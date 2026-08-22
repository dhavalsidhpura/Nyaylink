'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'QUERY_RAISED' | 'APPROVED';

interface StatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string; style: string }> = [
  { value: 'SUBMITTED', label: 'Submitted', style: 'bg-slate-100 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', style: 'bg-cyan-100 text-cyan-800' },
  { value: 'QUERY_RAISED', label: 'Query Raised', style: 'bg-amber-100 text-amber-800' },
  { value: 'APPROVED', label: 'Approved', style: 'bg-emerald-100 text-emerald-800' },
];

export default function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as OrderStatus;
    setUpdating(true);

    try {
      const response = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status.');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = STATUS_OPTIONS.find((option) => option.value === status) || STATUS_OPTIONS[0];

  return (
    <select
      value={status}
      disabled={updating}
      onChange={handleStatusChange}
      className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-orange-500 cursor-pointer uppercase tracking-wider ${currentConfig.style} ${updating ? 'opacity-50' : ''}`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className="bg-white text-slate-800 font-normal">
          {option.label}
        </option>
      ))}
    </select>
  );
}
