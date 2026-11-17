import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser, clientIp } from '@/lib/authz';
import { logAuditEvent } from '@/lib/audit';
import { isDemoResetAllowed } from '@/lib/payments';

const schema = z.object({
  orderNumber: z.string().min(1),
});

/**
 * Idempotent reset endpoint for sandbox/staging test orders.
 * Resets a test order (*.local, demo, test) back to PENDING_PAYMENT, zeroes amountPaid,
 * and clears test simulation payment states so E2E test runs can be repeated.
 *
 * Security & Audit Constraints:
 * 1. Strictly unavailable in production.
 * 2. Restricted to authorized test users or staff members.
 * 3. Restricted strictly to synthetic demo client orders.
 * 4. Incapable of resetting any order with real payment history.
 * 5. Incapable of resetting any order with live ledger entries or deleting ledger history.
 * 6. Idempotent and fully audited via immutable AuditLog.
 */
export const POST = apiHandler(async (request: Request) => {
  if (!isDemoResetAllowed()) {
    throw new HttpError(403, 'Demo reset is strictly disabled in production environments.');
  }

  const user = await requireUser();

  const isStagingUser = Boolean(
    user.email?.endsWith('.local') ||
    user.email?.includes('demo') ||
    user.email?.includes('test')
  );
  const isStaffMember = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'FINANCE_MANAGER'].includes(user.role);

  if (!isStagingUser && !isStaffMember) {
    throw new HttpError(403, 'Order reset is restricted to authorized test accounts or staff members.');
  }

  const { orderNumber } = schema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      client: { select: { id: true, email: true } },
      payments: true,
    },
  });

  if (!order) throw new HttpError(404, 'Order not found.');

  if (order.clientId !== user.id && !isStaffMember) {
    throw new HttpError(403, 'You do not have permission to reset this order.');
  }

  // Safety check 1: Only synthetic demo orders can be reset
  const isTestOrder = Boolean(
    order.client.email.endsWith('.local') ||
    order.client.email.includes('demo') ||
    order.client.email.includes('test') ||
    order.orderNumber.includes('DEMO')
  );

  if (!isTestOrder) {
    throw new HttpError(400, 'Only simulated demo/staging orders with synthetic customer records can be reset.');
  }

  // Safety check 2: Incapable of resetting any order with real gateway payment history
  const hasRealPayment = order.payments.some(
    (p) => p.gatewayPaymentId && !p.gatewayPaymentId.startsWith('pay_demo_')
  );
  if (hasRealPayment) {
    throw new HttpError(400, 'Cannot reset order: Real gateway payment history detected. Only simulated payments can be reset.');
  }

  // Safety check 3: Incapable of resetting any order with live ledger records
  const hasRealLedger = await prisma.ledgerEntry.findFirst({
    where: {
      orderId: order.id,
      mode: { not: 'TEST_SIMULATION' },
    },
  });
  if (hasRealLedger) {
    throw new HttpError(400, 'Cannot reset order: Production ledger entries detected. Live ledger records cannot be modified.');
  }

  // Idempotency: If already in initial clean state, return success immediately
  const isAlreadyReset =
    Number(order.amountPaid) === 0 &&
    order.paymentStatus === 'UNPAID' &&
    order.status === 'PENDING_PAYMENT' &&
    order.payments.every((p) => p.status === 'CREATED' || p.status === 'FAILED');

  if (!isAlreadyReset) {
    await prisma.$transaction(async (tx) => {
      // 1. Reset simulated payments back to CREATED state without deleting ledger history
      await tx.payment.updateMany({
        where: {
          orderId: order.id,
          gatewayPaymentId: { startsWith: 'pay_demo_' },
        },
        data: {
          status: 'CREATED',
          gatewayPaymentId: null,
          capturedAt: null,
        },
      });

      // 2. Reset the order state
      await tx.order.update({
        where: { id: order.id },
        data: {
          amountPaid: 0,
          paymentStatus: 'UNPAID',
          status: 'PENDING_PAYMENT',
        },
      });

      // 3. Add an audit log entry to order status history (ledger history preserved)
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'DEMO_RESET',
          remarks: `Order reset to initial unpaid state by test user ${user.email}. Historical ledger records preserved.`,
        },
      });
    });
  }

  // 4. Log immutable system audit event
  await logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'DEMO_ORDER_RESET',
    entityType: 'Order',
    entityId: order.id,
    details: {
      orderNumber: order.orderNumber,
      clientEmail: order.client.email,
      previousStatus: order.status,
      previousAmountPaid: Number(order.amountPaid),
      ledgerHistoryPreserved: true,
      idempotentSkipped: isAlreadyReset,
    },
    ipAddress: clientIp(request),
  });

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
    message: isAlreadyReset
      ? 'Order is already in initial unpaid state (idempotent).'
      : 'Test order successfully reset to initial unpaid state. Ledger history preserved.',
  });
});
