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

export interface GatewayRefundPayload {
  amount: number; // in paise
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
}

export interface GatewayRefundOptions {
  refundRequestId: string; // Stable internal refund request ID
  isSimulation?: boolean;
}

export interface GatewayRefundResult {
  id: string;
  amount: number;
  currency: string;
  paymentId: string;
  status: string;
  refundRequestId: string;
  receipt?: string;
}

/**
 * Adapter function executing a refund via Razorpay's API.
 * Uses Razorpay's documented `X-Refund-Idempotency` header and ensures the same key and
 * identical payload are sent on retries.
 */
export async function executeGatewayRefund(
  gatewayPaymentId: string,
  payload: GatewayRefundPayload,
  options: GatewayRefundOptions
): Promise<GatewayRefundResult> {
  const { refundRequestId, isSimulation } = options;
  if (!refundRequestId || !refundRequestId.trim()) {
    throw new HttpError(400, 'A stable internal refundRequestId is required for refund idempotency.');
  }

  // Safe simulation mode: deterministic identifiers, zero outbound network calls
  if (isSimulation || gatewayPaymentId.startsWith('pay_demo_')) {
    return {
      id: `rfnd_demo_${refundRequestId}`,
      amount: payload.amount,
      currency: 'INR',
      paymentId: gatewayPaymentId,
      status: 'processed',
      refundRequestId,
      receipt: payload.receipt,
    };
  }

  const keyId = razorpayKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new HttpError(503, 'Online payments are not configured.');

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  const url = `https://api.razorpay.com/v1/payments/${encodeURIComponent(gatewayPaymentId)}/refund`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'X-Refund-Idempotency': refundRequestId,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorBody);
    } catch {
      parsed = { error: { description: errorBody } };
    }
    throw new HttpError(
      response.status === 400 ? 400 : 502,
      `Razorpay Refund Failed (${response.status}): ${parsed?.error?.description || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency || 'INR',
    paymentId: data.payment_id || gatewayPaymentId,
    status: data.status,
    refundRequestId,
    receipt: data.receipt,
  };
}
