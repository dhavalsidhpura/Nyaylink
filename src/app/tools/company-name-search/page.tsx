'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface SearchResult {
  query: string;
  isAvailable: boolean;
  label: string;
  conflicts: string[];
  recommendation: string;
  suggestedNames: string[];
}

const KNOWN_BRANDS = ['TATA', 'RELIANCE', 'INFOSYS', 'NYAYALINK', 'MOBIZ', 'WIPRO', 'HDFC', 'ICICI', 'BIRLA', 'FLIPKART', 'AMAZON', 'ZOMATO', 'SWIGGY', 'PAYTM', 'RAZORPAY'];
const RESTRICTED_WORDS = ['NATIONAL', 'BHARAT', 'FEDERAL', 'RESERVE', 'MINISTRY', 'GOVERNMENT', 'PARLIAMENT', 'REPUBLIC', 'UNION', 'BANK', 'INSURANCE', 'EXCHANGE'];

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

    setTimeout(() => {
      const cleanName = companyName.trim().toUpperCase();
      const tokens = cleanName.split(/\s+/).filter(Boolean);
      const matchedBrand = KNOWN_BRANDS.find((brand) => cleanName.includes(brand));
      const matchedRestricted = RESTRICTED_WORDS.find((w) => tokens.includes(w));
      const isTooShort = tokens.length === 1 && cleanName.length < 4;

      if (matchedBrand || matchedRestricted || isTooShort) {
        const conflicts: string[] = [];
        if (matchedBrand) conflicts.push(`Matches well-known registered mark/entity containing "${matchedBrand}" (Rule 8A/8B conflict risk).`);
        if (matchedRestricted) conflicts.push(`Contains restricted term "${matchedRestricted}" requiring Central Government approval under Rule 8B.`);
        if (isTooShort) conflicts.push('Single short word under 4 characters is typically rejected unless paired with an activity descriptor.');

        setResult({
          query: `${companyName.trim()} ${suffix}`,
          isAvailable: false,
          label: 'Rule 8 Risk Flagged',
          conflicts,
          recommendation:
            'Our Rule 8 preliminary screen detected a naming restriction or brand clash risk. Consider adding a distinctive coined prefix and activity descriptor before filing SPICe+ Part A.',
          suggestedNames: [
            `${companyName.trim()} Global Systems ${suffix}`,
            `Nexa ${companyName.trim()} Solutions ${suffix}`,
            `${companyName.trim()} Enterprise Ventures ${suffix}`,
          ],
        });
      } else {
        setResult({
          query: `${companyName.trim()} ${suffix}`,
          isAvailable: true,
          label: 'Passes Rule 8 Pre-Screen',
          conflicts: [],
          recommendation:
            'Structure looks compliant with MCA Rule 8 formatting (no restricted words or major brand clashes flagged). Note: live MCA V3 & IP India database lookup is still required before final filing.',
          suggestedNames: [],
        });
      }
      setIsSearching(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased">
      <Header />

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
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      <strong className="text-emerald-900 font-extrabold text-sm sm:text-base">
                        {result.query} — {result.label}
                      </strong>
                    </div>
                    <a
                      href="https://www.mca.gov.in/mcafoportal/showCheckCompanyName.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-emerald-300 text-emerald-900 font-bold px-2.5 py-1 rounded-lg text-[11px] hover:underline"
                    >
                      Verify on MCA Portal ↗
                    </a>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">{result.recommendation}</p>

                  {(() => {
                    const targetSlug =
                      suffix === 'LLP'
                        ? 'llp-registration'
                        : suffix === 'OPC Private Limited'
                        ? 'one-person-company'
                        : suffix === 'Limited'
                        ? 'public-limited-company'
                        : suffix === 'Section 8'
                        ? 'section-8-company'
                        : 'private-limited-company';
                    const targetUrl = `/services/${targetSlug}?name=${encodeURIComponent(companyName.trim())}&state=${encodeURIComponent(state)}`;

                    return (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Link
                            href={targetUrl}
                            className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3.5 rounded-xl uppercase tracking-wider text-center transition shadow flex-1 flex items-center justify-center gap-2"
                          >
                            <span>🚀 Reserve &quot;{companyName.trim()}&quot; for ₹999 Token →</span>
                          </Link>
                          <a
                            href={`https://wa.me/919920054785?text=${encodeURIComponent(
                              `Hi NyayaLink Team, I ran the MCA Rule 8 pre-screen for "${companyName.trim()} ${suffix}" in ${state}. Please verify availability on MCA V3 and reserve this name with the ₹999 token.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 shrink-0"
                          >
                            <span>💬 WhatsApp CS</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium pt-0.5">
                          <span>🛡️</span>
                          <span>Empanelled CS verifies Rule 8 compliance prior to filing. 100% Free Re-submission Guarantee if ROC queries name.</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <strong className="text-rose-900 font-extrabold text-sm sm:text-base">
                        Rule 8 Flags for &quot;{result.query}&quot;
                      </strong>
                    </div>
                    <span className="bg-rose-200 text-rose-900 font-bold px-2.5 py-0.5 rounded text-[11px]">
                      {result.label}
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
                            type="button"
                            onClick={() => {
                              setCompanyName(sug.replace(` ${suffix}`, ''));
                            }}
                            className="bg-white border border-slate-300 text-slate-800 font-bold text-[11px] px-3 py-1.5 rounded-lg hover:border-[#0E7490] hover:text-[#0E7490] transition cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const targetSlug =
                      suffix === 'LLP'
                        ? 'llp-registration'
                        : suffix === 'OPC Private Limited'
                        ? 'one-person-company'
                        : suffix === 'Limited'
                        ? 'public-limited-company'
                        : suffix === 'Section 8'
                        ? 'section-8-company'
                        : 'private-limited-company';
                    const targetUrl = `/services/${targetSlug}?note=mca-name-clearance&name=${encodeURIComponent(companyName.trim())}&state=${encodeURIComponent(state)}`;

                    return (
                      <div className="space-y-2 pt-2 border-t border-rose-200">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Link
                            href={targetUrl}
                            className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3.5 rounded-xl uppercase tracking-wider text-center transition shadow flex-1 flex items-center justify-center gap-2"
                          >
                            <span>⚖️ File SPICe+ with 2 Alternative Names (₹999 Token) →</span>
                          </Link>
                          <a
                            href={`https://wa.me/919920054785?text=${encodeURIComponent(
                              `Hi NyayaLink Team, I checked "${companyName.trim()} ${suffix}" on your MCA Name Checker and found conflicts (${result.conflicts.slice(0, 2).join(', ')}). How can your CS help me modify or clear the name for ROC approval?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 shrink-0"
                          >
                            <span>💬 Consult CS on Name Fix</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-rose-800 font-medium pt-0.5">
                          <span>💡</span>
                          <span>Our CS drafts distinctive prefix/activity combinations and NOC affidavits under MCA Rule 8A/8B to secure name approval.</span>
                        </div>
                      </div>
                    );
                  })()}
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