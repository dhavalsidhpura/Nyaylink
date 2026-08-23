import crypto from 'crypto';
import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { success: false, error: 'Payment service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const razorpayOrderId = typeof body.razorpay_order_id === 'string'
      ? body.razorpay_order_id
      : '';
    const razorpayPaymentId = typeof body.razorpay_payment_id === 'string'
      ? body.razorpay_payment_id
      : '';
    const razorpaySignature = typeof body.razorpay_signature === 'string'
      ? body.razorpay_signature
      : '';
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber : '';

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Incomplete payment verification data.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber, clientId: auth.user.id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 },
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature.' },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [razorpayOrder, payment] = await Promise.all([
      razorpay.orders.fetch(razorpayOrderId),
      razorpay.payments.fetch(razorpayPaymentId),
    ]);

    const expectedAmount = Math.round(order.amount * 100);
    const paymentAmount = Number(payment.amount);
    const orderAmount = Number(razorpayOrder.amount);

    if (
      razorpayOrder.receipt !== order.orderNumber ||
      orderAmount !== expectedAmount ||
      paymentAmount !== expectedAmount ||
      payment.currency !== 'INR' ||
      payment.order_id !== razorpayOrderId ||
      payment.status !== 'captured'
    ) {
      return NextResponse.json(
        { success: false, error: 'Payment details could not be reconciled.' },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          razorpayOrderId,
          razorpayPaymentId,
          paidAt: order.paidAt || new Date(),
          status: order.status === 'SUBMITTED' ? 'IN_PROGRESS' : order.status,
        },
        select: { id: true, orderNumber: true, paymentStatus: true, status: true, paidAt: true },
      });

      if (order.paymentStatus !== 'PAID') {
        await tx.caseEvent.create({
          data: {
            orderId: order.id,
            eventType: 'PAYMENT_CAPTURED',
            title: 'Payment confirmed',
            message: 'Your payment has been confirmed. The case is now queued for professional review and assignment.',
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed.' },
      { status: 500 },
    );
  }
}
