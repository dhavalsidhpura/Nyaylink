'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceRate {
  slug: string;
  title: string;
  category: string;
  professionalFee: number;
  govtFee: number;
  govtFeeNote: string;
  isActive: boolean;
}

export default function AdminPricingConsole() {
  const [services, setServices] = useState<ServiceRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (slug: string, patch: Partial<Pick<ServiceRate, 'professionalFee' | 'govtFee' | 'govtFeeNote' | 'isActive'>>) => {
    setSavingSlug(slug);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...patch }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.map((s) => (s.slug === slug ? { ...s, ...patch } : s)));
      } else {
        alert(data.error || 'Failed to update rate');
      }
    } catch (err) {
      alert('Error updating rate');
    } finally {
      setSavingSlug(null);
    }
  };

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#073B5C] text-[#F4B942] font-black text-xs px-3 py-1 rounded-lg">Admin Console</span>
              <h1 className="text-xl font-extrabold text-[#073B5C]">Dynamic Rate & Fee Manager</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Prices here are what checkout charges. Changes apply to new orders only; existing orders keep their quoted price.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
            <Link href="/admin" className="text-xs text-[#0E7490] font-bold hover:underline whitespace-nowrap">
              ← Main Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading statutory rate matrix...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#073B5C] text-white">
                    <th className="py-3 px-4 font-bold">Service Name & Category</th>
                    <th className="py-3 px-4 font-bold w-40">Professional Fee (₹, excl. GST)</th>
                    <th className="py-3 px-4 font-bold w-36">Govt Fee Collected Upfront (₹)</th>
                    <th className="py-3 px-4 font-bold">Govt Fee Note (shown to client)</th>
                    <th className="py-3 px-4 font-bold">Live</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <RateRow key={item.slug} item={item} onSave={handleUpdate} isSaving={savingSlug === item.slug} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RateRow({
  item,
  onSave,
  isSaving,
}: {
  item: ServiceRate;
  onSave: (slug: string, patch: Partial<Pick<ServiceRate, 'professionalFee' | 'govtFee' | 'govtFeeNote' | 'isActive'>>) => void;
  isSaving: boolean;
}) {
  const [fee, setFee] = useState(item.professionalFee);
  const [govtFee, setGovtFee] = useState(item.govtFee);
  const [note, setNote] = useState(item.govtFeeNote);
  const dirty = fee !== item.professionalFee || govtFee !== item.govtFee || note !== item.govtFeeNote;

  const input = 'bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]';

  return (
    <tr className={`hover:bg-slate-50/80 transition ${item.isActive ? '' : 'opacity-60'}`}>
      <td className="py-3.5 px-4">
        <strong className="text-[#073B5C] block font-extrabold">{item.title}</strong>
        <span className="text-[10px] text-slate-400 uppercase font-mono">{item.category} • /{item.slug}</span>
      </td>
      <td className="py-3.5 px-4">
        <input type="number" min={0} value={fee} onChange={(e) => setFee(Number(e.target.value))} className={`w-28 font-bold text-[#073B5C] ${input}`} />
      </td>
      <td className="py-3.5 px-4">
        <input type="number" min={0} value={govtFee} onChange={(e) => setGovtFee(Number(e.target.value))} className={`w-24 font-bold text-[#073B5C] ${input}`} />
      </td>
      <td className="py-3.5 px-4">
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={`w-full text-xs text-slate-700 ${input}`} />
      </td>
      <td className="py-3.5 px-4">
        <input
          type="checkbox"
          checked={item.isActive}
          disabled={isSaving}
          onChange={(e) => onSave(item.slug, { isActive: e.target.checked })}
          className="w-4 h-4 accent-[#0E7490] cursor-pointer"
          aria-label={`${item.title} is live`}
        />
      </td>
      <td className="py-3.5 px-4 text-right">
        <button
          onClick={() => onSave(item.slug, { professionalFee: fee, govtFee, govtFeeNote: note })}
          disabled={isSaving || !dirty}
          className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-[11px] px-4 py-1.5 rounded-xl uppercase transition shadow cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
