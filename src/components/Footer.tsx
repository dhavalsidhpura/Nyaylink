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
        { label: 'Section 8 Company (NGO)', href: '/services/section-8-company' },
        { label: 'Startup India DPIIT Recognition', href: '/services/startup-india-dpiit-recognition' },
        { label: 'US Delaware C-Corp (YC)', href: '/services/us-delaware-company-registration' },
      ],
    },
    {
      id: 'lic',
      title: 'Licenses & IPR',
      links: [
        { label: 'FSSAI Food License', href: '/services/fssai-food-license' },
        { label: 'IEC [Import/Export Code]', href: '/services/import-export-code-iec' },
        { label: 'MSME / Udyam Registration', href: '/services/msme-udyam-registration' },
        { label: 'Shop & Establishment Act', href: '/services/shop-and-establishment-license' },
        { label: 'Trademark Registration (™ / ®)', href: '/services/trademark-registration' },
        { label: 'Copyright Registration', href: '/services/copyright-registration' },
      ],
    },
    {
      id: 'tax',
      title: 'Tax, GST & Legal',
      links: [
        { label: 'GST Registration', href: '/services/gst-registration' },
        { label: 'GST Return Filing (GSTR-1 & 3B)', href: '/services/gst-return-filing' },
        { label: 'GST LUT for Exporters', href: '/services/gst-lut-filing' },
        { label: 'Income Tax Return (ITR)', href: '/services/income-tax-return-itr' },
        { label: 'Online Bookkeeping Retainer', href: '/services/online-bookkeeping' },
        { label: 'Legal Demand & Consumer Notice', href: '/services/legal-demand-notice' },
      ],
    },
    {
      id: 'tools',
      title: 'Tools & Portals',
      links: [
        { label: 'Incorporation Cost Calculator', href: '/tools/incorporation-calculator' },
        { label: 'Legal Agreement Generator', href: '/tools/agreement-generator' },
        { label: 'All 7 Free Founder Tools', href: '/tools' },
        { label: 'वकील Advocate Directory', href: '/vakil' },
        { label: 'Frequently Asked Questions', href: '/faq' },
        { label: 'Client Vault & Tracking', href: '/dashboard' },
      ],
    },
  ];

  return (
    <footer className="bg-[#052A42] text-slate-300 text-xs border-t border-[#0E7490]/30 font-sans mt-auto">
      {/* Mobile Collapsible Accordions */}
      <div className="md:hidden px-4 py-6 border-b border-slate-700/60 space-y-2">
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
                <ul className="px-3.5 pb-3 pt-1 space-y-2 border-t border-slate-700/40 text-xs bg-[#041E30]/60">
                  {cat.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.href} className="text-slate-300 hover:text-[#F4B942] transition-colors block py-0.5">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop 4-Column Services & Brand Grid */}
      <div className="hidden md:grid max-w-7xl mx-auto px-4 py-10 md:grid-cols-4 gap-8 border-b border-slate-700/60">
        {FOOTER_CATEGORIES.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-xs border-b border-slate-700 pb-2">
              {cat.title}
            </h4>
            <ul className="space-y-2 text-slate-300 font-medium text-xs">
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

      {/* Contact & Regulatory Notice */}
      <div className="max-w-7xl mx-auto px-4 py-5 border-b border-slate-700/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            <strong className="text-[#F4B942]">{BRAND.name}</strong> · {BRAND.address}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href={`tel:${BRAND.phoneTel}`} className="text-[#F4B942] hover:underline font-bold">
              📞 {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-[#F4B942]">
              ✉️ {BRAND.supportEmail}
            </a>
            <a href={`mailto:${BRAND.grievanceEmail}`} className="hover:text-[#F4B942]">
              Grievance: {BRAND.grievanceEmail}
            </a>
          </div>
        </div>

        <div className="text-slate-400 text-xs leading-relaxed border-t border-slate-700/40 pt-3">
          <div className="flex items-center justify-between">
            <strong className="text-[#F4B942] uppercase tracking-wider text-[11px]">
              Statutory &amp; Bar Council Regulatory Notice
            </strong>
            <button
              type="button"
              onClick={() => setShowLegalNotice(!showLegalNotice)}
              className="md:hidden text-cyan-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              {showLegalNotice ? 'Collapse ▲' : 'Read Notice ▼'}
            </button>
          </div>
          <p className={`mt-1.5 ${showLegalNotice ? 'block' : 'hidden md:block'}`}>
            NyayaLink is an independent corporate compliance and legal-technology platform—not a law firm. Pursuant to Bar Council of India Rules (Rule 36) and the Advocates Act, 1961, empanelled Advocates and Chartered Accountants practice independently. All government fees, ROC stamp duties, and statutory challans are pass-through disbursements collected as a pure agent (Rule 33 CGST Rules).
          </p>
        </div>
      </div>

      {/* Bottom Policy Bar */}
      <div className="bg-[#031c2d] py-3.5 pb-20 md:pb-4 px-4 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}. {BRAND.city} {BRAND.pincode}.</p>
          <div className="flex items-center gap-3 font-semibold text-slate-300 flex-wrap justify-center">
            <Link href="/packages" className="text-[#F4B942] hover:underline font-bold">Bundles</Link>
            <span>•</span>
            <Link href="/faq" className="text-cyan-300 hover:underline font-bold">FAQs</Link>
            <span>•</span>
            <Link href="/ca/dashboard" className="hover:text-[#F4B942] transition-colors">CA Portal</Link>
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
