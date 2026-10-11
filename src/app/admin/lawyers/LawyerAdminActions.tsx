'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (url: string, method: 'POST' | 'PATCH', body: unknown) => {
    setBusy(true);
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) alert(data.error || 'Action failed.');
      else router.refresh();
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

const btn = 'font-bold text-[11px] px-3 py-2 rounded-xl cursor-pointer disabled:opacity-50';

export function VerificationActions({ lawyerId, pending, verified }: { lawyerId: string; pending?: boolean; verified?: boolean }) {
  const { busy, run } = useAction();
  const decide = (action: 'verify' | 'reject' | 'suspend') => {
    const note = action === 'verify' ? undefined : prompt(action === 'reject' ? 'Reason for rejection (emailed to the advocate):' : 'Reason for suspension:');
    if (action !== 'verify' && !note) return;
    run('/api/admin/lawyers', 'PATCH', { lawyerId, action, note });
  };

  return (
    <div className="flex gap-2 shrink-0 justify-end">
      {(pending || !verified) && (
        <button disabled={busy} onClick={() => decide('verify')} className={`${btn} bg-emerald-600 text-white`}>
          ✓ Verify
        </button>
      )}
      {pending && (
        <button disabled={busy} onClick={() => decide('reject')} className={`${btn} bg-rose-50 text-rose-700`}>
          ✕ Reject
        </button>
      )}
      {verified && (
        <button disabled={busy} onClick={() => decide('suspend')} className={`${btn} bg-slate-100 text-slate-700`}>
          Suspend
        </button>
      )}
    </div>
  );
}

export function CreatePayoutButton({ lawyerId }: { lawyerId: string }) {
  const { busy, run } = useAction();
  return (
    <button disabled={busy} onClick={() => run('/api/admin/payouts', 'POST', { lawyerId })} className={`${btn} bg-[#073B5C] text-[#F4B942]`}>
      Create payout
    </button>
  );
}

export function MarkPaidButton({ payoutId }: { payoutId: string }) {
  const { busy, run } = useAction();
  return (
    <button
      disabled={busy}
      onClick={() => {
        const reference = prompt('Bank transfer UTR / reference:');
        if (reference) run('/api/admin/payouts', 'PATCH', { payoutId, reference });
      }}
      className={`${btn} bg-emerald-600 text-white`}
    >
      Mark paid
    </button>
  );
}
