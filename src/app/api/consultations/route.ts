import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ConsultationMode, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, requireUser } from '@/lib/authz';
import { isSlotAvailable, HOLD_MINUTES } from '@/lib/slots';
import { computeConsultationQuote } from '@/lib/pricing';
import { nextConsultationNumber } from '@/lib/counters';
import { preparePaymentCheckout } from '@/lib/payments';
import { num } from '@/lib/serialize';
import { CONSENT_VERSIONS } from '@/lib/env';

const schema = z.object({
  lawyerSlug: z.string().min(1),
  startsAt: z.string().datetime(),
  mode: z.nativeEnum(ConsultationMode),
  notes: z.string().trim().min(10, 'please describe your matter briefly').max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the consultation terms.' }) }),
});

const MAX_ACTIVE_HOLDS = 2;

// Books a slot as a 15-minute hold and returns Razorpay Checkout options. Payment confirms it.
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const input = schema.parse(await request.json());
  const startsAt = new Date(input.startsAt);

  const lawyer = await prisma.lawyerProfile.findUnique({ where: { slug: input.lawyerSlug } });
  if (!lawyer || lawyer.verification !== 'VERIFIED' || !lawyer.isListed) throw new HttpError(404, 'Lawyer not found.');
  if (lawyer.userId === user.id) throw new HttpError(400, 'You cannot book a consultation with yourself.');
  if (!lawyer.modes.includes(input.mode)) throw new HttpError(400, 'This consultation mode is not offered.');
  if (!(await isSlotAvailable(lawyer.id, startsAt))) throw new HttpError(409, 'That slot is no longer available. Please pick another.');

  const now = new Date();
  const activeHolds = await prisma.consultation.count({
    where: { clientId: user.id, status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } },
  });
  if (activeHolds >= MAX_ACTIVE_HOLDS) throw new HttpError(429, 'Please complete or let your pending bookings expire first.');

  const endsAt = new Date(startsAt.getTime() + lawyer.consultationMinutes * 60_000);
  const quote = computeConsultationQuote(num(lawyer.consultationFee));

  let created;
  try {
    // SERIALIZABLE: two clients racing for the same slot cannot both pass the overlap check.
    created = await prisma.$transaction(
      async (tx) => {
        const clash = await tx.consultation.findFirst({
          where: {
            lawyerId: lawyer.id,
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
            OR: [{ status: 'CONFIRMED' }, { status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } }],
          },
          select: { id: true },
        });
        if (clash) throw new HttpError(409, 'That slot was just taken. Please pick another.');

        const consultation = await tx.consultation.create({
          data: {
            number: await nextConsultationNumber(tx),
            lawyerId: lawyer.id,
            clientId: user.id,
            startsAt,
            endsAt,
            mode: input.mode,
            holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
            fee: quote.lawyerFee,
            platformFee: quote.platformFee,
            gstAmount: quote.gstAmount,
            totalAmount: quote.total,
            clientNotes: input.notes,
          },
        });
        const payment = await tx.payment.create({
          data: {
            kind: 'CONSULTATION',
            amount: quote.total,
            taxableAmount: quote.platformFee,
            gstAmount: quote.gstAmount,
            description: `Legal consultation ${consultation.number}`,
            consultationId: consultation.id,
          },
        });
        await tx.consent.create({
          data: { userId: user.id, purpose: 'CONSULTATION_TERMS', version: CONSENT_VERSIONS.TERMS_PRIVACY, ip: clientIp(request) },
        });
        return { consultation, payment };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      throw new HttpError(409, 'That slot was just taken. Please pick another.');
    }
    throw error;
  }

  const checkout = await preparePaymentCheckout(created.payment.id, user.id);
  return NextResponse.json(
    { success: true, consultationNumber: created.consultation.number, holdExpiresAt: created.consultation.holdExpiresAt, checkout },
    { status: 201 }
  );
});
