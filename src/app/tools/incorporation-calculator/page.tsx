'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { INDIAN_STATES, STATE_STAMP_RULES, formatINR } from '@/lib/pricing';

type EntityType = 'pvt-ltd' | 'llp' | 'opc' | 'section-8';

interface EntityMeta {
  id: EntityType;
  name: string;
  badge: string;
  slug: string;
  description: string;
  baseProfFee: number;
  minDirectors: number;
  defaultDirectors: number;
  maxDirectors: number;
  includedDsc: number;
  mcaBaseFee: number;
  panTanFee: number;
}

const ENTITIES: Record<EntityType, EntityMeta> = {
  'pvt-ltd': {
    id: 'pvt-ltd',
    name: 'Private Limited Company',
    badge: 'Most Popular for Startups',
    slug: 'private-limited-company',
    description: 'Gold standard for venture capital, investor equity allocation, and high-growth startups.',
    baseProfFee: 6999,
    minDirectors: 2,
    defaultDirectors: 2,
    maxDirectors: 15,
    includedDsc: 2,
    mcaBaseFee: 0, // ₹0 up to ₹15 Lakhs capital under SPICe+
    panTanFee: 131,
  },
  llp: {
    id: 'llp',
    name: 'Limited Liability Partnership (LLP)',
    badge: 'Lowest Annual Compliance',
    slug: 'llp-registration',
    description: 'Ideal for professional services, agencies, consultancies, and lifestyle businesses with low audit overhead.',
    baseProfFee: 5499,
    minDirectors: 2,
    defaultDirectors: 2,
    maxDirectors: 20,
    includedDsc: 2,
    mcaBaseFee: 500, // FiLLiP central fee up to ₹1 Lakh contribution
    panTanFee: 131,
  },
  opc: {
    id: 'opc',
    name: 'One Person Company (OPC)',
    badge: 'Single Founder Entity',
    slug: 'one-person-company',
    description: 'Corporate shield for solo entrepreneurs without co-founders, requiring 1 director and 1 nominee.',
    baseProfFee: 5999,
    minDirectors: 1,
    defaultDirectors: 1,
    maxDirectors: 1,
    includedDsc: 1,
    mcaBaseFee: 0,
    panTanFee: 131,
  },
  'section-8': {
    id: 'section-8',
    name: 'Section 8 Company (NGO / Trust)',
    badge: 'Non-Profit & CSR Ready',
    slug: 'section-8-company',
    description: 'Non-profit foundation authorized under Companies Act 2013 for philanthropy, science, arts, or education.',
    baseProfFee: 8999,
    minDirectors: 2,
    defaultDirectors: 2,
    maxDirectors: 15,
    includedDsc: 2,
    mcaBaseFee: 2000, // Central INC-12 license fee
    panTanFee: 131,
  },
};

const CAPITAL_QUICK_PRESETS = [
  { label: '₹1 Lakh', value: 100000, desc: 'Startup Default' },
  { label: '₹5 Lakhs', value: 500000, desc: 'Small Business' },
  { label: '₹10 Lakhs', value: 1000000, desc: 'Commercial' },
  { label: '₹15 Lakhs', value: 1500000, desc: 'Max ₹0 MCA Tier' },
  { label: '₹25 Lakhs', value: 2500000, desc: 'Growth Scale' },
  { label: '₹50 Lakhs', value: 5000000, desc: 'Enterprise' },
  { label: '₹1 Crore', value: 10000000, desc: 'Institutional' },
];

