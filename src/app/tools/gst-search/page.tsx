'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GSTData {
  gstin: string;
  stateName: string;
  stateGstCode: string;
  pan: string;
  holderType: string;
  registrationNumber: number;
}

export default function GSTSearchTool() {
  const [gstinQuery, setGstinQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<GSTData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstinQuery.trim()) return;

    setErrorMsg('');
    setIsSearching(true);
    setData(null);

    try {
      const res = await fetch('/api/verify/gstin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: gstinQuery.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Invalid 15-digit GSTIN or taxpayer not found.');
        return;
      }

      setData({
        gstin: json.gstin,
        stateName: json.stateName,
        stateGstCode: json.stateGstCode,
        pan: json.pan,
        holderType: json.holderType,
        registrationNumber: json.registrationNumber,
      });
    } catch {
      setErrorMsg('GSTN portal lookup service temporarily unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased">
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/#catalog-section" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Explore All Services
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow space-y-8">
        <div className="text-center space-y-3">
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            🧾 GSTIN Decoder
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#073B5C]">
            GSTIN Format & Check-Digit Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Instantly check whether a GSTIN is well-formed and see the state, PAN and entity type encoded in it.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-5">
          <form onSubmit={handleSearch} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Enter 15-Digit GSTIN Number *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstinQuery}
                  onChange={(e) => setGstinQuery(e.target.value.toUpperCase())}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 font-mono uppercase text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
                <button
                  type="submit"
                  disabled={isSearching || gstinQuery.length !== 15}
                  className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs px-6 rounded-xl uppercase tracking-wider transition shadow shrink-0 cursor-pointer"
                >
                  {isSearching ? 'Verifying...' : 'Search GSTIN →'}
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          {data && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn text-xs">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">GSTIN:</span>
                    <h3 className="font-mono text-base font-extrabold text-[#0E7490]">{data.gstin}</h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase">
                    ✓ Check digit valid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Registered State</span>
                    <strong>{data.stateName} (Code: {data.stateGstCode})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Embedded PAN</span>
                    <strong className="font-mono">{data.pan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Entity Type (from PAN)</span>
                    <strong>{data.holderType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Registration # under this PAN in state</span>
                    <strong>{data.registrationNumber}</strong>
                  </div>
                </div>

                <p className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  A valid format does not confirm the registration is active. For the legal name, status and return filing
                  history, search on the{' '}
                  <a href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noopener noreferrer" className="text-[#0E7490] font-bold underline">
                    official GST portal
                  </a>
                  .
                </p>

                <div className="pt-2">
                  <Link
                    href="/services/gst-return-filing"
                    className="inline-block bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider text-center transition shadow"
                  >
                    File Monthly GST Returns (₹999/mo) →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}