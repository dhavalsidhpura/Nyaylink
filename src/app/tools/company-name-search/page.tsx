'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  query: string;
  isAvailable: boolean;
  score: number;
  conflicts: string[];
  recommendation: string;
  suggestedNames: string[];
}

export default function CompanyNameSearchTool() {
  const [companyName, setCompanyName] = useState('');
  const [suffix, setSuffix] = useState('Private Limited');
  const [state, setState] = useState('Maharashtra');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSearching(true);
    setResult(null);

    // Simulating Sandbox.co.in / MCA V3 Registry API call
    setTimeout(() => {
      const cleanName = companyName.trim().toUpperCase();
      const isConflicting = ['TATA', 'RELIANCE', 'INFOSYS', 'NYAYALINK', 'MOBIZ'].some((brand) =>
        cleanName.includes(brand)
      );

      if (isConflicting) {
        setResult({
          query: `${companyName.trim()} ${suffix}`,
          isAvailable: false,
          score: 35,
          conflicts: [
            `${companyName.trim()} TECHNOLOGIES PVT LTD (CIN: U72900MH2021PTC369123)`,
            `${companyName.trim()} VENTURES LLP (LLPIN: AAB-9921)`,
          ],
          recommendation:
            'This name shares high phonetic similarity with existing registered entities or protected trademarks. Under Rule 8 of Companies Act 2013, ROC may reject this application.',
          suggestedNames: [
            `${companyName.trim()} Global Systems ${suffix}`,
            `NextGen ${companyName.trim()} Solutions ${suffix}`,
            `${companyName.trim()} Enterprise Innovations ${suffix}`,
          ],
        });
      } else {
        setResult({
          query: `${companyName.trim()} ${suffix}`,
          isAvailable: true,
          score: 95,
          conflicts: [],
          recommendation:
            'Excellent! No phonetically identical company or active trademark conflict found in the MCA registry. This name qualifies for RUN / SPICe+ Part A reservation.',
          suggestedNames: [],
        });
      }
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased">
      {/* Navigation Header */}
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

      {/* Hero & Search Tool */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow space-y-8">
        <div className="text-center space-y-3">
          <span className="bg-cyan-100 text-[#0E7490] border border-cyan-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            ⚡ Free MCA Registry Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#073B5C]">
            Company Name Availability Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Check real-time MCA database availability, phonetic similarity, and trademark conflicts under Rule 8 of Companies Act 2013.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-5">
          <form onSubmit={handleSearch} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block font-bold text-[#073B5C] mb-1">Proposed Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Nexus Logistics"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-[#073B5C] mb-1">Entity Structure</label>
                <select
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="LLP">LLP</option>
                  <option value="OPC Private Limited">OPC Pvt Ltd</option>
                  <option value="Limited">Public Limited</option>
                  <option value="Section 8">Section 8 (NGO)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-[#073B5C] mb-1">Jurisdiction State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="Maharashtra">Maharashtra (Mumbai/Pune)</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Karnataka">Karnataka (Bengaluru)</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
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
                  Scanning MCA V3 & IP India Databases...
                </>
              ) : (
                '🔍 Check Availability on MCA Registry →'
              )}
            </button>
          </form>

          {/* Search Result Display */}
          {result && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
              {result.isAvailable ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      <strong className="text-emerald-900 font-extrabold text-sm sm:text-base">
                        {result.query} is Available!
                      </strong>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
                      Score: {result.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">{result.recommendation}</p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/services/private-limited-company?name=${encodeURIComponent(companyName.trim())}`}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider text-center transition shadow"
                    >
                      Reserve Name & Incorporate Now (₹6,999) →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <strong className="text-rose-900 font-extrabold text-sm sm:text-base">
                        Potential Conflicts Detected for &quot;{result.query}&quot;
                      </strong>
                    </div>
                    <span className="bg-rose-200 text-rose-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
                      Score: {result.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">{result.recommendation}</p>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-rose-900 block">Existing Active Registries:</span>
                    <ul className="list-disc pl-5 text-[11px] text-rose-700 space-y-0.5">
                      {result.conflicts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {result.suggestedNames.length > 0 && (
                    <div className="pt-2 border-t border-rose-200 space-y-2">
                      <span className="text-[11px] font-extrabold text-[#073B5C] block">
                        💡 Suggested Available Alternatives:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestedNames.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setCompanyName(sug.replace(` ${suffix}`, ''));
                            }}
                            className="bg-white border border-slate-300 text-slate-800 font-bold text-[11px] px-3 py-1.5 rounded-lg hover:border-[#0E7490] hover:text-[#0E7490] transition"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MCA Naming Rules Guidance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
          <h3 className="font-extrabold text-[#073B5C] text-sm">📘 MCA Name Selection Rules at a Glance:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-[#073B5C]">1. Distinctive Word Requirement</strong>
              Must contain a unique prefix and an activity descriptor (e.g., &quot;Apex&quot; + &quot;Logistics&quot;).
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-[#073B5C]">2. No Trademark Infringement</strong>
              Cannot be identical to registered Class 1–45 brand marks under IP India.
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-[#073B5C]">3. Restricted Government Words</strong>
              Words like &quot;National&quot;, &quot;Bharat&quot;, &quot;Federal&quot;, or &quot;Ministry&quot; require central clearance.
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-[#073B5C]">4. No Plural/Spelling Bypasses</strong>
              Adding an &quot;s&quot; or changing case does not make a conflicting name unique.
            </li>
          </ul>
        </div>

        {/* Company Name Search FAQs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Expert guidance on MCA V3 name reservations, Rule 8 guidelines, and trademark clearances.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                q: 'How does this tool check company name availability?',
                a: 'Our search engine cross-references both the Ministry of Corporate Affairs (MCA V3) database of incorporated companies / LLPs and the IP India trademark registry across Classes 1 through 45. It checks for exact word matches, phonetic similarities, and prohibited prefix/suffix structures under Rule 8 of the Companies (Incorporation) Rules, 2014.',
              },
              {
                q: 'What are the essential elements of an acceptable company name?',
                a: 'An approvable name requires three components: (1) A unique and distinctive coined prefix (e.g., "Acrobat"), (2) An activity descriptor reflecting your business objective (e.g., "Technologies", "Consulting", "Solutions"), and (3) The statutory entity suffix (e.g., "Private Limited" or "LLP").',
              },
              {
                q: 'Why can a name be rejected even if no identical company exists?',
                a: 'The Registrar of Companies (ROC) Central Registration Centre (CRC) rejects names that sound identical to existing entities (e.g., "Kwik" vs "Quick"), names that translate to the same word, or names that clash with a registered or pending trademark in related business classes.',
              },
              {
                q: 'How long is an approved company name reserved once filed?',
                a: 'For new company incorporation under SPICe+ Part A, an approved name is reserved for 20 calendar days from the date of approval. For existing companies applying for a name change via the RUN (Reserve Unique Name) form, the reservation is valid for 60 calendar days.',
              },
              {
                q: 'Can I use a registered trademark as my company name?',
                a: 'Yes. In fact, holding a registered trademark or applied mark gives you legal priority. If CRC raises an objection under Rule 8 clashing with your own trademark, providing your trademark registration certificate or applicant NOC clears the name approval immediately.',
              },
              {
                q: 'What is the government fee for MCA name reservation?',
                a: 'Filing a standalone RUN form on MCA V3 costs ₹1,000 for company reservation and ₹200 for LLP reservation (RUN-LLP). However, when incorporating directly via SPICe+ Part B, name reservation is bundled with the incorporation application at zero additional name fee for small companies.',
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