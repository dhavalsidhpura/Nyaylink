'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TrackingData {
  source: string;
  type: string;
  identifier: string;
  srn: string;
  title: string;
  status: string;
  sla: string;
  lastUpdated: string;
  stageNumber: number;
  recommendation: string;
  history: Array<{ stage: string; remarks: string; date: string }>;
}

const STAGES = [
  'Application Lodged',
  'Verification & Fee Clearance',
  'Registrar Scrutiny & Examination',
  'Objection Defense / Publication',
  'Final Certificate Allotment',
];

export default function TrackStatusPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TrackingData | null>(null);

  const handleTrack = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/track-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Failed to locate tracking records.');
        return;
      }
      setData(result);
    } catch {
      setError('An error occurred while tracking this reference. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      {/* TOOL HEADER BANNER */}
      <section className="bg-[#073B5C] text-white py-12 px-4 sm:px-6 border-b border-[#0E7490]/40">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#052A42] text-[#F4B942] text-xs font-black uppercase px-3 py-1 rounded-full border border-slate-700">
            <span>🏛️</span>
            <span>All-India Statutory Registry Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Live MCA SRN, Trademark & GST Status Tracker
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Real-time status tracking for Ministry of Corporate Affairs (MCA) Service Request Numbers, Trade Marks Registry application numbers, and GST ARNs.
          </p>

          {/* OMNIBAR SEARCH INPUT */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border-2 border-cyan-500/30"
            >
              <div className="flex items-center gap-2 pl-3 w-full sm:w-auto flex-1">
                <span className="text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter MCA SRN (F12345678), TM No (5849201), or ARN..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none py-2"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full sm:w-auto bg-[#073B5C] hover:bg-[#052A42] disabled:bg-slate-300 text-[#F4B942] font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow whitespace-nowrap"
              >
                {loading ? 'Querying Portals...' : 'Track Status →'}
              </button>
            </form>

            {/* PRE-POPULATED QUICK SEARCH CHIPS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-300">
              <span className="text-slate-400 font-semibold">Try sample:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('F92837412');
                  handleTrack('F92837412');
                }}
                className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-cyan-200 font-mono transition"
              >
                MCA SRN: F92837412
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('5849201');
                  handleTrack('5849201');
                }}
                className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-cyan-200 font-mono transition"
              >
                Trademark: 5849201
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('AA270324123456P');
                  handleTrack('AA270324123456P');
                }}
                className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-cyan-200 font-mono transition"
              >
                GST ARN: AA270324123456P
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKING RESULTS CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-fadeIn">
            {/* OVERVIEW CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-cyan-100 text-[#0E7490] font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                      {data.source}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{data.type}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#073B5C] font-mono mt-1">
                    {data.srn}
                  </h2>
                  <p className="text-xs font-bold text-slate-700">{data.title}</p>
                </div>

                <div className="text-right sm:shrink-0 space-y-1">
                  <span
                    className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase ${
                      data.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.status.includes('OBJECTED')
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {data.status.replace(/_/g, ' ')}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium">SLA: {data.sla}</span>
                </div>
              </div>

              {/* 5-STAGE PROGRESS STEPPER */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Statutory Progression Lifecycle
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {STAGES.map((label, idx) => {
                    const stepNumber = idx + 1;
                    const isCompleted = stepNumber <= data.stageNumber;
                    const isCurrent = stepNumber === data.stageNumber;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-[#F4B942] ring-2 ring-amber-300'
                                : 'bg-[#0E7490]'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block leading-tight ${
                            isCurrent
                              ? 'text-[#073B5C] font-black'
                              : isCompleted
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONABLE NEXT STEP MEMO */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
                  Legal Advice & Next Action
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {data.recommendation}
                </p>

                {data.status.includes('OBJECTED') && (
                  <div className="pt-2">
                    <Link
                      href="/services/trademark-objection"
                      className="inline-block bg-[#073B5C] hover:bg-[#052A42] text-[#F4B942] font-black text-xs px-4 py-2 rounded-xl transition-colors shadow"
                    >
                      File Official TM Objection Reply (₹2,999) →
                    </Link>
                  </div>
                )}
              </div>

              {/* AUDIT LOG TIMELINE */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Registry Activity Log
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {data.history.map((h, i) => (
                    <div key={i} className="p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50 transition">
                      <div className="space-y-0.5">
                        <strong className="text-slate-800 font-bold block">{h.stage}</strong>
                        <span className="text-slate-500 text-[11px]">{h.remarks}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(h.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT INFORMATION CARD */}
        {!data && !loading && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-extrabold text-[#073B5C] text-sm">
              How does the NyayaLink Unified Status Tracker work?
            </h3>
            <p>
              Our automated registry tracking engine bridges multiple statutory portals under one unified interface:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong>MCA V3 Registry:</strong> Validates SPICe+ Part B incorporation status, DIN allotments, and annual e-Forms (AOC-4, MGT-7).</li>
              <li><strong>Trade Marks Registry (IP India):</strong> Inspects examination reports, Vienna classifications, journal advertisements, and Section 9/11 objections.</li>
              <li><strong>GSTN Portal:</strong> Tracks Form REG-01 Application Reference Numbers (ARN) and state tax officer approvals.</li>
              <li><strong>NyayaLink Vault Dockets:</strong> Provides live internal caseworker updates and verified document reviews for your orders.</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
