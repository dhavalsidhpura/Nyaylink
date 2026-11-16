import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser } from '@/lib/authz';
import { capturePayment } from '@/lib/payments';

const schema = z.object({
  paymentId: z.string().min(1),
});

/**
 * Endpoint for testing / staging environments.
 * Allows seeded demo users (*.local) to simulate capturing an unpaid payment
 * so that end-to-end customer workflows can be audited without real cards.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();

  // Safety check: Only available for test/staging identities (*.local) or non-production envs
  const isStagingUser = user.email?.endsWith('.local') || user.email?.includes('demo') || user.email?.includes('test');
  const isDevOrPreview = process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production';

  if (!isStagingUser && !isDevOrPreview) {
    throw new HttpError(403, 'Demo payment simulation is only permitted in staging and test sessions.');
  }

  const { paymentId } = schema.parse(await request.json());

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: { select: { id: true, clientId: true, orderNumber: true } },
      consultation: { select: { id: true, clientId: true, number: true } },
    },
  });

  if (!payment) throw new HttpError(404, 'Payment record not found.');

  const ownerId = payment.order?.clientId ?? payment.consultation?.clientId;
  const isStaffMember = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'FINANCE_MANAGER'].includes(user.role);

  if (ownerId !== user.id && !isStaffMember) {
    throw new HttpError(403, 'You do not have permission to simulate this payment.');
  }

  // Generate mock gateway identifiers if not present
  const mockGatewayOrderId = payment.gatewayOrderId || `order_demo_${Date.now()}`;
  const mockGatewayPaymentId = `pay_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!payment.gatewayOrderId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: mockGatewayOrderId },
    });
  }

  const result = await capturePayment(mockGatewayOrderId, mockGatewayPaymentId, { isSimulation: true });

  return NextResponse.json({
    success: true,
    simulated: true,
    paymentId: payment.id,
    orderNumber: payment.order?.orderNumber ?? null,
    consultationNumber: payment.consultation?.number ?? null,
    message: 'Test payment captured successfully in sandbox simulation.',
  });
});
