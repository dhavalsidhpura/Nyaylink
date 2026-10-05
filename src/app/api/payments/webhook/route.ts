import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { capturePayment, markPaymentFailed, recordRefund } from '@/lib/payments';
import { HttpError } from '@/lib/http';

// Razorpay webhook. Configure in Dashboard → Webhooks with the events
//   payment.captured, payment.failed, refund.processed
// and set RAZORPAY_WEBHOOK_SECRET. Every handler is idempotent, so Razorpay retries are safe.
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    const payment = event.payload?.payment?.entity;
    const refund = event.payload?.refund?.entity;

    switch (event.event) {
      case 'payment.captured':
        if (payment?.order_id) await capturePayment(payment.order_id, payment.id);
        break;
      case 'payment.failed':
        if (payment?.order_id) await markPaymentFailed(payment.order_id);
        break;
      case 'refund.processed':
        if (refund?.payment_id) await recordRefund(refund.payment_id, refund.id, refund.amount / 100);
        break;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // A payment this app never created (e.g. a payment link made in the dashboard): acknowledge it so Razorpay stops retrying.
    if (error instanceof HttpError && error.status === 404) return NextResponse.json({ success: true, ignored: true });
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
