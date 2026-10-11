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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

        {/* GST Verification FAQs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">Frequently Asked Questions on GSTIN & Compliance</h3>
            <p className="text-xs text-slate-500">Key insights on GSTIN syntax, status codes, vendor ITC verification, and return deadlines.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                q: 'How is a 15-digit GSTIN structured?',
                a: 'A Goods and Services Tax Identification Number (GSTIN) follows a strict statutory structure: (1) Digits 1–2 represent the state code (e.g., 27 for Maharashtra, 07 for Delhi, 29 for Karnataka); (2) Digits 3–12 contain the 10-digit PAN of the entity; (3) Digit 13 represents the entity registration count under that PAN within that state (1 to 9, then A to Z); (4) Digit 14 is default "Z"; (5) Digit 15 is a calculated alphanumeric check-digit derived via the Luhn algorithm.',
              },
              {
                q: 'What does an "Active" vs "Suspended" or "Cancelled" GST status mean?',
                a: '"Active" status confirms that the taxpayer is in good standing and legally authorized to levy GST and pass on Input Tax Credit (ITC). "Suspended" indicates an ongoing departmental inquiry or non-reconciliation. "Cancelled" status indicates that the registration was terminated—either upon voluntary surrender or suo-motu by the tax officer due to continuous non-filing of returns (6 consecutive months for regular taxpayers).',
              },
              {
                q: 'Why must businesses verify vendor GSTIN before paying invoices?',
                a: 'Under Section 16(2)(aa) of the CGST Act, Input Tax Credit (ITC) can only be claimed if your supplier has actually filed their GSTR-1 and the invoice appears in your auto-generated GSTR-2B. If a vendor operates with an invalid or suspended GSTIN, your ITC claim will be rejected by the tax department with 18% interest penalties.',
              },
              {
                q: 'What are the aggregate turnover limits requiring mandatory GST registration?',
                a: 'For businesses supplying goods, registration is mandatory if annual turnover exceeds ₹40 Lakhs (₹20 Lakhs in Special Category States like Northeast states and Uttarakhand). For service providers, the turnover threshold is ₹20 Lakhs (₹10 Lakhs in Special Category States). Regardless of turnover, inter-state suppliers and e-commerce sellers must register mandatorily.',
              },
              {
                q: 'How do I add branches or change my registered business address?',
                a: 'You can update your business address or add an Additional Place of Business (APoB) by filing a Core Amendment on the GST portal within 15 days of relocation. Required documents include an updated electricity bill, registered rent agreement, and landlord consent NOC. Our CA desk completes amendment filings within 24 hours.',
              },
              {
                q: 'What are the penalties for late filing of GST returns?',
                a: 'The government levies a statutory late fee of ₹50 per day (₹20 per day for Nil returns) for delayed filing of GSTR-1 and GSTR-3B, subject to a statutory ceiling. Additionally, interest at 18% per annum is payable on net unpaid cash tax liability from the due date until the actual date of payment.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-sm text-[#0E7490] font-mono shrink-0">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}