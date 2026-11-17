import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS, clientIp } from '@/lib/authz';
import { createApprovalRequest } from '@/lib/approvals';
import { num } from '@/lib/serialize';

const schema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive().optional(), // omit for a full refund
  reason: z.string().min(5).max(500).default('Client requested refund under service guarantee terms'),
});

/**
 * Refund Initiation API.
 * Enforces strict Maker-Checker controls:
 * Financial refunds cannot be unilaterally self-approved. The request enters the
 * approval desk where a second qualified officer reviews and approves before gateway execution.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.finance);
  const { paymentId, amount, reason } = schema.parse(await request.json());

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: { select: { orderNumber: true, client: { select: { name: true, email: true } } } },
      consultation: { select: { number: true, client: { select: { name: true, email: true } } } },
    },
  });

  if (!payment || payment.status !== 'CAPTURED' || !payment.gatewayPaymentId) {
    throw new HttpError(409, 'Only captured payments can be refunded.');
  }

  // Structured query on PaymentRefund by paymentId
  const priorRefunds = await prisma.paymentRefund.findMany({
    where: {
      paymentId: payment.id,
      status: { in: ['RESERVED', 'SUCCEEDED'] },
    },
  });
  const cumulativePriorRefunded = priorRefunds.reduce((sum, entry) => sum + num(entry.amount), 0);
  const remainingRefundable = Math.round((num(payment.amount) - cumulativePriorRefunded) * 100) / 100;

  if (remainingRefundable <= 0) {
    throw new HttpError(400, 'Payment has already been fully refunded or has pending reservations.');
  }

  const refundAmount = amount ?? remainingRefundable;
  if (refundAmount > remainingRefundable) {
    throw new HttpError(
      400,
      `Refund of ₹${refundAmount} exceeds remaining refundable balance of ₹${remainingRefundable}.`
    );
  }

  const reference = payment.order?.orderNumber || payment.consultation?.number || payment.id;
  const clientName = payment.order?.client.name || payment.consultation?.client.name || 'Client';

  // Generate and persist a stable internal refund request ID for gateway idempotency
  const refundRequestId = `ref_req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const approval = await createApprovalRequest({
    type: 'REFUND',
    title: `Refund of ₹${refundAmount.toLocaleString('en-IN')} for ${reference} (${clientName})`,
    reason,
    payload: {
      paymentId: payment.id,
      refundRequestId,
      amount: refundAmount,
      reason,
      gatewayPaymentId: payment.gatewayPaymentId,
      reference,
    },
    requesterId: user.id,
    requesterRole: user.role,
    ipAddress: clientIp(request),
  });

  return NextResponse.json({
    success: true,
    pendingApproval: true,
    approvalId: approval.id,
    message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} submitted to Maker-Checker queue. A second authorized officer must review and approve this action.`,
  });
});
