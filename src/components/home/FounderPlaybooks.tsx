'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export default function FounderPlaybooks() {
  const packagesSliderRef = useRef<HTMLDivElement>(null);
  const [activePackageIndex, setActivePackageIndex] = useState(0);

  const scrollPackages = (direction: 'left' | 'right') => {
    if (packagesSliderRef.current) {
      const scrollAmount = packagesSliderRef.current.clientWidth * 0.85;
      packagesSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handlePackagesScroll = () => {
    if (packagesSliderRef.current) {
      const scrollLeft = packagesSliderRef.current.scrollLeft;
      const cardWidth = packagesSliderRef.current.clientWidth * 0.85;
      const index = Math.round(scrollLeft / (cardWidth || 1));
      setActivePackageIndex(Math.min(Math.max(0, index), 3));
    }
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full overflow-hidden">
      <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-3xl border-2 border-[#0E7490]/30 shadow-md p-4 sm:p-10 space-y-5 sm:space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#0E7490]/10 border border-[#0E7490]/30 px-3 py-1 rounded-full text-xs font-black text-[#0E7490]">
              <span>⚡</span> Zero Guesswork • 1-Click Business Starter Kits
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#073B5C] tracking-tight">
              Starting a New Business in India?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Do not buy fragmented licenses one by one. Choose your business model below to get the exact legal entity, tax registrations, municipal approvals, and bank setup bundled together at discounted package rates.
            </p>
          </div>

          <Link
            href="/packages"
            className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3 rounded-2xl transition shadow flex items-center gap-1.5 shrink-0"
          >
            <span>Explore All 8 Founder Bundles</span>
            <span>→</span>
          </Link>
        </div>

        {/* Mobile Horizontal Slider Swipe Navigator & Dots */}
        <div className="flex md:hidden items-center justify-between pb-1 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#073B5C]">
            <span className="text-amber-500 animate-pulse text-sm">👉</span>
            <span>Swipe Starter Kits</span>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              {activePackageIndex + 1} of 4
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollPackages('left')}
              className="w-10 h-10 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-sm font-black text-[#073B5C] active:bg-slate-100 transition cursor-pointer"
              aria-label="Previous package"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollPackages('right')}
              className="w-10 h-10 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-sm font-black text-[#073B5C] active:bg-slate-100 transition cursor-pointer"
              aria-label="Next package"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={packagesSliderRef}
          onScroll={handlePackagesScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible md:px-0"
        >
          {/* PLAYBOOK 1: SELLING ON AMAZON / FLIPKART */}
          <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 bg-amber-50 rounded-2xl border border-amber-100">🛒</span>
                <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                  Amazon Ready
                </span>
              </div>

              <div>
                <h3 className="font-black text-[#073B5C] text-base leading-snug">
                  Selling on Amazon, Flipkart & E-Com
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sell goods nationwide via online marketplaces or your own Shopify store with full tax authorization.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                <ul className="text-slate-600 space-y-0.5">
                  <li>✓ 15-Digit Marketplace GSTIN</li>
                  <li>✓ Lifetime Import Export Code (IEC)</li>
                  <li>✓ MSME Udyam (50% TM Subsidy)</li>
                  <li>✓ GST LUT for 0% Global Export</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">All-Inclusive Bundle</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#073B5C]">₹5,999</span>
                    <span className="text-[10px] text-slate-400 line-through">₹11,496</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Save 48%
                </span>
              </div>

              <Link
                href="/services/gst-registration?package=ecommerce-seller-suite"
                className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start with ₹999 Advance →</span>
              </Link>
            </div>
          </div>

          {/* PLAYBOOK 2: RESTAURANT / CAFE / CLOUD KITCHEN */}
          <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 bg-orange-50 rounded-2xl border border-orange-100">🍳</span>
                <span className="bg-orange-50 text-orange-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-orange-200">
                  Swiggy / Zomato Ready
                </span>
              </div>

              <div>
                <h3 className="font-black text-[#073B5C] text-base leading-snug">
                  Restaurant, Cafe & Cloud Kitchen
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Commercial food preparation setup required by Swiggy, Zomato & local municipal health inspectors.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                <ul className="text-slate-600 space-y-0.5">
                  <li>✓ FSSAI State Food License (FoSCoS)</li>
                  <li>✓ Commercial Restaurant GSTIN</li>
                  <li>✓ Shop & Establishment (Gumasta)</li>
                  <li>✓ Swiggy/Zomato Onboarding Pack</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">All-Inclusive Bundle</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#073B5C]">₹6,499</span>
                    <span className="text-[10px] text-slate-400 line-through">₹12,496</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Save 48%
                </span>
              </div>

              <Link
                href="/services/fssai-food-license?package=restaurant-kitchen-compliance-kit"
                className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start with ₹999 Advance →</span>
              </Link>
            </div>
          </div>

          {/* PLAYBOOK 3: TECH STARTUP & PVT LTD */}
          <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#0E7490] transition shadow-md hover:shadow-xl flex flex-col justify-between space-y-3 sm:space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0E7490] text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs tracking-wider">
              Most Popular Starter Kit
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 bg-cyan-50 rounded-2xl border border-cyan-100">🚀</span>
                <span className="bg-cyan-50 text-cyan-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-cyan-200">
                  VC & Angel Ready
                </span>
              </div>

              <div>
                <h3 className="font-black text-[#073B5C] text-base leading-snug">
                  Tech Startup & Private Limited
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Raise venture capital, issue equity shares, and protect founders with complete corporate veil defense.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                <ul className="text-slate-600 space-y-0.5">
                  <li>✓ SPICe+ Pvt Ltd Incorporation</li>
                  <li>✓ Startup India (DPIIT) Recognition</li>
                  <li>✓ 2 Director DINs, PAN & TAN</li>
                  <li>✓ Fast-Track Current Bank Account</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">All-Inclusive Bundle</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#073B5C]">₹8,999</span>
                    <span className="text-[10px] text-slate-400 line-through">₹18,496</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Save 51%
                </span>
              </div>

              <Link
                href="/services/private-limited-company?package=startup-launchpad-bundle"
                className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start with ₹999 Advance →</span>
              </Link>
            </div>
          </div>

          {/* PLAYBOOK 4: RETAIL STORE / LOCAL SHOP */}
          <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">🏪</span>
                <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                  Municipal Compliant
                </span>
              </div>

              <div>
                <h3 className="font-black text-[#073B5C] text-base leading-snug">
                  Retail Store, Trade & Local Outlet
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Operate physical retail outlets, warehouses & commercial trade spaces free from municipal interference.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                <ul className="text-slate-600 space-y-0.5">
                  <li>✓ Shop & Establishment (Gumasta)</li>
                  <li>✓ Regular / Composition GSTIN</li>
                  <li>✓ MSME Udyam (Govt Tender Access)</li>
                  <li>✓ Professional Tax Registration (PTEC)</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">All-Inclusive Bundle</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#073B5C]">₹4,499</span>
                    <span className="text-[10px] text-slate-400 line-through">₹7,997</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Save 44%
                </span>
              </div>

              <Link
                href="/services/shop-and-establishment-license?package=retailer-physical-storefront-pack"
                className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start with ₹999 Advance →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Dot Indicators */}
        <div className="flex md:hidden items-center justify-center gap-1.5 pt-1">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (packagesSliderRef.current) {
                  const cardWidth = packagesSliderRef.current.clientWidth * 0.85;
                  packagesSliderRef.current.scrollTo({
                    left: idx * (cardWidth + 16),
                    behavior: 'smooth',
                  });
                  setActivePackageIndex(idx);
                }
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activePackageIndex === idx ? 'w-6 bg-[#0E7490]' : 'w-2 bg-slate-300'
              }`}
              aria-label={`Go to package ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
