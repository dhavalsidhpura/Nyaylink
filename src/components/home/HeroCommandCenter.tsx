'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INDIAN_STATES, getStateStampDuty, formatINR } from '@/lib/pricing';
import type { MASTER_SERVICES } from '@/data/services';

interface HeroCommandCenterProps {
  servicesList: typeof MASTER_SERVICES;
}

export default function HeroCommandCenter({ servicesList }: HeroCommandCenterProps) {
  const [heroTab, setHeroTab] = useState<'calculator' | 'callback'>('calculator');
  const [estimatorService, setEstimatorService] = useState('private-limited-company');
  const [estimatorState, setEstimatorState] = useState('MH');

  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbEmail, setCbEmail] = useState('');
  const [isSubmittingCb, setIsSubmittingCb] = useState(false);
  const [cbSubmitted, setCbSubmitted] = useState(false);
  const [cbError, setCbError] = useState('');

  const currentEstimatorService = servicesList.find((s) => s.slug === estimatorService) || servicesList[0];

  const isCompanyRegService =
    currentEstimatorService?.category === 'company-reg' ||
    currentEstimatorService?.slug.includes('company') ||
    currentEstimatorService?.slug.includes('llp');

  const estimatorStampDuty = isCompanyRegService ? getStateStampDuty(estimatorState).amount : 0;
  const estimatorGstAmount = Math.round(((currentEstimatorService?.price || 0) * 18) / 100);
  const estimatorTotalOutlay = (currentEstimatorService?.price || 0) + estimatorGstAmount + estimatorStampDuty;

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCb(true);
    setCbError('');
    try {
      const res = await fetch('/api/leads', {
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
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCbError(data.error || 'Could not submit request. Please check your details.');
        return;
      }
      setCbSubmitted(true);
    } catch {
      setCbError('Network error. Please try contacting via WhatsApp or phone.');
    } finally {
      setIsSubmittingCb(false);
    }
  };

  return (
    <div className="lg:col-span-5" id="hero-booking-card">
      <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Focused 2-Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setHeroTab('calculator')}
            className={`flex-1 py-2 px-2 rounded-lg transition text-center cursor-pointer ${
              heroTab === 'calculator' ? 'bg-white text-[#073B5C] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fee Estimator
          </button>
          <button
            type="button"
            onClick={() => setHeroTab('callback')}
            className={`flex-1 py-2 px-2 rounded-lg transition text-center cursor-pointer ${
              heroTab === 'callback' ? 'bg-white text-[#073B5C] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Request Callback
          </button>
        </div>

        {heroTab === 'calculator' && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#073B5C]">
                Estimate Your All-Inclusive Cost
              </h2>
              <p className="text-xs text-slate-500">
                Upfront professional fees + state stamp duty. Start with ₹999.
              </p>
            </div>

            <div>
              <label htmlFor="hero-service-select" className="block font-bold text-[#073B5C] mb-1">
                1. Service Requirement
              </label>
              <select
                id="hero-service-select"
                value={estimatorService}
                onChange={(e) => setEstimatorService(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              >
                <optgroup label="Company & Business Registration">
                  {servicesList.filter((s) => s.category === 'company-reg').map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Trademark & Intellectual Property">
                  {servicesList.filter((s) => s.category === 'trademark-ipr' || s.category === 'copyright').map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Tax, Accounting & GST">
                  {servicesList.filter((s) => s.category === 'tax-accounting').map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Licenses, Permits & Legal">
                  {servicesList.filter((s) => s.category === 'licenses-permits' || s.category === 'legal-dispute').map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label htmlFor="hero-state-select" className="block font-bold text-[#073B5C] mb-1">
                2. State of Registered Office
              </label>
              <select
                id="hero-state-select"
                value={estimatorState}
                onChange={(e) => setEstimatorState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} {isCompanyRegService ? `(₹${getStateStampDuty(st.code).amount.toLocaleString('en-IN')} Stamp)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Professional Fee:</span>
                <strong className="text-slate-900">{formatINR(currentEstimatorService?.price || 0)}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>GST @ 18% (ITC Eligible):</span>
                <strong className="text-slate-900">{formatINR(estimatorGstAmount)}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Govt Stamp / Statutory Fee:</span>
                <strong className="text-slate-900">
                  {estimatorStampDuty > 0 ? formatINR(estimatorStampDuty) : 'At actuals'}
                </strong>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-extrabold text-[#073B5C] text-sm">
                <span>Total Estimated Outlay:</span>
                <span className="text-base text-emerald-700 font-black">{formatINR(estimatorTotalOutlay)}</span>
              </div>
            </div>

            <Link
              href={`/services/${estimatorService}?state=${estimatorState}`}
              className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              Start with ₹999 Token →
            </Link>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <Link href="/tools/company-name-search" className="text-[#0E7490] font-bold hover:underline">
                Rule 8 Name Pre-Check →
              </Link>
              <Link href="/tools" className="text-slate-500 hover:text-[#073B5C] font-semibold">
                All Free Tools
              </Link>
            </div>
          </div>
        )}

        {heroTab === 'callback' && (
          <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
            {cbSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <h4 className="font-black text-[#073B5C] text-base">Request Received!</h4>
                <p className="text-slate-500 text-xs">
                  A practicing CA from our desk will reach out within business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCbSubmitted(false);
                    setHeroTab('calculator');
                  }}
                  className="text-xs text-[#0E7490] font-bold underline pt-2 cursor-pointer"
                >
                  Back to fee estimator
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-base font-black text-[#073B5C]">Request Expert CA Callback</h2>
                  <p className="text-xs text-slate-500">Direct consultation with an empanelled CA/CS. Zero spam.</p>
                </div>

                {cbError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold">
                    {cbError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
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
                      minLength={10}
                      value={cbPhone}
                      onChange={(e) => setCbPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Email *</label>
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
                  className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
                >
                  {isSubmittingCb ? 'Submitting...' : 'Request Free Callback →'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
