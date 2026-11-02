'use client';

import { useState } from 'react';

interface DeliverableItem {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  icon: string;
  visualType: 'coi' | 'pan' | 'moa' | 'dsc' | 'bank';
  details: string[];
  whyItMatters: string;
}

const DELIVERABLES: DeliverableItem[] = [
  {
    id: 'coi',
    badge: 'Ministry of Corporate Affairs',
    title: 'Certificate of Incorporation (COI)',
    tagline: 'Official 21-digit Corporate Identity Number (CIN)',
    icon: '📜',
    visualType: 'coi',
    details: [
      'Govt. of India MCA seal & Registrar digital signature',
      'Unique 21-digit CIN (e.g. U72900MH2026PTC398124)',
      'Permanent QR code for instant bank & investor verification',
      'Permanent corporate existence (perpetual succession)',
    ],
    whyItMatters:
      'The foundational birth certificate of your company. Required by banks to open your current account and by investors to issue funding agreements.',
  },
  {
    id: 'pan',
    badge: 'Income Tax Department (NSDL)',
    title: 'Corporate Permanent Account (e-PAN) & TAN',
    tagline: '10-digit Alphanumeric Corporate Tax Identity',
    icon: '🪪',
    visualType: 'pan',
    details: [
      'Permanent Account Number (PAN) issued under Section 139A',
      'Tax Deduction and Collection Account Number (TAN)',
      'Pre-linked for immediate GSTIN and EPF/ESIC registrations',
      '100% compliant for corporate vendor payments & TDS',
    ],
    whyItMatters:
      'Required to invoice commercial clients, register as an Amazon/Flipkart seller, open payment gateways (Razorpay/Stripe), and file corporate tax returns.',
  },
  {
    id: 'moa',
    badge: 'Registrar of Companies (ROC)',
    title: 'Certified e-MOA & e-AOA',
    tagline: 'Corporate Constitution & Internal Bylaws',
    icon: '📑',
    visualType: 'moa',
    details: [
      'Form INC-33: Electronic Memorandum of Association',
      'Form INC-34: Electronic Articles of Association',
      'Main object clauses tailored to your specific industry',
      'Digital stamp from respective State Stamp Authority',
    ],
    whyItMatters:
      'Defines what business activities your company is legally permitted to execute, its authorized capital structure, and how shareholder equity is governed.',
  },
  {
    id: 'dsc',
    badge: 'Class-3 FIPS 140-2 Cryptographic',
    title: '2x Hardware USB Cryptographic Tokens',
    tagline: 'Paperless Digital Signing for Directors',
    icon: '🔐',
    visualType: 'dsc',
    details: [
      '2x Class-3 Signing Certificates on encrypted USB hardware',
      '2-Year Validity for MCA, Income Tax & GST filings',
      'Included FREE in NyayaLink base package (₹0 markup)',
      'Saves ₹5,000+ vs competitor bait-and-switch fees',
    ],
    whyItMatters:
      'Eliminates physical paperwork forever. Directors sign legal forms, ROC filings, and GST returns securely from their laptop anywhere in the world.',
  },
  {
    id: 'bank',
    badge: 'Fast-Track Partner Network',
    title: 'Pre-Approved Corporate Current Account',
    tagline: 'Zero Minimum Deposit Fast-Track',
    icon: '🏦',
    visualType: 'bank',
    details: [
      'Pre-screened paperwork for ICICI, HDFC, Axis Bank & RazorpayX',
      'Zero initial balance requirement during initial 30 days',
      'Integrated net banking, corporate debit cards & forex desk',
      'Pre-populated board resolution passed by our CA desk',
    ],
    whyItMatters:
      'Saves you weeks of branch visits. Receive payments from clients and deposit your initial authorized share capital without bureaucratic friction.',
  },
];

interface Props {
  serviceSlug?: string;
  serviceTitle?: string;
}

