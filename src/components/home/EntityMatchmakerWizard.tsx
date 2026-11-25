'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export interface EntityMatchmakerWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function EntityMatchmakerWizard({ isOpen = true, onClose }: EntityMatchmakerWizardProps) {
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardFounders, setWizardFounders] = useState<'solo' | 'multi' | null>(null);
  const [wizardFunding, setWizardFunding] = useState<'bootstrap' | 'vc' | null>(null);
  const [wizardLiability, setWizardLiability] = useState<'shield' | 'fast' | null>(null);

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWizardCompleted = wizardFounders !== null && wizardFunding !== null && wizardLiability !== null;

  // Computed Business Entity Recommendation
  const entityRecommendation = useMemo(() => {
    if (wizardFounders === 'solo') {
      if (wizardLiability === 'shield') {
        return {
          title: 'One Person Company (OPC)',
          tagline: 'Best for Solo Founders Wanting 100% Limited Liability Protection',
          slug: 'one-person-company',
          price: '₹5,499',
          advanceToken: '₹999',
          features: [
            'Separate legal corporate entity with 100% personal asset protection',
            'Full corporate status with 1 single director & shareholder',
            'Seamless conversion to Private Limited as business revenue scales',
          ],
          packageUrl: '/services/one-person-company',
        };
      } else {
        return {
          title: 'Sole Proprietorship (GST + MSME Udyam)',
          tagline: 'Fastest & Most Affordable Setup for Solo Freelancers, Traders & Local Outlets',
          slug: 'gst-registration',
          price: '₹1,499',
          advanceToken: '₹999',
          features: [
            'Zero MCA statutory audit headaches & minimal recurring compliance burden',
            'Ready in 3–5 working days with 15-Digit GSTIN & Green MSME Udyam Certificate',
            'Instant Current Bank Account opening with partner banks',
          ],
          packageUrl: '/services/gst-registration',
        };
      }
    } else {
      if (wizardFunding === 'vc') {
        return {
          title: 'Private Limited Company (Startup Launchpad)',
          tagline: 'The Gold Standard for High-Growth Startups, Co-Founders & VC Investment',
          slug: 'private-limited-company',
          price: '₹8,999',
          advanceToken: '₹999',
          features: [
            'Mandatory vehicle to raise angel/VC capital, issue equity shares, and grant ESOPs',
            'Limited liability shields founders from company debt and corporate liabilities',
            'Includes Pvt Ltd + GST + MSME + INC-20A bundle (standalone Pvt Ltd is ₹6,999)',
          ],
          packageUrl: '/services/private-limited-company?package=startup-launchpad-bundle',
        };
      } else {
        return {
          title: 'Limited Liability Partnership (LLP)',
          tagline: 'Ideal for 2+ Partners, Agencies, Consultancies & Family Businesses',
          slug: 'llp-registration',
          price: '₹4,999',
          advanceToken: '₹999',
          features: [
            'Limited liability shield without heavy corporate secretarial compliances',
            'No mandatory statutory audit unless turnover exceeds ₹40 Lakhs or capital exceeds ₹25 Lakhs',
            'Partners enjoy lower tax on profit withdrawals compared to corporate dividend tax',
          ],
          packageUrl: '/services/llp-registration',
        };
      }
    }
  }, [wizardFounders, wizardFunding, wizardLiability]);

  return (
    <div
      id="wizard-section"
      role="dialog"
      aria-modal="true"
      aria-label="60-Second Business Structure Advisor"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#0E7490]/10 border border-[#0E7490]/30 px-3 py-1 rounded-full text-xs font-bold text-[#0E7490]">
              <span>🤖</span> 60-Second Business Structure Advisor
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">
              Not Sure Which Legal Entity to Register?
            </h3>
            <p className="text-xs text-slate-500">
              Answer 3 quick questions to discover whether you need a Pvt Ltd, LLP, OPC, or Sole Proprietorship.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Entity Advisor"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center transition cursor-pointer shrink-0"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Stepper Header Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  wizardStep === 1
                    ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                    : wizardFounders !== null
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span>{wizardFounders !== null ? '✓' : '1'}</span>
                <span>1. Founders</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                onClick={() => {
                  if (wizardFounders !== null) setWizardStep(2);
                }}
                disabled={wizardFounders === null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  wizardFounders === null
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : wizardStep === 2
                    ? 'bg-[#073B5C] text-[#F4B942] shadow-sm cursor-pointer'
                    : wizardFunding !== null
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-600 cursor-pointer'
                }`}
              >
                <span>{wizardFunding !== null ? '✓' : '2'}</span>
                <span>2. Capital Strategy</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                onClick={() => {
                  if (wizardFounders !== null && wizardFunding !== null) setWizardStep(3);
                }}
                disabled={wizardFounders === null || wizardFunding === null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  wizardFounders === null || wizardFunding === null
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : wizardStep === 3
                    ? 'bg-[#073B5C] text-[#F4B942] shadow-sm cursor-pointer'
                    : wizardLiability !== null
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-600 cursor-pointer'
                }`}
              >
                <span>{wizardLiability !== null ? '✓' : '3'}</span>
                <span>3. Liability Shield</span>
              </button>
            </div>

            {isWizardCompleted && (
              <button
                type="button"
                onClick={() => {
                  setWizardFounders(null);
                  setWizardFunding(null);
                  setWizardLiability(null);
                  setWizardStep(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-[#073B5C] underline cursor-pointer shrink-0"
              >
                ↺ Reset & Start Over
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Interactive Progressive Step Questions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              {/* STEP 1: Founders */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 1 of 3</div>
                    <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                      How many founders or partners are starting this venture?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Indian corporate law strictly separates single-owner entities (OPC / Sole Prop) from multi-director corporate structures (Pvt Ltd / LLP).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWizardFounders('solo');
                        setWizardStep(2);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardFounders === 'solo'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">👤</span>
                        <strong className="block text-sm font-black text-[#073B5C]">Solo Founder (1 Person)</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          I am starting this business on my own without co-founders or active equity partners.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0E7490]">Options: OPC or Sole Proprietorship →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWizardFounders('multi');
                        setWizardStep(2);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardFounders === 'multi'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">👥</span>
                        <strong className="block text-sm font-black text-[#073B5C]">2 or More Co-Founders / Partners</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          We have at least 2 people to serve as directors or partners sharing equity/profits.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0E7490]">Options: Private Limited or LLP →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Funding & Capital Strategy */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 2 of 3</div>
                    <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                      What is your capital &amp; funding strategy?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Venture Capital and Angel Investors strictly require Private Limited equity shares and cap tables.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWizardFunding('bootstrap');
                        setWizardStep(3);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardFunding === 'bootstrap'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">🌱</span>
                        <strong className="block text-sm font-black text-[#073B5C]">Bootstrapped / Client Funded</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          Funded from customer revenue, personal savings, or bank debt. No immediate plans to raise VC equity.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0E7490]">Optimizes for Low Secretarial Cost →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWizardFunding('vc');
                        setWizardStep(3);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardFunding === 'vc'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">🚀</span>
                        <strong className="block text-sm font-black text-[#073B5C]">Angel / VC Equity Funding</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          Planning to raise external institutional capital, issue ESOPs to employees, or apply to accelerators.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0E7490]">Requires Private Limited Structure →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Limited Liability Protection */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 3 of 3</div>
                    <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                      How important is personal asset protection (Limited Liability)?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Limited liability legally protects your personal home, savings, and assets if the business faces commercial debt.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setWizardLiability('shield')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardLiability === 'shield'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">🛡️</span>
                        <strong className="block text-sm font-black text-[#073B5C]">100% Limited Liability Shield</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          Critical. My personal savings and assets must remain strictly separate from company risk and liabilities.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700">✓ Corporate Veil Protection</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardLiability('fast')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        wizardLiability === 'fast'
                          ? 'border-[#073B5C] bg-[#073B5C]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-2xl">⚡</span>
                        <strong className="block text-sm font-black text-[#073B5C]">Lowest Cost &amp; Speed First</strong>
                        <p className="text-xs text-slate-500 leading-snug">
                          I am running a small trading/service operation with low commercial risk and want the fastest setup.
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-amber-700">⚡ Minimal Compliance Burden</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Stepper Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="font-bold text-slate-600 hover:text-[#073B5C] px-3 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    ← Previous Question
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Step 1 of 3</span>
                )}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    disabled={(wizardStep === 1 && wizardFounders === null) || (wizardStep === 2 && wizardFunding === null)}
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="font-black text-[#073B5C] hover:text-[#0E7490] disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    Next Question →
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700">✓ Diagnostic Ready</span>
                )}
              </div>
            </div>

            {/* Right Column: Live Recommendation Card */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#073B5C] to-[#0E7490] text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-[#F4B942] text-[#073B5C] font-black text-[11px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    Recommended Structure
                  </span>
                  <span className="text-xs text-cyan-200 font-mono">
                    {isWizardCompleted ? '100% Match' : 'Analyzing...'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {entityRecommendation.title}
                  </h4>
                  <p className="text-xs text-cyan-100 mt-1 leading-snug">
                    {entityRecommendation.tagline}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-cyan-800/80">
                  <span className="text-[11px] uppercase font-bold text-cyan-200 tracking-wider block">
                    Why this fits your business:
                  </span>
                  <ul className="space-y-1.5 text-xs text-cyan-50">
                    {entityRecommendation.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-black shrink-0">✓</span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-800/80 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-cyan-200">All-Inclusive Professional Retainer:</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white">{entityRecommendation.price}</span>
                    <span className="text-[11px] text-cyan-200 font-medium">all-in</span>
                  </div>
                </div>

                <Link
                  href={entityRecommendation.packageUrl}
                  className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-center text-xs py-3 rounded-2xl uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Book with {entityRecommendation.advanceToken} Advance Token →</span>
                </Link>
                <p className="text-xs text-cyan-200 text-center">
                  Lock in CA assignment today • Balance settled upon drafting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
