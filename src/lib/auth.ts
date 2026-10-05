import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeIdentifier, verifyOtp } from '@/lib/otp';
import { requireEnv, CONSENT_VERSIONS } from '@/lib/env';

const toSessionUser = (u: { id: string; name: string; email: string; role: any }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // Same message for unknown email and wrong password, so accounts can't be enumerated.
        const ok = user?.password ? await bcrypt.compare(credentials.password, user.password) : false;
        if (!user || !ok) throw new Error('Incorrect email or password.');

        return toSessionUser(user);
      },
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'One-time code',
      credentials: {
        identifier: { label: 'Mobile or email', type: 'text' },
        code: { label: 'Code', type: 'text' },
        name: { label: 'Full name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        consent: { label: 'Consent', type: 'text' },
      },
      async authorize(credentials, req) {
        const id = normalizeIdentifier(credentials?.identifier || '');
        if (!id || !credentials?.code) throw new Error('Enter your mobile/email and the 6-digit code.');

        const where = id.kind === 'email' ? { email: id.value } : { phone: id.value };
        let user = await prisma.user.findUnique({ where });

        // New users must supply their details before we burn the code, so they can retry.
        let newUser: { name: string; email: string } | null = null;
        if (!user) {
          const name = credentials.name?.trim();
          const email = (id.kind === 'email' ? id.value : credentials.email || '').toLowerCase().trim();
          if (!name || !email) throw new Error('NEW_USER_DETAILS_REQUIRED');
          if (credentials.consent !== 'true') throw new Error('Please accept the Terms and Privacy Policy to continue.');
          if (await prisma.user.findUnique({ where: { email } })) {
            throw new Error('That email already has an account. Sign in with the email instead.');
          }
          newUser = { name, email };
        }

        if (!(await verifyOtp(id, credentials.code))) throw new Error('Invalid or expired code.');

        const now = new Date();
        if (newUser) {
          const ip = (req?.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0] || null;
          user = await prisma.user.create({
            data: {
              name: newUser.name,
              email: newUser.email,
              phone: id.kind === 'phone' ? id.value : null,
              ...(id.kind === 'phone' ? { phoneVerified: now } : { emailVerified: now }),
              role: 'CLIENT',
              consents: { create: { purpose: 'TERMS_PRIVACY', version: CONSENT_VERSIONS.TERMS_PRIVACY, ip } },
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user!.id },
            data: id.kind === 'phone' ? { phoneVerified: user!.phoneVerified ?? now } : { emailVerified: user!.emailVerified ?? now },
          });
        }

        return toSessionUser(user);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // useSession().update() — e.g. after applying as an advocate. Re-read from the DB; never trust client data.
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true, name: true } });
        if (fresh) {
          token.role = fresh.role;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: requireEnv('NEXTAUTH_SECRET'),
};
