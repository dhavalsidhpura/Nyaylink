'use client';

import type { CheckoutPayload } from '@/lib/payments';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

export type CheckoutResult =
  | { status: 'paid'; orderNumber: string | null; consultationNumber: string | null; slotLost: boolean }
  | { status: 'dismissed' }
  | { status: 'failed'; error: string };

async function waitForRazorpay(timeoutMs = 8000) {
  const start = Date.now();
  while (!window.Razorpay) {
    if (Date.now() - start > timeoutMs) throw new Error('Payment window failed to load. Check your connection and try again.');
    await new Promise((r) => setTimeout(r, 150));
  }
  return window.Razorpay;
}

/** Opens Razorpay Checkout and verifies the result server-side. The webhook also confirms it independently. */
export async function openRazorpayCheckout(checkout: CheckoutPayload): Promise<CheckoutResult> {
  let Razorpay;
  try {
    Razorpay = await waitForRazorpay();
  } catch (error) {
    return { status: 'failed', error: (error as Error).message };
  }

  return new Promise<CheckoutResult>((resolve) => {
    const rzp = new Razorpay({
      key: checkout.keyId,
      amount: checkout.amountPaise,
      currency: checkout.currency,
      order_id: checkout.gatewayOrderId,
      name: 'NyayaLink Legal Services',
      description: checkout.description,
      prefill: checkout.prefill,
      theme: { color: '#073B5C' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await res.json();
          if (data.success) {
            resolve({ status: 'paid', orderNumber: data.orderNumber, consultationNumber: data.consultationNumber, slotLost: data.slotLost });
          } else {
            resolve({ status: 'failed', error: data.error || 'Payment could not be verified. If money was debited, it will be confirmed automatically.' });
          }
        } catch {
          resolve({ status: 'failed', error: 'Network error while confirming payment. If money was debited, it will be confirmed automatically.' });
        }
      },
      modal: { ondismiss: () => resolve({ status: 'dismissed' }) },
    });
    rzp.on('payment.failed', () => {
      /* Razorpay shows its own retry UI; the modal stays open. */
    });
    rzp.open();
  });
}

/** Fetches checkout options for an existing unpaid payment and opens Razorpay. */
export async function payExistingPayment(paymentId: string): Promise<CheckoutResult> {
  const res = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId }),
  });
  const data = await res.json();
  if (!data.success) return { status: 'failed', error: data.error || 'Could not start payment.' };
  return openRazorpayCheckout(data.checkout);
}
