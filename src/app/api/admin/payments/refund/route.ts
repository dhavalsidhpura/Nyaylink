import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { getRazorpay } from '@/lib/razorpay';
import { recordRefund } from '@/lib/payments';
import { num } from '@/lib/serialize';

const schema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive().optional(), // omit for a full refund
});

export const POST = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.finance);
  const { paymentId, amount } = schema.parse(await request.json());

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== 'CAPTURED' || !payment.gatewayPaymentId) {
    throw new HttpError(409, 'Only captured payments can be refunded.');
  }
  const refundAmount = amount ?? num(payment.amount);
  if (refundAmount > num(payment.amount)) throw new HttpError(400, 'Refund exceeds the payment amount.');

  const refund = await getRazorpay().payments.refund(payment.gatewayPaymentId, {
    amount: Math.round(refundAmount * 100),
    notes: { paymentId: payment.id },
  });
  // The refund.processed webhook records this too; recordRefund is idempotent on the refund id.
  await recordRefund(payment.gatewayPaymentId, refund.id, refundAmount);

  return NextResponse.json({ success: true, refundId: refund.id });
});
