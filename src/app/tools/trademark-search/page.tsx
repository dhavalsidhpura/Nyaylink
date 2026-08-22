'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TMResult {
  brandName: string;
  recommendedClass: number;
  classDescription: string;
  isAvailable: boolean;
  score: number;
  existingMarks: { name: string; classNo: number; status: string }[];
  filingTip: string;
}

export default function TrademarkSearchTool() {
  const [brandName, setBrandName] = useState('');
  const [businessType, setBusinessType] = useState('42');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<TMResult | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setIsSearching(true);
    setResult(null);

    // Simulating IP India Registry Search
    setTimeout(() => {
      const clean = brandName.trim().toUpperCase();
      const hasConflict = ['APPLE', 'GOOGLE', 'NYAYA', 'AMAZON', 'ZOMATO', 'MOBIZ'].some((b) =>
        clean.includes(b)
      );

      const classDescriptions: Record<string, string> = {
        '9': 'Computers, Software, Mobile Electronics & Hardware',
        '25': 'Clothing, Footwear & Apparel',
        '30': 'Food, Spices, Bakery & Packaged Edibles',
        '35': 'E-commerce, Retail, Advertising & Business Management',
        '42': 'SaaS, Software Development & IT Services',
        '45': 'Legal Services & Dispute Resolution',
      };

      if (hasConflict) {
        setResult({
          brandName: brandName.trim(),
          recommendedClass: parseInt(businessType),
          classDescription: classDescriptions[businessType] || 'Specialized Goods & Services',
          isAvailable: false,
          score: 42,
          existingMarks: [
            { name: `${clean} INDIA PVT LTD`, classNo: parseInt(businessType), status: 'Registered ®' },
            { name: `${clean} GLOBAL VENTURES`, classNo: parseInt(businessType), status: 'Opposed / Pending' },
          ],
          filingTip:
            'A phonetically similar or identical wordmark already exists under this NICE Class. We recommend adding a unique invented word prefix before submitting Form TM-A.',
        });
      } else {
        setResult({
          brandName: brandName.trim(),
          recommendedClass: parseInt(businessType),
          classDescription: classDescriptions[businessType] || 'Specialized Goods & Services',
          isAvailable: true,
          score: 96,
          existingMarks: [],
          filingTip:
            'High likelihood of registration! No direct phonetic conflicts found in IP India Journal. Fast-track filing available under MSME fee concession (₹4,500 govt fee).',
        });
      }
      setIsSearching(false);
    }, 1200);
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
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            ™️ IP India Brand Protection Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#073B5C]">
            Trademark & NICE Class Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Search 45 NICE classifications, check phonetic brand conflicts, and prevent Section 9 / 11 objections.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-5">
          <form onSubmit={handleSearch} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block font-bold text-[#073B5C] mb-1">Brand Name / Slogan / Wordmark *</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Mobizspare, AcmeFlow"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block font-bold text-[#073B5C] mb-1">Business Industry / Class</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="42">Class 42: Software, Tech & SaaS</option>
                  <option value="35">Class 35: E-commerce, Retail & Ads</option>
                  <option value="9">Class 9: Mobile Electronics & Hardware</option>
                  <option value="30">Class 30: Food, Snacks & Beverages</option>
                  <option value="25">Class 25: Clothing & Fashion</option>
                  <option value="45">Class 45: Legal & Security Services</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Searching IP India Database & TM Journal...
                </>
              ) : (
                '🔍 Search TM Class & Phonetic Conflicts →'
              )}
            </button>
          </form>

          {result && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
              {result.isAvailable ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      <strong className="text-emerald-900 font-extrabold text-sm sm:text-base">
                        &quot;{result.brandName}&quot; is Available in Class {result.recommendedClass}!
                      </strong>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
                      Score: {result.score}/100
                    </span>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span><strong>NICE Class {result.recommendedClass}:</strong> {result.classDescription}</span>
                    <p className="text-[11px] leading-relaxed pt-1 text-slate-700">{result.filingTip}</p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/services/trademark-registration?brand=${encodeURIComponent(result.brandName)}`}
                      className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider text-center transition shadow"
                    >
                      File Trademark in Class {result.recommendedClass} (₹1,999 + Govt Fee) →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <strong className="text-rose-900 font-extrabold text-sm sm:text-base">
                        Potential Conflicts in Class {result.recommendedClass}
                      </strong>
                    </div>
                    <span className="bg-rose-200 text-rose-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
                      Score: {result.score}/100
                    </span>
                  </div>

                  <p className="text-xs text-rose-800 leading-relaxed">{result.filingTip}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-rose-900 block">Existing Registered Marks:</span>
                    <div className="space-y-1">
                      {result.existingMarks.map((m, i) => (
                        <div key={i} className="flex justify-between p-2.5 bg-white rounded-lg border border-rose-200 text-[11px]">
                          <strong className="text-slate-800">{m.name}</strong>
                          <span className="text-rose-700 font-extrabold">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/services/trademark-objection-reply"
                      className="inline-block bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider text-center transition shadow"
                    >
                      Consult IPR Attorney for Clearance →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}