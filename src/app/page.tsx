'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALL_CATEGORIES, MASTER_SERVICES } from '@/data/services';

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('company-reg');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Quick Form State
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickService, setQuickService] = useState('private-limited-company');
  const [quickState, setQuickState] = useState('Maharashtra');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  const servicesList = MASTER_SERVICES || [];
  const categoriesList = ALL_CATEGORIES || [];

  const filteredServices = servicesList.filter((service) => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuick(true);
    // Redirect directly into the dedicated service intake flow with prefilled data
    const queryParams = new URLSearchParams({
      name: quickName,
      phone: quickPhone,
      email: quickEmail,
      state: quickState,
    });
    router.push(`/services/${quickService}?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-16 lg:pb-0">
      {/* 1. Top Utility Contact Ribbon */}
      <div className="bg-[#041E30] text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-cyan-950/60 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>📍 Mumbai HQ: Charkop, Kandivali West</span>
            <span>📞 Direct Desk: <strong>+91 9920054785</strong></span>
            <span>✉️ compliance@nyayalink.com</span>
          </div>
          <div className="flex items-center gap-4 text-[#F4B942] font-semibold">
            <span>⚡ ISO 9001:2015 Certified Portal</span>
            <span>• MCA V3, IP India & GSTN Integrated</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="hidden lg:inline-block text-[11px] text-cyan-200 font-semibold border-l border-white/20 pl-3">
              Corporate & Compliance Legal Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
            >
              Vault Dashboard
            </Link>
            <Link
              href="/admin"
              className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs px-4 py-2 rounded-xl transition shadow"
            >
              CA Console →
            </Link>
          </div>
        </div>

        {/* Dropdown Navigation Menu */}
        <div className="hidden lg:block border-t border-cyan-900/60 mt-3 pt-2.5 max-w-7xl mx-auto">
          <nav className="flex items-center justify-between text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-6">
              {/* Company Registration */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('cr')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  Company Registration <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'cr' && (
                  <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-fadeIn text-xs">
                    <Link href="/services/private-limited-company" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">Private Limited Company</Link>
                    <Link href="/services/llp-registration" className="block p-2 hover:bg-slate-50 rounded-lg">LLP Registration</Link>
                    <Link href="/services/one-person-company" className="block p-2 hover:bg-slate-50 rounded-lg">One Person Company (OPC)</Link>
                    <Link href="/services/public-limited-company" className="block p-2 hover:bg-slate-50 rounded-lg">Public Limited Company</Link>
                    <Link href="/services/section-8-company" className="block p-2 hover:bg-slate-50 rounded-lg">Section 8 NGO Company</Link>
                    <Link href="/services/nidhi-company-registration" className="block p-2 hover:bg-slate-50 rounded-lg">Nidhi Company Setup</Link>
                    <Link href="/services/indian-subsidiary-registration" className="block p-2 hover:bg-slate-50 rounded-lg">Indian Subsidiary (FDI)</Link>
                  </div>
                )}
              </div>

              {/* Tax & Accounting */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('tax')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  Tax & Accounting <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'tax' && (
                  <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-fadeIn text-xs">
                    <Link href="/services/gst-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">GST Registration</Link>
                    <Link href="/services/gst-return-filing" className="block p-2 hover:bg-slate-50 rounded-lg">Monthly GST Returns (3B/1)</Link>
                    <Link href="/services/income-tax-return-itr" className="block p-2 hover:bg-slate-50 rounded-lg">Income Tax Return (ITR)</Link>
                    <Link href="/services/tds-return-filing" className="block p-2 hover:bg-slate-50 rounded-lg">TDS Return (24Q / 26Q)</Link>
                    <Link href="/services/pf-esic-registration" className="block p-2 hover:bg-slate-50 rounded-lg">PF & ESIC Setup</Link>
                    <Link href="/services/online-bookkeeping" className="block p-2 hover:bg-slate-50 rounded-lg">Online Bookkeeping</Link>
                  </div>
                )}
              </div>

              {/* Trademark & IPR */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('tm')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  Trademark & IPR <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'tm' && (
                  <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-fadeIn text-xs">
                    <Link href="/services/trademark-registration" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">Trademark Registration</Link>
                    <Link href="/services/trademark-renewal" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Renewal</Link>
                    <Link href="/services/trademark-objection" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Objection Reply</Link>
                    <Link href="/services/trademark-opposition" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Opposition</Link>
                    <Link href="/services/trademark-assignment" className="block p-2 hover:bg-slate-50 rounded-lg">Trademark Assignment</Link>
                    <Link href="/services/logo-design" className="block p-2 hover:bg-slate-50 rounded-lg">Logo & Brand Identity</Link>
                    <Link href="/services/series-trademark" className="block p-2 hover:bg-slate-50 rounded-lg">Series Trademark</Link>
                  </div>
                )}
              </div>

              {/* Licenses & Permits */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('lic')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  Licenses & Permits <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'lic' && (
                  <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-fadeIn text-xs">
                    <Link href="/services/fssai-food-license" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">FSSAI Food License</Link>
                    <Link href="/services/import-export-code-iec" className="block p-2 hover:bg-slate-50 rounded-lg">Import Export Code (IEC)</Link>
                    <Link href="/services/iso-certification" className="block p-2 hover:bg-slate-50 rounded-lg">ISO Certification</Link>
                    <Link href="/services/fssai-renewal" className="block p-2 hover:bg-slate-50 rounded-lg">FSSAI Renewal</Link>
                  </div>
                )}
              </div>

              {/* Business & Tech */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setOpenDropdown('btech')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="hover:text-[#F4B942] flex items-center gap-1 font-semibold transition cursor-pointer">
                  Business & Tech <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === 'btech' && (
                  <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-3 space-y-1 z-50 animate-fadeIn text-xs">
                    <Link href="/services/scale-your-business" className="block p-2 hover:bg-slate-50 rounded-lg font-bold text-[#073B5C]">Scale Your Business</Link>
                    <Link href="/services/ai-solutions" className="block p-2 hover:bg-slate-50 rounded-lg">AI Solutions & Agents</Link>
                    <Link href="/services/software-app-development" className="block p-2 hover:bg-slate-50 rounded-lg">Custom Software & Apps</Link>
                    <Link href="/services/website-ecommerce" className="block p-2 hover:bg-slate-50 rounded-lg">Website & E-Commerce</Link>
                    <Link href="/services/cloud-it-infrastructure" className="block p-2 hover:bg-slate-50 rounded-lg">Cloud & IT Infrastructure</Link>
                    <Link href="/services/cybersecurity-compliance" className="block p-2 hover:bg-slate-50 rounded-lg">Cybersecurity & VAPT</Link>
                    <Link href="/services/data-business-intelligence" className="block p-2 hover:bg-slate-50 rounded-lg">Data & Power BI</Link>
                    <Link href="/services/digital-marketing-growth" className="block p-2 hover:bg-slate-50 rounded-lg">Digital Marketing & SEO</Link>
                  </div>
                )}
              </div>
            </div>

            <Link href="/#catalog-section" className="text-[#F4B942] hover:underline font-bold">
              Explore All 35+ Services →
            </Link>
          </nav>
        </div>
      </header>

      {/* 3. Hero Section: Split Value Banner + High-Converting Quick Form */}
      <section className="bg-gradient-to-b from-[#073B5C] to-[#052840] text-white py-10 sm:py-16 px-4 sm:px-6 border-b border-cyan-900 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Value Proposition (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#0E7490]/50 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#F4B942]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Govt Recognized Legal-Tech Architecture
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Fast, Certified Compliance & Legal Filing in India
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl">
              Company Incorporation, Trademark protection, GST returns, FSSAI licenses, and AI transformations supervised by empanelled Chartered Accountants, CS, and High Court Advocates.
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#F4B942] text-sm">✓</span>
                <span className="text-slate-200">100% Online Filing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F4B942] text-sm">✓</span>
                <span className="text-slate-200">Zero Hidden Govt Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F4B942] text-sm">✓</span>
                <span className="text-slate-200">Encrypted Vault Delivery</span>
              </div>
            </div>

            {/* Instant Free Verification Tools */}
            <div className="pt-4 border-t border-cyan-900/60">
              <span className="text-[11px] text-cyan-200 font-bold block mb-2.5">
                Free Instant Diagnostic Tools:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/tools/company-name-search"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <span>🏢</span> MCA Name Search
                </Link>
                <Link
                  href="/tools/trademark-search"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <span>™️</span> TM Class Finder
                </Link>
                <Link
                  href="/tools/gst-search"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <span>🧾</span> Verify GSTIN
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: High-Converting Quick Filing / Consultation Widget (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 relative">
              <div className="absolute -top-3 right-6 bg-[#F4B942] text-[#073B5C] text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                ⚡ Instant Consultation Desk
              </div>

              <div className="space-y-1 mb-5">
                <h3 className="text-lg font-black text-[#073B5C]">Quick Filing & Free Quote</h3>
                <p className="text-xs text-slate-500">Get connected with a dedicated CA desk in under 15 minutes.</p>
              </div>

              <form onSubmit={handleQuickFormSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="e.g. Dhaval Sidhpura"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Mobile (+91) *</label>
                    <input
                      type="tel"
                      required
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      placeholder="+91 9920054785"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      placeholder="dhaval@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">Service Needed *</label>
                    <select
                      value={quickService}
                      onChange={(e) => setQuickService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      <option value="private-limited-company">Pvt Ltd Registration</option>
                      <option value="llp-registration">LLP Registration</option>
                      <option value="one-person-company">One Person Company</option>
                      <option value="trademark-registration">Trademark Filing</option>
                      <option value="gst-registration">GST Registration</option>
                      <option value="fssai-food-license">FSSAI Food License</option>
                      <option value="iso-certification">ISO Certification</option>
                      <option value="scale-your-business">Scale Business (AI/Tech)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">State *</label>
                    <select
                      value={quickState}
                      onChange={(e) => setQuickState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      <option value="Maharashtra">Maharashtra (Mumbai)</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Karnataka">Karnataka (Bengaluru)</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmittingQuick ? 'Connecting to Desk...' : 'Start Filing / Get Free Quote →'}
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  🔒 256-Bit Encrypted • No Spam Policy • Assigned to Mumbai CA Desk
                </p>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Trust & Metrics Banner */}
      <section className="bg-white border-b border-slate-200 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <strong className="text-2xl sm:text-3xl font-black text-[#073B5C]">50,000+</strong>
            <p className="text-[11px] text-slate-500 font-medium">Filings Completed</p>
          </div>
          <div>
            <strong className="text-2xl sm:text-3xl font-black text-[#073B5C]">4.9 / 5.0</strong>
            <p className="text-[11px] text-slate-500 font-medium">Google Verified Rating</p>
          </div>
          <div>
            <strong className="text-2xl sm:text-3xl font-black text-[#073B5C]">100% Online</strong>
            <p className="text-[11px] text-slate-500 font-medium">Paperless Execution</p>
          </div>
          <div>
            <strong className="text-2xl sm:text-3xl font-black text-[#073B5C]">CA & Advocate</strong>
            <p className="text-[11px] text-slate-500 font-medium">Direct Desk Supervision</p>
          </div>
        </div>
      </section>

      {/* 5. Main Services Directory (4x2 Desktop & 2x2 Mobile) */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 py-12 w-full flex-grow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#073B5C]">Services Directory</h2>
            <p className="text-xs text-slate-500">Select a vertical or search 35+ specialized statutory offerings.</p>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services (e.g. Trademark, OPC, FSSAI, GST)..."
            className="w-full sm:w-80 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490] shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#073B5C] text-[#F4B942] shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Verticals ({servicesList.length})
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 4x2 Desktop & 2x2 Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#0E7490]/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-xl sm:text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100 group-hover:scale-105 transition-transform">
                    {srv.icon}
                  </span>
                  <span className="bg-[#FFF4D9] text-[#073B5C] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200/60 truncate max-w-[110px]">
                    {srv.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-[#073B5C] text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                    {srv.title}
                  </h3>
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-1 leading-relaxed line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem]">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SLA:</span>
                    <strong className="text-slate-800 truncate">{srv.sla}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Govt Fee:</span>
                    <span className="text-slate-500 truncate max-w-[100px] sm:max-w-[120px] text-right" title={srv.govtFee}>
                      {srv.govtFee}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold block uppercase">
                    Fee
                  </span>
                  <strong className="text-sm sm:text-base font-extrabold text-[#073B5C]">
                    ₹{srv.price.toLocaleString()}
                  </strong>
                </div>

                <Link
                  href={`/services/${srv.slug}`}
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[10px] sm:text-xs px-3 sm:px-4 py-2 rounded-xl uppercase tracking-wider text-center transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  Apply →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 6. Why NyayaLink Comparison Matrix */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider">
              The Modern Legal-Tech Standard
            </span>
            <h3 className="text-2xl font-black text-[#073B5C]">Why Choose NyayaLink vs. Traditional Providers</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[#073B5C]">
                  <th className="py-3 px-4 font-bold">Feature / Capability</th>
                  <th className="py-3 px-4 font-black bg-cyan-50/70 text-[#0E7490] rounded-t-xl">NyayaLink Portal</th>
                  <th className="py-3 px-4 font-semibold text-slate-500">Traditional Offline CA / Lawyer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Filing Execution</td>
                  <td className="py-3 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">100% Digital & Paperless (Zero physical visits)</td>
                  <td className="py-3 px-4 text-slate-500">Requires multiple office visits & physical paperwork</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Pricing Transparency</td>
                  <td className="py-3 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">Upfront fixed pricing + itemized GST invoice</td>
                  <td className="py-3 px-4 text-slate-500">Unpredictable billing & unexpected surprise charges</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Live Status Tracking</td>
                  <td className="py-3 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">Real-time milestone progress tracker & SRN sync</td>
                  <td className="py-3 px-4 text-slate-500">Manual phone follow-ups with uncertain timelines</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Document Security</td>
                  <td className="py-3 px-4 bg-cyan-50/30 font-bold text-[#073B5C]">Lifetime 256-bit encrypted digital vault</td>
                  <td className="py-3 px-4 text-slate-500">Physical paper files prone to loss or misplacement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Step-by-Step Execution Workflow */}
      <section className="bg-[#F0F4F8] border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider">
              Transparent & Simple Workflow
            </span>
            <h3 className="text-2xl font-black text-[#073B5C]">How NyayaLink Executes Your Filing</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-8 h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-sm">1</span>
              <strong className="block text-[#073B5C] text-sm">Digital Intake</strong>
              <p className="text-slate-500">Provide basic identity details and upload documents to your encrypted vault.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-8 h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-sm">2</span>
              <strong className="block text-[#073B5C] text-sm">Expert Scrutiny</strong>
              <p className="text-slate-500">Empanelled CAs and CS inspect paperwork and draft statutory declarations.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-8 h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-sm">3</span>
              <strong className="block text-[#073B5C] text-sm">Govt Submission</strong>
              <p className="text-slate-500">Direct portal filing with MCA V3, GSTN, FoSCoS, or IP India with live SRN tracking.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-8 h-8 bg-[#073B5C] text-[#F4B942] font-black rounded-xl flex items-center justify-center text-sm">4</span>
              <strong className="block text-[#073B5C] text-sm">Vault Delivery</strong>
              <p className="text-slate-500">Receive approved Certificate of Incorporation, GSTIN, or TM acknowledgment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Homepage FAQs */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-[#073B5C]">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Everything you need to know about our legal-tech execution.</p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                q: 'How does NyayaLink guarantee government filing accuracy?',
                a: 'Every filing undergoes a 2-stage verification process: first through automated pre-audit checks, and second through manual scrutiny by certified Chartered Accountants or Advocates before government submission.',
              },
              {
                q: 'Are there any hidden costs after making payment?',
                a: 'No. Our quotations display transparent breakdowns of professional retainers, 18% GST, and statutory government fees upfront.',
              },
              {
                q: 'How do I download my approved government certificates?',
                a: 'Once approved by the respective statutory authority (MCA, GSTN, DGFT, IP India), all certificates, DIN letters, and bylaws are placed directly in your encrypted digital Vault for lifetime access.',
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

      {/* 9. Full Footer */}
      <footer className="bg-[#052840] text-slate-300 text-xs pt-12 pb-8 border-t border-[#0E7490]/40 antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-700/60 pb-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow">
                Nyaya<span className="text-[#F4B942]">Link</span>
              </Link>
              <span className="text-xs text-slate-400">Corporate Legal Tech Portal</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-300">
              <Link href="/tools/company-name-search" className="hover:text-white">MCA Search</Link>
              <Link href="/tools/trademark-search" className="hover:text-white">TM Finder</Link>
              <Link href="/tools/gst-search" className="hover:text-white">GST Lookup</Link>
              <Link href="/dashboard" className="text-[#F4B942] font-bold">Client Login</Link>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-400">
            © 2026 NyayaLink Tech Solutions Private Limited. Charkop, Kandivali West, Mumbai 400067.
          </div>
        </div>
      </footer>

      {/* 10. Sticky Action Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#073B5C] text-white p-2.5 px-4 flex items-center justify-between z-50 border-t border-cyan-800 shadow-2xl">
        <a
          href="tel:+919920054785"
          className="flex items-center gap-1.5 text-xs font-bold text-[#F4B942]"
        >
          <span>📞</span> Call Desk
        </a>
        <a
          href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20need%20assistance"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow"
        >
          💬 WhatsApp
        </a>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-[#F4B942] text-[#073B5C] font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow"
        >
          Quick Quote ↑
        </button>
      </div>
    </div>
  );
}