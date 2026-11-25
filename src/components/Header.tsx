'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';

interface NavLinkItem {
  name: string;
  slug?: string;
  href?: string;
}

interface NavDropdownColumn {
  title: string;
  icon: string;
  items: NavLinkItem[];
}

interface NavMenu {
  id: string;
  label: string;
  alignRight?: boolean;
  columns: [NavDropdownColumn, NavDropdownColumn];
}

const resolveMenuHref = (item: NavLinkItem) => item.href || `/services/${item.slug}`;

const NAV_MENUS: NavMenu[] = [
  {
    id: 'company',
    label: 'Business Setup',
    columns: [
      {
        title: 'Incorporation & Entities',
        icon: '🏢',
        items: [
          { name: 'Private Limited Company', slug: 'private-limited-company' },
          { name: 'LLP Registration', slug: 'llp-registration' },
          { name: 'One Person Company (OPC)', slug: 'one-person-company' },
          { name: 'Public Limited Company', slug: 'public-limited-company' },
          { name: 'Section 8 Company (NGO)', slug: 'section-8-company' },
          { name: 'Indian Subsidiary (FDI)', slug: 'indian-subsidiary-registration' },
          { name: 'US Delaware C-Corp', slug: 'us-delaware-company-registration' },
          { name: 'Proprietorship / Shop Setup', slug: 'business-registration-license' },
        ],
      },
      {
        title: 'Licenses & Governance',
        icon: '📜',
        items: [
          { name: 'FSSAI Food License', slug: 'fssai-food-license' },
          { name: 'Shop & Establishment (Gumasta)', slug: 'shop-and-establishment-license' },
          { name: 'Import Export Code (IEC)', slug: 'import-export-code-iec' },
          { name: 'Startup India DPIIT Recognition', slug: 'startup-india-dpiit-recognition' },
          { name: 'MSME Udyam Registration', slug: 'msme-udyam-registration' },
          { name: 'Director DIR-3 KYC Filing', slug: 'dir-3-kyc-director-filing' },
          { name: 'MCA Form INC-20A Commencement', slug: 'mca-inc-20a-commencement-of-business' },
          { name: 'Bundled Founder Packages →', href: '/packages' },
        ],
      },
    ],
  },
  {
    id: 'tax',
    label: 'Tax & GST',
    columns: [
      {
        title: 'GST Filings & Registrations',
        icon: '🧾',
        items: [
          { name: 'GST Registration (New GSTIN)', slug: 'gst-registration' },
          { name: 'GST Return Filing (GSTR-1 & 3B)', slug: 'gst-return-filing' },
          { name: 'GST Nil Return Filing', slug: 'gst-nil-return-filing' },
          { name: 'GSTR-9 Annual Return', slug: 'gstr-9-annual-filing' },
          { name: 'GST LUT Filing for Exporters', slug: 'gst-lut-filing' },
          { name: 'GST Modification / Amendment', slug: 'gst-modification' },
        ],
      },
      {
        title: 'Direct Tax & Accounting',
        icon: '📊',
        items: [
          { name: 'Income Tax Return (ITR 1–6)', slug: 'income-tax-return-itr' },
          { name: 'TDS Quarterly Return (24Q/26Q)', slug: 'tds-return-filing' },
          { name: 'Online Bookkeeping & Retainer', slug: 'online-bookkeeping' },
          { name: 'Virtual CFO (vCFO) Advisory', slug: 'virtual-cfo-services' },
          { name: 'PF & ESIC Registration', slug: 'pf-esic-registration' },
        ],
      },
    ],
  },
  {
    id: 'trademark',
    label: 'Trademark & Legal',
    columns: [
      {
        title: 'Trademark & IPR',
        icon: '™️',
        items: [
          { name: 'Trademark Registration', slug: 'trademark-registration' },
          { name: 'Trademark Objection Reply', slug: 'trademark-objection-reply' },
          { name: 'Trademark Hearing Representation', slug: 'trademark-hearing-representation' },
          { name: 'Trademark Renewal', slug: 'trademark-renewal' },
          { name: 'Trademark Opposition', slug: 'trademark-opposition' },
          { name: 'Copyright Registration', slug: 'copyright-registration' },
        ],
      },
      {
        title: 'Notices & Disputes (ODR)',
        icon: '⚖️',
        items: [
          { name: 'Consumer Complaint Notice', slug: 'consumer-complaint-notice' },
          { name: 'Formal Legal Demand Notice', slug: 'legal-demand-notice' },
          { name: 'Section 138 Cheque Bounce Notice', slug: 'cheque-bounce-notice-138' },
          { name: 'Consumer Forum Petition (e-Daakhil)', slug: 'consumer-court-petition' },
          { name: 'Consult an Advocate (वकील Search) →', href: '/vakil' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Free Tools',
    alignRight: true,
    columns: [
      {
        title: 'Calculators & Generators',
        icon: '🧮',
        items: [
          { name: 'Incorporation Cost Calculator', href: '/tools/incorporation-calculator' },
          { name: 'Startup India 80-IAC Checker', href: '/tools/startup-india-checker' },
          { name: 'Legal Agreement Generator', href: '/tools/agreement-generator' },
          { name: 'All 7 Free Tools Hub →', href: '/tools' },
        ],
      },
      {
        title: 'Search & Verification',
        icon: '🔍',
        items: [
          { name: 'MCA Company Name Check', href: '/tools/company-name-search' },
          { name: 'Trademark Class & Brand Check', href: '/tools/trademark-search' },
          { name: 'GSTIN Format Decoder', href: '/tools/gst-search' },
          { name: 'Track Filing / SRN Status', href: '/tools/track-status' },
        ],
      },
    ],
  },
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
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
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const toggleMobileSection = (sec: string) => {
    setOpenMobileSection(openMobileSection === sec ? null : sec);
  };

  return (
    <>
      {/* Slim Utility Bar (Desktop & Tablet) */}
      <div className="hidden sm:block bg-[#052A42] text-slate-300 text-xs py-1.5 px-4 border-b border-slate-700/50 relative z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-5">
            <a href={`tel:${BRAND.phoneTel}`} className="hover:text-[#F4B942] transition-colors">
              📞 <strong className="text-white">{BRAND.phone}</strong> <span className="hidden md:inline text-slate-400">(Mon–Sat 9AM–7PM)</span>
            </a>
            <a href={`mailto:${BRAND.supportEmail}`} className="hidden md:inline hover:text-[#F4B942] transition-colors">
              ✉️ {BRAND.supportEmail}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tools/track-status" className="hover:text-[#F4B942] transition-colors">
              Track Filing
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/ca/dashboard" className="hover:text-[#F4B942] transition-colors">
              CA Portal
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/lawyer/join" className="hover:text-white transition-colors">
              Advocates
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="bg-[#073B5C] text-white sticky top-0 z-40 shadow-md border-b border-[#0E7490]/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-[#0E7490] text-white font-extrabold text-xl px-3.5 py-1 rounded-xl font-mono tracking-wider shadow-sm border border-cyan-400/30 flex items-center gap-0.5">
              <span>Nyaya</span>
              <span className="text-[#F4B942]">Link</span>
            </div>
            <span className="hidden xl:inline text-xs text-cyan-200/90 font-medium border-l border-slate-600 pl-2.5">
              {BRAND.tagline}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav ref={navRef} aria-label="Main navigation" className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-100">
            {NAV_MENUS.map((menu) => {
              const isOpen = activeDropdown === menu.id;
              return (
                <div
                  key={menu.id}
                  className="relative py-1"
                  onMouseEnter={() => setActiveDropdown(menu.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveDropdown(isOpen ? null : menu.id)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      isOpen ? 'bg-[#0E7490]/50 text-[#F4B942]' : 'hover:bg-[#0E7490]/40 hover:text-[#F4B942]'
                    }`}
                  >
                    <span>{menu.label}</span>
                    <span className="text-[11px] opacity-75">▾</span>
                  </button>

                  {isOpen && (
                    <div
                      className={`absolute top-full ${
                        menu.alignRight ? 'right-0' : 'left-0'
                      } w-[560px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-5 grid grid-cols-2 gap-6 z-50 animate-fadeIn`}
                    >
                      {menu.columns.map((col, cIdx) => (
                        <div key={cIdx}>
                          <div className="flex items-center gap-2 text-[#0E7490] font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                            <span>{col.icon}</span>
                            <span>{col.title}</span>
                          </div>
                          <ul className="space-y-2 text-xs font-medium text-slate-700">
                            {col.items.map((item, idx) => (
                              <li key={idx}>
                                <Link
                                  href={resolveMenuHref(item)}
                                  onClick={() => setActiveDropdown(null)}
                                  className="hover:text-[#0E7490] hover:underline block py-0.5 transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/packages" className="px-3 py-2 hover:bg-[#0E7490]/40 hover:text-[#F4B942] rounded-lg transition-colors whitespace-nowrap">
              Bundles
            </Link>
            <Link href="/vakil" className="px-3 py-2 hover:bg-[#0E7490]/40 hover:text-[#F4B942] rounded-lg transition-colors whitespace-nowrap">
              वकील Search
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#F4B942] text-white hover:text-[#F4B942] font-bold text-xs px-3 py-2 rounded-xl transition"
            >
              <span>Log In</span>
            </Link>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <span>Client Vault</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[#0E7490] text-white flex items-center justify-center font-bold text-base hover:bg-[#0E7490]/80 transition cursor-pointer"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#073B5C] border-t border-slate-700/80 px-4 py-5 max-h-[82vh] overflow-y-auto space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2.5 pb-3 border-b border-slate-700/60">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#F4B942] text-[#073B5C] font-black text-center py-2.5 px-3 rounded-xl text-xs"
              >
                Client Login
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-center py-2.5 px-3 rounded-xl text-xs"
              >
                Client Vault
              </Link>
            </div>

            {NAV_MENUS.map((menu) => (
              <div key={menu.id} className="border-b border-slate-700/60 pb-3">
                <button
                  type="button"
                  onClick={() => toggleMobileSection(menu.id)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-100 py-1.5 cursor-pointer"
                  aria-expanded={openMobileSection === menu.id}
                >
                  <span>{menu.label}</span>
                  <span className="text-xs text-[#F4B942]">{openMobileSection === menu.id ? '▲' : '▼'}</span>
                </button>

                {openMobileSection === menu.id && (
                  <div className="pt-2 pl-2 space-y-3 text-xs text-slate-200">
                    {menu.columns.map((col, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <span className="block text-[11px] font-bold uppercase text-[#F4B942] tracking-wider">
                          {col.title}
                        </span>
                        {col.items.map((item, i) => (
                          <Link
                            key={i}
                            href={resolveMenuHref(item)}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-[#F4B942]"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="space-y-2 pt-1 text-sm font-bold">
              <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="block text-[#F4B942] py-1">
                📦 Bundled Founder Packages
              </Link>
              <Link href="/vakil" onClick={() => setMobileMenuOpen(false)} className="block text-emerald-300 py-1">
                ⚖️ वकील Search (Verified Advocates)
              </Link>
              <Link href="/#catalog-section" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 py-1">
                📋 Browse All Services
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-700/60 space-y-1.5 text-slate-300 text-xs">
              <div>
                📞 Helpline: <a href={`tel:${BRAND.phoneTel}`} className="text-white font-bold">{BRAND.phone}</a>
              </div>
              <div>
                ✉️ Email: <a href={`mailto:${BRAND.supportEmail}`} className="text-white">{BRAND.supportEmail}</a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
