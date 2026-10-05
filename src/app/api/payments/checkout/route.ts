import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler, requireUser } from '@/lib/authz';
import { preparePaymentCheckout } from '@/lib/payments';

// Returns Razorpay Checkout options for an existing unpaid payment (retry, milestone, consultation).
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const { paymentId } = z.object({ paymentId: z.string().min(1) }).parse(await request.json());
  const checkout = await preparePaymentCheckout(paymentId, user.id);
  return NextResponse.json({ success: true, checkout });
});
