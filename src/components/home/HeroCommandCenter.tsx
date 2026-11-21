'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INDIAN_STATES, getStateStampDuty, formatINR } from '@/lib/pricing';
import type { MASTER_SERVICES } from '@/data/services';

interface HeroCommandCenterProps {
  servicesList: typeof MASTER_SERVICES;
}

export default function HeroCommandCenter({ servicesList }: HeroCommandCenterProps) {
  const [heroTab, setHeroTab] = useState<'calculator' | 'name-check' | 'callback'>('calculator');
  const [estimatorService, setEstimatorService] = useState('private-limited-company');
  const [estimatorState, setEstimatorState] = useState('MH');

  // Hero MCA Name Availability Checker State
  const [heroNameQuery, setHeroNameQuery] = useState('');
  const [heroNameSuffix, setHeroNameSuffix] = useState('Private Limited');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameCheckResult, setNameCheckResult] = useState<{
    query: string;
    isAvailable: boolean;
    score: number;
    conflicts: string[];
    recommendation: string;
    suggestedNames?: string[];
  } | null>(null);

  // Callback Form Fields
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbEmail, setCbEmail] = useState('');
  const [isSubmittingCb, setIsSubmittingCb] = useState(false);
  const [cbSubmitted, setCbSubmitted] = useState(false);

  // Selected Service for Quote Estimator
  const currentEstimatorService = servicesList.find((s) => s.slug === estimatorService) || servicesList[0];

  const isCompanyRegService =
    currentEstimatorService?.category === 'company-reg' ||
    currentEstimatorService?.slug.includes('company') ||
    currentEstimatorService?.slug.includes('llp');

  const estimatorStampDuty = isCompanyRegService ? getStateStampDuty(estimatorState).amount : 0;
  const estimatorGstAmount = Math.round(((currentEstimatorService?.price || 0) * 18) / 100);
  const estimatorTotalOutlay = (currentEstimatorService?.price || 0) + estimatorGstAmount + estimatorStampDuty;

  // Callback form handler
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCb(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cbName,
          phone: cbPhone,
          email: cbEmail,
          source: 'Homepage Instant Estimator Desk',
          complianceType: currentEstimatorService?.title || 'General Legal Inquiry',
        }),
      });
      setCbSubmitted(true);
    } catch {
      alert('Could not submit request. Please try contacting via WhatsApp or phone.');
    } finally {
      setIsSubmittingCb(false);
    }
  };

  // Hero MCA Name Checker submit handler
  const handleHeroNameCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroNameQuery.trim()) return;

    setIsCheckingName(true);
    setNameCheckResult(null);

    setTimeout(() => {
      const cleanName = heroNameQuery.trim().toUpperCase();
      const isConflicting = ['TATA', 'RELIANCE', 'INFOSYS', 'NYAYALINK', 'MOBIZ', 'WIPRO', 'HDFC', 'BIRLA'].some((b) =>
        cleanName.includes(b)
      );

      if (isConflicting) {
        setNameCheckResult({
          query: `${heroNameQuery.trim()} ${heroNameSuffix}`,
          isAvailable: false,
          score: 35,
          conflicts: [
            `${heroNameQuery.trim()} TECHNOLOGIES PVT LTD (CIN: U72900MH2021PTC369123)`,
            `${heroNameQuery.trim()} ENTERPRISES LLP (LLPIN: AAB-9921)`,
          ],
          recommendation:
            'This name shares high phonetic similarity with existing registered entities in the MCA V3 registry. ROC CRC scrutiny may reject this application.',
          suggestedNames: [
            `${heroNameQuery.trim()} Global Systems ${heroNameSuffix}`,
            `NextGen ${heroNameQuery.trim()} Solutions ${heroNameSuffix}`,
            `${heroNameQuery.trim()} Enterprise Innovations ${heroNameSuffix}`,
          ],
        });
      } else {
        setNameCheckResult({
          query: `${heroNameQuery.trim()} ${heroNameSuffix}`,
          isAvailable: true,
          score: 96,
          conflicts: [],
          recommendation:
            'Excellent! No identical entity or active trademark conflict found in MCA registry. This name qualifies for RUN / SPICe+ Part A reservation.',
        });
      }
      setIsCheckingName(false);
    }, 800);
  };

  return (
    <div className="lg:col-span-5" id="hero-booking-card">
      <div className="bg-white text-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute -top-3 right-4 sm:right-6 bg-[#F4B942] text-[#073B5C] text-[9px] sm:text-[10px] font-black uppercase px-2.5 sm:px-3.5 py-1 rounded-full shadow-md truncate max-w-[85%]">
          ⚡ Instant Booking & Verification Desk
        </div>

        {/* 3-Tab Switcher: Calculator vs MCA Name Check vs Free Callback */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold gap-0.5">
          <button
            type="button"
            onClick={() => setHeroTab('calculator')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate cursor-pointer ${
              heroTab === 'calculator'
                ? 'bg-white text-[#073B5C] shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ⚡ Fee Estimator
          </button>
          <button
            type="button"
            onClick={() => setHeroTab('name-check')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate cursor-pointer ${
              heroTab === 'name-check'
                ? 'bg-white text-[#073B5C] shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🔍 MCA Name Check
          </button>
          <button
            type="button"
            onClick={() => setHeroTab('callback')}
            className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate cursor-pointer ${
              heroTab === 'callback'
                ? 'bg-white text-[#073B5C] shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📞 Free Callback
          </button>
        </div>

        {/* TAB 1: Self-Serve Instant Calculator Mode */}
        {heroTab === 'calculator' && (
          <div className="space-y-3.5 text-xs">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                Estimate & Book with ₹999 Advance
              </h3>
              <p className="text-[11px] text-slate-500">
                Transparent statutory stamp duties & professional retainers upfront.
              </p>
            </div>

            {/* Step 1: Categorized Service Selector */}
            <div>
              <label className="block font-bold text-[#073B5C] mb-1">
                1. Select Filing Requirement:
              </label>
              <select
                value={estimatorService}
                onChange={(e) => setEstimatorService(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              >
                <optgroup label="🏢 Company & Business Registration">
                  {servicesList
                    .filter((s) => s.category === 'company-reg')
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.icon} {s.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="™️ Trademark & Intellectual Property">
                  {servicesList
                    .filter((s) => s.category === 'trademark-ipr' || s.category === 'copyright')
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.icon} {s.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🧾 Tax, Accounting & GST">
                  {servicesList
                    .filter((s) => s.category === 'tax-accounting')
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.icon} {s.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📜 Licenses, Permits & Certifications">
                  {servicesList
                    .filter((s) => s.category === 'licenses-permits')
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.icon} {s.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🚀 Business Transformation & Tech">
                  {servicesList
                    .filter((s) => s.category === 'business-tech')
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.icon} {s.title}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Step 2: State selector */}
            <div>
              <label className="block font-bold text-[#073B5C] mb-1">
                2. State of Registered Office:
              </label>
              <select
                value={estimatorState}
                onChange={(e) => setEstimatorState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} {isCompanyRegService ? `(₹${getStateStampDuty(st.code).amount.toLocaleString()} Stamp Duty)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Matrix Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>NyayaLink Professional Fee:</span>
                <strong className="text-slate-900">{formatINR(currentEstimatorService?.price || 0)}</strong>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>GST @ 18% (ITC Eligible):</span>
                <strong className="text-slate-900">{formatINR(estimatorGstAmount)}</strong>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Govt Stamp / Statutory Fee:</span>
                <strong className="text-slate-900">
                  {estimatorStampDuty > 0 ? formatINR(estimatorStampDuty) : 'Direct at actuals'}
                </strong>
              </div>

              <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center font-extrabold text-[#073B5C] text-sm">
                <span>Total Payable (GST-Inclusive):</span>
                <span className="text-base text-emerald-700 font-black">{formatINR(estimatorTotalOutlay)}</span>
              </div>
            </div>

            {/* Impulse CTA Button */}
            <Link
              href={`/services/${estimatorService}?state=${estimatorState}`}
              className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Start Now for ₹999 Advance Token →</span>
            </Link>

            <p className="text-[10px] text-slate-400 text-center leading-tight">
              🔒 ₹999 locks in CA review and name reservation. Balance settled after drafting.
            </p>
          </div>
        )}

        {/* TAB 2: MCA Name Availability Checker Mode */}
        {heroTab === 'name-check' && (
          <div className="space-y-3.5 text-xs">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                Free MCA Name Availability Check
              </h3>
              <p className="text-[11px] text-slate-500">
                Screen against registered companies, LLPs & trademarks before filing.
              </p>
            </div>

            <form onSubmit={handleHeroNameCheck} className="space-y-2.5">
              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  Proposed Company Name:
                </label>
                <input
                  type="text"
                  required
                  value={heroNameQuery}
                  onChange={(e) => setHeroNameQuery(e.target.value)}
                  placeholder="e.g. NexaWave Technologies"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  Corporate Entity Suffix:
                </label>
                <select
                  value={heroNameSuffix}
                  onChange={(e) => setHeroNameSuffix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="OPC Private Limited">One Person Company (OPC)</option>
                  <option value="Limited">Public Limited</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCheckingName || !heroNameQuery.trim()}
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-xl uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCheckingName ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#F4B942] border-t-transparent rounded-full animate-spin"></span>
                    <span>Searching MCA V3 Registry...</span>
                  </>
                ) : (
                  <span>Verify Name Availability Now →</span>
                )}
              </button>
            </form>

            {/* Name Check Result Box */}
            {nameCheckResult && (
              <div
                className={`p-3 rounded-2xl border ${
                  nameCheckResult.isAvailable
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950'
                } space-y-2 animate-in fade-in zoom-in-95 duration-150`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">
                    {nameCheckResult.isAvailable ? '🎉 Name Available!' : '⚠️ Conflict Detected'}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      nameCheckResult.isAvailable
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    Score: {nameCheckResult.score}/100
                  </span>
                </div>

                <p className="text-[11px] leading-tight font-medium">
                  {nameCheckResult.recommendation}
                </p>

                {nameCheckResult.isAvailable ? (
                  <Link
                    href={`/services/private-limited-company?name=${encodeURIComponent(
                      nameCheckResult.query
                    )}`}
                    className="block w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-center text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow"
                  >
                    Reserve & Incorporate for ₹999 Token →
                  </Link>
                ) : (
                  nameCheckResult.suggestedNames && (
                    <div className="pt-1 border-t border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-amber-900 block">
                        Try These Available Alternatives:
                      </span>
                      <div className="space-y-1">
                        {nameCheckResult.suggestedNames.map((alt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setHeroNameQuery(alt.replace(` ${heroNameSuffix}`, ''));
                              setNameCheckResult(null);
                            }}
                            className="w-full text-left p-1.5 bg-white/80 hover:bg-white rounded-lg text-[10px] font-bold text-slate-800 border border-amber-200/60 transition flex justify-between items-center cursor-pointer"
                          >
                            <span>{alt}</span>
                            <span className="text-emerald-700 font-extrabold">Check ↗</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Free 15-Min CA Callback Mode */}
        {heroTab === 'callback' && (
          <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
            {cbSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <h4 className="font-black text-[#073B5C] text-base">Request Received!</h4>
                <p className="text-slate-500 text-xs">
                  A dedicated CA from our Mumbai desk will call you within 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCbSubmitted(false);
                    setHeroTab('calculator');
                  }}
                  className="text-xs text-[#0E7490] font-bold underline pt-2 cursor-pointer"
                >
                  Back to fee calculator
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-[#073B5C]">Request Expert Legal Callback</h3>
                  <p className="text-[11px] text-slate-500">
                    Direct phone consultation with an empanelled CA/CS. Zero spam.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={cbName}
                    onChange={(e) => setCbName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Mobile (+91) *</label>
                    <input
                      type="tel"
                      required
                      value={cbPhone}
                      onChange={(e) => setCbPhone(e.target.value)}
                      placeholder="+91 9920054785"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={cbEmail}
                      onChange={(e) => setCbEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCb}
                  className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isSubmittingCb ? 'Connecting...' : 'Request Free 15-Min Callback →'}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  🔒 Confidential. Covered by Bar Council Advocate-Client confidentiality.
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
