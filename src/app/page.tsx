'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { MASTER_SERVICES } from '@/data/services';
import HeroCommandCenter from '@/components/home/HeroCommandCenter';
import FounderPlaybooks from '@/components/home/FounderPlaybooks';
import EntityMatchmakerWizard from '@/components/home/EntityMatchmakerWizard';
import ServicesCatalog from '@/components/home/ServicesCatalog';
import ComparisonMatrix from '@/components/home/ComparisonMatrix';
import FounderReviewsCarousel from '@/components/home/FounderReviewsCarousel';

export default function HomePage() {
  // Navigation & Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>('company-reg');

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  // Hero Omnisearch
  const [heroSearch, setHeroSearch] = useState('');
  const [isHeroSearchOpen, setIsHeroSearchOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close hero search on click outside
  useEffect(() => {
    if (!isHeroSearchOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsHeroSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHeroSearchOpen]);

  // Live Activity Ticker State
  const LIVE_ACTIVITIES = useMemo(
    () => [
      { text: 'Private Limited Company incorporated in Bengaluru, Karnataka', time: '3m ago', icon: '🏢' },
      { text: 'Trademark Class 35 application filed in Mumbai, Maharashtra', time: '11m ago', icon: '™️' },
      { text: 'GST Registration Certificate issued in New Delhi', time: '18m ago', icon: '🧾' },
      { text: 'LLP Agreement & Incorporation filed in Pune, Maharashtra', time: '26m ago', icon: '🤝' },
      { text: 'MSME Udyam Certificate approved in Hyderabad, Telangana', time: '34m ago', icon: '📜' },
      { text: 'US Delaware C-Corp setup completed for YC Founder', time: '49m ago', icon: '🇺🇸' },
    ],
    []
  );
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [LIVE_ACTIVITIES.length]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Services Hydration from API
  const [servicesList, setServicesList] = useState<typeof MASTER_SERVICES>(MASTER_SERVICES || []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/services', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.services) && data.services.length > 0) {
          const map = new Map<string, any>();
          for (const s of MASTER_SERVICES) map.set(s.slug, s);
          let hasPriceChange = false;
          for (const s of data.services) {
            const existing = map.get(s.slug);
            if (existing && Number(s.professionalFee) !== existing.price) {
              hasPriceChange = true;
            }
            map.set(s.slug, {
              id: s.slug,
              slug: s.slug,
              title: s.title,
              category: s.category,
              price: Number(s.professionalFee),
              govtFee: s.govtFeeNote || 'Direct statutory portal charges',
              sla: s.sla || '5–7 working days',
              sacCode: s.sacCode || '998221',
              badge: existing?.badge || 'Govt Verified',
              icon: existing?.icon || '🏢',
              desc: existing?.desc || 'Professional statutory and legal filing executed by Chartered Accountants.',
              docs: s.requirements?.map((r: any) => r.label).join(', ') || existing?.docs || 'ID & Address Proof',
            });
          }
          if (hasPriceChange || map.size !== MASTER_SERVICES.length) {
            setServicesList(Array.from(map.values()));
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // ignore network failures silently as master data is already loaded
        }
      });

    return () => controller.abort();
  }, []);

  // Hero Omnisearch Suggestions
  const heroSearchMatches = useMemo(() => {
    if (!heroSearch.trim()) return [];
    const q = heroSearch.toLowerCase().trim();
    return servicesList
      .filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.slug.includes(q))
      .slice(0, 6);
  }, [heroSearch, servicesList]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-20 lg:pb-0 overflow-x-hidden w-full max-w-[100vw]">
      {/* 1. TOP GLOBAL TRUST & ADVISORY RIBBON (DESKTOP ONLY) */}
      <div className="hidden sm:block bg-gradient-to-r from-[#031522] via-[#073B5C] to-[#031522] text-white text-[11px] py-2 px-3 sm:px-8 border-b border-cyan-800/40">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
            <span className="bg-[#F4B942] text-[#073B5C] font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
              ⚡ Flat ₹999 Token
            </span>
            <span className="text-slate-200 font-medium text-center sm:text-left">
              Pure Agent Rule 33 Zero-Markup Stamp Duty Guarantee
            </span>
            <span className="hidden lg:inline text-cyan-400">•</span>
            <span className="hidden lg:inline text-slate-300">
              MCA V3, GSTN &amp; IP India Empanelled Desk
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] flex-wrap justify-center sm:justify-end">
            <a
              href="tel:+919920054785"
              className="text-[#F4B942] hover:underline font-extrabold flex items-center gap-1"
            >
              <span>📞</span>
              <span>Direct Desk: +91 9920054785</span>
            </a>
            <span className="text-cyan-600 hidden sm:inline">|</span>
            <a
              href="https://wa.me/919920054785?text=Hi%20NyayaLink%2C%20I%20need%20help%20choosing%20the%20right%20business%20registration"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-xs transition"
            >
              <span>💬</span> WhatsApp CA
            </a>
            <span className="text-cyan-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <span className="text-slate-500">For Experts:</span>
              <Link href="/ca/dashboard" className="text-slate-300 hover:text-[#F4B942] text-[10px] font-semibold underline underline-offset-2">
                CA Portal
              </Link>
              <Link href="/lawyer/join" className="text-slate-300 hover:text-[#F4B942] text-[10px] font-semibold underline underline-offset-2">
                Advocates
              </Link>
            </div>
            <span className="text-cyan-600 hidden sm:inline">|</span>
            <Link
              href="/login"
              className="text-white hover:text-[#F4B942] font-extrabold flex items-center gap-1 transition text-[11px]"
            >
              <span>🔑</span>
              <span>Client Log In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & MEGA-MENU */}
      <header className="bg-[#073B5C] text-white py-3 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Logo & Sub-Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <span className="text-lg leading-none">☰</span>
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-[#0E7490] text-white font-black text-xl sm:text-2xl px-3 py-1 rounded-2xl font-mono tracking-wider shadow-sm flex items-center gap-1 border border-cyan-400/30 group-hover:border-cyan-300 transition">
                <span>Nyaya</span>
                <span className="text-[#F4B942]">Link</span>
              </div>
              <div className="hidden xl:block border-l border-cyan-700/60 pl-2.5">
                <span className="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Legal &amp; Compliance Portal
                </span>
                <span className="block text-[10px] text-cyan-300 font-semibold tracking-tight">
                  Rule 33 Pure Agent • Direct CA Desk
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Trust Assurance Chip (Replaces Redundant Search) */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-2xs">
            <span className="flex items-center gap-1 text-[#F4B942] font-extrabold">
              <span>⭐</span> 4.9/5
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium">10,000+ Founders</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-400 font-bold">Pure Agent Rule 33 Zero Markup</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/919920054785?text=Hello%20NyayaLink%2C%20I%20need%20assistance%20with%20company%20registration%20and%20compliance."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 sm:px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>💬</span>
              <span className="hidden sm:inline">WhatsApp CA Desk</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            <Link
              href="/login"
              className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-3 sm:px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>🔑</span>
              <span>Client Log In</span>
            </Link>
          </div>
        </div>

        {/* Desktop Interactive Mega-Menu Ribbon */}
        <div className="hidden lg:block border-t border-cyan-800/50 mt-3 pt-2">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs font-bold tracking-tight">
            <div className="flex items-center gap-1">
              {[
                {
                  id: 'company-reg',
                  label: '🏢 Company Registration',
                  links: [
                    { name: 'Private Limited Company (Pvt Ltd)', href: '/services/private-limited-company' },
                    { name: 'US Delaware C-Corp (YC Ready)', href: '/services/us-delaware-company-registration' },
                    { name: 'Limited Liability Partnership (LLP)', href: '/services/llp-registration' },
                    { name: 'One Person Company (OPC)', href: '/services/one-person-company' },
                    { name: 'Section 8 Company (NGO)', href: '/services/section-8-company' },
                    { name: 'Startup India DPIIT Recognition', href: '/services/startup-india-dpiit-recognition' },
                  ],
                },
                {
                  id: 'tax-gst',
                  label: '🧾 Tax & GST',
                  links: [
                    { name: 'GST Registration (New GSTIN)', href: '/services/gst-registration' },
                    { name: 'Monthly GST Return Filing', href: '/services/monthly-gst-return-filing' },
                    { name: 'GST LUT Filing for Exporters', href: '/services/gst-lut-filing' },
                    { name: 'TDS Quarterly Return (24Q/26Q)', href: '/services/tds-return-filing' },
                    { name: 'Corporate Income Tax (ITR-6)', href: '/services/income-tax-return-itr' },
                  ],
                },
                {
                  id: 'trademark-ipr',
                  label: '™️ Trademark & IPR',
                  links: [
                    { name: 'Trademark Registration (™ / ®)', href: '/services/trademark-registration' },
                    { name: 'Trademark Objection Reply', href: '/services/trademark-objection-reply' },
                    { name: 'Trademark Hearing Representation', href: '/services/trademark-hearing-representation' },
                    { name: 'Copyright Registration', href: '/services/copyright-registration' },
                    { name: 'Patent Search & Filing', href: '/services/patent-filing-india' },
                  ],
                },
                {
                  id: 'licenses',
                  label: '📜 Licenses & Permits',
                  links: [
                    { name: 'FSSAI Food License (Basic & State)', href: '/services/fssai-food-license' },
                    { name: 'Shop & Establishment (Gumasta)', href: '/services/shop-and-establishment-license' },
                    { name: 'Import Export Code (IEC)', href: '/services/import-export-code-iec' },
                    { name: 'MSME Udyam Registration', href: '/services/msme-udyam-registration' },
                    { name: 'ISO Certification (9001 / 27001)', href: '/services/iso-certification' },
                  ],
                },
                {
                  id: 'tech-scaling',
                  label: '🚀 Tech & Scaling',
                  links: [
                    { name: 'Founders Agreement & Cap Table', href: '/services/founders-agreement-drafting' },
                    { name: 'Commercial Contract / SLA', href: '/services/business-contract-drafting' },
                    { name: 'Scale Your Business & AI SOPs', href: '/services/scale-your-business' },
                    { name: 'AI Voice Agents & Automation', href: '/services/ai-solutions' },
                  ],
                },
              ].map((menu) => (
                <div
                  key={menu.id}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(menu.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-[#F4B942] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{menu.label}</span>
                    <span className="text-[10px] opacity-60">▾</span>
                  </button>

                  {openDropdown === menu.id && (
                    <div className="absolute top-full left-0 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {menu.links.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#073B5C] hover:bg-slate-50 transition"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-[#F4B942]">
              <Link href="/packages" className="hover:underline flex items-center gap-1">
                <span>📦</span>
                <span>8 Founder Bundles</span>
              </Link>
              <span className="text-cyan-700">•</span>
              <Link href="/vakil" className="hover:underline flex items-center gap-1 text-cyan-200">
                <span>👨‍⚖️</span>
                <span>वकील Advocate Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDING DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#073B5C] text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-5 z-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono">
                  Nyaya<span className="text-[#F4B942]">Link</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 2x2 Quick Category Launcher */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/packages"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center font-bold"
                >
                  <span className="text-xl block">📦</span>
                  <span>Founder Bundles</span>
                </Link>
                <Link
                  href="/vakil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center font-bold"
                >
                  <span className="text-xl block">👨‍⚖️</span>
                  <span>Advocates Hub</span>
                </Link>
                <Link
                  href="/tools/company-name-search"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center font-bold"
                >
                  <span className="text-xl block">🔍</span>
                  <span>MCA Name Search</span>
                </Link>
                <Link
                  href="/tools/incorporation-calculator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center font-bold"
                >
                  <span className="text-xl block">🏛️</span>
                  <span>Stamp Calculator</span>
                </Link>
              </div>

              {/* Category Accordions */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                {[
                  {
                    id: 'company-reg',
                    label: '🏢 Company Registration',
                    items: [
                      { name: 'Private Limited (Pvt Ltd)', href: '/services/private-limited-company' },
                      { name: 'Limited Liability Partnership', href: '/services/llp-registration' },
                      { name: 'One Person Company (OPC)', href: '/services/one-person-company' },
                      { name: 'Section 8 Company (NGO)', href: '/services/section-8-company' },
                    ],
                  },
                  {
                    id: 'tax',
                    label: '🧾 Tax & GST Compliance',
                    items: [
                      { name: 'GST Registration', href: '/services/gst-registration' },
                      { name: 'Monthly GST Filing', href: '/services/monthly-gst-return-filing' },
                      { name: 'GST LUT for Export', href: '/services/gst-lut-filing' },
                    ],
                  },
                  {
                    id: 'ipr',
                    label: '™️ Trademark & Intellectual Property',
                    items: [
                      { name: 'Trademark Registration', href: '/services/trademark-registration' },
                      { name: 'Trademark Objection Reply', href: '/services/trademark-objection-reply' },
                      { name: 'Copyright Registration', href: '/services/copyright-registration' },
                    ],
                  },
                  {
                    id: 'licenses',
                    label: '📜 Licenses & Approvals',
                    items: [
                      { name: 'FSSAI Food License', href: '/services/fssai-food-license' },
                      { name: 'Shop & Establishment (Gumasta)', href: '/services/shop-and-establishment-license' },
                      { name: 'Import Export Code (IEC)', href: '/services/import-export-code-iec' },
                    ],
                  },
                ].map((sec) => (
                  <div key={sec.id} className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileExpandedCat(mobileExpandedCat === sec.id ? null : sec.id)}
                      className="w-full p-3 font-bold flex justify-between items-center bg-white/5 hover:bg-white/10"
                    >
                      <span>{sec.label}</span>
                      <span>{mobileExpandedCat === sec.id ? '−' : '+'}</span>
                    </button>
                    {mobileExpandedCat === sec.id && (
                      <div className="p-3 bg-[#052840] space-y-2 border-t border-white/10">
                        {sec.items.map((it, i) => (
                          <Link
                            key={i}
                            href={it.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-slate-300 hover:text-white"
                          >
                            • {it.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Support */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <a
                href="tel:+919920054785"
                className="block p-3 bg-white/10 rounded-xl text-center font-extrabold text-[#F4B942]"
              >
                📞 Call Direct Desk: +91 9920054785
              </a>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 bg-[#F4B942] text-[#073B5C] rounded-xl text-center font-black"
              >
                Client Dashboard Login →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#073B5C] via-[#09476F] to-[#0E7490] text-white pt-6 pb-12 sm:pt-12 sm:pb-20 px-4 sm:px-8 border-b border-[#0E7490]/50 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition & Omnisearch (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-7">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F4B942]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Pure Agent Rule 33 • Zero-Markup Stamp Duty Guarantee</span>
            </div>

            <h1 className="text-3xl sm:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight text-white">
              India’s Most Transparent Legal &amp; Compliance Platform
            </h1>

            <p className="text-sm sm:text-lg text-slate-200 leading-relaxed font-medium max-w-2xl">
              Incorporate, protect, and scale your business with empanelled Chartered Accountants and High Court Advocates. No hidden stamp duties, zero sales pressure, and a flat ₹999 booking advance.
            </p>

            {/* Master Omnisearch */}
            <div className="relative max-w-xl" ref={searchDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => {
                    setHeroSearch(e.target.value);
                    setIsHeroSearchOpen(true);
                  }}
                  onFocus={() => setIsHeroSearchOpen(true)}
                  placeholder="What legal or compliance service does your business need? (e.g. Pvt Ltd, GST, Trademark)..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-xs sm:text-sm pl-11 pr-24 py-4 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/40 border border-slate-200"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  🔍
                </span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#073B5C] text-[#F4B942] text-[10px] font-black px-2.5 py-1 rounded-xl">
                  {servicesList.length} Services
                </span>
              </div>

              {/* Autocomplete Dropdown */}
              {isHeroSearchOpen && heroSearchMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 divide-y divide-slate-100">
                  {heroSearchMatches.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      onClick={() => setIsHeroSearchOpen(false)}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{s.icon}</span>
                        <div className="min-w-0">
                          <strong className="block text-xs font-black text-[#073B5C] truncate">{s.title}</strong>
                          <span className="text-[10px] text-slate-500 font-medium">{s.sla} • Direct CA Desk</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-700 shrink-0">₹{s.price.toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Guided Advisory Callout */}
            <div className="p-3.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 max-w-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="text-slate-100 font-semibold">
                  Not sure which entity to choose? Answer 3 questions:
                </span>
              </div>
              <a
                href="#wizard-section"
                className="bg-[#F4B942] text-[#073B5C] font-black px-3.5 py-1.5 rounded-xl hover:bg-amber-400 transition text-[11px] self-start sm:self-auto shrink-0 shadow-xs"
              >
                Take 60-Sec Wizard →
              </a>
            </div>

            {/* Popular Service Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200 block">
                Popular Statutory Registrations:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: '🏢 Pvt Ltd Company (₹6,999)', href: '/services/private-limited-company' },
                  { label: '🧾 GST Registration (₹1,499)', href: '/services/gst-registration' },
                  { label: '™️ Trademark Filing (₹1,499)', href: '/services/trademark-registration' },
                  { label: '🤝 LLP Registration (₹6,499)', href: '/services/llp-registration' },
                  { label: '📜 FSSAI Food License (₹1,499)', href: '/services/fssai-food-license' },
                ].map((pill, i) => (
                  <Link
                    key={i}
                    href={pill.href}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl border border-white/10 transition shadow-2xs hover:border-cyan-300"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hero 3-Tab Command Center (5 cols) */}
          <HeroCommandCenter servicesList={servicesList} />
        </div>
      </section>

      {/* 3.1 LIVE ACTIVITY TICKER BANNER */}
      <div className="bg-[#052840] border-y border-cyan-900/60 py-2.5 px-4 sm:px-8 text-xs min-h-[44px]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Activity
            </span>
            <span className="text-slate-200 font-medium truncate flex items-center gap-2 transition-all duration-300 text-[11px] sm:text-xs">
              <span>{LIVE_ACTIVITIES[activityIndex].icon}</span>
              <strong className="text-white">{LIVE_ACTIVITIES[activityIndex].text}</strong>
              <span className="text-cyan-300/80 text-[10px] font-mono shrink-0">({LIVE_ACTIVITIES[activityIndex].time})</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-slate-300 text-[11px] font-semibold shrink-0">
            <span className="flex items-center gap-1.5 text-cyan-200">
              <span className="text-[#F4B942]">⚡</span> 4-Hour SLA Auto-Escalation Active
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">✓ Pure Agent Stamp Duty Passed-Through</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#F4B942]">256-Bit SSL Encrypted Vault</span>
          </div>
        </div>
      </div>

      {/* 4. TRUST & SOCIAL PROOF METRICS */}
      <section className="bg-white border-b border-slate-200 py-3 sm:py-6 px-3 sm:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile Horizontal Scroll Strip */}
          <div className="sm:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
            <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">
              <span className="text-base">🏢</span>
              <div className="leading-tight">
                <strong className="block text-xs font-black text-[#073B5C]">1,200+</strong>
                <span className="text-[9px] text-slate-500 font-semibold whitespace-nowrap">Businesses Advised</span>
              </div>
            </div>
            <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">
              <span className="text-base text-amber-500">⭐</span>
              <div className="leading-tight">
                <strong className="block text-xs font-black text-[#073B5C]">4.9 / 5.0</strong>
                <span className="text-[9px] text-slate-500 font-semibold whitespace-nowrap">Verified Rating</span>
              </div>
            </div>
            <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 bg-emerald-50/90 border border-emerald-200/80 rounded-xl shadow-2xs">
              <span className="text-base text-emerald-600">⚡</span>
              <div className="leading-tight">
                <strong className="block text-xs font-black text-emerald-800">₹999 Token</strong>
                <span className="text-[9px] text-emerald-700 font-semibold whitespace-nowrap">Split Advance</span>
              </div>
            </div>
            <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 bg-cyan-50/90 border border-cyan-200/80 rounded-xl shadow-2xs">
              <span className="text-base text-[#0E7490]">🛡️</span>
              <div className="leading-tight">
                <strong className="block text-xs font-black text-[#073B5C]">CA &amp; Advocate</strong>
                <span className="text-[9px] text-[#0E7490] font-semibold whitespace-nowrap">Direct Desk</span>
              </div>
            </div>
          </div>

          {/* Desktop 4-Column Grid */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
              <strong className="text-3xl font-black text-[#073B5C]">1,200+</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Businesses &amp; Startups Advised</p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
              <strong className="text-3xl font-black text-[#073B5C]">4.9 / 5.0</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Verified Client Rating</p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
              <strong className="text-3xl font-black text-[#0E7490]">₹999 Token</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Split-Ticket Advance</p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
              <strong className="text-3xl font-black text-[#073B5C]">CA &amp; Advocate</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Direct Desk Supervision</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.1 THE NYAYALINK INTEGRITY GUARANTEE & ANTI-TELEMARKETING */}
      <section className="bg-gradient-to-r from-[#073B5C] via-[#0A4E7A] to-[#073B5C] text-white py-4 sm:py-6 px-3 sm:px-8 border-b border-cyan-900/50 shadow-md">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile Swipeable Horizontal Carousel */}
          <div className="sm:hidden flex items-stretch gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
            <div className="w-[82vw] shrink-0 snap-start flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xl p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">🛡️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-white">Zero Pushy Sales Calls</h4>
                <p className="text-[10px] text-slate-300 leading-snug">
                  We never trigger automated call centers when you browse or calculate fees. 100% transparent, self-service digital tracking in your Vault.
                </p>
              </div>
            </div>

            <div className="w-[82vw] shrink-0 snap-start flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xl p-2 rounded-xl bg-[#F4B942]/20 text-[#F4B942] shrink-0">⚖️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-white">Rule 33 Pure Agent Transparency</h4>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Government stamp duties and MCA/IP India fees are passed through to the rupee with zero hidden markup. Itemized GST invoices.
                </p>
              </div>
            </div>

            <div className="w-[82vw] shrink-0 snap-start flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xl p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">🏛️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-white">Direct CA &amp; Advocate Supervision</h4>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Corporate filings are supervised directly by practicing Chartered Accountants; disputes &amp; legal notices vetted by High Court advocates.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop 3-Column Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-2xl p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">🛡️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-white">Zero Pushy Sales Calls</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We never trigger automated call centers when you browse or calculate fees. 100% transparent, self-service digital tracking in your personal S3 Vault.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-2xl p-2 rounded-xl bg-[#F4B942]/20 text-[#F4B942] shrink-0">⚖️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-white">Rule 33 Pure Agent Transparency</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Government stamp duties and MCA/IP India fees are passed through to the rupee with zero hidden markup. Professional fees are clearly itemized on GST invoices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-2xl p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">🏛️</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-white">Direct CA &amp; Bar Council Supervision</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Corporate filings are supervised directly by practicing Chartered Accountants; disputes &amp; legal notices are vetted by verified High Court advocates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.2 DUAL-TRACK DISPUTE RESOLUTION */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8 px-3 sm:px-8">
        <div className="max-w-[1600px] mx-auto bg-gradient-to-br from-slate-50 via-cyan-50/30 to-amber-50/30 rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#073B5C] text-[#F4B942] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                <span>⚖️</span> Honest Dispute Resolution (ODR)
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[#073B5C]">
                Consumer Dispute, Fraud, or Unpaid Dues? Choose the Honest Dual-Track
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Unlike competitors who promise court resolution but only mail a templated letter and demand tens of thousands later, NyayLink provides an upfront 2-stage choice:
              </p>
            </div>

            {/* Desktop-Only Action Buttons */}
            <div className="hidden sm:flex flex-row gap-3 shrink-0">
              <Link
                href="/services/consumer-complaint-notice"
                className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <span>📜 Send Legal Notice (₹1,999) →</span>
              </Link>
              <Link
                href="/vakil"
                className="bg-white hover:bg-slate-50 text-[#073B5C] border-2 border-[#073B5C] font-black text-xs px-5 py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>👨‍⚖️ Book Verified Court Advocate →</span>
              </Link>
            </div>
          </div>

          {/* Actionable Track Cards with Direct CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#073B5C] text-sm">Track 1: Advocate Demand Notice</span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">₹1,999 - ₹2,499</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  High-impact notice on advocate letterhead served via Registered Speed Post with Proof of Delivery (POD). Solves 70%+ of disputes pre-litigation.
                </p>
              </div>
              <Link
                href="/services/consumer-complaint-notice"
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-2.5 rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>📜</span> Send Legal Notice (₹1,999) →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#073B5C] text-sm">Track 2: e-Daakhil / Court Filing</span>
                  <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Direct Advocate Representation</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  If the opposite party defaults, hire a verified Bar Council advocate from our directory to draft your petition and represent you before the District Commission.
                </p>
              </div>
              <Link
                href="/vakil"
                className="w-full bg-white hover:bg-slate-50 text-[#073B5C] border-2 border-[#073B5C] font-black text-xs py-2.5 rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>👨‍⚖️</span> Book Verified Court Advocate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 FOUNDER STARTER KITS & PLAYBOOKS */}
      <FounderPlaybooks />

      {/* 5. MAIN SERVICES DIRECTORY & ENTITY MATCHMAKER */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full space-y-8 flex-grow">
        {/* INTERACTIVE 3-QUESTION BUSINESS ENTITY MATCHMAKER WIZARD */}
        <EntityMatchmakerWizard />

        {/* 58 SERVICES DIRECTORY */}
        <ServicesCatalog servicesList={servicesList} />
      </main>

      {/* 6. WHY NYAYALINK 3-WAY COMPARISON MATRIX */}
      <ComparisonMatrix />

      {/* 7. STEP-BY-STEP EXECUTION WORKFLOW */}
      <section className="bg-[#F0F4F8] border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
              Transparent &amp; Simple Workflow
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              How NyayaLink Executes Your Filing in 4 Steps
            </h3>
          </div>

          {/* 2×2 Process Matrix on Mobile, 4 Across on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
            <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 sm:space-y-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-xs sm:text-sm">
                1
              </span>
              <strong className="block text-[#073B5C] text-xs sm:text-sm leading-snug">₹999 Booking Token</strong>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
                Start with a low-friction ₹999 advance. Dedicated CA assigned.
              </p>
            </div>
            <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 sm:space-y-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-xs sm:text-sm">
                2
              </span>
              <strong className="block text-[#073B5C] text-xs sm:text-sm leading-snug">Vault Upload &amp; CA</strong>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
                Upload smartphone photos to vault. CA scrutinizes documents.
              </p>
            </div>
            <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 sm:space-y-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-xs sm:text-sm">
                3
              </span>
              <strong className="block text-[#073B5C] text-xs sm:text-sm leading-snug">Govt Submission</strong>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
                Direct statutory submission to MCA V3, GSTN, or IP India.
              </p>
            </div>
            <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 sm:space-y-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-xs sm:text-sm">
                4
              </span>
              <strong className="block text-[#073B5C] text-xs sm:text-sm leading-snug">Vault Delivery</strong>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
                Download approved official certificates and DIN letters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7.1 VERIFIED FOUNDER REVIEWS & SOCIAL PROOF */}
      <FounderReviewsCarousel />

      {/* 8. HOMEPAGE FAQS */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Quick answers to the most common legal &amp; filing questions.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                q: 'What is the ₹999 Advance Token option and how does it work?',
                a: 'The ₹999 advance token allows you to initiate your statutory filing (including MCA name reservation, constitutional document drafting, and CA pre-audit) without paying the full package fee upfront. Once your documents are CA-verified and the name is reserved, the remaining balance is settled transparently in your Order Tracking Room.',
              },
              {
                q: 'Are government statutory fees and state stamp duties included?',
                a: 'NyayaLink packages clearly itemize professional fees and standard portal charges. State-specific stamp duties (which vary by authorized capital and registered state, e.g., Maharashtra, Delhi, Karnataka) and official registry fees are passed through strictly at actual government challan receipts with zero markup under Rule 33 of CGST Rules.',
              },
              {
                q: 'How does NyayaLink guarantee government filing accuracy?',
                a: 'Every filing undergoes a 2-stage verification workflow: automated algorithmic validation against MCA V3, GSTN, and IP India rules, followed by meticulous scrutiny and digital certification from practicing Chartered Accountants, Company Secretaries, or High Court Advocates before submission.',
              },
              {
                q: 'Is the entire registration process 100% online and paperless?',
                a: 'Yes, 100% digital and paperless. You never need to visit a physical government office or courier physical papers. Identity verification and document signing are handled securely via Class-3 Digital Signature Certificates (DSC) or Aadhaar OTP, and all documents are stored in your encrypted NyayaLink Vault.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <span className="text-sm text-slate-400 font-mono">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dedicated FAQ Knowledge Base Button */}
          <div className="pt-4 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
            >
              <span>📖 View All 20+ Questions on Dedicated FAQ Page →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
