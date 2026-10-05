import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { sendNotificationEmail, buildLawyerVerificationEmail } from '@/lib/email';

const schema = z.object({
  lawyerId: z.string().min(1),
  action: z.enum(['verify', 'reject', 'suspend']),
  note: z.string().trim().max(500).optional(),
});

// Ops verifies the enrolment number against the State Bar Council roll before a profile goes live.
export const PATCH = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.ops);
  const { lawyerId, action, note } = schema.parse(await request.json());
  if (action !== 'verify' && !note) throw new HttpError(400, 'Please add a note explaining the decision.');

  const verification = action === 'verify' ? 'VERIFIED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED';
  const lawyer = await prisma.lawyerProfile.update({
    where: { id: lawyerId },
    data: { verification, verificationNote: note || null, verifiedAt: action === 'verify' ? new Date() : null },
    include: { user: { select: { name: true, email: true } } },
  });

  await sendNotificationEmail({
    to: lawyer.user.email,
    subject: action === 'verify' ? 'Your वकील Search profile is live' : 'Update on your वकील Search profile',
    html: buildLawyerVerificationEmail(lawyer.user.name, action === 'verify', note),
  });

  return NextResponse.json({ success: true, verification });
});
