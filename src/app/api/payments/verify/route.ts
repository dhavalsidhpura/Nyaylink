import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser } from '@/lib/authz';
import { verifyCheckoutSignature } from '@/lib/razorpay';
import { capturePayment } from '@/lib/payments';

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Browser-side confirmation after Razorpay Checkout. The webhook is the backstop if this never arrives.
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const body = schema.parse(await request.json());

  if (!verifyCheckoutSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)) {
    throw new HttpError(400, 'Invalid payment signature.');
  }

  // The signature binds this payment to *this* gateway order, which was created for exactly one Payment row.
  const payment = await prisma.payment.findUnique({
    where: { gatewayOrderId: body.razorpay_order_id },
    select: {
      order: { select: { clientId: true, orderNumber: true } },
      consultation: { select: { clientId: true, number: true } },
    },
  });
  const ownerId = payment?.order?.clientId ?? payment?.consultation?.clientId;
  if (!payment || ownerId !== user.id) throw new HttpError(404, 'Payment not found.');

  const result = await capturePayment(body.razorpay_order_id, body.razorpay_payment_id);

  return NextResponse.json({
    success: true,
    orderNumber: payment.order?.orderNumber ?? null,
    consultationNumber: payment.consultation?.number ?? null,
    slotLost: result.slotLost,
  });
});
