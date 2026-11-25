'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import type { PackageItem } from '@/data/packages';
import type { ServiceStructure } from '@/data/serviceDetails';
import {
  computeQuote,
  formatINR,
  INDIAN_STATES,
  getStateStampDuty,
  getPricingModelBadge,
} from '@/lib/pricing';
import { openRazorpayCheckout } from '@/lib/checkout-client';
import Header from '@/components/Header';
import StampDutyCalculator from '@/components/StampDutyCalculator';
import DeliverablesUnboxingCard from '@/components/DeliverablesUnboxingCard';
import CompanyTierSelector, { TierKey } from '@/components/CompanyTierSelector';
import ServiceStickySidebar from '@/components/service/ServiceStickySidebar';
import ServiceCheckoutModal from '@/components/service/ServiceCheckoutModal';
import ServiceRequirementsModal from '@/components/service/ServiceRequirementsModal';
import { getStateDocumentRequirements } from '@/data/stateDocumentRequirements';

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
  structure?: ServiceStructure | null;
  packages?: PackageItem[];
  masterMeta?: { badge: string; icon: string };
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

function ServiceDetailContent({ serviceData, pricing, structure, packages = [], masterMeta }: ServiceDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || serviceData?.slug || 'private-limited-company';
  const prefilledName = searchParams?.get('name') || searchParams?.get('brand') || '';

  const fallbackTitle = serviceData?.title || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const masterService = {
    id: slug,
    slug,
    category: serviceData?.category || 'company-reg',
    title: fallbackTitle,
    price: serviceData?.professionalFee ?? pricing?.professionalFee ?? 6999,
    govtFee: serviceData?.govtFeeNote ?? pricing?.govtFeeNote ?? 'Standard Official Portal Charges Apply',
    sla: serviceData?.sla ?? pricing?.sla ?? '7–10 working days',
    badge: masterMeta?.badge || 'NyayaLink Assured',
    sacCode: serviceData?.sacCode ?? pricing?.sacCode ?? '998221',
    icon: masterMeta?.icon || '🏢',
  };

  const details: ServiceStructure = structure || {
    slug,
    title: fallbackTitle,
    category: masterService.category,
    badge: masterService.badge,
    whoShouldBuy: 'Founders, professionals, and businesses seeking verified statutory compliance execution.',
    whyShouldBuy: 'Direct Chartered Accountant and Advocate execution with Rule 33 pass-through transparency.',
    timeframe: masterService.sla,
    specificDocs: ['PAN & Aadhaar Card', 'Registered Business Address Proof'],
    importantConsiderations: ['Government fees are billed at actuals under Rule 33.'],
    deliverables: [
      { title: 'Statutory Filing & Submission', desc: 'Executed by assigned practicing professionals.' },
      { title: 'Encrypted Vault Deliverables', desc: 'Approved certificates and Rule 33 GST invoice.' },
    ],
    faqs: [],
  };
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

  // Service Type & Pricing Model Flags
  const isFssaiService = slug.includes('fssai');
  const isShopActService = slug.includes('shop-and-establishment') || slug.includes('gumasta');
  const isDisputeService =
    serviceCategory === 'legal-disputes' ||
    slug.includes('notice') ||
    slug.includes('consumer') ||
    slug.includes('cheque') ||
    slug.includes('dispute');

  // Interactive Tier States
  const [fssaiTier, setFssaiTier] = useState<'basic' | 'state' | 'central'>('basic');
  const [staffSlab, setStaffSlab] = useState<'0_9' | '10_20' | '20_plus'>('0_9');

  const pricingModel = useMemo(() => getPricingModelBadge(slug, serviceCategory), [slug, serviceCategory]);

  // Mobile Segmented Control Tab
  const [mobileTab, setMobileTab] = useState<'overview' | 'documents'>('overview');
  const [showAllStatesDocs, setShowAllStatesDocs] = useState(false);

  // Modals
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Quick Checkout Form in Modal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarPhone, setAadhaarPhone] = useState('');
  const [entityName, setEntityName] = useState(prefilledName);
  const [entityNameChoice2, setEntityNameChoice2] = useState('');
  const [consent, setConsent] = useState(true);
  const [email, setEmail] = useState('');

  // In-Modal Seamless OTP States
  const [otpStep, setOtpStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone');
  const [otpCooldown, setOtpCooldown] = useState<number>(0);

  // Package bundle detection from URL (?package=startup-launchpad-bundle)
  const packageParam = searchParams?.get('package');
  const matchedPackage: PackageItem | null = useMemo(() => {
    if (!packageParam) return null;
    return packages.find((p) => p.slug === packageParam || p.id === packageParam) || null;
  }, [packageParam, packages]);

  const isPvtLtdPage = slug === 'private-limited-company';
  const isEntityIncorporationPage =
    slug === 'private-limited-company' ||
    slug === 'one-person-company' ||
    slug === 'llp-registration' ||
    slug === 'public-limited-company';

  // Active Formation Tier State (only applies to Private Limited Company page or explicit package link)
  const [activeFormationTier, setActiveFormationTier] = useState<TierKey>(() => {
    if (packageParam === 'tech-founder-venture-suite') return 'complete';
    if (packageParam === 'annual-corporate-compliance-retainer') return 'retainer';
    if (packageParam === 'startup-launchpad-bundle') return 'growth';
    return 'launch';
  });

  // Effective package resolves either from explicit tier choice on Pvt Ltd page or URL ?package= param
  const effectivePackage: PackageItem | null = useMemo(() => {
    if (isPvtLtdPage) {
      if (activeFormationTier === 'growth') {
        return packages.find((p) => p.slug === 'startup-launchpad-bundle') || null;
      }
      if (activeFormationTier === 'complete') {
        return packages.find((p) => p.slug === 'tech-founder-venture-suite') || null;
      }
      if (activeFormationTier === 'retainer') {
        return packages.find((p) => p.slug === 'annual-corporate-compliance-retainer') || null;
      }
      return null; // 'launch' is standalone Pvt Ltd service
    }
    return matchedPackage;
  }, [isPvtLtdPage, activeFormationTier, matchedPackage, packages]);

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
  // OTP resend countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY(slug));
      if (!raw) return;
      const d = JSON.parse(raw);
      setFullName(d.fullName || '');
      setPhone(d.phone || '');
      setEmail(d.email || '');
      setEntityName(d.entityName || prefilledName);
      setSelectedState(d.selectedState || 'MH');
      if (d.openCheckout) setIsCheckoutModalOpen(true);
    } catch {
      /* storage unavailable */
    }
  }, [slug, prefilledName]);

  useEffect(() => {
    if (signedIn) {
      if (!fullName && session?.user?.name) setFullName(session.user.name);
      if (!email && session?.user?.email) setEmail(session.user.email);
    }
  }, [signedIn, session, fullName, email]);

  // Pricing calculations with interactive tier calculations
  const rawProfFee = serviceData ? serviceData.professionalFee : (pricing ? pricing.professionalFee : masterService.price);
  const rawGovtFee = (serviceData?.govtFee ?? pricing?.govtFee) || 0;
  const gstRate = serviceData?.gstRate || pricing?.gstRate || 18;
  const stateStamp = useMemo(() => getStateStampDuty(selectedState), [selectedState]);

  // Dynamic Tier Pricing computation
  const effectivePricing = useMemo(() => {
    let prof = rawProfFee;
    let govt = isStateSpecificService ? stateStamp.amount : rawGovtFee;
    let sla = displaySla;
    let tierLabel = '';

    if (isFssaiService) {
      if (fssaiTier === 'basic') {
        prof = 1999;
        govt = 100;
        sla = '3 - 5 Working Days';
        tierLabel = 'Basic FoSCoS Registration (< ₹12L Turnover)';
      } else if (fssaiTier === 'state') {
        prof = 3499;
        govt = 2000;
        sla = '7 - 10 Working Days';
        tierLabel = 'State FoSCoS Food License (₹12L - ₹20 Cr)';
      } else {
        prof = 6999;
        govt = 7500;
        sla = '10 - 15 Working Days';
        tierLabel = 'Central FoSCoS License (> ₹20 Cr / Importer)';
      }
    } else if (isShopActService) {
      if (staffSlab === '0_9') {
        prof = 1999;
        govt = 0;
        sla = '1 - 3 Working Days';
        tierLabel = 'Micro / Self-Operated (0 to 9 Staff)';
      } else if (staffSlab === '10_20') {
        prof = 2499;
        govt = 1000;
        sla = '3 - 5 Working Days';
        tierLabel = 'Commercial Establishment (10 to 20 Staff)';
      } else {
        prof = 3999;
        govt = 1500;
        sla = '5 - 7 Working Days';
        tierLabel = 'Large Enterprise (20+ Staff + EPFO/ESIC)';
      }
    }

    return { prof, govt, sla, tierLabel };
  }, [rawProfFee, rawGovtFee, isStateSpecificService, stateStamp.amount, displaySla, isFssaiService, fssaiTier, isShopActService, staffSlab]);

  const baseProfFee = effectivePricing.prof;
  const dynamicGovtFee = effectivePricing.govt;

  // Active pricing derived from effective package if selected
  const activeProfFee = effectivePackage ? effectivePackage.packagePrice : baseProfFee;
  const activeGovtFee = effectivePackage && effectivePackage.slug === 'annual-corporate-compliance-retainer' ? 0 : dynamicGovtFee;

  // Statutory Filing vs Pure Professional Service Mode
  const isStatutoryFiling = useMemo(() => {
    const cat = (serviceCategory || '').toLowerCase();
    const s = slug.toLowerCase();
    return (
      cat === 'company-reg' ||
      cat === 'trademark-ipr' ||
      cat === 'copyright' ||
      cat === 'licenses-permits' ||
      s.includes('company') ||
      s.includes('incorporation') ||
      s.includes('llp') ||
      s.includes('fssai') ||
      s.includes('shop') ||
      s.includes('gumasta') ||
      s.includes('iec') ||
      s.includes('gst-reg') ||
      activeGovtFee > 0
    );
  }, [serviceCategory, slug, activeGovtFee]);

  const isPureService = !isStatutoryFiling;

  // Dynamic state-specific document requirements
  const stateSpecificDocs = useMemo(() => {
    return getStateDocumentRequirements(selectedState, isStatutoryFiling);
  }, [selectedState, isStatutoryFiling]);

  const baseQuote = useMemo(
    () =>
      computeQuote(
        { professionalFee: activeProfFee, govtFee: activeGovtFee, gstRate },
        selectedState
      ),
    [activeProfFee, activeGovtFee, gstRate, selectedState]
  );

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
        JSON.stringify({ fullName, phone, email, entityName, selectedState, openCheckout: true })
      );
    } catch {
      /* storage unavailable */
    }
    router.push(`/login?callbackUrl=${encodeURIComponent(`/services/${slug}`)}`);
  };

  // Core order creation and payment execution
  const executeOrderCreationAndPayment = async () => {
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
            aadhaarPhone: aadhaarPhone || phone,
            email: email || session?.user?.email || '',
            entityName: entityName || (effectivePackage ? effectivePackage.title : details.title),
            entityNameChoice2: entityNameChoice2 || '',
            selectedState,
            bookingPlan: payAdvance ? 'ADVANCE_999' : 'FULL_PAYMENT',
            ...(isFssaiService ? { fssaiTier, fssaiTierLabel: effectivePricing.tierLabel, fssaiGovtFee: String(dynamicGovtFee) } : {}),
            ...(isShopActService ? { staffSlab, staffSlabLabel: effectivePricing.tierLabel, shopActGovtFee: String(dynamicGovtFee) } : {}),
            ...(effectivePackage
              ? {
                  isPackageBooking: 'true',
                  packageId: effectivePackage.id,
                  packageSlug: effectivePackage.slug,
                  packageTitle: effectivePackage.title,
                  bundleIncludedServices: effectivePackage.includedServices.map((s) => s.name).join(' • '),
                  bundleDeliverables: effectivePackage.deliverables.join(' | '),
                }
              : {}),
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

  // Zero-redirect in-modal Checkout Submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signedIn) {
      return executeOrderCreationAndPayment();
    }

    const targetIdentifier = phone.trim() || email.trim();
    if (!targetIdentifier) {
      setCheckoutError('Please enter your mobile number or email address.');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetIdentifier }),
      });
      const data = await res.json();
      if (!data.success) {
        setCheckoutError(data.error || 'Could not send verification code.');
        setIsProcessing(false);
        return;
      }

      setOtpChannel(data.channel || (targetIdentifier.includes('@') ? 'email' : 'phone'));
      setOtpStep('otp');
      setOtpCooldown(30);
    } catch {
      setCheckoutError('Network error while requesting verification code.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify OTP and proceed directly to payment
  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setCheckoutError('Please enter the 6-digit verification code.');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');
    const targetIdentifier = phone.trim() || email.trim();

    try {
      const res = await signIn('otp', {
        redirect: false,
        identifier: targetIdentifier,
        code: otpCode.trim(),
        name: fullName,
        email: otpChannel === 'phone' ? email : '',
        consent: 'true',
      });

      if (res?.error) {
        setCheckoutError(res.error === 'NEW_USER_DETAILS_REQUIRED' ? 'Please provide your name.' : res.error);
        setIsProcessing(false);
        return;
      }

      await executeOrderCreationAndPayment();
    } catch {
      setCheckoutError('Verification failed. Please check the code and try again.');
      setIsProcessing(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setIsProcessing(true);
    setCheckoutError('');
    const targetIdentifier = phone.trim() || email.trim();
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetIdentifier }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpCooldown(30);
      } else {
        setCheckoutError(data.error || 'Failed to resend code.');
      }
    } catch {
      setCheckoutError('Network error. Failed to resend code.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased pb-28 lg:pb-12">
      <Header />

      {/* 2. MAIN 65/35 GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-grow space-y-6">

        {/* PACKAGE BUNDLE ACTIVATION BANNER */}
        {matchedPackage && (
          <div className="bg-gradient-to-r from-[#073B5C] via-[#0E7490] to-[#052840] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-cyan-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#F4B942] text-[#073B5C] text-[11px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                  Starter Suite Activated • Save {matchedPackage.savingsPercent}%
                </span>
                <span className="text-xs text-cyan-200 font-semibold">⏱️ SLA: {matchedPackage.sla}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{matchedPackage.icon}</span> {matchedPackage.title}
              </h2>
              <p className="text-xs text-cyan-100 max-w-2xl leading-relaxed">
                Bundled Services: <strong className="text-white">{matchedPackage.includedServices.map((s) => s.name).join(' + ')}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-cyan-200 line-through block">₹{matchedPackage.standaloneTotal.toLocaleString()}</span>
                <span className="text-xl font-black text-[#F4B942]">₹{matchedPackage.packagePrice.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(true)}
                className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-4 py-2.5 rounded-2xl uppercase tracking-wider transition shadow cursor-pointer"
              >
                Book Package ₹999 →
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (65% width): Education, Deliverables & Trust */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-8">

            {/* MOBILE 2-TAB SEGMENTED CONTROL (Matching Online Legal India UX pattern) */}
            <div className="lg:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-md py-2 border-b border-slate-200">
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileTab('overview')}
                  className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileTab === 'overview'
                      ? 'bg-[#073B5C] text-white shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <span>📋 Service Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('documents')}
                  className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileTab === 'documents'
                      ? 'bg-[#073B5C] text-white shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <span>📁 Documents Required</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    mobileTab === 'documents' ? 'bg-[#F4B942] text-[#073B5C]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {allDocsList.length + (isStatutoryFiling ? stateSpecificDocs.length : 0)}
                  </span>
                </button>
              </div>
            </div>

            {/* DEDICATED MOBILE DOCUMENTS REQUIRED TAB VIEW (lg:hidden) */}
            {mobileTab === 'documents' && (
              <div className="lg:hidden space-y-5 animate-fadeIn">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#0E7490] tracking-wider block">
                        Compliance Checklist
                      </span>
                      <h2 className="text-base font-black text-[#073B5C]">
                        {displayTitle}
                      </h2>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[11px] px-2.5 py-1 rounded-full uppercase">
                      Vault Assured
                    </span>
                  </div>

                  {/* State selector dropdown on mobile documents tab */}
                  <div className="space-y-1.5">
                    <label htmlFor="mobile-doc-state-select" className="block text-xs font-bold text-[#073B5C]">
                      {isStatutoryFiling ? 'Jurisdiction State:' : 'Operational State (Place of Supply):'}
                    </label>
                    <select
                      id="mobile-doc-state-select"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-extrabold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} ({st.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">
                      Showing tailored documentation requirements for {INDIAN_STATES.find((s) => s.code === selectedState)?.name || selectedState}.
                    </p>
                  </div>

                  {/* Universal Documents */}
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider">
                      1. Universal Identification & Entity Records ({allDocsList.length})
                    </h3>
                    <div className="space-y-2">
                      {allDocsList.map((doc, idx) => {
                        const parsed = getDocIcon(doc);
                        return (
                          <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                            <span className="text-lg shrink-0 mt-0.5">{parsed.icon}</span>
                            <div className="min-w-0">
                              <strong className="text-xs font-bold text-[#073B5C] block leading-snug">{doc}</strong>
                              <span className="text-xs text-slate-400">Clear smartphone photo or PDF scan accepted</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* State Jurisdiction Specific Documents */}
                  {isStatutoryFiling && stateSpecificDocs.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase text-[#0E7490] tracking-wider flex items-center gap-1.5">
                          <span>📍</span> 2. {INDIAN_STATES.find((s) => s.code === selectedState)?.name || selectedState} Premises & Tax Mandates
                        </h3>
                        <span className="text-[11px] bg-cyan-100 text-cyan-900 font-bold px-2 py-0.5 rounded-full">
                          State Specific
                        </span>
                      </div>
                      <div className="space-y-2">
                        {stateSpecificDocs.map((doc, idx) => (
                          <div key={idx} className="p-3 bg-cyan-50/60 border border-cyan-200/80 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-700 font-bold text-xs">✓</span>
                                <strong className="text-xs font-bold text-[#073B5C]">{doc.title}</strong>
                              </div>
                              {doc.mandatory && (
                                <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 pl-4 leading-relaxed">{doc.desc}</p>
                            <span className="text-[11px] font-mono text-slate-400 pl-4 block">{doc.authority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vault Reassurance Box */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-950 space-y-1">
                    <strong className="block font-black text-emerald-900 flex items-center gap-1">
                      <span>🛡️</span> Zero Pressure: No Documents Needed Right Now
                    </strong>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      You do not need documents ready in hand to get started. Secure your booking with a ₹999 advance token today. Your assigned CA will open your private encrypted Vault and assist you step-by-step.
                    </p>
                  </div>

                  {/* Upload Specs */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-0.5">
                    <span className="font-bold text-slate-700 block">Accepted Formats: PDF, JPG, PNG (&lt; 10 MB)</span>
                    <span>Built-in smartphone camera compression automatically optimizes large photo files.</span>
                  </div>

                  {/* Mobile CTA on Documents Tab */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-3.5 rounded-2xl uppercase tracking-wider shadow cursor-pointer transition active:scale-[0.99]"
                  >
                    Start for {formatINR(activePayAmount)} {payAdvance ? 'Advance' : ''} →
                  </button>
                </div>
              </div>
            )}
            
            {/* OVERVIEW CONTENT CONTAINER (Visible on desktop, toggled on mobile) */}
            <div className={`space-y-8 ${mobileTab === 'documents' ? 'hidden lg:block' : 'block'}`}>
            {/* HERO SECTION */}
            <div className="space-y-4">
              {!isServiceActive && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
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
                <span className="bg-[#073B5C] text-[#F4B942] font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-400/20 shadow-sm">
                  ⚡ {details.badge || 'Govt Portal Assured'}
                </span>
                <span className="bg-slate-200/80 text-slate-700 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md">
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
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🛡️</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[11px] sm:text-[11px] truncate">100% Verified</strong>
                    <span className="text-[11px] sm:text-xs text-slate-500 block truncate">CA/CS Supervised</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">⏱️</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[11px] sm:text-[11px] truncate">Fast Track SLA</strong>
                    <span className="text-[11px] sm:text-xs text-slate-500 block truncate">{displaySla}</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🔒</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[11px] sm:text-[11px] truncate">Encrypted Vault</strong>
                    <span className="text-[11px] sm:text-xs text-slate-500 block truncate">256-Bit SSL Cloud</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 sm:gap-2.5">
                  <span className="text-base sm:text-lg">🧾</span>
                  <div className="min-w-0">
                    <strong className="block text-[#073B5C] font-extrabold text-[11px] sm:text-[11px] truncate">GST Invoicing</strong>
                    <span className="text-[11px] sm:text-xs text-slate-500 block truncate">Input Tax Credit</span>
                  </div>
                </div>
              </div>
            </div>

            
            {/* COMPANY INCORPORATION TIERS (ONLY ON PRIVATE LIMITED COMPANY PAGE) */}
            {isPvtLtdPage && (
              <CompanyTierSelector
                selectedState={selectedState}
                onSelectState={setSelectedState}
                activeTier={activeFormationTier}
                onSelectTier={(tier) => setActiveFormationTier(tier)}
                onCheckout={(tier) => {
                  setActiveFormationTier(tier);
                  setIsCheckoutModalOpen(true);
                }}
                showComparisonDetails={true}
              />
            )}

            {/* DIRECT ADVOCATE REPRESENTATION RADAR (FOR DISPUTES & NOTICES) */}
            {isDisputeService && (
              <div className="bg-gradient-to-r from-[#073B5C] via-[#0A4E7A] to-[#041E30] text-white rounded-3xl p-5 sm:p-7 shadow-md space-y-4 border border-cyan-800/80">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="bg-[#F4B942] text-[#073B5C] text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      Bar Council Verified Advocates
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1">
                      Direct High Court Advocate Representation
                    </h3>
                    <p className="text-xs text-cyan-200">
                      Formal legal notices and court petitions drafted directly on practicing advocate letterhead.
                    </p>
                  </div>
                  <Link
                    href="/vakil"
                    className="inline-flex items-center gap-1.5 bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] text-xs font-black px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
                  >
                    <span>Browse Empanelled Advocates →</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-base">📜</span>
                    <strong className="block text-white font-bold text-[11px]">Advocate Letterhead</strong>
                    <p className="text-xs text-cyan-200 leading-snug">
                      Issued with official Bar Council enrollment numbers, carrying immediate statutory weight.
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-base">📮</span>
                    <strong className="block text-white font-bold text-[11px]">Speed Post with POD</strong>
                    <p className="text-xs text-cyan-200 leading-snug">
                      Dispatched via India Post with Proof of Delivery (POD) archived in your vault for court admissibility.
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-base">⚖️</span>
                    <strong className="block text-white font-bold text-[11px]">Litigation Ready</strong>
                    <p className="text-xs text-cyan-200 leading-snug">
                      Seamless transition to e-Daakhil consumer forum filing or Section 138 trial if the opponent defaults.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* OFFICIAL DELIVERABLES SECTION (1 Focused Section) */}
            {isEntityIncorporationPage ? (
              <DeliverablesUnboxingCard serviceSlug={slug} serviceTitle={displayTitle} />
            ) : (
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-xl font-extrabold text-[#073B5C] flex items-center gap-2">
                      <span>📦</span> Official Deliverables Included
                    </h2>
                    <p className="text-xs text-slate-500">Statutory assets delivered directly to your encrypted customer vault upon approval.</p>
                  </div>
                  <span className="hidden sm:inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                    All-Inclusive Kit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {details.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-cyan-400/50 rounded-2xl transition-all shadow-sm space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0E7490] text-white text-xs font-black flex items-center justify-center shrink-0">
                            ✓
                          </span>
                          <strong className="text-xs sm:text-sm font-extrabold text-[#073B5C] leading-tight">
                            {item.title}
                          </strong>
                        </div>
                        <p className="text-xs text-slate-600 pl-7 leading-relaxed font-normal pt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: SIMPLIFIED DOCUMENTS (PROGRESSIVE DISCLOSURE GRID) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#073B5C] flex items-center gap-2">
                    <span>📁</span> Required Documents
                  </h2>
                  <p className="text-xs text-slate-500">Simple smartphone photos or clear scans. Uploaded privately right after booking.</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {allDocsList.length + (isStatutoryFiling ? stateSpecificDocs.length : 0)} items total
                </span>
              </div>

              {/* 3-4 Horizontal Document Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {simplifiedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-[#0E7490] transition shadow-sm"
                  >
                    <span className="text-2xl">{doc.icon}</span>
                    <strong className="text-[11px] font-extrabold text-[#073B5C] leading-tight line-clamp-2">
                      {doc.title}
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Required
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic State Document Requirements (Active when statutory filing is selected) */}
              {isStatutoryFiling && stateSpecificDocs.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-50/60 to-slate-50 border border-cyan-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#073B5C]">
                          State Jurisdiction Additions: {INDIAN_STATES.find((s) => s.code === selectedState)?.name || selectedState}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Mandated by local Registrar & Revenue authorities for premises verification in {selectedState}.
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#0E7490] text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto">
                      {selectedState} Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {stateSpecificDocs.map((doc, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 font-bold">✓</span>
                            <strong className="text-xs text-[#073B5C]">{doc.title}</strong>
                            {doc.mandatory && (
                              <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 pl-4">{doc.desc}</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded shrink-0 hidden sm:inline">
                          {doc.authority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progressive Disclosure Link */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsDocsModalOpen(true)}
                  className="font-extrabold text-[#0E7490] hover:text-[#073B5C] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📋 + View complete documentation guidelines ({allDocsList.length + (isStatutoryFiling ? stateSpecificDocs.length : 0)} items)</span>
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

            {/* SECTION 4.1: DYNAMIC STATE STAMP DUTY ESTIMATOR (FOR ENTITY INCORPORATION) */}
            {isEntityIncorporationPage && (
              <div className="pt-1">
                <StampDutyCalculator
                  baseProfFee={baseProfFee}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
            )}

            {/* SECTION 4.2: INTERACTIVE FSSAI TURNOVER & SCALE SELECTOR */}
            {isFssaiService && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍲</span>
                      <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                        FoSCoS Food Safety License Scale Selector
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory FoSCoS portal fees vary based on annual food business turnover and operations.
                    </p>
                  </div>
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto">
                    Rule 33 Pure Agent
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'basic',
                      title: 'Basic Registration',
                      turnover: 'Turnover < ₹12 Lakhs',
                      desc: 'Cloud kitchens, home bakers, food stalls, petty manufacturers.',
                      govtFee: '₹100/yr',
                      profFee: '₹1,999',
                      badge: 'Micro FBO',
                    },
                    {
                      id: 'state',
                      title: 'State Food License',
                      turnover: 'Turnover ₹12L - ₹20 Cr',
                      desc: 'Full-service dine-in restaurants, caterers, commercial Swiggy/Zomato kitchens.',
                      govtFee: '₹2,000/yr',
                      profFee: '₹3,499',
                      badge: 'Most Popular',
                    },
                    {
                      id: 'central',
                      title: 'Central License',
                      turnover: 'Turnover > ₹20 Cr',
                      desc: 'Multi-state food chains, 100% export oriented units, importers, food e-commerce.',
                      govtFee: '₹7,500/yr',
                      profFee: '₹6,999',
                      badge: 'Venture & Scale',
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFssaiTier(t.id as any)}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        fssaiTier === t.id
                          ? 'border-[#0E7490] bg-cyan-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                            fssaiTier === t.id ? 'bg-[#0E7490] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.badge}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-500">
                            {fssaiTier === t.id ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-[#073B5C] text-xs leading-snug">{t.title}</h4>
                        <div className="text-[11px] font-bold text-amber-900">{t.turnover}</div>
                        <p className="text-xs text-slate-500 leading-tight">{t.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 text-[11px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Govt Fee:</span>
                          <strong className="text-slate-700">{t.govtFee}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Prof. Fee:</span>
                          <strong className="text-[#073B5C]">{t.profFee}</strong>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4.3: INTERACTIVE SHOP ACT EMPLOYEE SLAB SELECTOR */}
            {isShopActService && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏬</span>
                      <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                        Shop & Establishment Staff Headcount Slab
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      State labor department registration requirements and portal fees scale with active employee headcount.
                    </p>
                  </div>
                  <span className="bg-purple-50 text-purple-900 border border-purple-200 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto">
                    Labor Act Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: '0_9',
                      title: 'Micro / Self-Operated',
                      staff: '0 to 9 Employees',
                      desc: 'Online Intimation (Form F in MH / Free in Delhi). Instant delivery.',
                      govtFee: '₹0 (Nominal)',
                      profFee: '₹1,999',
                      badge: 'Zero Labor Fee',
                    },
                    {
                      id: '10_20',
                      title: 'Commercial Establishment',
                      staff: '10 to 20 Employees',
                      desc: 'Formal Registration Certificate issued by State Labor Commissioner.',
                      govtFee: '~₹1,000 (At Actuals)',
                      profFee: '₹2,499',
                      badge: 'Commercial',
                    },
                    {
                      id: '20_plus',
                      title: 'Large Enterprise',
                      staff: '20+ Employees',
                      desc: 'Labor registration + mandatory EPFO and ESIC employer compliance code.',
                      govtFee: '~₹1,500 (At Actuals)',
                      profFee: '₹3,999',
                      badge: 'ESIC + EPFO',
                    },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStaffSlab(s.id as any)}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        staffSlab === s.id
                          ? 'border-[#0E7490] bg-cyan-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                            staffSlab === s.id ? 'bg-[#0E7490] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.badge}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-500">
                            {staffSlab === s.id ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-[#073B5C] text-xs leading-snug">{s.title}</h4>
                        <div className="text-[11px] font-bold text-purple-900">{s.staff}</div>
                        <p className="text-xs text-slate-500 leading-tight">{s.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 text-[11px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Labor Fee:</span>
                          <strong className="text-slate-700">{s.govtFee}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Prof. Fee:</span>
                          <strong className="text-[#073B5C]">{s.profFee}</strong>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: REGULATORY CONSIDERATIONS */}
            {details.importantConsiderations && details.importantConsiderations.length > 0 && (
              <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
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

            {/* Mobile In-Line Prompt to Check Required Documents */}
            <div className="lg:hidden p-4 bg-cyan-50/80 border border-cyan-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div>
                <strong className="text-xs text-[#073B5C] block">Check Documentation Checklist</strong>
                <p className="text-xs text-slate-500">
                  {allDocsList.length + (isStatutoryFiling ? stateSpecificDocs.length : 0)} documents for {INDIAN_STATES.find((s) => s.code === selectedState)?.name || selectedState}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab('documents')}
                className="bg-[#073B5C] text-[#F4B942] text-xs font-black px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer shadow-sm"
              >
                View Checklist →
              </button>
            </div>

            </div>{/* END OF OVERVIEW CONTENT CONTAINER */}

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (35% width): Sticky "Split-Ticket" Card     */}
          {/* ======================================================== */}
          <ServiceStickySidebar
            displayTitle={displayTitle}
            displaySla={displaySla}
            pricingModel={pricingModel}
            isStatutoryFiling={isStatutoryFiling}
            isStateSpecificService={isStateSpecificService}
            isPureService={isPureService}
            isServiceActive={isServiceActive}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            stateStamp={stateStamp}
            effectivePackage={effectivePackage}
            activeProfFee={activeProfFee}
            activeGovtFee={activeGovtFee}
            gstRate={gstRate}
            gstAmount={baseQuote.gstAmount}
            totalEstimatedCost={totalEstimatedCost}
            payAdvance={payAdvance}
            onSelectPayAdvance={setPayAdvance}
            activePayAmount={activePayAmount}
            onOpenCheckout={() => setIsCheckoutModalOpen(true)}
          />

        </div>
      </main>


      {/* ======================================================== */}
      {/* 4. EXPRESS CHECKOUT & FULL REQUIREMENTS MODALS          */}
      {/* ======================================================== */}
      <ServiceCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        displayTitle={displayTitle}
        displaySac={displaySac}
        signedIn={signedIn}
        effectivePackage={effectivePackage}
        otpStep={otpStep}
        setOtpStep={setOtpStep}
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        aadhaarPhone={aadhaarPhone}
        setAadhaarPhone={setAadhaarPhone}
        entityName={entityName}
        setEntityName={setEntityName}
        entityNameChoice2={entityNameChoice2}
        setEntityNameChoice2={setEntityNameChoice2}
        consent={consent}
        setConsent={setConsent}
        isPureService={isPureService}
        isStateSpecificService={isStateSpecificService}
        selectedState={selectedState}
        payAdvance={payAdvance}
        totalEstimatedCost={totalEstimatedCost}
        activePayAmount={activePayAmount}
        checkoutError={checkoutError}
        setCheckoutError={setCheckoutError}
        pendingOrder={pendingOrder}
        isProcessing={isProcessing}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        otpCooldown={otpCooldown}
        onSubmitForm={handleCheckoutSubmit}
        onVerifyOtp={handleVerifyOtpAndProceed}
        onResendOtp={handleResendOtp}
        onSaveDraftAndSignIn={saveDraftAndSignIn}
      />

      <ServiceRequirementsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        documents={allDocsList}
      />

      {/* STICKY MOBILE BOTTOM BOOKING BAR (Single high-converting bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 pb-[max(env(safe-area-inset-bottom),0.625rem)] print:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase font-bold text-slate-500">
              {payAdvance ? 'Advance Token' : (isPureService ? 'Total Retainer' : 'Total Price')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-1.5 py-0.2 rounded">
              {isPureService ? 'Fixed Retainer' : 'Zero Markup'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-base font-black text-[#073B5C] font-mono">
              {formatINR(activePayAmount)}
            </strong>
            {payAdvance && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(totalEstimatedCost)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://wa.me/919920054785?text=${encodeURIComponent(
              `Hi NyayaLink, I am looking at ${displayTitle} and want quick guidance.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm"
            title="Chat with CA on WhatsApp"
          >
            💬
          </a>

          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            {payAdvance ? 'Book for ₹999 →' : (isPureService ? 'Book Retainer →' : 'Book Filing →')}
          </button>
        </div>
      </div>

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

