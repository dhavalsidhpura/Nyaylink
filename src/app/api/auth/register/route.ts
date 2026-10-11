import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError } from '@/lib/authz';
import { normalizeIdentifier } from '@/lib/otp';
import { CONSENT_VERSIONS } from '@/lib/env';

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional().or(z.literal('')),
  password: z.string().min(8, 'must be at least 8 characters').max(128),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the Terms and Privacy Policy.' }) }),
});

export const POST = apiHandler(async (request: Request) => {
  const body = schema.parse(await request.json());

  let phone: string | null = null;
  if (body.phone) {
    const id = normalizeIdentifier(body.phone);
    if (id?.kind !== 'phone') throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.');
    phone = id.value;
  }

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email: body.email }, ...(phone ? [{ phone }] : [])] },
    select: { id: true },
  });
  if (clash) throw new HttpError(409, 'An account with this email or mobile number already exists.');

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      phone,
      password: await bcrypt.hash(body.password, 12),
      role: 'CLIENT',
      consents: { create: { purpose: 'TERMS_PRIVACY', version: CONSENT_VERSIONS.TERMS_PRIVACY, ip: clientIp(request) } },
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
});
