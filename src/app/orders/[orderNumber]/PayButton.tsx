'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PayButtonProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  currentStatus: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayButton({
  orderId,
  orderNumber,
  amount,
  serviceTitle,
  clientName,
  clientEmail,
  clientPhone,
  currentStatus,
}: PayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentStatus === 'payment_completed' || currentStatus === 'completed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <span className="text-emerald-700 font-bold text-sm block">✓ Payment Completed</span>
        <span className="text-emerald-600 text-xs">Our CA/CS team is reviewing your filing details.</span>
      </div>
    );
  }

  const configuredRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const completePaymentInDatabase = async (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const verifyRes = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderNumber,
      }),
    });

    const verifyData = await verifyRes.json();
    if (verifyData.success) {
      router.refresh();
    } else {
      alert(`Payment verification failed: ${verifyData.error || 'Please refresh.'}`);
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const createRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        alert(`Payment initialization error: ${createData.error || 'Server error.'}`);
        setLoading(false);
        return;
      }

      const razorpayKey = configuredRazorpayKey || createData.keyId;

      if (razorpayKey && razorpayKey.startsWith('rzp_')) {
        const options = {
          key: razorpayKey,
          amount: createData.amount,
          currency: 'INR',
          name: 'Legal & Compliance Portal',
          description: serviceTitle,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            await completePaymentInDatabase(response);
          },
          prefill: {
            name: clientName,
            email: clientEmail,
            contact: clientPhone,
          },
          theme: { color: '#f97316' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }

      alert('Payment is not configured. Please contact NyayLink support.');
    } catch (err: any) {
      alert(`Checkout error: ${err.message || 'Check terminal logs.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
    >
      {loading ? 'Processing Payment...' : `Pay Now via Razorpay (₹${amount.toLocaleString('en-IN')}) →`}
    </button>
  );
}