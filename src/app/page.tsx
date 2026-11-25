'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { MASTER_SERVICES } from '@/data/services';
import Header from '@/components/Header';
import HeroCommandCenter from '@/components/home/HeroCommandCenter';
import FounderPlaybooks from '@/components/home/FounderPlaybooks';
import EntityMatchmakerWizard from '@/components/home/EntityMatchmakerWizard';
import ServicesCatalog from '@/components/home/ServicesCatalog';
import FounderReviewsCarousel from '@/components/home/FounderReviewsCarousel';

export default function HomePage() {
  const [heroSearch, setHeroSearch] = useState('');
  const [isHeroSearchOpen, setIsHeroSearchOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [servicesList, setServicesList] = useState<typeof MASTER_SERVICES>(MASTER_SERVICES || []);

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
          // keep bundled catalog fallback
        }
      });

    return () => controller.abort();
  }, []);

  const heroSearchMatches = useMemo(() => {
    if (!heroSearch.trim()) return [];
    const q = heroSearch.toLowerCase().trim();
    return servicesList
      .filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.slug.includes(q))
      .slice(0, 6);
  }, [heroSearch, servicesList]);

  const popularPills = useMemo(() => {
    const slugs = [
      { slug: 'private-limited-company', label: 'Pvt Ltd Company', icon: '🏢' },
      { slug: 'gst-registration', label: 'GST Registration', icon: '🧾' },
      { slug: 'trademark-registration', label: 'Trademark Filing', icon: '™️' },
      { slug: 'llp-registration', label: 'LLP Registration', icon: '🤝' },
    ];
    return slugs.map((p) => {
      const match = servicesList.find((s) => s.slug === p.slug);
      return {
        label: `${p.icon} ${p.label} (₹${(match?.price ?? 0).toLocaleString('en-IN')})`,
        href: `/services/${p.slug}`,
      };
    });
  }, [servicesList]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-20 lg:pb-0 overflow-x-hidden w-full max-w-[100vw]">
      <Header />

      {/* 1. FOCUSED HERO */}
      <section className="bg-gradient-to-b from-[#073B5C] via-[#09476F] to-[#0E7490] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-[#0E7490]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F4B942]">
              <span>Pure Agent Rule 33 · Zero-Markup Stamp Duty</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Transparent Business Registration &amp; Legal Compliance
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              Incorporate, register trademarks, and file taxes directly with practicing CAs and Bar Council advocates. Start any filing with a ₹999 advance token and zero sales pressure.
            </p>

            {/* Omnisearch */}
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
                  placeholder="Search a service (e.g. Pvt Ltd, GST, Trademark, FSSAI)..."
                  aria-label="Search legal and compliance services"
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-sm pl-11 pr-28 py-4 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/40 border border-slate-200"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#073B5C] text-[#F4B942] text-xs font-bold px-2.5 py-1 rounded-xl">
                  {servicesList.length} Services
                </span>
              </div>

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
                          <strong className="block text-xs font-bold text-[#073B5C] truncate">{s.title}</strong>
                          <span className="text-xs text-slate-500">{s.sla}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-700 shrink-0">₹{s.price.toLocaleString('en-IN')}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Quick Links */}
            <div className="flex flex-wrap gap-2 text-xs">
              {popularPills.map((pill, i) => (
                <Link
                  key={i}
                  href={pill.href}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-xl border border-white/15 transition"
                >
                  {pill.label}
                </Link>
              ))}
            </div>

            {/* Primary Entry Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                Not sure which entity? Take 60-Sec Advisor →
              </button>
              <Link
                href="/packages"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/20 transition"
              >
                Compare Bundles &amp; Entity Tiers
              </Link>
            </div>
          </div>

          <HeroCommandCenter servicesList={servicesList} />
        </div>
      </section>

      {/* 2. CONSOLIDATED TRUST & 4-STEP FILING STRIP */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <strong className="block text-xl sm:text-2xl font-black text-[#073B5C]">1,200+</strong>
              <span className="text-xs text-slate-600 font-medium">Businesses &amp; Startups Advised</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <strong className="block text-xl sm:text-2xl font-black text-[#073B5C]">₹999 Token</strong>
              <span className="text-xs text-slate-600 font-medium">Start Now · Pay Balance After Review</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <strong className="block text-xl sm:text-2xl font-black text-[#0E7490]">0% Markup</strong>
              <span className="text-xs text-slate-600 font-medium">Rule 33 Pass-Through Stamp Duty</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <strong className="block text-xl sm:text-2xl font-black text-[#073B5C]">Zero Spam</strong>
              <span className="text-xs text-slate-600 font-medium">Direct CA &amp; Advocate Supervision</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            {[
              { n: '1', title: 'Pay ₹999 Advance Token', desc: 'Lock your filing and get matched with a dedicated CA.' },
              { n: '2', title: 'Upload Documents Securely', desc: 'Share PAN, Aadhaar, and proofs in your encrypted Vault.' },
              { n: '3', title: 'Direct Govt Submission', desc: 'Filed on MCA V3, GSTN, or IP India with live tracking.' },
              { n: '4', title: 'Download Certificates', desc: 'Receive approved COI, GSTIN, DINs & Rule 33 GST invoice.' },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
                <span className="w-7 h-7 bg-[#073B5C] text-[#F4B942] font-black rounded-lg flex items-center justify-center text-xs shrink-0">
                  {step.n}
                </span>
                <div>
                  <strong className="block text-[#073B5C] font-extrabold">{step.title}</strong>
                  <p className="text-slate-600 leading-snug mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CURATED STARTER KITS & DISPUTE HELP */}
      <FounderPlaybooks />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full -mt-2 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E7490] block">
              Consumer Disputes &amp; Unpaid Dues (ODR)
            </span>
            <p className="text-sm font-bold text-[#073B5C]">
              Send an advocate-drafted demand notice (₹1,999) or consult a verified Bar Council advocate directly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0 text-xs">
            <Link
              href="/services/consumer-complaint-notice"
              className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold px-4 py-2.5 rounded-xl transition"
            >
              Send Legal Notice (₹1,999) →
            </Link>
            <Link
              href="/vakil"
              className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold px-4 py-2.5 rounded-xl transition"
            >
              Browse Verified Advocates
            </Link>
          </div>
        </div>
      </div>

      {/* 4. FILTERABLE SERVICES CATALOG */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-4 w-full flex-grow">
        <ServicesCatalog servicesList={servicesList} />
      </main>

      {/* 5. FOUNDER REVIEWS */}
      <FounderReviewsCarousel />

      {/* 6. TOP FAQS */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#073B5C]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500">Quick answers to the most common legal &amp; filing questions.</p>
          </div>

          <div className="space-y-2.5 text-sm">
            {[
              {
                q: 'What is the ₹999 Advance Token option and how does it work?',
                a: 'The ₹999 advance token initiates your filing (name reservation, drafting, and CA review) without paying the full package fee upfront. Once verified, you pay the remaining balance in your Order Room.',
              },
              {
                q: 'Are government statutory fees and state stamp duties included?',
                a: 'Professional fees and government charges are clearly separated. State stamp duties and official registry fees are passed through at actual government challan cost with zero markup under Rule 33 of CGST Rules.',
              },
              {
                q: 'Is the entire registration process 100% online and paperless?',
                a: 'Yes. Identity verification and document signing use Class-3 DSC or Aadhaar OTP, and all approved documents are stored in your encrypted NyayaLink Vault.',
              },
              {
                q: 'Who handles my filing after I book?',
                a: 'A dedicated practicing Chartered Accountant, Company Secretary, or High Court Advocate is assigned to your docket—never commission-based telemarketers.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-xs sm:text-sm"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <span className="text-base text-slate-400 font-mono">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-6 py-3 rounded-xl transition"
            >
              View All 20+ Questions →
            </Link>
          </div>
        </div>
      </section>

      {/* ON-DEMAND ENTITY ADVISOR MODAL */}
      <EntityMatchmakerWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
