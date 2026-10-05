import crypto from 'crypto';
import Razorpay from 'razorpay';
import { HttpError } from '@/lib/http';

let client: Razorpay | null = null;

export function razorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new HttpError(503, 'Online payments are not configured yet. Please contact support.');
  return keyId;
}

export function getRazorpay(): Razorpay {
  if (client) return client;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) throw new HttpError(503, 'Online payments are not configured yet. Please contact support.');
  client = new Razorpay({ key_id: razorpayKeyId(), key_secret });
  return client;
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ab.length === bb.length && ab.length > 0 && crypto.timingSafeEqual(ab, bb);
}

/** Signature returned to the browser by Razorpay Checkout: HMAC(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(gatewayOrderId: string, gatewayPaymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !/^[a-f0-9]+$/i.test(signature || '')) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${gatewayOrderId}|${gatewayPaymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

/** X-Razorpay-Signature header on webhooks: HMAC(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !/^[a-f0-9]+$/i.test(signature)) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}
