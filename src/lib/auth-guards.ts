import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
};

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getCurrentSession();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return {
      session: null,
      user: null,
      response: NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 },
      ),
    } as const;
  }

  return { session, user, response: null } as const;
}

export async function requireRole(roles: readonly string[]) {
  const auth = await requireUser();

  if (auth.response) {
    return auth;
  }

  if (!roles.includes(auth.user.role)) {
    return {
      ...auth,
      response: NextResponse.json(
        { success: false, error: 'You do not have permission to perform this action.' },
        { status: 403 },
      ),
    } as const;
  }

  return auth;
}
