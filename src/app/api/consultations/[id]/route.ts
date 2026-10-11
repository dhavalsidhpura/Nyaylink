import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser } from '@/lib/authz';
import { getRazorpay } from '@/lib/razorpay';
import { recordRefund } from '@/lib/payments';
import { num } from '@/lib/serialize';

const FREE_CANCEL_HOURS = 24;

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.literal('complete') }),
  z.object({ action: z.literal('no_show') }),
  z.object({
    action: z.literal('update'),
    lawyerNotes: z.string().max(5000).optional(),
    meetingUrl: z.string().url().max(300).optional().or(z.literal('')),
  }),
]);

async function refundCaptured(consultationId: string) {
  const payment = await prisma.payment.findFirst({ where: { consultationId, status: 'CAPTURED' } });
  if (!payment?.gatewayPaymentId) return false;
  const refund = await getRazorpay().payments.refund(payment.gatewayPaymentId, {
    amount: Math.round(num(payment.amount) * 100),
    notes: { consultationId },
  });
  await recordRefund(payment.gatewayPaymentId, refund.id, num(payment.amount));
  return true;
}

export const PATCH = apiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const input = schema.parse(await request.json());

  const c = await prisma.consultation.findUnique({ where: { id: params.id }, include: { lawyer: true } });
  if (!c) throw new HttpError(404, 'Consultation not found.');
  const isClient = c.clientId === user.id;
  const isLawyer = c.lawyer.userId === user.id;
  if (!isClient && !isLawyer) throw new HttpError(404, 'Consultation not found.');

  const now = Date.now();

  if (input.action === 'cancel') {
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(c.status)) throw new HttpError(409, 'This consultation cannot be cancelled.');
    const hoursLeft = (c.startsAt.getTime() - now) / 3_600_000;
    // Clients get a full refund up to 24h before; lawyers can always cancel (and the client is always refunded).
    if (isClient && c.status === 'CONFIRMED' && hoursLeft < FREE_CANCEL_HOURS) {
      throw new HttpError(409, `Cancellations are allowed up to ${FREE_CANCEL_HOURS} hours before the consultation.`);
    }
    await prisma.consultation.update({ where: { id: c.id }, data: { status: 'CANCELLED', holdExpiresAt: null } });
    const refunded = c.status === 'CONFIRMED' ? await refundCaptured(c.id) : false;
    return NextResponse.json({ success: true, status: 'CANCELLED', refunded });
  }

  if (!isLawyer) throw new HttpError(403, 'Only the advocate can update this consultation.');

  if (input.action === 'complete' || input.action === 'no_show') {
    if (c.status !== 'CONFIRMED') throw new HttpError(409, 'Only confirmed consultations can be closed.');
    if (c.startsAt.getTime() > now) throw new HttpError(409, 'The consultation has not started yet.');
    const status = input.action === 'complete' ? 'COMPLETED' : 'NO_SHOW';
    await prisma.consultation.update({ where: { id: c.id }, data: { status } });
    return NextResponse.json({ success: true, status });
  }

  await prisma.consultation.update({
    where: { id: c.id },
    data: {
      ...(input.lawyerNotes !== undefined ? { lawyerNotes: input.lawyerNotes } : {}),
      ...(input.meetingUrl !== undefined ? { meetingUrl: input.meetingUrl || null } : {}),
    },
  });
  return NextResponse.json({ success: true });
});
