'use client';

import { useState } from 'react';
import Link from 'next/link';

const MENU_COMPANY_REG = {
  column1: {
    title: 'Incorporation & Setup',
    items: [
      { name: 'Private Limited Company', slug: 'private-limited-company' },
      { name: 'LLP Registration', slug: 'llp-registration' },
      { name: 'One Person Company (OPC)', slug: 'one-person-company' },
      { name: 'Public Limited Company', slug: 'public-limited-company' },
      { name: 'Section 8 Company (NGO)', slug: 'section-8-company' },
      { name: 'Nidhi Company Registration', slug: 'nidhi-company-registration' },
      { name: 'Indian Subsidiary Registration', slug: 'indian-subsidiary-registration' },
      { name: 'Proprietorship / Shop Act Setup', slug: 'proprietorship-setup' },
    ],
  },
  column2: {
    title: 'Governance & Compliance',
    items: [
      { name: 'Annual Corporate Governance', slug: 'corporate-compliance-governance' },
      { name: 'Director DIN e-KYC Update', slug: 'director-din-ekyc' },
      { name: 'Appointment / Removal of Director', slug: 'appointment-removal-director' },
      { name: 'Registered Office Address Change', slug: 'registered-office-change' },
      { name: 'Change Company Name', slug: 'change-company-name' },
      { name: 'Form AOC-4 & MGT-7 Annual Filing', slug: 'form-aoc-4-filing' },
      { name: 'Company / LLP Winding Up', slug: 'company-llp-winding-up' },
    ],
  },
};

const MENU_TRADEMARK = {
  column1: {
    title: 'Trademark & Brand Protection',
    items: [
      { name: 'Trademark Registration', slug: 'trademark-registration' },
      { name: 'Trademark Renewal', slug: 'trademark-renewal' },
      { name: 'Trademark Objection Reply', slug: 'trademark-objection-reply' },
      { name: 'Trademark Opposition', slug: 'trademark-opposition' },
      { name: 'Trademark Assignment', slug: 'trademark-assignment' },
      { name: 'Series & Logo Trademark', slug: 'series-trademark' },
    ],
  },
  column2: {
    title: 'Copyright & IPR Rights',
    items: [
      { name: 'Copyright Registration', slug: 'copyright-registration' },
      { name: 'Patent Filing Assistance', slug: 'patent-filing' },
    ],
  },
};

