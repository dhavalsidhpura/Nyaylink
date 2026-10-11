import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole } from '@/lib/authz';
import { lawyerProfileSchema } from '../profile-schema';

const schema = lawyerProfileSchema.extend({ isListed: z.boolean() });

export const PUT = apiHandler(async (request: Request) => {
  const user = await requireRole(['LAWYER']);
  const input = schema.parse(await request.json());
  const profile = await prisma.lawyerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new HttpError(404, 'Profile not found.');

  // Changing Bar Council credentials sends the profile back for re-verification.
  const credentialsChanged =
    input.enrollmentNo !== profile.enrollmentNo ||
    input.barCouncil !== profile.barCouncil ||
    input.enrollmentYear !== profile.enrollmentYear;

  if (input.enrollmentNo !== profile.enrollmentNo) {
    const clash = await prisma.lawyerProfile.findUnique({ where: { enrollmentNo: input.enrollmentNo } });
    if (clash) throw new HttpError(409, 'This enrolment number is already registered.');
  }

  const { practiceAreaSlugs, ...data } = input;
  await prisma.lawyerProfile.update({
    where: { id: profile.id },
    data: {
      ...data,
      practiceAreas: { set: practiceAreaSlugs.map((slug) => ({ slug })) },
      ...(credentialsChanged ? { verification: 'PENDING', verifiedAt: null, verificationNote: 'Credentials updated — re-verification required.' } : {}),
    },
  });

  return NextResponse.json({ success: true, reverification: credentialsChanged });
});
