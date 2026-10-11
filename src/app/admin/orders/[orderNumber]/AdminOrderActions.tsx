'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function send(url: string, method: 'POST' | 'PATCH', body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed.');
  return data;
}

const inputCls = 'w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]';
const btnCls = 'bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-bold text-xs px-4 py-2 rounded-xl cursor-pointer';

export function AssignSelector({
  orderId,
  currentId,
  staff,
}: {
  orderId: string;
  currentId: string | null;
  staff: { id: string; name: string; role: string; activeCases: number }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentId || '');
  const [busy, setBusy] = useState(false);

  const save = async (next: string) => {
    setValue(next);
    setBusy(true);
    try {
      await send('/api/admin/orders/assign', 'PATCH', { orderId, assigneeId: next || null });
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
      setValue(currentId || '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <select value={value} disabled={busy} onChange={(e) => save(e.target.value)} className={inputCls}>
      <option value="">— Unassigned —</option>
      {staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} · {s.role.replace(/_/g, ' ')} · {s.activeCases} active
        </option>
      ))}
    </select>
  );
}

export function PaymentRequestForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [gstApplicable, setGstApplicable] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await send('/api/admin/orders/payment-request', 'POST', { orderId, amount: Number(amount), description, gstApplicable });
      setAmount('');
      setDescription('');
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Maharashtra stamp duty" className={inputCls} />
      <input required type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" className={inputCls} />
      <label className="flex items-center gap-2 text-[11px] text-slate-600">
        <input type="checkbox" checked={gstApplicable} onChange={(e) => setGstApplicable(e.target.checked)} className="accent-[#0E7490]" />
        Professional fee (add 18% GST). Leave unticked for government fees.
      </label>
      <button disabled={busy} className={`${btnCls} w-full`}>
        {busy ? 'Sending…' : 'Request payment from client'}
      </button>
    </form>
  );
}

export function RefundButton({ paymentId, amount }: { paymentId: string; amount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const refund = async () => {
    const input = prompt(`Refund amount in ₹ (max ${amount}). Leave blank for a full refund.`, '');
    if (input === null) return;
    const value = input.trim() ? Number(input) : undefined;
    if (value !== undefined && (!Number.isFinite(value) || value <= 0 || value > amount)) {
      alert('Enter a valid amount.');
      return;
    }
    if (!confirm(`Refund ₹${(value ?? amount).toLocaleString('en-IN')} to the client's original payment method?`)) return;
    setBusy(true);
    try {
      await send('/api/admin/payments/refund', 'POST', { paymentId, amount: value });
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={refund} disabled={busy} className="text-[11px] font-bold text-rose-700 hover:underline disabled:opacity-50">
      {busy ? 'Refunding…' : 'Refund'}
    </button>
  );
}
