'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payExistingPayment } from '@/lib/checkout-client';
import { formatINR } from '@/lib/pricing';

export default function PayNowButton({ paymentId, amount, label }: { paymentId: string; amount: number; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setBusy(true);
    setError('');
    const result = await payExistingPayment(paymentId);
    if (result.status === 'paid') router.refresh();
    if (result.status === 'failed') setError(result.error);
    setBusy(false);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={pay}
        disabled={busy}
        className="w-full sm:w-auto bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider shadow cursor-pointer"
      >
        {busy ? 'Opening secure payment…' : label || `Pay ${formatINR(amount)} →`}
      </button>
      {error && <p className="text-[11px] text-rose-700 font-semibold">{error}</p>}
    </div>
  );
}
