import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError } from '@/lib/authz';
import { normalizeIdentifier, requestOtp } from '@/lib/otp';

const schema = z.object({ identifier: z.string().min(3).max(120) });

export const POST = apiHandler(async (request: Request) => {
  const { identifier } = schema.parse(await request.json());
  const id = normalizeIdentifier(identifier);
  if (!id) throw new HttpError(400, 'Enter a valid email or 10-digit Indian mobile number.');

  await requestOtp(id, clientIp(request));

  // Tells the UI whether to ask for name/email on the verify step (new account).
  const exists = await prisma.user.findUnique({
    where: id.kind === 'email' ? { email: id.value } : { phone: id.value },
    select: { id: true },
  });

  return NextResponse.json({ success: true, isNewUser: !exists, channel: id.kind });
});
