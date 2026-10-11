'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MASTER_SERVICES } from '@/data/services';
import { getServiceStructure } from '@/data/serviceDetails';
import {
  computeQuote,
  formatINR,
  INDIAN_STATES,
  getStateStampDuty,
} from '@/lib/pricing';
import { openRazorpayCheckout } from '@/lib/checkout-client';

export interface ServicePricing {
  professionalFee: number;
  govtFee: number;
  govtFeeNote: string;
  gstRate: number;
  sla: string;
  sacCode: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  category: string;
  professionalFee: number;
  govtFee: number;
  govtFeeNote: string;
  gstRate: number;
  sla: string;
  sacCode: string;
  isActive: boolean;
  requirements?: Array<{
    id?: string;
    key: string;
    label: string;
    required: boolean;
  }>;
}

export interface ServiceDetailClientProps {
  serviceData?: ServiceData | null;
  pricing?: ServicePricing | null;
}

const DRAFT_KEY = (slug: string) => `nyayalink:intake:${slug}`;

// Dynamic document icons mapping based on document keyword
function getDocIcon(docText: string): { icon: string; title: string } {
  const lower = docText.toLowerCase();
  if (lower.includes('pan') || lower.includes('aadhaar') || lower.includes('id proof') || lower.includes('passport')) {
    return { icon: '🪪', title: 'Identity Proof (PAN / Aadhaar)' };
  }
  if (lower.includes('address') || lower.includes('electricity') || lower.includes('utility') || lower.includes('bank statement')) {
    return { icon: '⚡', title: 'Address & Utility Proof' };
  }
  if (lower.includes('rent') || lower.includes('noc') || lower.includes('property') || lower.includes('deed')) {
    return { icon: '🏢', title: 'Office Premises & NOC' };
  }
  if (lower.includes('photo') || lower.includes('dsc') || lower.includes('signature') || lower.includes('specimen')) {
    return { icon: '📸', title: 'Photographs & Digital Signature' };
  }
  if (lower.includes('license') || lower.includes('certificate') || lower.includes('registration') || lower.includes('moa')) {
    return { icon: '📜', title: 'Prior Registrations / Charter' };
  }
  return { icon: '📄', title: 'Statutory Documentation' };
}

