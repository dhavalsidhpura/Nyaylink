'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceRate {
  slug: string;
  title: string;
  category: string;
  baseFee: number;
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

  const handleUpdate = async (slug: string, newFee: number, newGovtNote: string) => {
    setSavingSlug(slug);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, baseFee: newFee, govtFeeNote: newGovtNote }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.slug === slug ? { ...s, baseFee: newFee, govtFeeNote: newGovtNote } : s))
        );
        alert('Rates updated live in database!');
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
            <p className="text-xs text-slate-500 mt-1">Adjust NyayaLink professional fees and government fee display notes in real-time.</p>
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
                    <th className="py-3 px-4 font-bold w-48">Professional Fee (₹)</th>
                    <th className="py-3 px-4 font-bold">Govt Fee Display Note</th>
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
  onSave: (slug: string, fee: number, note: string) => void;
  isSaving: boolean;
}) {
  const [fee, setFee] = useState(item.baseFee);
  const [note, setNote] = useState(item.govtFeeNote);

  return (
    <tr className="hover:bg-slate-50/80 transition">
      <td className="py-3.5 px-4">
        <strong className="text-[#073B5C] block font-extrabold">{item.title}</strong>
        <span className="text-[10px] text-slate-400 uppercase font-mono">{item.category} • /{item.slug}</span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">₹</span>
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-28 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
          />
        </div>
      </td>
      <td className="py-3.5 px-4">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
        />
      </td>
      <td className="py-3.5 px-4 text-right">
        <button
          onClick={() => onSave(item.slug, fee, note)}
          disabled={isSaving}
          className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-[11px] px-4 py-1.5 rounded-xl uppercase transition shadow cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}