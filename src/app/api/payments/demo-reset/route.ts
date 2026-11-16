import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser } from '@/lib/authz';

const schema = z.object({
  orderNumber: z.string().min(1),
});

/**
 * Idempotent reset endpoint for sandbox/staging test orders.
 * Resets a test order (*.local) back to PENDING_PAYMENT, zeroes amountPaid,
 * and clears test simulation ledger and payment states so E2E test runs can be repeated.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();

  const isStagingUser = user.email?.endsWith('.local') || user.email?.includes('demo') || user.email?.includes('test');
  const isDevOrPreview = process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production';

  if (!isStagingUser && !isDevOrPreview) {
    throw new HttpError(403, 'Order reset is only permitted in staging/test sessions for verified test accounts.');
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

  const isStaffMember = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'FINANCE_MANAGER'].includes(user.role);
  if (order.clientId !== user.id && !isStaffMember) {
    throw new HttpError(403, 'You do not have permission to reset this order.');
  }

  // Safety check: Cannot reset real production client orders
  const isTestOrder =
    order.client.email.endsWith('.local') ||
    order.client.email.includes('demo') ||
    order.client.email.includes('test') ||
    order.orderNumber.includes('DEMO');

  if (!isTestOrder) {
    throw new HttpError(400, 'Only simulated demo/staging orders can be reset.');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Remove TEST_SIMULATION ledger entries
    await tx.ledgerEntry.deleteMany({
      where: {
        orderId: order.id,
        mode: 'TEST_SIMULATION',
      },
    });

    // 2. Remove invoices created for this demo order
    await tx.invoice.deleteMany({
      where: {
        orderId: order.id,
      },
    });

    // 3. Remove simulated payments
    await tx.payment.deleteMany({
      where: {
        orderId: order.id,
        gatewayPaymentId: { startsWith: 'pay_demo_' },
      },
    });

    // If the base payment record remains, reset it to CREATED
    await tx.payment.updateMany({
      where: {
        orderId: order.id,
      },
      data: {
        status: 'CREATED',
        gatewayPaymentId: null,
        capturedAt: null,
      },
    });

    // 4. Reset the order itself
    await tx.order.update({
      where: { id: order.id },
      data: {
        amountPaid: 0,
        paymentStatus: 'UNPAID',
        status: 'PENDING_PAYMENT',
      },
    });

    // 5. Add an audit log entry
    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'DEMO_RESET',
        remarks: `Order reset to initial unpaid state by test user ${user.email}.`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
    message: 'Test order successfully reset to initial unpaid state.',
  });
});