export default function DeliverablesUnboxingCard({ serviceSlug, serviceTitle }: Props) {
  const [activeItem, setActiveItem] = useState<DeliverableItem>(DELIVERABLES[0]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#073B5C]">
              What You Receive: Official Deliverables Unboxing Kit
            </h2>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Everything your company needs to legally invoice clients, open bank accounts, and operate in India.
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full uppercase text-[10px] self-start sm:self-auto">
          ✓ All-Inclusive Statutory Kit
        </span>
      </div>

      {/* Interactive Tabs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {DELIVERABLES.map((item) => {
          const isSelected = activeItem.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItem(item)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#073B5C] bg-[#073B5C] text-white shadow-md ring-2 ring-[#073B5C]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.icon}</span>
                {isSelected && <span className="text-[#F4B942] font-black text-xs">● Active</span>}
              </div>
              <div>
                <strong className={`block text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#073B5C]'}`}>
                  {item.title.split(' (')[0]}
                </strong>
                <span className={`block text-[10px] mt-0.5 truncate ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`}>
                  {item.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Deliverable Deep Dive Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          {/* Left: Detailed Specifications */}
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <span className="inline-block bg-[#0E7490]/10 text-[#0E7490] font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#0E7490]/20">
                {activeItem.badge}
              </span>
              <h3 className="text-xl font-black text-[#073B5C]">
                {activeItem.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {activeItem.tagline}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Statutory Inclusions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeItem.details.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-emerald-600 font-black text-xs">✓</span>
                    <span className="text-slate-700 font-medium leading-tight text-[11px]">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl space-y-1">
              <strong className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                <span>💡</span> Why This Matters for Your Business:
              </strong>
              <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                {activeItem.whyItMatters}
              </p>
            </div>
          </div>

          {/* Right: Realistic Visual Mock Preview */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-4 space-y-3 relative overflow-hidden font-sans">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#073B5C]/5 rounded-bl-full pointer-events-none" />

              {activeItem.visualType === 'coi' && (
                <div className="space-y-2.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#073B5C] text-white flex items-center justify-center text-lg">
                    🏛️
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black block">GOVERNMENT OF INDIA</span>
                    <span className="text-[10px] font-extrabold text-[#073B5C] block">MINISTRY OF CORPORATE AFFAIRS</span>
                    <span className="text-[9px] font-bold text-slate-600 block mt-0.5">Central Registration Centre</span>
                  </div>
                  <div className="border-t border-b border-dashed border-slate-200 py-2 space-y-1 text-left font-mono text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CIN:</span>
                      <strong className="text-slate-800">U72900MH2026PTC398124</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">STATUS:</span>
                      <strong className="text-emerald-700">INCORPORATED</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ROC:</span>
                      <strong className="text-slate-800">MUMBAI</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1">
                    <span>DIGITALLY SIGNED</span>
                    <span className="font-mono text-emerald-600 font-bold">✓ VERIFIED QR</span>
                  </div>
                </div>
              )}

              {activeItem.visualType === 'pan' && (
                <div className="space-y-2.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-800 text-white flex items-center justify-center text-lg">
                    🪪
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black block">INCOME TAX DEPARTMENT</span>
                    <span className="text-[10px] font-extrabold text-[#073B5C] block">PERMANENT ACCOUNT NUMBER</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-center space-y-1">
                    <span className="text-[14px] font-black tracking-widest text-[#073B5C] block">
                      AAACN1234F
                    </span>
                    <span className="text-[8px] text-slate-500 font-sans block">Company / Corporate Entity</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1">
                    <span>TAN: MUMN12345A</span>
                    <span className="text-emerald-600 font-bold">100% ITC READY</span>
                  </div>
                </div>
              )}

              {activeItem.visualType === 'moa' && (
                <div className="space-y-2.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-900 text-white flex items-center justify-center text-lg">
                    📑
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black block">FORM INC-33 &amp; INC-34</span>
                    <span className="text-[10px] font-extrabold text-[#073B5C] block">e-MOA &amp; e-AOA CHARTER</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left text-[9px] text-slate-600 space-y-1">
                    <p className="line-clamp-2 italic">
                      &quot;To carry on business of technology development, digital services, and commerce...&quot;
                    </p>
                    <span className="text-[8px] font-bold text-[#0E7490] block">State Stamp Duty Paid at Actuals</span>
                  </div>
                  <div className="text-[8px] text-emerald-700 font-bold">
                    ✓ ROC DIGITAL STAMP ATTACHED
                  </div>
                </div>
              )}

              {activeItem.visualType === 'dsc' && (
                <div className="space-y-2.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg">
                    🔐
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black block">CLASS-3 CRYPTOGRAPHIC TOKEN</span>
                    <span className="text-[10px] font-extrabold text-[#073B5C] block">2x USB Hardware Keys</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center space-y-1 text-emerald-950">
                    <span className="text-xs font-black block">FIPS 140-2 Validated</span>
                    <span className="text-[9px] block">2-Year Validity Included</span>
                  </div>
                  <div className="text-[8px] text-emerald-700 font-bold">
                    ✓ ZERO COMPETITOR SURCHARGE
                  </div>
                </div>
              )}

              {activeItem.visualType === 'bank' && (
                <div className="space-y-2.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#073B5C] text-white flex items-center justify-center text-lg">
                    🏦
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black block">CORPORATE BANKING KIT</span>
                    <span className="text-[10px] font-extrabold text-[#073B5C] block">Partner Fast-Track Pass</span>
                  </div>
                  <div className="bg-cyan-50 p-2 rounded-xl border border-cyan-200 text-center text-[10px] text-cyan-900 font-bold">
                    HDFC · ICICI · Axis · RazorpayX
                  </div>
                  <div className="text-[8px] text-slate-500">
                    Zero Initial Balance Requirement
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