function ServiceDetailContent({ serviceData, pricing }: ServiceDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || serviceData?.slug || 'private-limited-company';
  const prefilledName = searchParams?.get('name') || searchParams?.get('brand') || '';

  const masterService = MASTER_SERVICES.find((s) => s.slug === slug) || {
    id: 'srv-custom',
    slug: slug,
    category: serviceData?.category || 'company-reg',
    title: serviceData?.title || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    price: serviceData?.professionalFee ?? 6999,
    govtFee: serviceData?.govtFeeNote ?? 'Standard Official Portal Charges Apply',
    sla: serviceData?.sla ?? '7–10 working days',
    badge: 'NyayaLink Assured',
    sacCode: serviceData?.sacCode ?? '998221',
    icon: '🏢',
    desc: 'Professional legal and statutory filing executed directly by Chartered Accountants and Legal Advocates.',
    docs: 'PAN, ID, Address Proof, Commercial Documents',
  };

  const details = getServiceStructure(slug);
  const serviceCategory = serviceData?.category || masterService.category;
  const isStateSpecificService = serviceCategory === 'company-reg' || slug.includes('incorporation') || slug.includes('company') || slug.includes('llp');
  const isServiceActive = serviceData ? serviceData.isActive : true;

  const displayTitle = serviceData?.title || details.title;
  const displaySla = serviceData?.sla || pricing?.sla || masterService.sla;
  const displaySac = serviceData?.sacCode || pricing?.sacCode || masterService.sacCode;

  const { data: session, status: sessionStatus } = useSession();
  const signedIn = sessionStatus === 'authenticated';

  // Selection states
  const [selectedState, setSelectedState] = useState('MH');
  const [payAdvance, setPayAdvance] = useState(true); // true = ₹999 impulse advance, false = full amount

  // Modals
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Quick Checkout Form in Modal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [entityName, setEntityName] = useState(prefilledName);
  const [consent, setConsent] = useState(true);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const idempotencyKey = useRef<string>('');

  useEffect(() => {
    if (prefilledName) setEntityName(prefilledName);
  }, [prefilledName]);

  // Restore draft saved before auth redirect
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY(slug));
      if (!raw) return;
      const d = JSON.parse(raw);
      setFullName(d.fullName || '');
      setPhone(d.phone || '');
      setEntityName(d.entityName || prefilledName);
      setSelectedState(d.selectedState || 'MH');
      if (d.openCheckout) setIsCheckoutModalOpen(true);
    } catch {
      /* storage unavailable */
    }
  }, [slug, prefilledName]);

  useEffect(() => {
    if (signedIn && !fullName && session?.user?.name) setFullName(session.user.name);
  }, [signedIn, session, fullName]);

  // Pricing calculations
  const baseProfFee = serviceData ? serviceData.professionalFee : (pricing ? pricing.professionalFee : masterService.price);
  const gstRate = serviceData?.gstRate || pricing?.gstRate || 18;
  const stateStamp = useMemo(() => getStateStampDuty(selectedState), [selectedState]);

  // Compute GST on professional fee
  const baseQuote = useMemo(
    () =>
      computeQuote(
        { professionalFee: baseProfFee, govtFee: isStateSpecificService ? stateStamp.amount : ((serviceData?.govtFee ?? pricing?.govtFee) || 0), gstRate },
        selectedState
      ),
    [baseProfFee, isStateSpecificService, stateStamp.amount, serviceData?.govtFee, pricing?.govtFee, gstRate, selectedState]
  );

  const dynamicGovtFee = isStateSpecificService ? stateStamp.amount : ((serviceData?.govtFee ?? pricing?.govtFee) || 0);
  const totalEstimatedCost = baseQuote.total;
  const advanceAmount = Math.min(999, totalEstimatedCost);
  const activePayAmount = payAdvance ? advanceAmount : totalEstimatedCost;

  // Active documents checklist (falls back to serviceDetails.ts if not custom seeded)
  const allDocsList = useMemo(() => {
    if (serviceData?.requirements && serviceData.requirements.length > 0) {
      return serviceData.requirements.map((r) => r.label);
    }
    return details.specificDocs;
  }, [serviceData, details.specificDocs]);

  // Simplified 3-4 document pills from allDocsList
  const simplifiedDocs = useMemo(() => {
    const list = allDocsList || [];
    const seenTitles = new Set<string>();
    const result: { icon: string; title: string; original: string }[] = [];

    for (const d of list) {
      const parsed = getDocIcon(d);
      if (!seenTitles.has(parsed.title)) {
        seenTitles.add(parsed.title);
        result.push({ icon: parsed.icon, title: parsed.title, original: d });
      }
      if (result.length >= 4) break;
    }

    // Fallbacks if fewer than 3
    if (result.length === 0) {
      result.push(
        { icon: '🪪', title: 'PAN & Aadhaar / Identity', original: 'Director / Applicant Identification Proof' },
        { icon: '⚡', title: 'Registered Address Proof', original: 'Electricity bill under 2 months old' },
        { icon: '🏢', title: 'No-Objection Certificate', original: 'NOC from commercial premises owner' },
        { icon: '📸', title: 'Passport Photo & Specimen', original: 'Color passport photograph' }
      );
    }
    return result;
  }, [allDocsList]);

  const saveDraftAndSignIn = () => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY(slug),
        JSON.stringify({ fullName, phone, entityName, selectedState, openCheckout: true })
      );
    } catch {
      /* storage unavailable */
    }
    router.push(`/login?callbackUrl=${encodeURIComponent(`/services/${slug}`)}`);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedIn) return saveDraftAndSignIn();

    setIsProcessing(true);
    setCheckoutError('');
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify({
          serviceSlug: slug,
          clientState: selectedState,
          consent: true,
          isAdvance: payAdvance,
          intake: {
            applicantName: fullName,
            mobile: phone,
            entityName: entityName || details.title,
            selectedState,
            bookingPlan: payAdvance ? 'ADVANCE_999' : 'FULL_PAYMENT',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckoutError(data.error || 'Could not initiate your filing order. Please try again.');
        return;
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY(slug));
      } catch {
        /* storage unavailable */
      }
      setPendingOrder(data.orderNumber);

      if (!data.checkout) {
        // Gateway unavailable - order is saved, redirect to order room
        router.push(`/orders/${data.orderNumber}`);
        return;
      }

      const result = await openRazorpayCheckout(data.checkout);
      if (result.status === 'paid') {
        router.push(`/orders/${data.orderNumber}`);
      } else if (result.status === 'failed') {
        setCheckoutError(result.error);
      }
    } catch {
      setCheckoutError('Network error. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased pb-28 lg:pb-12">
      {/* 1. TOP NAV STRIP */}
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="hidden sm:inline-block text-[11px] text-cyan-200 font-semibold border-l border-white/20 pl-3">
              Direct Compliance Desk
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/vakil" className="text-xs text-[#F4B942] hover:text-amber-300 font-bold transition">
              👨‍⚖️ Talk to a Lawyer
            </Link>
            <Link href="/dashboard" className="text-xs text-white/90 hover:text-white font-semibold">
              Vault Dashboard
            </Link>
            <Link href="/#catalog-section" className="text-xs text-cyan-200 hover:text-white transition">
              ← All Services
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN 65/35 GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (65% width): Education, Deliverables & Trust */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* HERO SECTION */}
            <div className="space-y-4">
              {!isServiceActive && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div className="space-y-1">
                    <h2 className="text-xs sm:text-sm font-extrabold text-amber-900 uppercase tracking-wide">
                      Online Intake Temporarily Paused
                    </h2>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      New online applications for this service are temporarily paused by administration. You can still schedule an advisory consultation with our Chartered Accountants.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#073B5C] text-[#F4B942] font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-400/20 shadow-sm">
                  ⚡ {details.badge || 'Govt Portal Assured'}
                </span>
                <span className="bg-slate-200/80 text-slate-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md">
                  SAC: {displaySac}
                </span>
                <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span>★ 4.9/5</span>
                  <span className="text-slate-400 font-normal">(1,200+ filings)</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#073B5C] tracking-tight leading-tight">
                {displayTitle}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl font-medium">
                {details.whyShouldBuy}
              </p>

              {/* Trust Badges Ribbon (2×2 on mobile, 4 across on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 text-xs">
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🛡️</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[10px] sm:text-[11px] truncate">100% Verified</strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">CA/CS Supervised</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">⏱️</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[10px] sm:text-[11px] truncate">Fast Track SLA</strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">{displaySla}</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🔒</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[10px] sm:text-[11px] truncate">Encrypted Vault</strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">256-Bit SSL Cloud</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🧾</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[10px] sm:text-[11px] truncate">GST Invoicing</strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Input Tax Credit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: OFFICIAL DELIVERABLES INCLUDED (2×2 GRID ON MOBILE) */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-[#073B5C] flex items-center gap-2">
                    <span>📦</span> Official Deliverables Included
                  </h2>
                  <p className="text-xs text-slate-500">Statutory assets delivered directly to your encrypted customer vault upon approval.</p>
                </div>
                <span className="hidden sm:inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                  All-Inclusive Kit
                </span>
              </div>

              {/* 2×2 on Mobile, 2 Columns on Desktop */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {details.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-cyan-400/50 rounded-2xl transition-all shadow-xs space-y-1 sm:space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0E7490] text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        <strong className="text-[11px] sm:text-sm font-extrabold text-[#073B5C] leading-tight">
                          {item.title}
                        </strong>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-600 pl-5 sm:pl-7 leading-relaxed font-normal pt-1 line-clamp-3 sm:line-clamp-none">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: SIMPLIFIED DOCUMENTS (PROGRESSIVE DISCLOSURE GRID) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#073B5C] flex items-center gap-2">
                    <span>📁</span> Required Documents
                  </h2>
                  <p className="text-xs text-slate-500">Simple smartphone photos or clear scans. Uploaded privately right after booking.</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {allDocsList.length} items total
                </span>
              </div>

              {/* 3-4 Horizontal Document Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {simplifiedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-[#0E7490] transition shadow-xs"
                  >
                    <span className="text-2xl">{doc.icon}</span>
                    <strong className="text-[11px] font-extrabold text-[#073B5C] leading-tight line-clamp-2">
                      {doc.title}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Required
                    </span>
                  </div>
                ))}
              </div>

              {/* Progressive Disclosure Link */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsDocsModalOpen(true)}
                  className="font-extrabold text-[#0E7490] hover:text-[#073B5C] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📋 + View complete documentation guidelines ({allDocsList.length} items)</span>
                  <span>→</span>
                </button>
                <span className="text-[11px] text-slate-400 hidden sm:inline">PDF, JPG, PNG accepted (up to 10MB)</span>
              </div>
            </div>

            {/* SECTION 4: WHO SHOULD APPLY & WHY BUY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#073B5C] font-extrabold text-sm border-b border-slate-100 pb-2">
                  <span className="text-lg">🎯</span>
                  <h3>Who Should Apply</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                  {details.whoShouldBuy}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#073B5C] font-extrabold text-sm border-b border-slate-100 pb-2">
                  <span className="text-lg">💡</span>
                  <h3>Strategic Advantage</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                  {details.whyShouldBuy}
                </p>
              </div>
            </div>

            {/* SECTION 5: REGULATORY CONSIDERATIONS */}
            {details.importantConsiderations && details.importantConsiderations.length > 0 && (
              <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-3">
                <h3 className="text-sm sm:text-base font-extrabold text-amber-950 flex items-center gap-2">
                  <span>⚠️</span> Important Statutory & Regulatory Considerations
                </h3>
                <div className="space-y-1.5 text-xs text-amber-900 leading-relaxed">
                  {details.importantConsiderations.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-amber-600">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 6: FAQS ACCORDION */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#073B5C] flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>💬</span> Frequently Asked Questions
              </h3>

              <div className="space-y-2.5 text-xs">
                {details.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <span className="text-base text-[#0E7490] font-mono shrink-0">{openFaq === idx ? '−' : '+'}</span>
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100 font-normal">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (35% width): Sticky "Split-Ticket" Card     */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-7 shadow-xl space-y-5">
              
              {/* Header with Fast-Track Badge */}
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="bg-cyan-100 text-[#0E7490] font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    ⚡ Fast-Track Filing
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">CA Supervised</span>
                </div>
                <h3 className="font-black text-[#073B5C] text-lg sm:text-xl">
                  {displayTitle}
                </h3>
              </div>

              {/* STATE SELECTION DROPDOWN */}
              <div className="space-y-1.5">
                <label htmlFor="card-state" className="block text-xs font-bold text-[#073B5C]">
                  {isStateSpecificService ? 'Select Incorporation State' : 'Select Operational State (GST)'}
                </label>
                <select
                  id="card-state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-extrabold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} {isStateSpecificService && stateStamp.baseStamp ? `(₹${(stateStamp.baseStamp + 131).toLocaleString()} Stamp)` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  {isStateSpecificService
                    ? `Stamp Duty calculated automatically for ${stateStamp.breakdown}.`
                    : 'Determines Place of Supply for valid GST tax invoice.'}
                </p>
              </div>

              {/* PRICING BREAKDOWN MATRIX */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">NyayaLink Professional Fee</span>
                  <strong className="text-slate-900 font-extrabold">{formatINR(baseProfFee)}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">GST @ {gstRate}%</span>
                  <strong className="text-slate-900 font-extrabold">{formatINR(baseQuote.gstAmount)}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <span>Govt Stamp Duty & Fee</span>
                    {isStateSpecificService && <span className="text-[10px] text-emerald-700 font-bold">(Live)</span>}
                  </span>
                  <strong className="text-slate-900 font-extrabold">
                    {dynamicGovtFee > 0 ? formatINR(dynamicGovtFee) : '₹0 (At Actuals)'}
                  </strong>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-[#073B5C]">
                  <span>Total Estimated Outlay</span>
                  <span className="text-base text-slate-900">{formatINR(totalEstimatedCost)}</span>
                </div>
              </div>

              {/* SPLIT-TICKET PROPOSITION BOX */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                    💳 Split-Ticket Option
                  </span>
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    Save Capital
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayAdvance(true)}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition ${
                      payAdvance
                        ? 'bg-white text-emerald-800 border-emerald-400 shadow-xs'
                        : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60'
                    }`}
                  >
                    <div>₹999 Advance</div>
                    <div className="text-[9px] font-normal text-slate-400">Balance later</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAdvance(false)}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition ${
                      !payAdvance
                        ? 'bg-white text-[#073B5C] border-cyan-400 shadow-xs'
                        : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60'
                    }`}
                  >
                    <div>Pay Full {formatINR(totalEstimatedCost)}</div>
                    <div className="text-[9px] font-normal text-slate-400">One-time</div>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  {payAdvance
                    ? 'Start name reservation and document drafting today for ₹999. Remaining balance is billed after CA verification.'
                    : 'Complete payment upfront. Direct fast-track filing into statutory portal queue.'}
                </p>
              </div>

              {/* THE IMPULSE CTA BUTTON */}
              <div className="space-y-2.5">
                {!isServiceActive ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full bg-slate-200 text-slate-500 font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider cursor-not-allowed text-center"
                    >
                      Applications Paused
                    </button>
                    <a
                      href="#consultation"
                      className="block text-center w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-2xl uppercase transition shadow"
                    >
                      Book Expert Consultation Instead →
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-sm py-4 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <span>Start Now for {formatINR(activePayAmount)} {payAdvance ? 'Advance' : ''} →</span>
                  </button>
                )}

                {/* SLA BADGE DIRECTLY UNDER CTA */}
                <div className="p-2.5 bg-cyan-50/70 border border-cyan-200/80 rounded-xl text-center">
                  <span className="text-xs font-extrabold text-[#073B5C] flex items-center justify-center gap-1.5">
                    <span>⚡ Typical Turnaround:</span>
                    <span className="text-[#0E7490]">{displaySla}</span>
                  </span>
                </div>
              </div>

              {/* TRUST SIGNALS */}
              <div className="pt-1 space-y-1.5 text-[11px] text-slate-500 text-center font-medium">
                <div className="flex items-center justify-center gap-3 text-slate-600 font-semibold text-[10px]">
                  <span>🔒 256-Bit SSL</span>
                  <span>•</span>
                  <span>🛡️ 100% Name Guarantee</span>
                  <span>•</span>
                  <span>🤝 Zero Hidden Fees</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Government stamp duty is strictly pass-through at actuals. Never marked up.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. MOBILE FIXED BOTTOM SHEET / BAR (lg:hidden)          */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#073B5C] text-white p-3.5 px-4 flex items-center justify-between z-40 border-t border-cyan-800 shadow-2xl">
        <div className="space-y-0.5">
          <span className="text-[10px] text-cyan-200 font-bold block uppercase tracking-wider">
            {payAdvance ? 'Booking Token' : 'Total Package'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-lg font-black text-[#F4B942]">
              {formatINR(activePayAmount)}
            </strong>
            {payAdvance && (
              <span className="text-[10px] text-slate-300">
                (Total: {formatINR(totalEstimatedCost)})
              </span>
            )}
          </div>
        </div>

        {!isServiceActive ? (
          <a
            href="#consultation"
            className="bg-[#073B5C] border border-[#F4B942] text-[#F4B942] font-black text-xs px-4 py-2.5 rounded-xl uppercase whitespace-nowrap"
          >
            Consultation Only
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider shadow cursor-pointer active:scale-95 transition"
          >
            Start for {formatINR(activePayAmount)} →
          </button>
        )}
      </div>


      {/* ======================================================== */}
      {/* 4. EXPRESS CHECKOUT MODAL                                */}
      {/* ======================================================== */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  Express Filing Setup
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                  {displayTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              
              {!signedIn && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-[11px] text-[#073B5C]">
                  <span>⚡ An account will be created automatically using your phone or email to track your filing.</span>
                </div>
              )}

              {/* Applicant Name */}
              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  WhatsApp / Mobile Number (+91) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              {/* Proposed Name / Brand */}
              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  Proposed Company / Brand / Entity Name
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Acme Innovations (can finalize later with CA)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              {/* Selected State & Amount Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Jurisdiction: {selectedState}</span>
                  <strong className="text-slate-800 text-xs">
                    {payAdvance ? '₹999 Booking Token' : 'Full Payment'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Package:</span>
                  <strong className="text-emerald-700 text-xs font-black">
                    {formatINR(totalEstimatedCost)}
                  </strong>
                </div>
              </div>

              {/* Consent checkbox */}
              <label className="flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[#0E7490]"
                />
                <span>
                  I agree to NyayaLink&apos;s <Link href="/terms" target="_blank" className="underline text-[#0E7490]">Terms</Link> and{' '}
                  <Link href="/privacy" target="_blank" className="underline text-[#0E7490]">Privacy Policy</Link>. Documents are securely verified by certified CAs.
                </span>
              </label>

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-xl font-bold">
                  {checkoutError}
                  {pendingOrder && (
                    <div className="pt-1">
                      <Link href={`/orders/${pendingOrder}`} className="underline text-[#073B5C]">
                        Open Saved Order #{pendingOrder} →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* CTA in Modal */}
              <button
                type="submit"
                disabled={isProcessing || !fullName || phone.length < 10}
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Connecting Gateway…' : `Confirm & Pay ${formatINR(activePayAmount)} →`}
              </button>

              <p className="text-[9px] text-slate-400 text-center">
                🔒 256-Bit SSL Encrypted. Invoices and tracking sent immediately.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ALL REQUIREMENTS FULL MODAL                          */}
      {/* ======================================================== */}
      {isDocsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  Document Checklist
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                  All Required Documents
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDocsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 text-xs pr-1">
              <p className="text-slate-500 text-[11px] pb-1">
                You do not need these immediately. You can book now and upload them anytime inside your secure Vault:
              </p>
              {allDocsList.map((doc, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-emerald-700 font-black text-sm mt-0.5">✓</span>
                  <span className="text-slate-700 font-medium leading-relaxed">{doc}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px]">Format: PDF, PNG, JPG (&lt; 10MB)</span>
              <button
                type="button"
                onClick={() => setIsDocsModalOpen(false)}
                className="bg-[#073B5C] text-[#F4B942] font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ServiceDetailClient(props: ServiceDetailClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs">Loading service workspace...</div>}>
      <ServiceDetailContent {...props} />
    </Suspense>
  );
}

