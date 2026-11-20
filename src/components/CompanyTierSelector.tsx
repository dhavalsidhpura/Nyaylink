'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INDIAN_STATES, getStateStampDuty, formatINR } from '@/lib/pricing';

export type TierKey = 'launch' | 'growth' | 'complete' | 'retainer';

export interface TierConfig {
  key: TierKey;
  name: string;
  badge?: string;
  isRecommended?: boolean;
  tagline: string;
  nyayalinkPrice: number;
  competitorPrice: string;
  competitorSavings: string;
  advanceToken: number;
  sla: string;
  packageSlug?: string;
  serviceSlug: string;
  features: {
    title: string;
    included: boolean;
    highlight?: boolean;
  }[];
}

export const INCORPORATION_TIERS: TierConfig[] = [
  {
    key: 'launch',
    name: 'Launch',
    tagline: 'Basic Incorporation Essentials',
    nyayalinkPrice: 6999,
    competitorPrice: '₹7,999 + Unstated Govt. Fee',
    competitorSavings: 'Save ₹1,000 + 2x DSC Tokens Included',
    advanceToken: 999,
    sla: '7 - 10 Working Days',
    serviceSlug: 'private-limited-company',
    features: [
      { title: 'MCA SPICe+ Company Incorporation', included: true },
      { title: 'RUN / SPICe+ Name Reservation', included: true },
      { title: 'e-MoA & e-AoA Drafting (up to ₹15L Capital)', included: true },
      { title: 'Corporate PAN & TAN Allotment', included: true },
      { title: 'DIN (Director Identification Number) for 2 Directors', included: true },
      { title: '2x Class-3 Digital Signature Certificates (DSC Tokens)', included: true, highlight: true },
      { title: 'Direct CA Consultation & Legal Scrutiny', included: true },
      { title: '15-Digit GST Registration', included: false },
      { title: 'Form INC-20A Commencement of Business Filing', included: false },
      { title: 'MSME Udyam Government Recognition', included: false },
      { title: 'First Board Resolution & Auditor Appointment (ADT-1)', included: false },
      { title: 'Brand Trademark Registration (™)', included: false },
      { title: 'Annual ROC Compliance & DIR-3 KYC', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    badge: 'Most Popular',
    isRecommended: true,
    tagline: 'Incorporation + Mandatory Post-Setup',
    nyayalinkPrice: 8999,
    competitorPrice: '₹14,999 + Unstated Govt. Fee',
    competitorSavings: 'Save ₹6,000 vs Online Legal India',
    advanceToken: 999,
    sla: '7 - 10 Working Days',
    serviceSlug: 'private-limited-company',
    packageSlug: 'startup-launchpad-bundle',
    features: [
      { title: 'MCA SPICe+ Company Incorporation', included: true },
      { title: 'RUN / SPICe+ Name Reservation', included: true },
      { title: 'e-MoA & e-AoA Drafting (up to ₹15L Capital)', included: true },
      { title: 'Corporate PAN & TAN Allotment', included: true },
      { title: 'DIN (Director Identification Number) for 2 Directors', included: true },
      { title: '2x Class-3 Digital Signature Certificates (DSC Tokens)', included: true },
      { title: 'Direct CA Consultation & Legal Scrutiny', included: true },
      { title: '15-Digit GST Registration & REG-06 Allotment', included: true, highlight: true },
      { title: 'Form INC-20A Commencement of Business Filing', included: true, highlight: true },
      { title: 'MSME Udyam Government Recognition (50% TM Subsidy)', included: true, highlight: true },
      { title: 'First Board Resolution & Auditor Appointment (ADT-1)', included: true, highlight: true },
      { title: 'Instant Corporate Current Account Onboarding', included: true },
      { title: 'Brand Trademark Registration (™)', included: false },
      { title: 'Annual ROC Compliance & DIR-3 KYC', included: false },
    ],
  },
  {
    key: 'complete',
    name: 'Complete',
    badge: 'Founder Protection',
    tagline: 'Incorporation + Brand Protection + VC Ready',
    nyayalinkPrice: 14999,
    competitorPrice: '₹24,999 + Unstated Govt. Fee',
    competitorSavings: 'Save ₹10,000 vs Online Legal India',
    advanceToken: 999,
    sla: '10 - 14 Working Days',
    serviceSlug: 'private-limited-company',
    packageSlug: 'tech-founder-venture-suite',
    features: [
      { title: 'MCA SPICe+ Company Incorporation', included: true },
      { title: 'RUN / SPICe+ Name Reservation', included: true },
      { title: 'e-MoA & e-AoA Drafting (up to ₹15L Capital)', included: true },
      { title: 'Corporate PAN & TAN Allotment', included: true },
      { title: 'DIN (Director Identification Number) for 2 Directors', included: true },
      { title: '2x Class-3 Digital Signature Certificates (DSC Tokens)', included: true },
      { title: 'Direct CA Consultation & Legal Scrutiny', included: true },
      { title: '15-Digit GST Registration & REG-06 Allotment', included: true },
      { title: 'Form INC-20A Commencement of Business Filing', included: true },
      { title: 'MSME Udyam Government Recognition', included: true },
      { title: 'First Board Resolution & Auditor Appointment (ADT-1)', included: true },
      { title: 'Wordmark Trademark Registration (Class 1) (Form TM-A)', included: true, highlight: true },
      { title: 'Startup India DPIIT Recognition & 80-IAC Tax Exemption', included: true, highlight: true },
      { title: 'GST LUT Filing for 0% IGST Export of Software/Services', included: true, highlight: true },
      { title: 'Founder 4-Yr Vesting Agreement & Employee IP Assignment', included: true, highlight: true },
    ],
  },
  {
    key: 'retainer',
    name: 'Start & Grow',
    badge: 'Annual Retainer',
    tagline: 'Dedicated CA Retainer & Bookkeeping Desk',
    nyayalinkPrice: 19999,
    competitorPrice: '₹5,999 / Month (₹71,988 / Yr)',
    competitorSavings: 'Save ₹52,000/yr vs Competitor Subscriptions',
    advanceToken: 999,
    sla: 'Year-Round Dedicated CA Desk',
    serviceSlug: 'private-limited-company',
    packageSlug: 'annual-corporate-compliance-retainer',
    features: [
      { title: 'Dedicated Chartered Accountant Desk via WhatsApp', included: true, highlight: true },
      { title: '12 Months of Monthly GST Returns (GSTR-1 & 3B)', included: true, highlight: true },
      { title: 'Annual ROC Filings (Form AOC-4 Financials & MGT-7)', included: true, highlight: true },
      { title: 'Annual Director DIR-3 KYC Renewal (up to 2 Directors)', included: true, highlight: true },
      { title: 'Monthly Cloud Bookkeeping & Bank Reconciliation', included: true, highlight: true },
      { title: 'Quarterly Advance Tax & TDS Review Dossiers', included: true },
      { title: 'Routine Department Scrutiny Notice Replies (₹0 fee)', included: true },
      { title: 'Zero Pushy Telemarketers / Pure Professional CA Desk', included: true },
    ],
  },
];

interface CompanyTierSelectorProps {
  selectedState: string;
  onSelectState?: (state: string) => void;
  activeTier: TierKey;
  onSelectTier: (tier: TierKey) => void;
  onCheckout: (tier: TierKey) => void;
  showComparisonDetails?: boolean;
}

export default function CompanyTierSelector({
  selectedState,
  onSelectState,
  activeTier,
  onSelectTier,
  onCheckout,
  showComparisonDetails = false,
}: CompanyTierSelectorProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [billingPeriod, setBillingPeriod] = useState<'onetime' | 'retainer'>('onetime');

  const stampDuty = useMemo(() => getStateStampDuty(selectedState), [selectedState]);
  const activeStateName = useMemo(() => {
    return INDIAN_STATES.find((s) => s.code === selectedState)?.name || selectedState;
  }, [selectedState]);

  // Filter tiers based on billing period toggle
  const visibleTiers = useMemo(() => {
    if (billingPeriod === 'retainer') {
      return INCORPORATION_TIERS.filter((t) => t.key === 'retainer');
    }
    return INCORPORATION_TIERS.filter((t) => t.key !== 'retainer');
  }, [billingPeriod]);

  return (
    <div className="w-full space-y-6">
      {/* 1. SECTION HEADER WITH HONEST COMPARISON BANNER */}
      <div className="bg-gradient-to-r from-[#073B5C] via-[#0A4E7A] to-[#0E7490] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-cyan-800/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#0E7490]/70 border border-cyan-300/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#F4B942]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Rule 33 Pure Agent Transparency • Zero Hidden Stamp Duty Markup</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              Choose Your Company Formation Tier
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl leading-relaxed">
              Transparent CA-supervised pricing. Unlike competitors who hide state stamp duties behind ambiguous &ldquo;+ Govt. Fee&rdquo; tags, NyayaLink calculates your exact government challan live for <strong>{activeStateName}</strong>.
            </p>
          </div>

          {/* Interactive State Selector Inside Module */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 sm:p-4 rounded-2xl shrink-0 space-y-1.5 self-start md:self-auto min-w-[240px]">
            <label htmlFor="tier-state-select" className="text-[11px] font-bold text-cyan-200 block">
              📍 State of Incorporation:
            </label>
            <select
              id="tier-state-select"
              value={selectedState}
              onChange={(e) => onSelectState && onSelectState(e.target.value)}
              className="w-full bg-[#041E30] text-white border border-cyan-400/50 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F4B942] cursor-pointer"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code} className="bg-[#073B5C] text-white">
                  {st.name} (₹{((getStateStampDuty(st.code).baseStamp || 0) + 131).toLocaleString()} Stamp)
                </option>
              ))}
            </select>
            <div className="text-[10px] text-cyan-300 flex items-center justify-between pt-0.5">
              <span>Govt Stamp Duty:</span>
              <strong className="text-white font-mono">₹{(stampDuty.amount).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* CONTROLS: ONE-TIME VS MONTHLY RETAINER TOGGLE + CARD/MATRIX VIEW */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          {/* Plan Type Toggle */}
          <div className="flex items-center gap-1 bg-[#041E30]/70 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setBillingPeriod('onetime');
                if (activeTier === 'retainer') onSelectTier('growth');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingPeriod === 'onetime'
                  ? 'bg-[#F4B942] text-[#073B5C] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🏢 One-Time Formation Bundles
            </button>
            <button
              type="button"
              onClick={() => {
                setBillingPeriod('retainer');
                onSelectTier('retainer');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                billingPeriod === 'retainer'
                  ? 'bg-[#F4B942] text-[#073B5C] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📊 Annual CA Retainer</span>
              <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                Save 72%
              </span>
            </button>
          </div>

          {/* Card vs Matrix View Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'cards' ? 'matrix' : 'cards')}
              className="bg-white/10 hover:bg-white/20 text-cyan-200 hover:text-white border border-white/20 px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{viewMode === 'cards' ? '📋 View Full Comparison Matrix' : '🗂️ View Tier Cards'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CARD VIEW (3-TIER OR RETAINER) */}
      {viewMode === 'cards' && (
        <div className={`grid gap-4 sm:gap-6 items-stretch ${
          billingPeriod === 'retainer' ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {visibleTiers.map((tier) => {
            const isSelected = activeTier === tier.key;
            const isRetainer = tier.key === 'retainer';
            const gstAmount = Math.round(tier.nyayalinkPrice * 0.18);
            const totalOutlay = tier.nyayalinkPrice + gstAmount + (isRetainer ? 0 : stampDuty.amount);

            return (
              <div
                key={tier.key}
                onClick={() => onSelectTier(tier.key)}
                className={`relative bg-white rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 shadow-sm hover:shadow-xl cursor-pointer ${
                  isSelected
                    ? 'border-[#0E7490] ring-2 ring-[#0E7490]/30 shadow-md'
                    : tier.isRecommended
                    ? 'border-amber-400/90'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Top Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                      tier.isRecommended
                        ? 'bg-[#F4B942] text-[#073B5C] border border-amber-500'
                        : 'bg-[#0E7490] text-white'
                    }`}>
                      ★ {tier.badge}
                    </span>
                  </div>
                )}

                {/* Header Information */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-[#073B5C]">{tier.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{tier.tagline}</p>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-[#0E7490] text-white text-xs font-black flex items-center justify-center shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Competitor Benchmark Callout */}
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 line-through">Competitors: {tier.competitorPrice}</span>
                      <span className="bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded text-[9px]">
                        Save ₹
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                      {tier.competitorSavings}
                    </p>
                  </div>

                  {/* Dynamic Pricing Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Professional Fee</span>
                      <strong className="text-2xl font-black text-[#073B5C]">
                        {formatINR(tier.nyayalinkPrice)}
                        {isRetainer && <span className="text-xs font-normal text-slate-500"> / Year</span>}
                      </strong>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-200/60 pt-2 font-mono">
                      <div className="flex justify-between">
                        <span>+ GST @ 18%:</span>
                        <span>{formatINR(gstAmount)}</span>
                      </div>
                      {!isRetainer && (
                        <div className="flex justify-between text-cyan-900">
                          <span>+ {activeStateName} Stamp:</span>
                          <span>{formatINR(stampDuty.amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-[#073B5C] border-t border-slate-200 pt-1 text-xs">
                        <span>Total All-Inclusive:</span>
                        <span>{formatINR(totalOutlay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Deliverables Included:
                    </span>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {tier.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className={`text-xs flex items-start gap-2 py-0.5 leading-snug ${
                            feat.included
                              ? feat.highlight
                                ? 'text-[#073B5C] font-bold'
                                : 'text-slate-700'
                              : 'text-slate-400 line-through opacity-60'
                          }`}
                        >
                          <span className={`shrink-0 text-xs ${feat.included ? 'text-emerald-600 font-black' : 'text-slate-300'}`}>
                            {feat.included ? '✓' : '✕'}
                          </span>
                          <span className="text-[11px] leading-tight">{feat.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Block */}
                <div className="space-y-2 pt-4 border-t border-slate-100 mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>⏱️ SLA: <strong>{tier.sla}</strong></span>
                    <span className="text-emerald-700 font-bold">💳 ₹999 Advance</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTier(tier.key);
                      onCheckout(tier.key);
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] ${
                      isSelected || tier.isRecommended
                        ? 'bg-[#F4B942] hover:bg-amber-500 text-[#073B5C]'
                        : 'bg-[#073B5C] hover:bg-[#0E7490] text-white'
                    }`}
                  >
                    <span>Start for ₹999 Token →</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    Zero lock-in. Pay ₹999 today, remaining balance billed after CA document vetting.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SIDE-BY-SIDE MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#073B5C] text-white border-b border-cyan-800">
                  <th className="p-4 font-bold text-xs sm:text-sm max-w-[200px]">Service / Feature Deliverable</th>
                  <th className="p-4 text-center font-bold">
                    <div>Launch</div>
                    <div className="text-[10px] text-cyan-200 font-normal">₹6,999 + Stamp</div>
                  </th>
                  <th className="p-4 text-center font-bold bg-[#0A4E7A] border-x border-cyan-700">
                    <span className="bg-[#F4B942] text-[#073B5C] text-[9px] font-black uppercase px-2 py-0.5 rounded-full block mb-1">
                      Recommended
                    </span>
                    <div>Growth (Launchpad)</div>
                    <div className="text-[10px] text-amber-200 font-normal">₹8,999 + Stamp</div>
                  </th>
                  <th className="p-4 text-center font-bold">
                    <div>Complete (Venture)</div>
                    <div className="text-[10px] text-cyan-200 font-normal">₹14,999 + Stamp</div>
                  </th>
                  <th className="p-4 text-center font-bold bg-[#041E30]">
                    <div>Start &amp; Grow</div>
                    <div className="text-[10px] text-emerald-300 font-normal">₹19,999 / Year</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'MCA SPICe+ Company Incorporation', l: true, g: true, c: true, r: false },
                  { name: 'RUN Name Approval & Reservation', l: true, g: true, c: true, r: false },
                  { name: 'Custom e-MoA & e-AoA (up to ₹15L Capital)', l: true, g: true, c: true, r: false },
                  { name: 'Corporate PAN & TAN Allotment', l: true, g: true, c: true, r: false },
                  { name: 'DIN for 2 Directors', l: true, g: true, c: true, r: false },
                  { name: '2x Class-3 Digital Signature Certificates (DSC Tokens)', l: true, g: true, c: true, r: false },
                  { name: 'Direct CA Document Vetting & Scrutiny', l: true, g: true, c: true, r: true },
                  { name: '15-Digit GST Registration & REG-06 Certificate', l: false, g: true, c: true, r: false },
                  { name: 'MCA Form INC-20A Commencement of Business Filing', l: false, g: true, c: true, r: false },
                  { name: 'MSME Udyam Government Recognition (50% TM Subsidy)', l: false, g: true, c: true, r: false },
                  { name: 'First Board Resolution & Statutory Auditor (ADT-1)', l: false, g: true, c: true, r: false },
                  { name: 'Corporate Current Account Partner Onboarding', l: false, g: true, c: true, r: false },
                  { name: 'Wordmark Trademark Registration (Class 1)', l: false, g: false, c: true, r: false },
                  { name: 'Startup India DPIIT Recognition (80-IAC Exemption)', l: false, g: false, c: true, r: false },
                  { name: 'GST LUT Filing for 0% IGST Export Services', l: false, g: false, c: true, r: false },
                  { name: 'Founder Equity Vesting & Employee NDA Agreement', l: false, g: false, c: true, r: false },
                  { name: '12 Months Ongoing GST Return Filings (GSTR-1 & 3B)', l: false, g: false, c: false, r: true },
                  { name: 'Annual MCA ROC Filings (Form AOC-4 & MGT-7)', l: false, g: false, c: false, r: true },
                  { name: 'Annual Director DIR-3 KYC Electronic Filings', l: false, g: false, c: false, r: true },
                  { name: 'Monthly Cloud Bookkeeping & Bank Reconciliation', l: false, g: false, c: false, r: true },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="p-3.5 font-medium text-slate-800">{row.name}</td>
                    <td className="p-3.5 text-center">{row.l ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">✕</span>}</td>
                    <td className="p-3.5 text-center bg-cyan-50/40 font-bold border-x border-slate-200/60">
                      {row.g ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-300">✕</span>}
                    </td>
                    <td className="p-3.5 text-center">{row.c ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">✕</span>}</td>
                    <td className="p-3.5 text-center bg-slate-50">{row.r ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">✕</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-center">
                  <td className="p-4 text-left font-black text-[#073B5C]">Start Now with ₹999 Advance</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('launch');
                        onCheckout('launch');
                      }}
                      className="bg-[#073B5C] text-white hover:bg-[#0E7490] px-3 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Choose Launch →
                    </button>
                  </td>
                  <td className="p-3 bg-cyan-100/50 border-x border-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('growth');
                        onCheckout('growth');
                      }}
                      className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] px-3 py-2 rounded-xl text-xs font-black transition shadow-xs"
                    >
                      Choose Growth →
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('complete');
                        onCheckout('complete');
                      }}
                      className="bg-[#073B5C] text-white hover:bg-[#0E7490] px-3 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Choose Complete →
                    </button>
                  </td>
                  <td className="p-3 bg-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTier('retainer');
                        onCheckout('retainer');
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Choose Retainer →
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. THE 3-PILLAR FOUNDER ADVANTAGE VS COMPETITOR CALLOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <strong className="text-xs text-[#073B5C]">Pure Agent Rule 33</strong>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Zero markup on MCA and State Stamp Duty challans. The exact government receipt is filed to your encrypted Vault.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">💳</span>
            <strong className="text-xs text-[#073B5C]">Split-Ticket ₹999 Advance</strong>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            No upfront financial risk. We reserve your name and verify identity before you pay the remaining balance.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🚫</span>
            <strong className="text-xs text-[#073B5C]">Zero Telemarketing Calls</strong>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            We do not sell your data or trigger automated call centers. Direct communication with your practicing CA via WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
