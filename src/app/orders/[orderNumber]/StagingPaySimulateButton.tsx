'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StagingPaySimulateButton({
  paymentId,
  orderNumber,
}: {
  paymentId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const simulate = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/payments/demo-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || 'Failed to simulate payment.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={simulate}
        disabled={busy}
        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl uppercase tracking-wider shadow cursor-pointer transition"
        title="Simulate payment confirmation for testing without real money transfer"
      >
        <span>🧪</span>
        <span>{busy ? 'Simulating…' : 'Sandbox: Simulate Token Pay'}</span>
      </button>
      {error && <p className="text-[10px] text-rose-600 font-bold">{error}</p>}
    </div>
  );
}

export function StagingOrderResetButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resetOrder = async () => {
    if (!confirm('Reset this demo order back to unpaid state for testing?')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/payments/demo-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || 'Failed to reset demo order.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 w-full">
      <button
        type="button"
        onClick={resetOrder}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 cursor-pointer transition"
        title="Reset demo order back to initial unpaid state"
      >
        <span>🔄</span>
        <span>{busy ? 'Resetting…' : 'Reset Demo Order (Sandbox)'}</span>
      </button>
      {error && <p className="text-[10px] text-rose-600 font-bold">{error}</p>}
    </div>
  );
}
