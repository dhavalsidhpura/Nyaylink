'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MASTER_PACKAGES, PackageItem } from '@/data/packages';

export default function PackagesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedDeliverables, setExpandedDeliverables] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filter packages based on active category
  const filteredPackages = useMemo(() => {
    if (activeCategory === 'all') return MASTER_PACKAGES;
    return MASTER_PACKAGES.filter((pkg) => {
      if (activeCategory === 'startup') return pkg.category === 'startup';
      if (activeCategory === 'industry') return pkg.category === 'industry';
      if (activeCategory === 'ecommerce') return pkg.category === 'ecommerce' || pkg.category === 'retail';
      if (activeCategory === 'compliance') return pkg.category === 'compliance';
      return true;
    });
  }, [activeCategory]);

  const toggleDeliverables = (id: string) => {
    setExpandedDeliverables((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-24 lg:pb-12">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER: BUNDLED PACKAGES COMMAND CENTER          */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#073B5C] via-[#052A42] to-[#041E30] text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-cyan-900 shadow-inner">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0E7490]/50 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F4B942]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Bundled Compliance & Business Suites • Save Up to 48%
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            All-In-One Legal & Compliance Packages
          </h1>

          <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Stop buying fragmented statutory filings. Our curated business bundles combine incorporation, tax registrations, municipal licenses, and ongoing accounting at discounted package rates.
          </p>

          {/* Value Props Ribbon */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-cyan-200">
            <span className="flex items-center gap-1.5">
              <span>💳</span> Start Any Package with <strong>₹999 Advance Token</strong>
            </span>
            <span className="text-cyan-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span>⚡</span> Single KYC Document Intake
            </span>
            <span className="text-cyan-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span>🛡️</span> Chartered Accountant & Advocate Supervised
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CATEGORY FILTER TABS (HORIZONTAL SWIPE ON MOBILE)     */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 w-full">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Packages', count: MASTER_PACKAGES.length },
            { id: 'startup', label: '🚀 Startups & Venture', count: 2 },
            { id: 'industry', label: '🍲 Food & Dining', count: 1 },
            { id: 'ecommerce', label: '🛒 E-Commerce & Retail', count: 2 },
            { id: 'compliance', label: '📊 Compliance Retainer', count: 1 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === tab.id ? 'bg-[#0E7490] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PACKAGES GRID                                         */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredPackages.map((pkg) => {
            const isDeliverablesOpen = !!expandedDeliverables[pkg.id];

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl border-2 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                  pkg.popular ? 'border-[#0E7490]' : 'border-slate-200/90'
                }`}
              >
                {/* Header & Badges */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                        {pkg.icon}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0E7490] block">
                          {pkg.categoryLabel}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#073B5C] leading-snug">
                          {pkg.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="bg-[#FFF4D9] text-[#073B5C] text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-200">
                        ⚡ {pkg.badge}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Save {pkg.savingsPercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {pkg.tagline}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                    <strong className="text-[#073B5C]">Target Audience:</strong> {pkg.targetAudience}
                  </div>

                  {/* Included Services Checklist */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Services Included in this Bundle ({pkg.includedServices.length} Filings):
                    </span>
                    <div className="space-y-1.5">
                      {pkg.includedServices.map((srv, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{srv.icon}</span>
                            <span className="font-bold text-[#073B5C] truncate">{srv.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 line-through shrink-0 font-mono">
                            ₹{srv.standalonePrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progressive Disclosure: Deliverables */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleDeliverables(pkg.id)}
                      className="text-xs font-bold text-[#0E7490] hover:text-[#073B5C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isDeliverablesOpen ? 'Hide included deliverables' : `+ View official deliverables (${pkg.deliverables.length} items)`}</span>
                      <span className="font-mono text-xs">{isDeliverablesOpen ? '▲' : '▼'}</span>
                    </button>

                    {isDeliverablesOpen && (
                      <div className="mt-2.5 p-3.5 bg-cyan-50/50 rounded-2xl border border-cyan-200/70 space-y-1.5 text-xs text-slate-700 animate-in fade-in duration-150">
                        {pkg.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-black shrink-0">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Impulse CTA Footer */}
                <div className="p-6 sm:p-7 bg-slate-50 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Standalone Value: <span className="line-through">₹{pkg.standaloneTotal.toLocaleString()}</span>
                      </span>
                      <div className="flex items-baseline gap-2">
                        <strong className="text-2xl font-black text-[#073B5C]">
                          ₹{pkg.packagePrice.toLocaleString()}
                        </strong>
                        <span className="text-xs font-bold text-emerald-700">
                          (Save ₹{(pkg.standaloneTotal - pkg.packagePrice).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        SLA Timeline
                      </span>
                      <span className="text-xs font-extrabold text-[#073B5C]">
                        ⏱️ {pkg.sla}
                      </span>
                    </div>
                  </div>

                  {/* Impulse CTA Button */}
                  <Link
                    href={`/services/${pkg.includedServices[0].slug}?package=${pkg.slug}`}
                    className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Start This Package for ₹999 Advance Token →</span>
                  </Link>

                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    🔒 ₹999 locks in parallel CA execution. Remaining balance billed after documentation approval.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. CUSTOM BUNDLE INQUIRY DESK                            */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        <div className="bg-gradient-to-r from-[#073B5C] to-[#0E7490] text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="bg-[#F4B942] text-[#073B5C] text-[10px] font-black uppercase px-3 py-1 rounded-full">
              Enterprise & Custom Scopes
            </span>
            <h3 className="text-xl sm:text-3xl font-black">
              Need a Custom Multi-Service Suite?
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
              Managing multi-state GST registrations, multiple brand trademarks, or complex FDI foreign holding structures? Speak with a Senior CA to build a tailored retainer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20need%20a%20custom%20compliance%20package"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl transition shadow flex items-center justify-center gap-2"
            >
              <span>💬</span> WhatsApp Senior CA
            </a>
            <Link
              href="/vakil"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl transition text-center"
            >
              Lawyer Desk Consultation →
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PACKAGES FAQ ACCORDION                                */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10 w-full space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
            Frequently Asked Questions on Packages
          </h3>
          <p className="text-xs text-slate-500">
            Everything you need to know about bundled pricing, documentation, and statutory processing.
          </p>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            {
              q: 'Why should I choose a bundled package instead of individual registrations?',
              a: 'Bundles combine complementary legal, tax, and licensing services (e.g., Private Limited + GST + MSME + Trademark + Bank Account Setup) at up to 40% discount compared to ordering separately. More importantly, bundling guarantees all registrations align under the exact same entity names, addresses, and authorized signers without discrepancies.',
            },
            {
              q: 'How does NyayaLink execute bundled services so quickly in parallel?',
              a: 'Instead of submitting documents sequentially to multiple independent accountants, our centralized CA, CS, and Legal desk takes your identity and business premises proofs once and coordinates MCA V3, GSTN, FoSCoS, and DGFT filings simultaneously.',
            },
            {
              q: 'Can I swap or remove a service from a pre-made package?',
              a: 'Yes. If you already possess an active GSTIN, Udyam certificate, or existing trademark, simply inform your assigned CA during your onboarding review. We will deduct that service and credit the amount against your remaining balance or add-on services.',
            },
            {
              q: 'Are statutory government stamp duties included in package fees?',
              a: 'Package fees cover 100% of NyayaLink professional legal, CA, and drafting services. Standard state-level stamp duties (e.g. Maharashtra or Delhi company stamp duty) and official trademark registry application fees are passed through strictly at actual government receipts with zero markup.',
            },
            {
              q: 'What post-incorporation support is provided with Startup & Growth packages?',
              a: 'Every bundle includes dedicated post-incorporation execution: corporate bank account opening support with premier partner banks, drafting founder bylaws & equity agreements, mandatory MCA Form INC-20A (Commencement of Business) filing, and automated GST return scheduling.',
            },
            {
              q: 'How does the Annual Compliance Retainer work after Year 1?',
              a: 'The Annual Compliance Retainer guarantees zero late penalties throughout the financial year. It covers all mandatory MCA filings (AOC-4, MGT-7), statutory board resolutions, Director DIR-3 KYC, and Income Tax returns. At the end of the 12-month period, you can renew at your locked-in loyalty rate or transition to self-serve anytime.',
            },
            {
              q: 'Can bundled packages support multi-state operations and branch registrations?',
              a: 'Yes. For e-commerce sellers, restaurant chains, and logistics companies expanding across states, our corporate desk manages multi-state GST registrations, Principal Place of Business (PPoB), and Additional Place of Business (APoB) documentation seamlessly.',
            },
            {
              q: 'Can I start a package with the ₹999 Advance Token?',
              a: 'Absolutely. You can initiate any bundled package with a ₹999 advance token. Our CA desk immediately begins company name approval, digital signatures (DSC), and legal drafting. You settle the remaining package fee only after preliminary verification is complete.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-sm text-[#0E7490] font-mono">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
