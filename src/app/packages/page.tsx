'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MASTER_PACKAGES, PackageItem } from '@/data/packages';
import Header from '@/components/Header';
import CompanyTierSelector, { TierKey } from '@/components/CompanyTierSelector';
import ComparisonMatrix from '@/components/home/ComparisonMatrix';

export default function PackagesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedDeliverables, setExpandedDeliverables] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedState, setSelectedState] = useState<string>('MH');
  const [activeTier, setActiveTier] = useState<TierKey>('growth');

  // Compute category counts dynamically from MASTER_PACKAGES
  const counts = useMemo(() => {
    return {
      all: MASTER_PACKAGES.length,
      startup: MASTER_PACKAGES.filter((p) => p.category === 'startup').length,
      industry: MASTER_PACKAGES.filter((p) => p.category === 'industry').length,
      ecommerce: MASTER_PACKAGES.filter((p) => p.category === 'ecommerce' || p.category === 'retail').length,
      compliance: MASTER_PACKAGES.filter((p) => p.category === 'compliance').length,
    };
  }, []);

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
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-24 lg:pb-16">
      
      {/* ======================================================== */}
      {/* 0. NAVIGATION HEADER (FULL DESKTOP & MOBILE DRAWER)      */}
      {/* ======================================================== */}
      <Header />

      {/* ======================================================== */}
      {/* 1. HERO HEADER: BUNDLED PACKAGES COMMAND CENTER          */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#073B5C] via-[#052A42] to-[#041E30] text-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-cyan-900 shadow-inner">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0E7490]/50 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[#F4B942]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>Bundled Compliance &amp; Business Suites • Save Up to 48%</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
            All-In-One Legal &amp; Compliance Packages
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Stop buying fragmented statutory filings. Our curated business bundles combine incorporation, tax registrations, municipal licenses, and ongoing accounting at discounted package rates.
          </p>

          {/* Value Props Ribbon (Responsive wrapping across mobile, tablet, and desktop) */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-5 text-xs text-cyan-200">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs">
              <span>💳</span> Start Any Package with <strong>₹999 Token</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs">
              <span>⚡</span> Single KYC Document Intake
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs">
              <span>🛡️</span> CA &amp; Advocate Supervised
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CATEGORY FILTER TABS (SWIPABLE ON MOBILE / TABLET)    */}
      {/* ======================================================== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black text-[#073B5C]">
              Browse Bundled Suites
            </h2>
            <p className="text-xs sm:text-xs text-slate-500">
              Select your business archetype or growth stage
            </p>
          </div>
          <div className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            Showing <strong className="text-[#073B5C] font-black">{filteredPackages.length}</strong> of {MASTER_PACKAGES.length} Packages
          </div>
        </div>

        {/* Category Tabs: Smooth swipe with edge bleed on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all', label: 'All Packages', count: counts.all },
            { id: 'startup', label: '🚀 Startups & Venture', count: counts.startup },
            { id: 'industry', label: '🍲 Food & Brand', count: counts.industry },
            { id: 'ecommerce', label: '🛒 E-Commerce & Retail', count: counts.ecommerce },
            { id: 'compliance', label: '📊 Compliance Retainer', count: counts.compliance },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0 ${
                activeCategory === tab.id
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeCategory === tab.id ? 'bg-[#0E7490] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2.5 INTERACTIVE FORMATION TIER HUB (LAUNCH/GROWTH/COMPLETE) */}
      {/* ======================================================== */}
      {(activeCategory === 'all' || activeCategory === 'startup') && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
          <CompanyTierSelector
            selectedState={selectedState}
            onSelectState={setSelectedState}
            activeTier={activeTier}
            onSelectTier={setActiveTier}
            onCheckout={(tier) => {
              if (tier === 'launch') {
                router.push('/services/private-limited-company');
              } else if (tier === 'growth') {
                router.push('/services/private-limited-company?package=startup-launchpad-bundle');
              } else if (tier === 'complete') {
                router.push('/services/private-limited-company?package=tech-founder-venture-suite');
              } else if (tier === 'retainer') {
                router.push('/services/private-limited-company?package=annual-corporate-compliance-retainer');
              }
            }}
          />
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. PACKAGES RESPONSIVE GRID (1 col Mobile, 2 cols Tablet, 3 cols Large Desktop) */}
      {/* ======================================================== */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 items-stretch">
          {filteredPackages.map((pkg) => {
            const isDeliverablesOpen = !!expandedDeliverables[pkg.id];

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl border-2 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                  pkg.popular ? 'border-[#0E7490] ring-1 ring-[#0E7490]/20' : 'border-slate-200/90'
                }`}
              >
                {/* Header & Badges */}
                <div className="p-4 sm:p-6 lg:p-7 space-y-3 sm:space-y-4 flex-1">
                  
                  {/* Meta Strip: Category label on left, badges on right */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] sm:text-[11px] font-black uppercase tracking-wider text-[#0E7490] bg-[#0E7490]/10 px-2.5 py-1 rounded-full border border-[#0E7490]/20">
                      {pkg.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <span className="bg-[#FFF4D9] text-[#073B5C] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                        ⚡ {pkg.badge}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                        Save {pkg.savingsPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Icon + Title block (Full horizontal breathing room on all screens) */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl sm:text-3xl p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm shrink-0 mt-0.5">
                      {pkg.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#073B5C] leading-snug">
                        {pkg.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Target Audience Pill */}
                  <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-snug">
                    <strong className="text-[#073B5C] font-extrabold">Best for:</strong> {pkg.targetAudience}
                  </div>

                  {/* Included Services Checklist */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                      Services Included ({pkg.includedServices.length} Filings):
                    </span>
                    <div className="space-y-1.5">
                      {pkg.includedServices.map((srv, idx) => (
                        <div
                          key={idx}
                          className="p-2 sm:p-2.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-2 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm sm:text-base shrink-0">{srv.icon}</span>
                            <span className="font-bold text-[#073B5C] truncate text-[11px] sm:text-xs">
                              {srv.name}
                            </span>
                          </div>
                          <span className="text-[11px] sm:text-[11px] text-slate-400 line-through shrink-0 font-mono">
                            ₹{srv.standalonePrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progressive Disclosure: Deliverables */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleDeliverables(pkg.id)}
                      className="text-xs font-bold text-[#0E7490] hover:text-[#073B5C] hover:underline flex items-center gap-1 cursor-pointer py-1"
                    >
                      <span>{isDeliverablesOpen ? 'Hide deliverables' : `+ View official deliverables (${pkg.deliverables.length} items)`}</span>
                      <span className="font-mono text-xs">{isDeliverablesOpen ? '▲' : '▼'}</span>
                    </button>

                    {isDeliverablesOpen && (
                      <div className="mt-2 p-3 sm:p-3.5 bg-cyan-50/50 rounded-2xl border border-cyan-200/70 space-y-1.5 text-xs text-slate-700 animate-fadeIn">
                        {pkg.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-[11px] sm:text-xs leading-relaxed">
                            <span className="text-emerald-600 font-black shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Impulse CTA Footer */}
                <div className="p-4 sm:p-6 lg:p-7 bg-slate-50 border-t border-slate-200/80 space-y-3 shrink-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                        Standalone: <span className="line-through">₹{pkg.standaloneTotal.toLocaleString()}</span>
                      </span>
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                        <strong className="text-xl sm:text-2xl font-black text-[#073B5C]">
                          ₹{pkg.packagePrice.toLocaleString()}
                        </strong>
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-700">
                          (Save ₹{(pkg.standaloneTotal - pkg.packagePrice).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                        SLA Timeline
                      </span>
                      <span className="text-xs font-extrabold text-[#073B5C]">
                        ⏱️ {pkg.sla}
                      </span>
                    </div>
                  </div>

                  {/* Impulse CTA Button (Responsive text on mobile vs desktop) */}
                  <Link
                    href={`/services/${pkg.includedServices[0].slug}?package=${pkg.slug}`}
                    className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs sm:text-sm py-3 sm:py-3.5 px-3 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-center active:scale-[0.99]"
                  >
                    <span className="sm:hidden">Start for ₹999 Token →</span>
                    <span className="hidden sm:inline">Start This Package for ₹999 Token →</span>
                  </Link>

                  <p className="text-xs text-slate-400 text-center leading-tight">
                    🔒 ₹999 advance locks in parallel CA execution. Remaining balance billed after documentation approval.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. CUSTOM BUNDLE INQUIRY DESK (RESPONSIVE BANNER)        */}
      {/* ======================================================== */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        <div className="bg-gradient-to-r from-[#073B5C] via-[#0A4E7A] to-[#0E7490] text-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="bg-[#F4B942] text-[#073B5C] text-[11px] font-black uppercase px-3 py-1 rounded-full inline-block">
              Enterprise &amp; Custom Scopes
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">
              Need a Custom Multi-Service Suite?
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed font-medium">
              Managing multi-state GST registrations, multiple brand trademarks, or complex FDI foreign holding structures? Speak with our Senior CA desk to build a tailored retainer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20need%20a%20custom%20compliance%20package"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs sm:text-sm px-5 py-3 sm:py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2"
            >
              <span>💬</span> WhatsApp Senior CA
            </a>
            <Link
              href="/vakil"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm px-5 py-3 sm:py-3.5 rounded-2xl transition text-center flex items-center justify-center gap-1.5"
            >
              <span>👨‍⚖️</span> Lawyer Consultation →
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. WHY NYAYALINK COMPARISON & PACKAGES FAQ ACCORDION     */}
      {/* ======================================================== */}
      <ComparisonMatrix />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-3xl font-black text-[#073B5C]">
            Frequently Asked Questions on Packages
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
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
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-3.5 sm:p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              >
                <span className="pr-2">{faq.q}</span>
                <span className="text-sm text-[#0E7490] font-mono shrink-0">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="p-3.5 sm:p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
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
