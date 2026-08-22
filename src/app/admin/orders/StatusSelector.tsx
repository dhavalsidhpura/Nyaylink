'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusSelectorProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pending Payment', style: 'bg-amber-100 text-amber-800' },
  { value: 'payment_completed', label: 'Payment Completed', style: 'bg-emerald-100 text-emerald-800' },
  { value: 'under_review', label: 'Under Review', style: 'bg-indigo-100 text-indigo-800' },
  { value: 'government_submitted', label: 'Government Submitted', style: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', style: 'bg-blue-100 text-blue-800' },
  { value: 'rejected', label: 'Rejected', style: 'bg-rose-100 text-rose-800' },
];

export default function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          newStatus,
          remarks: `Status updated to ${newStatus.replace('_', ' ')} from Operations Console.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('An error occurred while updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  return (
    <select
      value={status}
      disabled={updating}
      onChange={handleStatusChange}
      className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-orange-500 cursor-pointer uppercase tracking-wider ${currentConfig.style} ${
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
}