const MENU_TAX_GST = {
  column1: {
    title: 'GST & Business Taxation',
    items: [
      { name: 'GST Registration (New GSTIN)', slug: 'gst-registration' },
      { name: 'Monthly / Quarterly GST Return', slug: 'gst-return-filing' },
      { name: 'GST Nil Return Filing', slug: 'gst-nil-return' },
      { name: 'GSTR-9 Annual Return', slug: 'gstr-9-annual-return' },
      { name: 'GST LUT Filing for Exporters', slug: 'gst-lut-filing' },
    ],
  },
  column2: {
    title: 'TDS & Direct Taxation',
    items: [
      { name: 'TDS Quarterly Return (26Q/24Q)', slug: 'tds-tcs-return' },
      { name: 'Income Tax Return (ITR-1 to 7)', slug: 'income-tax-return' },
      { name: 'Tax Planning & Advisory', slug: 'tax-planning' },
      { name: 'Project Report for Bank Loans', slug: 'project-report' },
    ],
  },
};

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-nyaya-navy text-slate-300 text-xs py-2 px-4 border-b border-slate-700/50 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <a href="tel:+918068929400" className="flex items-center gap-1.5 hover:text-nyaya-gold transition-colors">
              📞 <strong className="text-white">+91 8068929400</strong> (Mon-Sat 9AM-7PM)
            </a>
            <a href="mailto:info@nyayalink.com" className="hidden sm:flex items-center gap-1.5 hover:text-nyaya-gold transition-colors">
              ✉️ info@nyayalink.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Already registered?</span>
            <Link
              href="/login"
              className="bg-nyaya-gold hover:bg-amber-500 text-nyaya-navy font-bold px-3 py-1 rounded transition-colors text-xs shadow-sm"
            >
              Client Login
            </Link>
            <Link
              href="/admin/orders"
              className="text-slate-400 hover:text-white underline font-medium text-xs"
            >
              Operations Console
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header & Branding */}
      <header className="bg-nyaya-navy text-white sticky top-0 z-40 shadow-lg border-b border-nyaya-teal/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 relative">
          
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-nyaya-teal text-white font-extrabold text-2xl px-3.5 py-1 rounded-xl font-mono tracking-wider shadow border border-cyan-500/30 flex items-center gap-1">
              <span>Nyaya</span>
              <span className="text-nyaya-gold">Link</span>
            </div>
            <div className="hidden lg:block border-l border-slate-700 pl-3">
              <span className="block text-xs font-bold leading-none uppercase tracking-wider text-white">
                Nyaya<span className="text-nyaya-gold">Link</span>
              </span>
              <span className="block text-[10px] text-nyaya-gold font-semibold tracking-wide mt-0.5">
                Your Link to Justice
              </span>
            </div>
          </Link>

          {/* Navigation Links with Mega Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-200">
            
            {/* Company Registration Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('company')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 hover:bg-nyaya-teal/40 hover:text-nyaya-gold rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                Company Registration ▾
              </button>

              {activeDropdown === 'company' && (
                <div className="absolute top-full -left-4 w-[680px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-2 gap-6 z-50 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>💼</span> {MENU_COMPANY_REG.column1.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_COMPANY_REG.column1.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>🏛️</span> {MENU_COMPANY_REG.column2.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_COMPANY_REG.column2.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Trademark Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('trademark')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 hover:bg-nyaya-teal/40 hover:text-nyaya-gold rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                Trademark & IPR ▾
              </button>

              {activeDropdown === 'trademark' && (
                <div className="absolute top-full -left-10 w-[550px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-2 gap-6 z-50 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>™️</span> {MENU_TRADEMARK.column1.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_TRADEMARK.column1.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>©️</span> {MENU_TRADEMARK.column2.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_TRADEMARK.column2.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Tax & GST Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('tax')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 hover:bg-nyaya-teal/40 hover:text-nyaya-gold rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                Tax & Compliance ▾
              </button>

              {activeDropdown === 'tax' && (
                <div className="absolute top-full -left-20 w-[580px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-2 gap-6 z-50 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>📊</span> {MENU_TAX_GST.column1.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_TAX_GST.column1.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-nyaya-teal font-extrabold text-xs uppercase mb-3 border-b border-slate-100 pb-1.5">
                      <span>📑</span> {MENU_TAX_GST.column2.title}
                    </div>
                    <ul className="space-y-2 text-xs font-medium text-slate-700">
                      {MENU_TAX_GST.column2.items.map((item, idx) => (
                        <li key={idx}>
                          <Link href={`/services/${item.slug}`} className="hover:text-nyaya-teal block transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#catalog-section"
              className="px-3 py-2 hover:bg-nyaya-teal/40 hover:text-nyaya-gold rounded-lg transition-all"
            >
              All 55 Services
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl text-white transition hover:bg-nyaya-teal/40 focus:outline-none focus:ring-2 focus:ring-nyaya-gold"
            >
              {mobileOpen ? '×' : '☰'}
            </button>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex bg-nyaya-gold hover:bg-amber-500 text-nyaya-navy font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-colors uppercase tracking-wider"
            >
              My Dashboard
            </Link>
          </div>

        {/* Compact mobile navigation */}
        {mobileOpen && (
          <div id="mobile-navigation" className="md:hidden border-t border-white/10 bg-[#052840] px-4 pb-4 pt-3 shadow-xl">
            <nav aria-label="Mobile navigation" className="grid gap-2 text-sm font-semibold">
              <Link onClick={() => setMobileOpen(false)} href="/#catalog-section" className="rounded-xl px-4 py-3 text-white transition hover:bg-nyaya-teal/40">
                Explore services
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/services/private-limited-company" className="rounded-xl px-4 py-3 text-white transition hover:bg-nyaya-teal/40">
                Company registration
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/services/gst-registration" className="rounded-xl px-4 py-3 text-white transition hover:bg-nyaya-teal/40">
                GST and tax
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/services/trademark-registration" className="rounded-xl px-4 py-3 text-white transition hover:bg-nyaya-teal/40">
                Trademark and IP
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/login" className="rounded-xl border border-nyaya-gold/50 px-4 py-3 text-nyaya-gold transition hover:bg-nyaya-gold/10">
                Client login
              </Link>
              <a href="tel:+918068929400" className="rounded-xl bg-nyaya-gold px-4 py-3 text-center font-extrabold text-nyaya-navy transition hover:bg-amber-500">
                Call the support desk
              </a>
            </nav>
          </div>
        )}
        </div>
      </header>
    </>
  );
}