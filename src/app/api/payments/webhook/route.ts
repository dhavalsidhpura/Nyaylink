import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = request.headers.get('x-razorpay-signature') || '';

  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'Payment webhook is not configured.' },
      { status: 503 },
    );
  }

  if (!receivedSignature) {
    return NextResponse.json(
      { success: false, error: 'Missing webhook signature.' },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (!signaturesMatch(expectedSignature, receivedSignature)) {
    return NextResponse.json(
      { success: false, error: 'Invalid webhook signature.' },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid webhook payload.' },
      { status: 400 },
    );
  }

  const root = asRecord(payload);
  const eventId = stringValue(root?.id);
  const eventType = stringValue(root?.event);
  const paymentPayload = asRecord(asRecord(root?.payload)?.payment);
  const payment = asRecord(paymentPayload?.entity);
  const orderPayload = asRecord(asRecord(root?.payload)?.order);
  const razorpayOrderId = stringValue(payment?.order_id) || stringValue(asRecord(orderPayload?.entity)?.id);
  const razorpayPaymentId = stringValue(payment?.id);

  if (!eventId || !eventType) {
    return NextResponse.json(
      { success: false, error: 'Webhook event ID and type are required.' },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      try {
        await transaction.paymentEvent.create({
          data: {
            eventId,
            eventType,
            razorpayOrderId: razorpayOrderId || null,
            razorpayPaymentId: razorpayPaymentId || null,
            payload: (root ?? {}) as Prisma.InputJsonValue,
          },
        });
      } catch (error) {
        if ((error as { code?: string }).code === 'P2002') {
          return { duplicate: true };
        }
        throw error;
      }

      const order = razorpayOrderId
        ? await transaction.order.findUnique({ where: { razorpayOrderId } })
        : razorpayPaymentId
          ? await transaction.order.findUnique({ where: { razorpayPaymentId } })
          : null;

      if (!order) {
        return { duplicate: false, matched: false };
      }

      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const amount = numberValue(payment?.amount);
        const currency = stringValue(payment?.currency);
        const paymentOrderId = stringValue(payment?.order_id);
        const expectedAmount = Math.round(order.amount * 100);

        if (
          order.paymentStatus !== 'PAID' &&
          amount === expectedAmount &&
          currency === 'INR' &&
          (!paymentOrderId || paymentOrderId === order.razorpayOrderId) &&
          (eventType === 'order.paid' || stringValue(payment?.status) === 'captured')
        ) {
          await transaction.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
              razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
              paidAt: order.paidAt ?? new Date(),
              status: order.status === 'SUBMITTED' ? 'IN_PROGRESS' : order.status,
            },
          });
          await transaction.caseEvent.create({
            data: {
              orderId: order.id,
              eventType: 'PAYMENT_CAPTURED',
              title: 'Payment confirmed',
              message: 'Your payment has been confirmed. The case is now queued for professional review and assignment.',
            },
          });
          return { duplicate: false, matched: true, updated: true };
        }
      }

      if (eventType === 'payment.failed' && order.paymentStatus !== 'PAID') {
        await transaction.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
            razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          },
        });
        await transaction.caseEvent.create({
          data: {
            orderId: order.id,
            eventType: 'PAYMENT_FAILED',
            title: 'Payment needs attention',
            message: 'The payment was not captured. You can retry from the case payment panel.',
          },
        });
        return { duplicate: false, matched: true, updated: true };
      }

      if (eventType === 'refund.processed' && order.paymentStatus === 'PAID') {
        await transaction.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'REFUNDED' },
        });
        await transaction.caseEvent.create({
          data: {
            orderId: order.id,
            eventType: 'REFUND_PROCESSED',
            title: 'Refund processed',
            message: 'A refund has been recorded for this case. Please contact the service desk if you need help with the next step.',
          },
        });
        return { duplicate: false, matched: true, updated: true };
      }

      return { duplicate: false, matched: true, updated: false };
    });

    return NextResponse.json({ success: true, received: true, ...result });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed.' },
      { status: 500 },
    );
  }
}