export default function IncorporationCalculatorPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('pvt-ltd');
  const [selectedState, setSelectedState] = useState<string>('MH');
  const [authorizedCapital, setAuthorizedCapital] = useState<number>(100000);
  const [directorCount, setDirectorCount] = useState<number>(2);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const entity = ENTITIES[selectedEntity];

  // Adjust director count when switching entity
  const handleEntityChange = (id: EntityType) => {
    setSelectedEntity(id);
    const target = ENTITIES[id];
    if (directorCount < target.minDirectors) {
      setDirectorCount(target.minDirectors);
    } else if (directorCount > target.maxDirectors) {
      setDirectorCount(target.maxDirectors);
    }
  };

  const stateRule = STATE_STAMP_RULES[selectedState] || {
    name: 'Standard State Rate',
    baseStamp: 1000,
    panTanFee: 131,
    note: '₹1,000 Stamp + ₹131 PAN/TAN',
  };

  // Statutory Calculations
  const calculations = useMemo(() => {
    const profFee = entity.baseProfFee;
    const gstProf = Math.round((profFee * 18) / 100);

    // MCA SPICe+ / FiLLiP Form Fee
    let mcaFee = 0;
    if (selectedEntity === 'pvt-ltd' || selectedEntity === 'opc') {
      if (authorizedCapital > 1500000) {
        mcaFee = Math.round((authorizedCapital - 1500000) * 0.003); // MCA fee on capital beyond ₹15 Lakhs
      }
    } else if (selectedEntity === 'llp') {
      mcaFee = authorizedCapital <= 100000 ? 500 : authorizedCapital <= 500000 ? 1000 : 2000;
    } else if (selectedEntity === 'section-8') {
      mcaFee = 2000 + (authorizedCapital > 1500000 ? Math.round((authorizedCapital - 1500000) * 0.003) : 0);
    }

    // State Stamp Duty on MoA/AoA or LLP Agreement
    let stateStamp = stateRule.baseStamp;
    if (authorizedCapital > 1000000) {
      stateStamp = Math.round(stateRule.baseStamp * (authorizedCapital / 1000000));
    }

    // In Maharashtra & high stamp states, LLP stamp is tied to capital contribution
    if (selectedEntity === 'llp') {
      if (selectedState === 'MH') {
        stateStamp = Math.max(500, Math.min(15000, Math.round(authorizedCapital * 0.01)));
      } else {
        stateStamp = Math.max(500, Math.round(stateRule.baseStamp * 0.8));
      }
    }

    // Class-3 Digital Signature Certificates (DSC)
    // 2 DSC tokens included FREE in NyayaLink package. Additional directors charged at actual issuance cost (₹1,200).
    const extraDirectors = Math.max(0, directorCount - entity.includedDsc);
    const dscFee = extraDirectors * 1200;

    const panTan = entity.panTanFee;
    const totalStatutoryPassThrough = mcaFee + stateStamp + panTan + dscFee;
    const grandTotal = profFee + gstProf + totalStatutoryPassThrough;

    // Competitor estimation (RegisterKaro style: ₹5,000 marked up DSC + hidden fees)
    const competitorEstimatedTotal = profFee + 5000 + stateStamp + mcaFee + panTan + 1500;
    const savings = competitorEstimatedTotal - grandTotal;

    return {
      profFee,
      gstProf,
      mcaFee,
      stateStamp,
      panTan,
      extraDirectors,
      dscFee,
      totalStatutoryPassThrough,
      grandTotal,
      competitorEstimatedTotal,
      savings,
    };
  }, [entity, selectedEntity, selectedState, authorizedCapital, directorCount, stateRule]);

  const copyBreakdown = () => {
    const text = `NyayaLink All-India Incorporation Quote:
Entity: ${entity.name}
State: ${stateRule.name}
Capital: ${formatINR(authorizedCapital)}
Directors: ${directorCount}
----------------------------------------
1. NyayaLink Professional Retainer: ${formatINR(calculations.profFee)}
2. 18% GST (100% ITC Claimable): ${formatINR(calculations.gstProf)}
3. MCA ROC Filing Fee: ${formatINR(calculations.mcaFee)} ${authorizedCapital <= 1500000 ? '(₹0 MCA Waiver Active)' : ''}
4. State Stamp Duty (MoA/AoA): ${formatINR(calculations.stateStamp)}
5. PAN & TAN Statutory Challan: ${formatINR(calculations.panTan)}
6. Hardware Class-3 DSC USB Tokens: ${formatINR(calculations.dscFee)} (${entity.includedDsc} Included Free)
----------------------------------------
Total Pure Agent Estimate: ${formatINR(calculations.grandTotal)}
Advance Booking Token to Start: ₹999
Book online: https://nyayalink.com/services/${entity.slug}?state=${selectedState}&capital=${authorizedCapital}`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  const bookingUrl = `/services/${entity.slug}?state=${selectedState}&capital=${authorizedCapital}&directors=${directorCount}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Hero Header */}
      <section className="bg-[#073B5C] text-white pt-10 pb-16 px-4 border-b border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0E7490]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4B942] mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/#catalog-section" className="hover:underline">Tools</Link>
            <span>/</span>
            <span>Incorporation Cost Calculator</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs">
                <span>🛡️</span> Zero Drip Pricing · 100% Rule 33 Pure Agent Compliant
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                All-India Multi-Entity <span className="text-[#F4B942]">Incorporation Cost Calculator</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Stop falling for deceptive &quot;₹999 Pvt Ltd&quot; ads that hide ₹8,000+ in state stamp duties and ₹5,000 in marked-up DSC tokens behind aggressive phone gates. Calculate your exact, all-inclusive statutory pass-throughs instantly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-4 text-xs shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#F4B942] text-[#073B5C] flex items-center justify-center text-2xl font-black">
                ₹0
              </div>
              <div>
                <strong className="block text-white text-sm font-black">Zero Lead Capture Gate</strong>
                <span className="text-slate-300 text-[11px]">Instant live breakdown without entering phone or email</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Entity Switcher */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider">
                  Step 1: Choose Corporate Structure
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Select 1 of 4 Indian Entities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(ENTITIES) as EntityType[]).map((key) => {
                  const item = ENTITIES[key];
                  const isSelected = selectedEntity === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleEntityChange(key)}
                      className={`text-left p-4 rounded-2xl border transition-all text-xs relative ${
                        isSelected
                          ? 'border-[#073B5C] bg-[#073B5C]/5 ring-2 ring-[#073B5C]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-sm font-black text-[#073B5C] block">
                          {item.name}
                        </strong>
                        {isSelected && <span className="text-emerald-600 font-black text-sm">✓</span>}
                      </div>
                      <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                        {item.badge}
                      </span>
                      <p className="text-slate-500 text-[11px] leading-tight">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. State & Location */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider">
                  Step 2: State of Registered Office
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Controls State Stamp Duty
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#073B5C] mb-1.5">
                  Select Registered State or Union Territory:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} {STATE_STAMP_RULES[s.code] ? `· (Base Stamp: ₹${STATE_STAMP_RULES[s.code].baseStamp.toLocaleString('en-IN')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-cyan-50/70 border border-cyan-200/80 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-[#073B5C]">
                <span className="text-base shrink-0">🏛️</span>
                <div className="space-y-0.5">
                  <strong className="block font-bold">State Stamp Act Notice for {stateRule.name}:</strong>
                  <p className="text-[11px] text-slate-600">
                    {stateRule.note}. State Stamp Duty is directly payable to the state revenue department upon e-MoA/e-AoA generation. NyayaLink remits 100% of this fee as your Pure Agent with zero markup.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Authorized Share Capital */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider">
                  Step 3: Authorized Share Capital / Contribution
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {authorizedCapital <= 1500000 ? '✓ MCA Form Fee Waived (₹0)' : 'MCA Fee Applicable'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Capital Amount:</span>
                  <span className="text-xl font-black text-[#073B5C] font-mono">
                    {formatINR(authorizedCapital)}
                  </span>
                </div>

                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="50000"
                  value={authorizedCapital}
                  onChange={(e) => setAuthorizedCapital(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#073B5C]"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {CAPITAL_QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setAuthorizedCapital(preset.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all ${
                        authorizedCapital === preset.value
                          ? 'bg-[#073B5C] text-white border-[#073B5C]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  💡 Ministry of Corporate Affairs (MCA) SPICe+ rules waive all central ROC filing fees for capital up to ₹15,00,000. 95% of venture-backed startups begin with ₹1 Lakh authorized capital.
                </p>
              </div>
            </div>

            {/* 4. Number of Directors / Partners */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider">
                  Step 4: Number of Directors / Designated Partners
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Min: {entity.minDirectors} · Max: {entity.maxDirectors}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={directorCount <= entity.minDirectors}
                  onClick={() => setDirectorCount((prev) => Math.max(entity.minDirectors, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-all"
                >
                  −
                </button>

                <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded-xl py-2 font-mono">
                  <span className="text-xl font-black text-[#073B5C]">{directorCount}</span>
                  <span className="block text-[10px] text-slate-500 font-sans uppercase font-bold">
                    {selectedEntity === 'llp' ? 'Designated Partners' : 'Directors'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={directorCount >= entity.maxDirectors}
                  onClick={() => setDirectorCount((prev) => Math.min(entity.maxDirectors, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-black text-lg text-slate-700 flex items-center justify-center transition-all"
                >
                  +
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <span>🔐</span>
                <span>
                  <strong>Included in Base Package:</strong> {entity.includedDsc}x Class-3 USB Cryptographic DSC Tokens + DIN Allotment at <strong>₹0 Extra Cost</strong>.
                  {calculations.extraDirectors > 0 && (
                    <span className="block font-bold text-amber-900 mt-0.5">
                      + {calculations.extraDirectors} additional token(s) at actual issuance cost of ₹1,200/director.
                    </span>
                  )}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Quotation & Pure Agent Breakdown */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-5">
              
              <div className="bg-white rounded-3xl border-2 border-[#073B5C] shadow-xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-[#073B5C] text-white p-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#F4B942]">
                      Pure Agent Quotation (Rule 33)
                    </span>
                    <span className="bg-emerald-400 text-[#073B5C] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Live Calculated
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {entity.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Registered Office: <strong className="text-white">{stateRule.name}</strong> · Capital: <strong className="text-white">{formatINR(authorizedCapital)}</strong>
                  </p>
                </div>

                {/* Line Items */}
                <div className="p-5 space-y-4 text-xs">
                  
                  {/* Category 1: Professional Fee */}
                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      A. Professional Advisory & Filing
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">CA Professional Retainer</span>
                      <span className="font-bold font-mono text-[#073B5C]">{formatINR(calculations.profFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>GST @ 18% (100% ITC Eligible)</span>
                      <span className="font-mono">{formatINR(calculations.gstProf)}</span>
                    </div>
                  </div>

                  {/* Category 2: Government Statutory Pass-Throughs */}
                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        B. Statutory Pass-Throughs (Pure Agent)
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Zero Markup
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-700 font-medium">MCA Central Filing Fee</span>
                        {calculations.mcaFee === 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Waived
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-700">{formatINR(calculations.mcaFee)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">
                        State Stamp Duty ({stateRule.name})
                      </span>
                      <span className="font-mono text-slate-700">{formatINR(calculations.stateStamp)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Statutory PAN & TAN Challan</span>
                      <span className="font-mono text-slate-700">{formatINR(calculations.panTan)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">
                        Class-3 Cryptographic Tokens ({directorCount})
                      </span>
                      <span className="font-mono text-slate-700">
                        {calculations.dscFee === 0 ? 'Included (₹0)' : formatINR(calculations.dscFee)}
                      </span>
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs uppercase font-black text-slate-500 tracking-wider block">
                          Total Transparent Cost:
                        </span>
                        <span className="text-[11px] text-slate-400">All-inclusive · Zero hidden bills later</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#073B5C] font-mono block">
                          {formatINR(calculations.grandTotal)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Saves ~{formatINR(calculations.savings)} vs competitors
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advance Token Model Trigger */}
                  <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-black">
                      <span>⚡</span>
                      <span>Start Today with Just ₹999 Advance</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-tight">
                      You do <strong>not</strong> need to pay the full amount today. Pay a ₹999 token to lock your CA desk, draft MoA/AoA, and conduct name reservation. The balance is payable only after your incorporation is ready to file!
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2 pt-1">
                    <Link
                      href={bookingUrl}
                      className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-center py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider block"
                    >
                      <span>Lock In Filing for ₹999 Advance →</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={copyBreakdown}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>{copiedQuote ? '✓ Copied!' : '📋 Copy Quote'}</span>
                      </button>

                      <a
                        href={`https://wa.me/919920054785?text=${encodeURIComponent(
                          `Hi NyayaLink Team, I ran the Incorporation Cost Calculator for ${entity.name} in ${stateRule.name} with capital of ${formatINR(authorizedCapital)}. Total calculated: ${formatINR(calculations.grandTotal)}. I want to proceed with the ₹999 advance booking.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>💬 WhatsApp CA</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pure Agent Statutory Guarantee */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-600 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#073B5C]">
                  <span>⚖️</span>
                  <span>Rule 33 Pure Agent Statutory Guarantee</span>
                </div>
                <p>
                  Under Rule 33 of the CGST Rules 2017, government fees (MCA challans, state stamp duties, NSDL charges) are billed at <strong>zero platform markup</strong>. NyayaLink issues separate receipts directly from the MCA and state treasury portals.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Competitor Reality Teardown Section */}
        <section className="mt-16 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              🚨 The Incumbent Deception Exposed
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Why &quot;₹999 Pvt Ltd&quot; Ads Cost ₹10,000+ Everywhere Else
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Here is how legacy legal portals deceive founders with drip pricing and bait-and-switch quotation tactics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            {/* Vakilsearch */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <strong className="text-sm font-black text-slate-800">Vakilsearch (Zolvit)</strong>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">3-Step Lead Trap</span>
              </div>
              <p className="text-slate-600">
                Advertises <strong>₹999 on Google Ads</strong>. When you click, checkout is blocked behind a 3-step phone gate (`/onboard`). Once you pay the ₹999 teaser, tele-callers demand <strong>₹5,000 to ₹10,000 extra</strong> for stamp duty and ROC challans.
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-semibold text-rose-700">
                ❌ Hidden DSC costs + Uncalculated stamp duty bills
              </div>
            </div>

            {/* IndiaFilings */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <strong className="text-sm font-black text-slate-800">IndiaFilings</strong>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">Heavy SaaS Upsell</span>
              </div>
              <p className="text-slate-600">
                Base plan is <strong>₹2,899 + GST + Govt Fees</strong>. Mandatory lead form before seeing any total. High-pressure sales calls push the ₹19,899 LEDGERS compliance plan. If you are in high stamp duty states (Maharashtra/Punjab), secondary invoices are sent.
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-semibold text-rose-700">
                ❌ Zero self-serve checkout + Gated by CRM tele-callers
              </div>
            </div>

            {/* RegisterKaro */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <strong className="text-sm font-black text-slate-800">RegisterKaro</strong>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">₹5,000 DSC Trap</span>
              </div>
              <p className="text-slate-600">
                Their cost calculator quotes <strong>₹9,199</strong> for a ₹1L Maharashtra company. When inspected, they markup 2 hardware DSC tokens to <strong>₹5,000</strong> (tokens cost ₹800 to issue). Clicking &quot;Proceed to Pay&quot; opens another mandatory phone capture popup.
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-semibold text-rose-700">
                ❌ 500% hardware token markup + Phone gated quote
              </div>
            </div>

          </div>
        </section>

        {/* FAQs */}
        <section className="mt-12 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">
            Frequently Asked Questions on Incorporation Costs
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {[
              {
                q: 'Why do incorporation costs differ from state to state in India?',
                a: 'Under the Indian Constitution, Stamp Duty is a state subject. While the Ministry of Corporate Affairs (MCA) waives ROC filing fees for capital up to ₹15 Lakhs uniformly across India, State Governments levy stamp duties on Memorandum of Association (MoA) and Articles of Association (AoA). For example, Delhi charges ₹300, while Maharashtra charges ₹1,000 base stamp duty and Kerala/Punjab charge ₹2,000+.',
              },
              {
                q: 'What is the ₹999 Advance Booking Token on NyayaLink?',
                a: 'Unlike competitors who force you to pay 100% upfront or trap you in phone negotiations, NyayaLink lets you lock in your incorporation with just ₹999. Our Chartered Accountants reserve your company name on MCA SPICe+ Part A, draft your MOA/AOA, and verify all KYC documents. You pay the remaining statutory balance only when your documents are ready for final ROC submission.',
              },
              {
                q: 'What is a "Pure Agent" and why does it matter for my GST bill?',
                a: 'Under Rule 33 of the CGST Rules, a service provider acts as a Pure Agent when it incurs statutory expenses (like MCA ROC challans or State Stamp Duty) on behalf of the client. As a result, you only pay 18% GST on NyayaLink’s professional fee, not on government fees. You also receive an official GST Tax Invoice to claim 100% Input Tax Credit (ITC).',
              },
              {
                q: 'Are Class-3 Digital Signature Certificates (DSC) included?',
                a: 'Yes! NyayaLink includes 2 Class-3 USB cryptographic hardware tokens in all Private Limited and LLP packages at zero extra markup. Competitors list DSC as "excluded" in fine print and demand ₹2,500 to ₹5,000 extra post-booking.',
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
