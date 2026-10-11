'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusSelectorProps {
  orderId: string;
  currentStatus: string;
  currentSrn?: string | null;
  compact?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Pending Payment', style: 'bg-amber-100 text-amber-800' },
  { value: 'DOCS_PENDING', label: 'Docs Pending', style: 'bg-indigo-100 text-indigo-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', style: 'bg-purple-100 text-purple-800' },
  { value: 'QUERY_RAISED', label: 'Query Raised', style: 'bg-orange-100 text-orange-800' },
  { value: 'APPROVED', label: 'Approved', style: 'bg-emerald-100 text-emerald-800' },
  { value: 'REJECTED', label: 'Rejected', style: 'bg-rose-100 text-rose-800' },
];

/** Compact mode: inline dropdown for tables. Full mode: status + remarks + govt SRN, sent together. */
export default function StatusSelector({ orderId, currentStatus, currentSrn, compact }: StatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState('');
  const [srn, setSrn] = useState(currentSrn || '');
  const [updating, setUpdating] = useState(false);

  const submit = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          newStatus,
          remarks: remarks.trim() || undefined,
          srn: srn.trim() && srn.trim() !== currentSrn ? srn.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
        setRemarks('');
        router.refresh();
      } else {
        alert(data.error || 'Failed to update status.');
        setStatus(currentStatus);
      }
    } catch {
      alert('An error occurred while updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  const select = (
    <select
      value={status}
      disabled={updating}
      onChange={(e) => (compact ? submit(e.target.value) : setStatus(e.target.value))}
      className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer uppercase tracking-wider ${currentConfig.style} ${
        updating ? 'opacity-50' : ''
      }`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-normal">
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (compact) return select;

  return (
    <div className="space-y-2 text-xs w-full sm:w-72">
      {select}
      <input
        value={srn}
        onChange={(e) => setSrn(e.target.value)}
        placeholder="Government SRN / ARN (once issued)"
        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
      />
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows={2}
        placeholder="Remarks for the client (emailed with the update)"
        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
      />
      <button
        onClick={() => submit(status)}
        disabled={updating || (status === currentStatus && !remarks.trim() && srn.trim() === (currentSrn || ''))}
        className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-bold py-2 rounded-xl cursor-pointer"
      >
        {updating ? 'Updating…' : 'Update & notify client'}
      </button>
    </div>
  );
}
