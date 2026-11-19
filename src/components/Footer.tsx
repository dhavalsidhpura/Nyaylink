'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const [openMobileCat, setOpenMobileCat] = useState<string | null>(null);
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  // Suppress public consumer footer on back-office, partner, and administrative workspaces
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/ca') ||
    pathname?.startsWith('/lawyer/dashboard') ||
    pathname?.startsWith('/unauthorized')
  ) {
    return null;
  }

  const FOOTER_CATEGORIES = [
    {
      id: 'reg',
      title: 'Business Registration',
      links: [
        { label: 'Private Limited Company', href: '/services/private-limited-company' },
        { label: 'Limited Liability Partnership', href: '/services/llp-registration' },
        { label: 'One Person Company (OPC)', href: '/services/one-person-company' },
        { label: 'Public Limited Company', href: '/services/public-limited-company' },
        { label: 'Section 8 Company (NGO)', href: '/services/section-8-company' },
        { label: 'Startup India DPIIT Recognition', href: '/services/startup-india-dpiit-recognition' },
        { label: 'US Delaware C-Corp (YC)', href: '/services/us-delaware-company-registration' },
      ],
    },
    {
      id: 'lic',
      title: 'Licenses & Permits',
      links: [
        { label: 'FSSAI Food License', href: '/services/fssai-food-license' },
        { label: 'FSSAI Renewal', href: '/services/fssai-renewal' },
        { label: 'IEC [Import/Export Code]', href: '/services/import-export-code-iec' },
        { label: 'ISO Certification', href: '/services/iso-certification' },
        { label: 'MSME / Udyam Registration', href: '/services/msme-udyam-registration' },
        { label: 'Shop & Establishment Act', href: '/services/shop-and-establishment-license' },
      ],
    },
    {
      id: 'tm',
      title: 'Trademark & IPR',
      links: [
        { label: 'TM Registration (™ / ®)', href: '/services/trademark-registration' },
        { label: 'TM Objection Reply', href: '/services/trademark-objection' },
        { label: 'TM Hearing Representation', href: '/services/trademark-hearing-representation' },
        { label: 'Copyright Registration', href: '/services/copyright-registration' },
        { label: 'Patent Search & Filing', href: '/services/patent-filing-india' },
      ],
    },
    {
      id: 'tax',
      title: 'GST & Tax Filings',
      links: [
        { label: 'GST Registration', href: '/services/gst-registration' },
        { label: 'Monthly GST Return Filing', href: '/services/monthly-gst-return-filing' },
        { label: 'GST LUT for Export', href: '/services/gst-lut-filing' },
        { label: 'Corporate IT Return (ITR-6)', href: '/services/income-tax-return-itr-filing' },
        { label: 'Bookkeeping & Retainer', href: '/services/accounting-bookkeeping-service' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal Drafting & Disputes',
      links: [
        { label: 'Founders Agreement', href: '/services/founders-agreement-drafting' },
        { label: 'Commercial Contract / SLA', href: '/services/business-contract-drafting' },
        { label: 'Advocate Demand Notice', href: '/services/legal-notice-demand-recovery' },
        { label: 'Consumer Complaint Notice', href: '/services/consumer-complaint-notice' },
        { label: 'NDAs & Tech Agreements', href: '/services/website-terms-privacy-policy' },
      ],
    },
    {
      id: 'tools',
      title: 'Tools & Portals',
      links: [
        { label: 'MCA Company Name Search', href: '/tools/company-name-search' },
        { label: 'Trademark IP Search', href: '/tools/trademark-search' },
        { label: 'GSTIN Live Status Verify', href: '/tools/gst-search' },
        { label: 'Startup India Eligibility', href: '/tools/startup-india-checker' },
        { label: 'Frequently Asked Questions', href: '/faq' },
        { label: 'CA & Expert Partner Portal', href: '/ca/dashboard' },
        { label: 'My Documents Vault', href: '/dashboard' },
      ],
    },
  ];

  return (
    <footer className="bg-[#052A42] text-slate-300 text-xs border-t border-[#0E7490]/30 font-sans mt-auto">
      {/* 1. MOBILE COLLAPSIBLE LINK ACCORDIONS (MD:HIDDEN) */}
      <div className="md:hidden px-4 py-6 border-b border-slate-700/60 space-y-3">
        {/* Quick Popular Chips */}
        <div className="space-y-2 pb-2 border-b border-slate-700/40">
          <span className="text-[10px] font-black uppercase text-[#F4B942] tracking-wider block">
            Popular Shortcuts:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/services/private-limited-company"
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-slate-700 text-slate-200 text-[11px] font-medium"
            >
              🏢 Pvt Ltd
            </Link>
            <Link
              href="/services/trademark-registration"
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-slate-700 text-slate-200 text-[11px] font-medium"
            >
              ™️ Trademark
            </Link>
            <Link
              href="/services/gst-registration"
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-slate-700 text-slate-200 text-[11px] font-medium"
            >
              🧾 GST
            </Link>
            <Link
              href="/packages"
              className="px-2.5 py-1 bg-[#F4B942]/10 hover:bg-[#F4B942]/20 rounded-lg border border-[#F4B942]/30 text-[#F4B942] text-[11px] font-bold"
            >
              📦 Bundles
            </Link>
            <Link
              href="/faq"
              className="px-2.5 py-1 bg-cyan-900/30 hover:bg-cyan-900/50 rounded-lg border border-cyan-700/30 text-cyan-300 text-[11px] font-bold"
            >
              📖 FAQs
            </Link>
          </div>
        </div>

        {/* Collapsible Category Menus */}
        <div className="space-y-1.5 pt-1">
          {FOOTER_CATEGORIES.map((cat) => {
            const isOpen = openMobileCat === cat.id;
            return (
              <div key={cat.id} className="border border-slate-700/60 rounded-xl overflow-hidden bg-[#073B5C]/40">
                <button
                  type="button"
                  onClick={() => setOpenMobileCat(isOpen ? null : cat.id)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-slate-200 text-xs hover:bg-white/5 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-[#F4B942]">{cat.title}</span>
                  <span className="text-slate-400 font-mono text-sm">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <ul className="px-3.5 pb-3 pt-1 space-y-2 border-t border-slate-700/40 text-[11px] bg-[#041E30]/60">
                    {cat.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link href={link.href} className="text-slate-300 hover:text-[#F4B942] transition-colors block py-0.5">
                          • {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. DESKTOP FULL SERVICES LINK GRID (HIDDEN ON MOBILE) */}
      <div className="hidden md:grid max-w-7xl mx-auto px-4 py-12 md:grid-cols-3 lg:grid-cols-6 gap-8 border-b border-slate-700/60">
        {FOOTER_CATEGORIES.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
              {cat.title}
            </h4>
            <ul className="space-y-2 text-slate-300 font-medium">
              {cat.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link href={link.href} className="hover:text-[#F4B942] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 2. CORPORATE LOCATION, CONTACT & SUPPORT */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-700/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Corporate Head Office */}
          <div className="space-y-1.5 bg-[#073B5C] p-3.5 rounded-xl border border-slate-700">
            <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">
              Corporate Head Office
            </h5>
            <p className="text-slate-300 font-medium text-[11px]">
              📍 {BRAND.address}
            </p>
            <div className="flex items-center gap-4 text-[11px] pt-1">
              <a href={`tel:${BRAND.phoneTel}`} className="text-[#F4B942] hover:underline font-bold">
                📞 {BRAND.phone}
              </a>
              <span className="text-slate-500">|</span>
              <a href={`mailto:${BRAND.supportEmail}`} className="text-[#F4B942] hover:underline">
                ✉️ {BRAND.supportEmail}
              </a>
            </div>
          </div>

          {/* Grievance Cell */}
          <div className="space-y-1.5 bg-[#073B5C] p-3.5 rounded-xl border border-slate-700">
            <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">
              Grievance Redressal
            </h5>
            <p className="text-slate-300 text-[11px] leading-snug">
              Statutory escalations or filing feedback:
            </p>
            <a href={`mailto:${BRAND.grievanceEmail}`} className="text-[#F4B942] font-bold hover:underline text-[11px] block pt-0.5">
              ✉️ {BRAND.grievanceEmail}
            </a>
          </div>

          {/* Quick Access */}
          <div className="space-y-1.5 bg-[#073B5C] p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">
                Instant Portal Access
              </h5>
              <p className="text-slate-300 text-[11px] leading-snug">
                Track live CA filings in your 256-bit encrypted Vault.
              </p>
            </div>
            <div className="flex gap-2 pt-1.5">
              <Link href="/login" className="bg-[#0E7490] hover:bg-cyan-800 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors">
                Client Login
              </Link>
              <Link href="/ca/dashboard" className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-extrabold px-3 py-1 rounded-lg text-xs transition-colors">
                CA Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LEGAL & REGULATORY COMPLIANCE DISCLAIMER (COLLAPSIBLE ON MOBILE) */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-slate-700/60 text-slate-400 text-[11px] leading-relaxed">
        <div className="flex items-center justify-between">
          <strong className="text-[#F4B942] uppercase tracking-wider text-[10px]">
            Statutory &amp; Bar Council Regulatory Notice:
          </strong>
          <button
            type="button"
            onClick={() => setShowLegalNotice(!showLegalNotice)}
            className="md:hidden text-cyan-300 hover:text-white text-[10px] font-bold cursor-pointer"
          >
            {showLegalNotice ? 'Collapse ▲' : 'Read Full Notice ▼'}
          </button>
        </div>
        <p className={`mt-1.5 ${showLegalNotice ? 'block' : 'hidden md:block'}`}>
          NyayaLink is an independent corporate compliance and legal-technology platform. NyayaLink is not a law firm and does not solicit legal work. Pursuant to the Bar Council of India Rules (Rule 36) and the Advocates Act, 1961, empanelled Advocates and Chartered Accountants listed on this platform practice independently and exercise independent professional discretion. All government fees, ROC stamp duties, and statutory filing challans are pass-through disbursements collected strictly as a pure agent (Rule 33 CGST Rules).
        </p>
      </div>

      {/* 4. COPYRIGHT & MANDATORY POLICIES BAR */}
      <div className="bg-[#031c2d] py-3.5 pb-20 md:pb-4 px-4 text-center text-slate-400 text-[11px] border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}. All Rights Reserved. {BRAND.city} {BRAND.pincode}.</p>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 flex-wrap justify-center">
            <Link href="/packages" className="text-[#F4B942] hover:underline font-bold">Founder Bundles</Link>
            <span>•</span>
            <Link href="/faq" className="text-cyan-300 hover:underline font-bold">FAQs</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#F4B942] transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#F4B942] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-[#F4B942] transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
