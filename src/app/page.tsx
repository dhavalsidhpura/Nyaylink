'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALL_CATEGORIES, MASTER_SERVICES } from '@/data/services';
import { INDIAN_STATES, getStateStampDuty, formatINR } from '@/lib/pricing';

export default function HomePage() {
  const router = useRouter();

  // Navigation & Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>('company-reg');

  // Hero Omnisearch
  const [heroSearch, setHeroSearch] = useState('');
  const [isHeroSearchOpen, setIsHeroSearchOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Directory Category & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [directorySearch, setDirectorySearch] = useState('');
  const [mobileCatalogLayout, setMobileCatalogLayout] = useState<'grid' | 'horizontal'>('grid');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive 2-Step Quote Estimator (Hero Right)
  const [estimatorService, setEstimatorService] = useState('private-limited-company');
  const [estimatorState, setEstimatorState] = useState('MH');
  const [isCallbackMode, setIsCallbackMode] = useState(false);

  // Callback Form Fields
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbEmail, setCbEmail] = useState('');
  const [isSubmittingCb, setIsSubmittingCb] = useState(false);
  const [cbSubmitted, setCbSubmitted] = useState(false);

  // Live Services Hydration
  const [servicesList, setServicesList] = useState<typeof MASTER_SERVICES>(MASTER_SERVICES || []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/services', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.services) && data.services.length > 0) {
          const map = new Map<string, any>();
          for (const s of MASTER_SERVICES) map.set(s.slug, s);
          for (const s of data.services) {
            const existing = map.get(s.slug);
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
          setServicesList(Array.from(map.values()));
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // ignore network failures silently as master data is already loaded
        }
      });

    return () => controller.abort();
  }, []);

  // Close hero search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsHeroSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hero Omnisearch Suggestions
  const heroSearchMatches = useMemo(() => {
    if (!heroSearch.trim()) return [];
    const q = heroSearch.toLowerCase().trim();
    return servicesList
      .filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.slug.includes(q))
      .slice(0, 6);
  }, [heroSearch, servicesList]);

  // Selected Service for Quote Estimator
  const currentEstimatorService = useMemo(() => {
    return servicesList.find((s) => s.slug === estimatorService) || servicesList[0];
  }, [estimatorService, servicesList]);

  // State Stamp Duty for Estimator
  const isCompanyRegService =
    currentEstimatorService?.category === 'company-reg' ||
    currentEstimatorService?.slug.includes('company') ||
    currentEstimatorService?.slug.includes('llp');

  const estimatorStampDuty = useMemo(() => {
    if (!isCompanyRegService) return 0;
    return getStateStampDuty(estimatorState).amount;
  }, [isCompanyRegService, estimatorState]);

  const estimatorTotalOutlay = (currentEstimatorService?.price || 0) + estimatorStampDuty;

  // Filtered Catalog Services
  const filteredServices = useMemo(() => {
    return servicesList.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' ||
        service.category === activeCategory ||
        (activeCategory === 'company-reg' && service.category === 'company-reg') ||
        (activeCategory === 'tax-accounting' && service.category === 'tax-accounting') ||
        (activeCategory === 'trademark-ipr' && (service.category === 'trademark-ipr' || service.category === 'copyright')) ||
        (activeCategory === 'licenses-permits' && service.category === 'licenses-permits') ||
        (activeCategory === 'business-tech' && service.category === 'business-tech');

      const matchesSearch =
        !directorySearch.trim() ||
        service.title.toLowerCase().includes(directorySearch.toLowerCase()) ||
        service.desc.toLowerCase().includes(directorySearch.toLowerCase()) ||
        service.category.toLowerCase().includes(directorySearch.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [servicesList, activeCategory, directorySearch]);

  // Callback form handler
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCb(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cbName,
          phone: cbPhone,
          email: cbEmail,
          source: 'Homepage Instant Estimator Desk',
          complianceType: currentEstimatorService.title,
        }),
      });
      setCbSubmitted(true);
    } catch {
      alert('Could not submit request. Please try contacting via WhatsApp or phone.');
    } finally {
      setIsSubmittingCb(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-20 lg:pb-0">

      {/* ======================================================== */}
      {/* 1. TOP UTILITY RIBBON (GOVT PORTAL INTEGRATIONS & DESK)   */}
      {/* ======================================================== */}
      <div className="bg-[#041E30] text-slate-300 text-[11px] py-2 px-4 sm:px-8 border-b border-cyan-950/60 hidden sm:block">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>📍 Mumbai HQ: Charkop, Kandivali West</span>
            <span>📞 Direct Desk: <strong className="text-white">+91 9920054785</strong></span>
            <span className="hidden md:inline">✉️ info@nyayalink.com</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Mumbai CA Desk: Online
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-[#F4B942] hidden md:inline">⚡ MCA V3, GSTN & IP India Integrated</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN HEADER & MEGA-MENU (MOBILE DRAWER INCLUDED)     */}
      {/* ======================================================== */}
      <header className="bg-[#073B5C] text-white py-3 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Sub-Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <span className="text-xl leading-none">☰</span>
            </button>

            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>

            <span className="hidden xl:inline-block text-[11px] text-cyan-200 font-semibold border-l border-white/20 pl-3">
              Direct Corporate & Compliance Legal Portal
            </span>
          </div>

          {/* Quick Header Search Bar on Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={searchDropdownRef}>
            <input
              type="text"
              placeholder="Search 35+ services (e.g. Pvt Ltd, Trademark, GST)..."
              value={heroSearch}
              onChange={(e) => {
                setHeroSearch(e.target.value);
                setIsHeroSearchOpen(true);
              }}
              onFocus={() => setIsHeroSearchOpen(true)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 border border-white/20 focus:border-[#0E7490] rounded-xl px-3.5 py-1.5 text-xs placeholder:text-slate-300 focus:placeholder:text-slate-400 focus:outline-none transition shadow-inner"
            />
            {heroSearch && (
              <button
                type="button"
                onClick={() => setHeroSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}

            {/* Live Autocomplete Dropdown */}
            {isHeroSearchOpen && heroSearchMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Suggested Services
                </div>
                {heroSearchMatches.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={() => setIsHeroSearchOpen(false)}
                    className="p-3 hover:bg-cyan-50/60 flex items-center justify-between gap-2 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <strong className="block text-xs font-extrabold text-[#073B5C] leading-snug">{s.title}</strong>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{s.category} • SLA: {s.sla}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full block">
                        ₹999 Advance
                      </span>
                      <span className="text-[10px] text-slate-400">Total: ₹{s.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/vakil"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#F4B942] hover:text-amber-300 font-bold px-2 py-1.5 transition"
            >
              <span>👨‍⚖️</span> Talk to a Lawyer
            </Link>

            <Link
              href="/dashboard"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
            >
              Vault Dashboard
            </Link>

            <Link
              href="/ca/dashboard"
              className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow flex items-center gap-1"
            >
              <span>📊</span> CA Partner Portal
            </Link>
          </div>
        </div>

        {/* Desktop Interactive Mega-Menu Ribbon */}
        <div className="hidden lg:block border-t border-cyan-900/60 mt-3 pt-2 max-w-[1600px] mx-auto">
          <nav className="flex items-center justify-between text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-6">
              
              {/* Dropdown 1: Company Registration */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('cr')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  <span>🏢</span> Company Registration <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'cr' && (
                  <div className="absolute top-full left-0 w-80 bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl mb-1">
                      <span className="text-[10px] font-black text-[#0E7490] uppercase tracking-wider block">Incorporation Fast-Track</span>
                      <p className="text-[11px] text-slate-500">Includes SPICe+, DINs, DSC & Name Approval</p>
                    </div>
                    <Link href="/services/private-limited-company" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">
                      Private Limited Company <span className="text-[10px] text-emerald-700 ml-1">₹999 Token</span>
                    </Link>
                    <Link href="/services/us-delaware-company-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#F4B942]">
                      US Delaware C-Corp <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black ml-1">YC Ready</span>
                    </Link>
                    <Link href="/services/startup-india-dpiit-recognition" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-amber-700">
                      Startup India DPIIT <span className="text-[10px] text-amber-600 ml-1">80-IAC Tax Exemption</span>
                    </Link>
                    <Link href="/services/mca-inc-20a-commencement-of-business" className="block p-2 hover:bg-slate-50 rounded-lg">
                      MCA Form INC-20A (Commencement)
                    </Link>
                    <Link href="/services/llp-registration" className="block p-2 hover:bg-slate-50 rounded-lg">LLP Registration</Link>
                    <Link href="/services/one-person-company" className="block p-2 hover:bg-slate-50 rounded-lg">One Person Company (OPC)</Link>
                    <Link href="/services/public-limited-company" className="block p-2 hover:bg-slate-50 rounded-lg">Public Limited Company</Link>
                    <Link href="/services/section-8-company" className="block p-2 hover:bg-slate-50 rounded-lg">Section 8 NGO Company</Link>
                    <Link href="/services/nidhi-company-registration" className="block p-2 hover:bg-slate-50 rounded-lg">Nidhi Company Setup</Link>
                    <Link href="/services/indian-subsidiary-registration" className="block p-2 hover:bg-slate-50 rounded-lg">Indian Subsidiary (FDI)</Link>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Tax & GST */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('tax')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  <span>🧾</span> Tax & Accounting <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'tax' && (
                  <div className="absolute top-full left-0 w-72 bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <Link href="/services/virtual-cfo-services" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#F4B942]">
                      Virtual CFO (vCFO) Advisory <span className="text-[10px] bg-cyan-100 text-[#073B5C] px-1.5 py-0.5 rounded font-black ml-1">Strategic</span>
                    </Link>
                    <Link href="/services/gst-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">
                      GST Registration <span className="text-[10px] text-emerald-700 ml-1">From ₹999</span>
                    </Link>
                    <Link href="/services/gst-return-filing" className="block p-2 hover:bg-slate-50 rounded-lg">Monthly GST Returns (3B/1)</Link>
                    <Link href="/services/dir-3-kyc-director-filing" className="block p-2 hover:bg-slate-50 rounded-lg font-semibold text-[#073B5C]">Director DIR-3 KYC Filing</Link>
                    <Link href="/services/income-tax-return-itr" className="block p-2 hover:bg-slate-50 rounded-lg">Income Tax Return (ITR)</Link>
                    <Link href="/services/tds-return-filing" className="block p-2 hover:bg-slate-50 rounded-lg">TDS Return (24Q / 26Q)</Link>
                    <Link href="/services/pf-esic-registration" className="block p-2 hover:bg-slate-50 rounded-lg">PF & ESIC Registration</Link>
                    <Link href="/services/online-bookkeeping" className="block p-2 hover:bg-slate-50 rounded-lg">Online Bookkeeping & MIS</Link>
                  </div>
                )}
              </div>

              {/* Dropdown 3: Trademark & IPR */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('tm')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  <span>™️</span> Trademark & Brand <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'tm' && (
                  <div className="absolute top-full left-0 w-72 bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <Link href="/services/trademark-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">
                      Trademark Registration (™) <span className="text-[10px] text-emerald-700 ml-1">₹999 Token</span>
                    </Link>
                    <Link href="/services/trademark-hearing-representation" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#F4B942]">
                      TM Hearing Representation <span className="text-[10px] text-amber-700 ml-1">High Court Adv.</span>
                    </Link>
                    <Link href="/services/trademark-watch-monitoring" className="block p-2 hover:bg-slate-50 rounded-lg font-semibold text-[#073B5C]">
                      TM Watch & Gazette Monitor
                    </Link>
                    <Link href="/services/trademark-renewal" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Renewal</Link>
                    <Link href="/services/trademark-objection" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Objection Reply</Link>
                    <Link href="/services/trademark-opposition" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Opposition</Link>
                    <Link href="/services/logo-design" className="block p-2 hover:bg-slate-50 rounded-lg">Brand Identity & Logo</Link>
                  </div>
                )}
              </div>

              {/* Dropdown 4: Licenses & Permits */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('lic')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  <span>📜</span> Licenses & Permits <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'lic' && (
                  <div className="absolute top-full left-0 w-80 bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <Link href="/services/msme-udyam-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-emerald-800">
                      MSME Udyam Registration <span className="text-[10px] text-emerald-600 ml-1">Govt Subsidies</span>
                    </Link>
                    <Link href="/services/shop-and-establishment-license" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">
                      Shop & Establishment (Gumasta)
                    </Link>
                    <Link href="/services/fssai-food-license" className="block p-2 hover:bg-slate-50 rounded-lg">FSSAI Food License</Link>
                    <Link href="/services/import-export-code-iec" className="block p-2 hover:bg-slate-50 rounded-lg">Import Export Code (IEC)</Link>
                    <Link href="/services/iso-certification" className="block p-2 hover:bg-slate-50 rounded-lg">ISO 9001:2015 Certification</Link>
                    <Link href="/services/fssai-renewal" className="block p-2 hover:bg-slate-50 rounded-lg">FSSAI Annual Renewal</Link>
                  </div>
                )}
              </div>

              {/* Dropdown 5: Tech & Scaling */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('btech')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  <span>🚀</span> Scale & AI <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'btech' && (
                  <div className="absolute top-full left-0 w-72 bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <Link href="/services/scale-your-business" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">Scale Your Business</Link>
                    <Link href="/services/ai-solutions" className="block p-2 hover:bg-slate-50 rounded-lg">Custom AI Solutions & Agents</Link>
                    <Link href="/services/software-app-development" className="block p-2 hover:bg-slate-50 rounded-lg">Custom Software & Apps</Link>
                    <Link href="/services/website-ecommerce" className="block p-2 hover:bg-slate-50 rounded-lg">Website & E-Commerce</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/packages"
                className="bg-[#F4B942]/15 hover:bg-[#F4B942]/25 text-[#F4B942] border border-[#F4B942]/30 px-3 py-1 rounded-xl font-black flex items-center gap-1.5 transition text-xs"
              >
                <span>📦</span> Packages & Bundles <span className="bg-[#F4B942] text-[#073B5C] text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Save 45%</span>
              </Link>

              <a href="#catalog-section" className="text-cyan-200 hover:text-white font-extrabold flex items-center gap-1 text-xs">
                Explore All 40+ Services ↓
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE SLIDING DRAWER (NATIVE MOBILE NAVIGATION)        */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#073B5C] text-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-cyan-800 pb-3">
              <span className="font-mono font-black text-lg text-white">
                Nyaya<span className="text-[#F4B942]">Link</span> Menu
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick links inside drawer */}
            <div className="space-y-2 text-xs">
              <Link
                href="/packages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 bg-gradient-to-r from-[#0E7490] to-cyan-800 text-[#F4B942] rounded-xl font-black border border-cyan-400/40 text-center shadow-md"
              >
                📦 Bundled Packages (Save up to 48%) →
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 bg-white/10 rounded-xl font-bold hover:bg-white/15"
              >
                📁 Vault Dashboard
              </Link>
              <Link
                href="/vakil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 bg-white/10 rounded-xl font-bold text-[#F4B942] hover:bg-white/15"
              >
                👨‍⚖️ Talk to a Lawyer Marketplace
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 bg-[#F4B942] text-[#073B5C] rounded-xl font-black text-center"
              >
                ⚡ CA & Staff Console →
              </Link>
            </div>

            {/* 2×2 Quick Category Launcher */}
            <div className="space-y-1.5 pt-2 border-t border-cyan-800">
              <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider block">
                Quick Category Launcher (1-Tap)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('company-reg');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold flex items-center gap-2 text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base">🏢</span>
                  <span className="truncate">Companies</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('trademark-ipr');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold flex items-center gap-2 text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base">™️</span>
                  <span className="truncate">Trademark</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('tax-accounting');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold flex items-center gap-2 text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base">🧾</span>
                  <span className="truncate">Tax & GST</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('licenses-permits');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold flex items-center gap-2 text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base">📜</span>
                  <span className="truncate">Licenses</span>
                </button>
              </div>
            </div>

            {/* Category Accordions */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-cyan-800">
              <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider block mb-1">
                Browse Detailed Catalog
              </span>

              {[
                { id: 'company-reg', label: 'Company Registration', icon: '🏢' },
                { id: 'tax-accounting', label: 'Tax & GST', icon: '🧾' },
                { id: 'trademark-ipr', label: 'Trademark & IP', icon: '™️' },
                { id: 'licenses-permits', label: 'Licenses & Permits', icon: '📜' },
                { id: 'business-tech', label: 'Business & AI Tech', icon: '🚀' },
              ].map((cat) => (
                <div key={cat.id} className="border border-cyan-900 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)}
                    className="w-full text-left p-3 flex justify-between items-center bg-cyan-950/60 font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span>{mobileExpandedCat === cat.id ? '−' : '+'}</span>
                  </button>

                  {mobileExpandedCat === cat.id && (
                    <div className="p-3 bg-[#052840] space-y-2 text-[11px] border-t border-cyan-900">
                      {servicesList
                        .filter((s) => s.category === cat.id || (cat.id === 'trademark-ipr' && s.category === 'copyright'))
                        .map((s) => (
                          <Link
                            key={s.slug}
                            href={`/services/${s.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-slate-300 hover:text-white py-1 hover:underline"
                          >
                            • {s.title}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direct Support */}
            <div className="pt-4 border-t border-cyan-800 text-xs space-y-2 text-slate-300">
              <a
                href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20need%20legal%20help"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
              >
                💬 WhatsApp CA Desk
              </a>
              <a href="tel:+919920054785" className="block text-center text-slate-400 py-1">
                📞 Hotline: +91 9920054785
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HERO SECTION: COMMAND CENTER & DYNAMIC ESTIMATOR     */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#073B5C] via-[#052A42] to-[#041E30] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-cyan-900 shadow-inner">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Omnisearch (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0E7490]/50 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F4B942]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ISO 9001:2015 Certified Portal • Zero Hidden Charges
            </div>

            <h1 className="text-3xl sm:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight text-white">
              Fast, Certified Compliance & Legal Filing in India
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl font-medium">
              Company Incorporation, Trademark protection, GST returns, and FSSAI licenses executed 100% online by empanelled Chartered Accountants and High Court Advocates.
            </p>

            {/* HERO PROMINENT SEARCH BAR */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl max-w-xl">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-slate-800">
                <span className="text-base text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Type what you need (e.g. Pvt Ltd, Trademark, GST Return)..."
                  value={heroSearch}
                  onChange={(e) => {
                    setHeroSearch(e.target.value);
                    setIsHeroSearchOpen(true);
                  }}
                  className="w-full text-xs font-medium focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (heroSearchMatches.length > 0) {
                      router.push(`/services/${heroSearchMatches[0].slug}`);
                    }
                  }}
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-3.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition"
                >
                  Explore →
                </button>
              </div>

              {/* Autocomplete under Hero search */}
              {isHeroSearchOpen && heroSearchMatches.length > 0 && (
                <div className="mt-2 bg-white rounded-xl p-2 divide-y divide-slate-100 text-slate-800 shadow-xl">
                  {heroSearchMatches.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      className="p-2 hover:bg-slate-50 flex justify-between items-center text-xs rounded-lg transition"
                    >
                      <span className="font-bold text-[#073B5C]">{s.icon} {s.title}</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                        Start for ₹999 Advance
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Category Jump (2×2 on Mobile, Flex on Desktop) */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider block">
                Popular Filings:
              </span>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs">
                <Link
                  href="/services/private-limited-company"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 p-2 sm:px-3 sm:py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 truncate"
                >
                  <span className="text-base shrink-0">🏢</span>
                  <span className="truncate">Pvt Ltd Company</span>
                </Link>
                <Link
                  href="/services/trademark-registration"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 p-2 sm:px-3 sm:py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 truncate"
                >
                  <span className="text-base shrink-0">™️</span>
                  <span className="truncate">Trademark Filing</span>
                </Link>
                <Link
                  href="/services/gst-registration"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 p-2 sm:px-3 sm:py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 truncate"
                >
                  <span className="text-base shrink-0">🧾</span>
                  <span className="truncate">GST Registration</span>
                </Link>
                <Link
                  href="/services/fssai-food-license"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 p-2 sm:px-3 sm:py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 truncate"
                >
                  <span className="text-base shrink-0">🍽️</span>
                  <span className="truncate">FSSAI License</span>
                </Link>
              </div>
            </div>

            {/* Instant Free Diagnostic Tools Ribbon (2×2 on Mobile, Flex on Desktop) */}
            <div className="pt-3 border-t border-cyan-900/60 space-y-2">
              <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider block">
                Free Verification Desks:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <Link
                  href="/tools/company-name-search"
                  className="p-2 sm:px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center gap-1.5 transition truncate"
                >
                  <span>🏢</span>
                  <span className="truncate">MCA Search ↗</span>
                </Link>
                <Link
                  href="/tools/trademark-search"
                  className="p-2 sm:px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center gap-1.5 transition truncate"
                >
                  <span>™️</span>
                  <span className="truncate">TM Finder ↗</span>
                </Link>
                <Link
                  href="/tools/gst-search"
                  className="p-2 sm:px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center gap-1.5 transition truncate"
                >
                  <span>🧾</span>
                  <span className="truncate">Verify GSTIN ↗</span>
                </Link>
                <Link
                  href="/vakil"
                  className="p-2 sm:px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-[#F4B942] flex items-center gap-1.5 transition truncate"
                >
                  <span>👨‍⚖️</span>
                  <span className="truncate">Lawyer Desk ↗</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 2-Step Quote Estimator (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 relative">
              <div className="absolute -top-3 right-6 bg-[#F4B942] text-[#073B5C] text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
                ⚡ Live Quote & Advance Desk
              </div>

              {/* Mode Toggle: Self-Serve vs Free Callback */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsCallbackMode(false)}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    !isCallbackMode ? 'bg-white text-[#073B5C] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Instant Fee Calculator
                </button>
                <button
                  type="button"
                  onClick={() => setIsCallbackMode(true)}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    isCallbackMode ? 'bg-white text-[#073B5C] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Free 15-Min CA Callback
                </button>
              </div>

              {!isCallbackMode ? (
                /* 1. Self-Serve Instant Calculator Mode */
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                      Estimate & Book with ₹999 Advance
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      See exact statutory government stamp duties and NyayaLink retainers upfront.
                    </p>
                  </div>

                  {/* Step 1: Service selector */}
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">
                      1. Select Filing Requirement:
                    </label>
                    <select
                      value={estimatorService}
                      onChange={(e) => setEstimatorService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      {servicesList.slice(0, 15).map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.icon} {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: State selector */}
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">
                      2. State of Filing:
                    </label>
                    <select
                      value={estimatorState}
                      onChange={(e) => setEstimatorState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} {isCompanyRegService ? `(₹${getStateStampDuty(st.code).amount.toLocaleString()} Stamp)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing Matrix Box */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>NyayaLink Professional Fee:</span>
                      <strong className="text-slate-900">{formatINR(currentEstimatorService?.price || 0)}</strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Govt Stamp / Statutory Fee:</span>
                      <strong className="text-slate-900">
                        {estimatorStampDuty > 0 ? formatINR(estimatorStampDuty) : 'Direct at actuals'}
                      </strong>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-extrabold text-[#073B5C] text-sm">
                      <span>Estimated Outlay:</span>
                      <span className="text-base text-slate-900">{formatINR(estimatorTotalOutlay)}</span>
                    </div>
                  </div>

                  {/* Impulse CTA Button */}
                  <Link
                    href={`/services/${estimatorService}?state=${estimatorState}`}
                    className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Start Now for ₹999 Advance Token →</span>
                  </Link>

                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    🔒 ₹999 locks in CA review and name reservation. Remaining balance billed after drafting.
                  </p>
                </div>
              ) : (
                /* 2. Free 15-Min Callback Mode */
                <form onSubmit={handleCallbackSubmit} className="space-y-3.5 text-xs">
                  {cbSubmitted ? (
                    <div className="py-8 text-center space-y-2">
                      <span className="text-3xl">🎉</span>
                      <h4 className="font-black text-[#073B5C] text-base">Request Received!</h4>
                      <p className="text-slate-500 text-xs">
                        A dedicated CA from our Mumbai desk will call you within 15 minutes.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCbSubmitted(false)}
                        className="text-xs text-[#0E7490] font-bold underline pt-2"
                      >
                        Calculate another service
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-[#073B5C]">Request Expert Legal Callback</h3>
                        <p className="text-[11px] text-slate-500">
                          Get advice on {currentEstimatorService.title} from a verified CA/CS.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-[#073B5C] mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={cbName}
                          onChange={(e) => setCbName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-[#073B5C] mb-1">Mobile (+91) *</label>
                          <input
                            type="tel"
                            required
                            value={cbPhone}
                            onChange={(e) => setCbPhone(e.target.value)}
                            placeholder="+91 9920054785"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#073B5C] mb-1">Email Address *</label>
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
                        className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        {isSubmittingCb ? 'Connecting...' : 'Request Free Callback →'}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. TRUST & SOCIAL PROOF METRICS BANNER                   */}
      {/* ======================================================== */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center">
          <div className="p-3 sm:p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <strong className="text-xl sm:text-3xl font-black text-[#073B5C]">50,000+</strong>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Filings Completed</p>
          </div>
          <div className="p-3 sm:p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <strong className="text-xl sm:text-3xl font-black text-[#073B5C]">4.9 / 5.0</strong>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Google Verified</p>
          </div>
          <div className="p-3 sm:p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <strong className="text-xl sm:text-3xl font-black text-[#0E7490]">₹999 Token</strong>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Split-Ticket Advance</p>
          </div>
          <div className="p-3 sm:p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <strong className="text-xl sm:text-3xl font-black text-[#073B5C]">CA & Advocate</strong>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Direct Desk Supervision</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. MAIN SERVICES DIRECTORY (MICRO-COMMITMENT CATALOG)   */}
      {/* ======================================================== */}
      <main id="catalog-section" className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 w-full flex-grow space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
              Official Statutory Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Services Directory ({servicesList.length} Offerings)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a vertical or use search to find exact corporate, IP, or tax filings.
            </p>
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="Filter services by name..."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490] shadow-xs"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Verticals ({servicesList.length})
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile View Switcher: 2×2 Grid vs 2×1 Horizontal List */}
        <div className="flex sm:hidden items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-extrabold text-[#073B5C]">
            Mobile View:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setMobileCatalogLayout('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                mobileCatalogLayout === 'grid'
                  ? 'bg-white text-[#073B5C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>⊞</span> 2×2 Grid
            </button>
            <button
              type="button"
              onClick={() => setMobileCatalogLayout('horizontal')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                mobileCatalogLayout === 'horizontal'
                  ? 'bg-white text-[#073B5C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>☰</span> 2×1 List
            </button>
          </div>
        </div>

        {/* 2×1 Horizontal List View for Mobile (sm:hidden) */}
        {mobileCatalogLayout === 'horizontal' && (
          <div className="space-y-2.5 sm:hidden">
            {filteredServices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No services match your search query. Try typing another term.
              </div>
            ) : (
              filteredServices.map((srv) => (
                <Link
                  key={srv.id}
                  href={`/services/${srv.slug}`}
                  className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition hover:border-[#0E7490]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                      {srv.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#073B5C] text-xs leading-snug truncate">
                        {srv.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium">
                        <span className="truncate">⏱️ {srv.sla}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold shrink-0">₹999 Token</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#073B5C] block">
                      ₹{srv.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-[#073B5C] text-[#F4B942] font-black px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                      Start →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Dynamic Responsive Service Cards Grid (2×2 on Mobile, 3-4 across on Desktop) */}
        <div
          className={`${
            mobileCatalogLayout === 'horizontal' ? 'hidden sm:grid' : 'grid'
          } grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2.5 sm:gap-6 pt-1`}
        >
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs">
              No services match your search query. Try typing another term.
            </div>
          ) : (
            filteredServices.map((srv) => {
              const isAdvanceEligible = srv.price > 1000;
              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#0E7490]/50 transition-all group duration-200"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xl sm:text-2xl p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-105 transition-transform">
                        {srv.icon}
                      </span>
                      <span className="bg-[#FFF4D9] text-[#073B5C] text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200/60 truncate max-w-[85px] sm:max-w-[130px]">
                        {srv.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-[#073B5C] text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                        {srv.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2 min-h-[2rem] hidden sm:block">
                        {srv.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Timeline:</span>
                        <strong className="text-slate-800 truncate ml-1">{srv.sla}</strong>
                      </div>
                      <div className="hidden sm:flex justify-between items-center">
                        <span className="text-slate-400">Govt Fee:</span>
                        <span className="text-slate-500 truncate max-w-[140px] text-right" title={srv.govtFee}>
                          {srv.govtFee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro-Commitment Card Footer with ₹999 Advance Anchor */}
                  <div className="pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold block uppercase">
                        Package Fee
                      </span>
                      <strong className="text-xs sm:text-base font-black text-[#073B5C]">
                        ₹{srv.price.toLocaleString()}
                      </strong>
                    </div>

                    <Link
                      href={`/services/${srv.slug}`}
                      className="bg-[#073B5C] group-hover:bg-[#0E7490] text-[#F4B942] font-black text-[11px] sm:text-xs py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl uppercase tracking-wider text-center transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isAdvanceEligible ? 'Start ₹999 →' : 'Apply →'}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 6. WHY NYAYALINK COMPARISON MATRIX                      */}
      {/* ======================================================== */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
              The Modern Legal-Tech Standard
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Why Choose NyayaLink vs. Traditional Offline CAs
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Compare transparent digital execution with unpredictable offline practices.
            </p>
          </div>

          {/* Desktop Full Comparison Table (hidden on mobile to prevent overflow) */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[#073B5C]">
                  <th className="py-3 px-4 font-bold">Execution Capability</th>
                  <th className="py-3 px-4 font-black bg-cyan-50/80 text-[#0E7490] rounded-t-2xl">
                    NyayaLink Portal
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-500">Traditional Offline CA / Lawyer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-700">Filing Execution</td>
                  <td className="py-3.5 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">
                    ✓ 100% Digital & Paperless (Zero physical visits)
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">✕ Requires physical paperwork & office visits</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-700">Pricing Transparency</td>
                  <td className="py-3.5 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">
                    ✓ Itemized ₹999 Advance Token + GST Invoice
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">✕ Hidden retainer charges & unexpected portal markups</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-700">Live Status Tracking</td>
                  <td className="py-3.5 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">
                    ✓ Real-time status progress logs + Govt SRN sync
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">✕ Manual phone calls with uncertain timelines</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-700">Document Vault Security</td>
                  <td className="py-3.5 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">
                    ✓ 256-Bit SSL Lifetime Cloud Vault
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">✕ Physical paper files prone to misplacement</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive 2×1 Comparison Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {[
              {
                capability: 'Filing Execution',
                nyayalink: '100% Digital & Paperless (Zero visits)',
                traditional: 'Physical paperwork & office visits',
              },
              {
                capability: 'Pricing Transparency',
                nyayalink: 'Itemized ₹999 Token + GST Invoice',
                traditional: 'Hidden retainer charges & markups',
              },
              {
                capability: 'Live Status Tracking',
                nyayalink: 'Real-time progress logs + Govt SRN sync',
                traditional: 'Manual calls with uncertain timelines',
              },
              {
                capability: 'Document Vault Security',
                nyayalink: '256-Bit SSL Lifetime Cloud Vault',
                traditional: 'Paper files prone to misplacement',
              },
            ].map((row, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2 text-xs">
                <span className="font-extrabold text-[#073B5C] text-xs block">
                  {row.capability}
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-cyan-50/90 border border-cyan-200 rounded-xl space-y-1">
                    <span className="font-black text-[#0E7490] block text-[10px] uppercase">NyayaLink</span>
                    <p className="text-[#073B5C] font-semibold leading-tight">✓ {row.nyayalink}</p>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">Traditional</span>
                    <p className="text-slate-500 leading-tight">✕ {row.traditional}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. STEP-BY-STEP EXECUTION WORKFLOW                      */}
      {/* ======================================================== */}
      <section className="bg-[#F0F4F8] border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
              Transparent & Simple Workflow
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
              <strong className="block text-[#073B5C] text-xs sm:text-sm leading-snug">Vault Upload & CA</strong>
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

      {/* ======================================================== */}
      {/* 8. HOMEPAGE FAQS                                        */}
      {/* ======================================================== */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Everything you need to know about our legal-tech execution.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                q: 'What is the ₹999 Advance Token option and how does it work?',
                a: 'The ₹999 advance token allows you to initiate your statutory filing (including MCA name reservation, constitutional document drafting, and CA pre-audit) without paying the full package fee upfront. Once your documents are CA-verified and the name is reserved, the remaining balance is settled transparently in your Order Tracking Room.',
              },
              {
                q: 'How does NyayaLink guarantee government filing accuracy?',
                a: 'Every filing undergoes a 2-stage verification workflow: automated algorithmic validation against MCA V3, GSTN, and IP India rules, followed by meticulous scrutiny and digital certification from practicing Chartered Accountants, Company Secretaries, or High Court Advocates before submission.',
              },
              {
                q: 'Are government statutory fees and state stamp duties included?',
                a: 'NyayaLink packages clearly itemize professional fees and standard portal charges. State-specific stamp duties (which vary by authorized capital and registered state, e.g., Maharashtra, Delhi, Karnataka) and official registry fees are passed through strictly at actual government challan receipts with zero markup.',
              },
              {
                q: 'Is the entire registration process 100% online and paperless?',
                a: 'Yes, 100% digital and paperless. You never need to visit a physical government office or courier physical papers. Identity verification and document signing are handled securely via Class-3 Digital Signature Certificates (DSC) or Aadhaar OTP, and all documents are stored in your encrypted NyayaLink Vault.',
              },
              {
                q: 'How long does company incorporation or registration take from start to finish?',
                a: 'Private Limited and LLP incorporations typically complete within 3 to 7 working days, subject to Central Registration Centre (CRC) processing. GST registrations take 3 to 5 working days, while MSME Udyam certificates are issued within 24 to 48 hours.',
              },
              {
                q: 'Can my business claim GST Input Tax Credit (ITC) on NyayaLink invoices?',
                a: 'Yes. NyayaLink issues valid GST tax invoices with our active GSTIN for all professional services. Simply enter your company GSTIN during checkout or in your Vault profile, and you can claim full 18% Input Tax Credit on your monthly GSTR-3B filings.',
              },
              {
                q: 'What post-incorporation compliances are required after company registration?',
                a: 'Under the Companies Act 2013, newly incorporated companies must complete three mandatory steps: (1) Open a corporate bank current account and file MCA Form INC-20A (Commencement of Business) within 180 days, (2) Appoint a statutory auditor via Form ADT-1 within 30 days, and (3) Complete annual Director DIR-3 KYC filings before September 30.',
              },
              {
                q: 'How do I download and preserve my approved government certificates?',
                a: 'Once approved by statutory authorities (MCA, GSTN, DGFT, or IP India), all official certificates (Certificate of Incorporation, PAN/TAN cards, GSTIN registration certificate, Trademark TM-A receipts) are permanently archived in your encrypted digital Vault with verifiable QR codes for instant lifetime download.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
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
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. STICKY ACTION BAR FOR MOBILE DEVICES (<1024px)        */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#073B5C] text-white p-3 px-4 flex items-center justify-between z-40 border-t border-cyan-800 shadow-2xl">
        <a
          href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20need%20assistance"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-white/10 px-3 py-2 rounded-xl"
        >
          <span>💬</span> Chat CA
        </a>
        <a
          href="tel:+919920054785"
          className="flex items-center gap-1.5 text-xs font-bold text-[#F4B942]"
        >
          <span>📞</span> +91 9920054785
        </a>
        <a
          href="#catalog-section"
          className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-3.5 py-2 rounded-xl uppercase tracking-wider shadow cursor-pointer"
        >
          Explore 35+ ↑
        </a>
      </div>

      {/* ======================================================== */}
      {/* 10. FLOATING WHATSAPP EXPRESS ASSIST (DESKTOP)           */}
      {/* ======================================================== */}
      <a
        href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20have%20a%20question%20about%20a%20filing"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl items-center gap-2 transition-all hover:scale-105 border-2 border-white/40 cursor-pointer"
        title="Chat with CA Desk on WhatsApp"
      >
        <span className="text-base">💬</span>
        <span>Chat with CA Desk</span>
      </a>

    </div>
  );
}