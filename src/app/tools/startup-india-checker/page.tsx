'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type EntityChoice = 'pvt-ltd' | 'llp' | 'partnership' | 'proprietorship';
type DateChoice = 'after-2016' | 'before-2016' | 'older-10yrs';
type TurnoverChoice = 'under-100cr' | '100cr-200cr' | 'above-200cr';
type InnovationChoice = 'deeptech' | 'software' | 'novel-process' | 'traditional';

export default function StartupIndiaCheckerPage() {
  const [step, setStep] = useState<number>(1);
  const [entity, setEntity] = useState<EntityChoice>('pvt-ltd');
  const [incorpDate, setIncorpDate] = useState<DateChoice>('after-2016');
  const [turnover, setTurnover] = useState<TurnoverChoice>('under-100cr');
  const [isOriginal, setIsOriginal] = useState<boolean>(true);
  const [innovation, setInnovation] = useState<InnovationChoice>('software');
  const [hasPatent, setHasPatent] = useState<boolean>(false);
  const [hasFunding, setHasFunding] = useState<boolean>(false);
  const [hasIncubator, setHasIncubator] = useState<boolean>(false);
  const [hasTrademark, setHasTrademark] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Diagnostic Calculation
  const evaluation = useMemo(() => {
    let score = 0;
    const dpiitEligible =
      (entity === 'pvt-ltd' || entity === 'llp' || entity === 'partnership') &&
      incorpDate !== 'older-10yrs' &&
      turnover !== 'above-200cr' &&
      isOriginal;

    const taxHolidayEligible =
      (entity === 'pvt-ltd' || entity === 'llp') &&
      incorpDate === 'after-2016' &&
      turnover === 'under-100cr' &&
      isOriginal &&
      innovation !== 'traditional';

    // Scoring
    if (entity === 'pvt-ltd' || entity === 'llp') score += 25;
    if (incorpDate === 'after-2016') score += 20;
    if (turnover === 'under-100cr') score += 15;
    if (isOriginal) score += 10;
    if (innovation === 'deeptech') score += 20;
    else if (innovation === 'software') score += 15;
    else if (innovation === 'novel-process') score += 10;

    if (hasPatent) score += 5;
    if (hasIncubator) score += 5;
    if (hasFunding) score += 5;
    if (hasTrademark) score += 5;

    score = Math.min(100, score);

    return {
      score,
      dpiitEligible,
      taxHolidayEligible,
      entityIssue: entity === 'proprietorship' || entity === 'partnership',
      dateIssue: incorpDate !== 'after-2016',
      turnoverIssue: turnover !== 'under-100cr',
      reconstructionIssue: !isOriginal,
      innovationIssue: innovation === 'traditional',
    };
  }, [entity, incorpDate, turnover, isOriginal, innovation, hasPatent, hasFunding, hasIncubator, hasTrademark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <section className="bg-[#073B5C] text-white pt-10 pb-16 px-4 border-b border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0E7490]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4B942] mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/#catalog-section" className="hover:underline">Tools</Link>
            <span>/</span>
            <span>Startup India Diagnostic</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs">
                <span>🇮🇳</span> DPIIT Notification G.S.R. 127(E) & Sec 80-IAC Diagnostic
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Startup India &amp; Section 80-IAC <span className="text-[#F4B942]">Eligibility Checker</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover whether your startup qualifies for <strong>3 consecutive years of 100% Tax Exemption</strong>, 80% patent discounts, and Angel Tax relief in under 60 seconds with our free diagnostic engine.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-3.5 text-xs shrink-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-black">
                ₹0
              </div>
              <div>
                <strong className="block text-white text-sm font-black">Official Govt Filing is Free</strong>
                <span className="text-slate-300 text-[11px]">DPIIT charges ₹0 fee on nsws.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Progress Indicator */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider">
                Interactive Diagnostic Wizard
              </span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Step {step} of 5
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`w-6 h-6 rounded-full text-[11px] font-black transition-all ${
                    step === s
                      ? 'bg-[#073B5C] text-white shadow'
                      : step > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Step 1: Entity Structure */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#073B5C]">
                    1. What is the legal structure of your business?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Under DPIIT rules, only specific corporate forms qualify for sovereign recognition and tax benefits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: 'pvt-ltd', title: 'Private Limited Company', badge: 'Eligible for 80-IAC & DPIIT', desc: 'Standard corporate structure registered with MCA.' },
                    { id: 'llp', title: 'Limited Liability Partnership (LLP)', badge: 'Eligible for 80-IAC & DPIIT', desc: 'Registered under LLP Act 2008 with MCA.' },
                    { id: 'partnership', title: 'Registered Partnership Firm', badge: 'DPIIT Only (No 80-IAC)', desc: 'Registered under Section 59 of Indian Partnership Act.' },
                    { id: 'proprietorship', title: 'Sole Proprietorship / Unregistered', badge: 'Ineligible (Needs Conversion)', desc: 'Single owner unregistered firm or Shop Act setup.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEntity(item.id as EntityChoice)}
                      className={`text-left p-4 rounded-2xl border transition-all text-xs ${
                        entity === item.id
                          ? 'border-[#073B5C] bg-[#073B5C]/5 ring-2 ring-[#073B5C]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="block text-sm font-bold text-[#073B5C] mb-1">{item.title}</strong>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 ${
                        item.id === 'proprietorship' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.badge}
                      </span>
                      <p className="text-slate-500 text-[11px]">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date of Incorporation */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#073B5C]">
                    2. When was your entity incorporated / registered?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Section 80-IAC requires incorporation on or after April 1, 2016. DPIIT recognition applies for up to 10 years from incorporation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: 'after-2016', title: 'On or After April 1, 2016', badge: '100% Eligible', desc: 'Within the statutory window for Section 80-IAC tax exemption & DPIIT recognition.' },
                    { id: 'before-2016', title: 'Between 2014 & March 2016', badge: 'DPIIT Only', desc: 'Eligible for DPIIT recognition perks, but disqualified from Section 80-IAC tax holiday.' },
                    { id: 'older-10yrs', title: 'More than 10 Years Ago', badge: 'Ineligible', desc: 'Entities exceeding 10 years are classified as established corporate entities.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIncorpDate(item.id as DateChoice)}
                      className={`text-left p-4 rounded-2xl border transition-all text-xs ${
                        incorpDate === item.id
                          ? 'border-[#073B5C] bg-[#073B5C]/5 ring-2 ring-[#073B5C]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="block text-sm font-bold text-[#073B5C] mb-1">{item.title}</strong>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 ${
                        item.id === 'after-2016' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.badge}
                      </span>
                      <p className="text-slate-500 text-[11px]">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Turnover Threshold */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#073B5C]">
                    3. What has been your highest annual turnover since incorporation?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Statutory ceilings apply to maintain eligibility under DPIIT and Income Tax definitions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: 'under-100cr', title: 'Less than ₹100 Crores', badge: 'Prime Tier', desc: 'Fully compliant with Section 80-IAC ceiling and DPIIT startup limits.' },
                    { id: '100cr-200cr', title: '₹100 Cr to ₹200 Crores', badge: 'DPIIT Only', desc: 'Eligible for DPIIT startup perks, but exceeds the Section 80-IAC tax holiday limit.' },
                    { id: 'above-200cr', title: 'More than ₹200 Crores', badge: 'Exceeds Ceiling', desc: 'Entity graduated beyond the definition of an eligible startup.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTurnover(item.id as TurnoverChoice)}
                      className={`text-left p-4 rounded-2xl border transition-all text-xs ${
                        turnover === item.id
                          ? 'border-[#073B5C] bg-[#073B5C]/5 ring-2 ring-[#073B5C]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="block text-sm font-bold text-[#073B5C] mb-1">{item.title}</strong>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 ${
                        item.id === 'under-100cr' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.badge}
                      </span>
                      <p className="text-slate-500 text-[11px]">{item.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Splitting check */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#073B5C] block mb-2">
                    Original Business Formation Check (Anti-Avoidance Rule):
                  </span>
                  <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOriginal}
                      onChange={(e) => setIsOriginal(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#073B5C] focus:ring-[#0E7490]"
                    />
                    <div className="text-xs">
                      <strong className="text-[#073B5C] block">
                        This entity is an original, new business setup.
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        It was NOT formed by splitting up, reconstruction, or reorganization of an existing business or family firm (strictly prohibited under Sec 80-IAC(4)).
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Innovation Core */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#073B5C]">
                    4. What is the innovation core of your business?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The Inter-Ministerial Board (IMB) strictly evaluates innovation, technology novelty, and wealth/job creation potential.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: 'deeptech', title: 'DeepTech / Hardware / AI Research', badge: 'High 80-IAC Approval', desc: 'Proprietary IP, biotech, robotics, or frontier technology models.' },
                    { id: 'software', title: 'Proprietary SaaS / Tech Platform', badge: 'Strong Candidate', desc: 'Scalable software platform, marketplace, or mobile technology product.' },
                    { id: 'novel-process', title: 'Novel Business Process / D2C Tech', badge: 'Moderate Likelihood', desc: 'Innovative delivery, supply chain technology, or tech-enabled product.' },
                    { id: 'traditional', title: 'Standard Trading / Brokerage / Retail', badge: 'Low Approval Likelihood', desc: 'Traditional distribution or reselling without algorithmic/proprietary tech.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInnovation(item.id as InnovationChoice)}
                      className={`text-left p-4 rounded-2xl border transition-all text-xs ${
                        innovation === item.id
                          ? 'border-[#073B5C] bg-[#073B5C]/5 ring-2 ring-[#073B5C]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <strong className="block text-sm font-bold text-[#073B5C] mb-1">{item.title}</strong>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 ${
                        item.id === 'deeptech' || item.id === 'software' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                      <p className="text-slate-500 text-[11px]">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Supporting Credentials & Diagnostic Result */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#073B5C]">
                    5. Supporting Credentials &amp; IP Portfolio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any assets that bolster your dossier before the Inter-Ministerial Board (IMB).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPatent}
                      onChange={(e) => setHasPatent(e.target.checked)}
                      className="w-4 h-4 text-[#073B5C] rounded"
                    />
                    <div>
                      <strong className="text-[#073B5C] block">Granted / Published Patent</strong>
                      <span className="text-slate-500 text-[11px]">Registered with Indian or PCT patent office</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTrademark}
                      onChange={(e) => setHasTrademark(e.target.checked)}
                      className="w-4 h-4 text-[#073B5C] rounded"
                    />
                    <div>
                      <strong className="text-[#073B5C] block">Registered Trademark / Copyright</strong>
                      <span className="text-slate-500 text-[11px]">Brand identity or software code IP protected</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasIncubator}
                      onChange={(e) => setHasIncubator(e.target.checked)}
                      className="w-4 h-4 text-[#073B5C] rounded"
                    />
                    <div>
                      <strong className="text-[#073B5C] block">Govt / University Incubator Letter</strong>
                      <span className="text-slate-500 text-[11px]">IIT, IIM, NASSCOM, AIC, or T-Hub incubated</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFunding}
                      onChange={(e) => setHasFunding(e.target.checked)}
                      className="w-4 h-4 text-[#073B5C] rounded"
                    />
                    <div>
                      <strong className="text-[#073B5C] block">Institutional / Angel Funding</strong>
                      <span className="text-slate-500 text-[11px]">SEBI AIF, Startup India Seed Fund, or Angel round</span>
                    </div>
                  </label>
                </div>

                {/* Instant Live Diagnostic Output */}
                <div className="bg-gradient-to-br from-[#073B5C] to-[#0E7490] text-white p-6 rounded-3xl space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#F4B942] tracking-wider block">
                        Official Diagnostic Verdict
                      </span>
                      <h4 className="text-2xl font-black text-white">
                        Eligibility Score: {evaluation.score}%
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-xs font-bold text-slate-200">Confidence Band:</span>
                        <strong className="text-[#F4B942] text-sm">
                          {evaluation.score >= 80 ? 'Exceptional Match' : evaluation.score >= 60 ? 'Strong Match' : 'Action Required'}
                        </strong>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-black font-mono">
                        {evaluation.score}%
                      </div>
                    </div>
                  </div>

                  {/* Dual Verdict Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* DPIIT Recognition Card */}
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-black text-white">1. DPIIT Recognition</strong>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          evaluation.dpiitEligible ? 'bg-emerald-400 text-[#073B5C]' : 'bg-rose-400 text-[#073B5C]'
                        }`}>
                          {evaluation.dpiitEligible ? 'Eligible' : 'Gaps Identified'}
                        </span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        {evaluation.dpiitEligible
                          ? 'Your entity meets all criteria for DPIIT Certificate of Recognition under Gazette Notification 127(E).'
                          : 'Entity structure or age prevents direct DPIIT recognition. Check restructuring advice below.'}
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-200 pt-1">
                        <li>✓ 80% Rebate on Patent Filing Fees</li>
                        <li>✓ 50% Rebate on Trademark Registration</li>
                        <li>✓ Exemption from Section 56(2)(viib) Angel Tax</li>
                        <li>✓ GeM Portal Tender Experience Exemption</li>
                      </ul>
                    </div>

                    {/* Section 80-IAC Tax Holiday Card */}
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-black text-white">2. Section 80-IAC Tax Holiday</strong>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          evaluation.taxHolidayEligible ? 'bg-amber-300 text-[#073B5C]' : 'bg-slate-400 text-slate-900'
                        }`}>
                          {evaluation.taxHolidayEligible ? 'High Candidate' : 'Ineligible'}
                        </span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        {evaluation.taxHolidayEligible
                          ? '100% Tax Holiday on Corporate Profits for 3 consecutive financial years out of the first 10 years.'
                          : 'Must be a Private Limited or LLP incorporated after 01/04/2016 with innovative tech proof.'}
                      </p>
                      <div className="bg-black/20 p-2.5 rounded-xl text-[10px] text-amber-200 font-medium">
                        ⚠️ <strong>Inter-Ministerial Board Warning:</strong> Less than 2% of applicants receive 80-IAC approval without professional dossier drafting.
                      </div>
                    </div>

                  </div>

                  {/* CTAs */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/services/startup-india-seed-fund-registration"
                      className="flex-1 bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-center py-3 px-4 rounded-xl shadow transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                      <span>Book CA Dossier Preparation (₹3,499) →</span>
                    </Link>

                    <a
                      href={`https://wa.me/919920054785?text=${encodeURIComponent(
                        `Hi NyayaLink Startup Team, I completed the Startup India Eligibility Checker. My score is ${evaluation.score}%. Entity: ${entity}, Date: ${incorpDate}, Innovation: ${innovation}. I want to consult a senior CA for DPIIT recognition and Section 80-IAC filing.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <span>💬 Chat with Startup CA</span>
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Back
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(5, s + 1))}
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  Restart Diagnostic ↺
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Sovereign Government Warning Notice */}
        <section className="mt-12 bg-amber-50 border border-amber-200 p-6 sm:p-7 rounded-3xl text-amber-950 text-xs space-y-3">
          <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
            <span>🇮🇳</span>
            <span>Official Government Notice from DPIIT (Ministry of Commerce &amp; Industry)</span>
          </div>
          <p className="leading-relaxed text-amber-900/90 text-xs sm:text-[13px]">
            &quot;Department for Promotion of Industry and Internal Trade (DPIIT) has not appointed any Agency, Representative, or Franchise for DPIIT &apos;Certificate of Recognition&apos; or &apos;Certificate of Eligibility&apos; for Startups. Application should be filed by the startup on its own via National Single Window System (<a href="https://www.nsws.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">nsws.gov.in</a>). Ministry does NOT charge any fee for DPIIT Recognition or Tax Exemption.&quot;
          </p>
          <p className="text-[11px] text-amber-800 font-medium">
            🛡️ <strong>NyayaLink Transparency:</strong> You can file directly on NSWS for ₹0. If you require expert Chartered Accountant and Company Secretary assistance to draft your 5-part technical innovation dossier, problem-solution pitch deck, and handle Inter-Ministerial Board inquiries, our professional assistance is ₹3,499.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-12 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">
            Frequently Asked Questions on Startup India Recognition
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {[
              {
                q: 'What is the difference between DPIIT Recognition and Section 80-IAC Tax Exemption?',
                a: 'DPIIT Recognition is the foundational certification that classifies your business as an official startup in India. It unlocks an 80% discount on patent filing, 50% discount on trademarks, self-certification under 9 labor/environmental laws, and Angel Tax immunity. Section 80-IAC is a secondary, elite tier reviewed by the Inter-Ministerial Board (IMB) that grants 100% tax exemption on profits for 3 consecutive financial years.',
              },
              {
                q: 'Can a Sole Proprietorship get Startup India Recognition?',
                a: 'No. Under Notification G.S.R. 127(E), only Private Limited Companies, Registered Partnerships, and Limited Liability Partnerships (LLP) qualify as startups. If you are operating as a Sole Proprietorship, NyayaLink can help you incorporate as a Private Limited Company or LLP in 5–7 business days.',
              },
              {
                q: 'Why are more than 98% of Section 80-IAC applications rejected?',
                a: 'The Inter-Ministerial Board comprises technical experts from the Department of Biotechnology, Department of Science & Technology, and MeitY. Rejections happen when applications present routine trading or marketing models without clear technological novelty, defensible IP, or measurable scalability. NyayaLink prepares structured technical dossiers that articulate your innovative moat.',
              },
              {
                q: 'What is the Angel Tax exemption under Section 56(2)(viib)?',
                a: 'Previously, if a startup raised capital at a premium higher than its Fair Market Value (FMV), the excess was taxed as income. With DPIIT Recognition and submission of Form 2, DPIIT-recognized startups are 100% exempt from Angel Tax on equity issued to resident investors.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-[#073B5C] flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#0E7490] font-black">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
