'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALL_CATEGORIES, MASTER_SERVICES } from '@/data/services';
import { INDIAN_STATES, getStateStampDuty, formatINR, getPricingModelBadge } from '@/lib/pricing';


const FOUNDER_REVIEWS = [
  {
    stars: '★★★★★',
    quote: '“Incorporated our SaaS entity in just 4 days. The ₹999 advance model gave us complete peace of mind, and the state stamp duty was passed through at exact govt challan with zero markup.”',
    name: 'Rohit K.',
    role: 'CTO @ NexaCloud Labs (Bengaluru)',
    service: '🏢 Pvt Ltd Company',
  },
  {
    stars: '★★★★★',
    quote: '“Our trademark faced an objection from a conglomerate. NyayaLink assigned a High Court Advocate who drafted a flawless reply and cleared our hearing in one attempt. Certificate granted!”',
    name: 'Priya S.',
    role: 'Founder @ Aara Naturals (Mumbai)',
    service: '™️ TM Hearing & Class 3',
  },
  {
    stars: '★★★★★',
    quote: '“GST registration and MSME Udyam certificate approved in under 72 hours. The encrypted document vault keeps all our PAN, TAN, and GST certificates securely archived with zero clutter.”',
    name: 'Vikram M.',
    role: 'Director @ Apex Precision (Delhi NCR)',
    service: '🧾 GST & MSME Udyam',
  },
  {
    stars: '★★★★★',
    quote: '“Secured our multi-state FSSAI food license in under a week. Communication with our assigned CA over direct WhatsApp was fast and professional. No endless sales rep spam.”',
    name: 'Dr. Ananya R.',
    role: 'Co-Founder @ NutriBites (Hyderabad)',
    service: '📜 Central FSSAI License',
  },
  {
    stars: '★★★★★',
    quote: '“Drafted our multi-founder LLP agreement and filed Form 3 with the ROC seamlessly. Transparent pass-through fee ledger without the usual hidden markups or aggressive sales calls.”',
    name: 'Karan Mehra',
    role: 'Managing Partner @ StackZero (Pune)',
    service: '🤝 LLP Agreement & ROC',
  },
];

export default function HomePage() {
  const router = useRouter();

  // Navigation & Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [isAllServicesExpanded, setIsAllServicesExpanded] = useState(false);
  const packagesSliderRef = useRef<HTMLDivElement>(null);
  const [activePackageIndex, setActivePackageIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Auto-slide founder reviews every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);
  const [comparisonCompetitor, setComparisonCompetitor] = useState<'portals' | 'offline'>('portals');
  // Entity Matchmaker Decision Wizard State
  // Entity Matchmaker Decision Wizard State (Interactive Step-by-Step)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardFounders, setWizardFounders] = useState<'solo' | 'multi' | null>(null);
  const [wizardFunding, setWizardFunding] = useState<'bootstrap' | 'vc' | null>(null);
  const [wizardLiability, setWizardLiability] = useState<'shield' | 'fast' | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const isWizardCompleted = wizardFounders !== null && wizardFunding !== null && wizardLiability !== null;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hero 3-Tab Command Center (Hero Right)
  const [heroTab, setHeroTab] = useState<'calculator' | 'name-check' | 'callback'>('calculator');
  const [estimatorService, setEstimatorService] = useState('private-limited-company');
  const [estimatorState, setEstimatorState] = useState('MH');

  // Hero MCA Name Availability Checker State
  const [heroNameQuery, setHeroNameQuery] = useState('');
  const [heroNameSuffix, setHeroNameSuffix] = useState('Private Limited');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameCheckResult, setNameCheckResult] = useState<{
    query: string;
    isAvailable: boolean;
    score: number;
    conflicts: string[];
    recommendation: string;
    suggestedNames?: string[];
  } | null>(null);

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

  // Close hero search on click outside (only active when dropdown is open)
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

  const estimatorGstAmount = useMemo(() => {
    return Math.round(((currentEstimatorService?.price || 0) * 18) / 100);
  }, [currentEstimatorService?.price]);

  const estimatorTotalOutlay = (currentEstimatorService?.price || 0) + estimatorGstAmount + estimatorStampDuty;

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

  // Progressive catalog limiter to avoid endless 58-service scroll on homepage
  const INITIAL_VISIBLE_SERVICES = 8;
  const displayedServices = useMemo(() => {
    if (directorySearch.trim() || activeCategory !== 'all') {
      return filteredServices;
    }
    if (isAllServicesExpanded) {
      return filteredServices;
    }
    return filteredServices.slice(0, INITIAL_VISIBLE_SERVICES);
  }, [filteredServices, activeCategory, directorySearch, isAllServicesExpanded]);

  // Packages mobile horizontal slider scroll handlers
  const scrollPackages = (direction: 'left' | 'right') => {
    if (packagesSliderRef.current) {
      const scrollAmount = packagesSliderRef.current.clientWidth * 0.85;
      packagesSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handlePackagesScroll = () => {
    if (packagesSliderRef.current) {
      const scrollLeft = packagesSliderRef.current.scrollLeft;
      const cardWidth = packagesSliderRef.current.clientWidth * 0.85;
      const index = Math.round(scrollLeft / (cardWidth || 1));
      setActivePackageIndex(Math.min(Math.max(0, index), 3));
    }
  };

    // Computed Business Entity Recommendation
  const entityRecommendation = useMemo(() => {
    if (wizardFounders === 'solo') {
      if (wizardLiability === 'shield') {
        return {
          title: 'One Person Company (OPC)',
          tagline: 'Best for Solo Founders Wanting 100% Limited Liability Protection',
          slug: 'one-person-company',
          price: '₹6,999',
          advanceToken: '₹999',
          features: [
            'Separate legal corporate entity with 100% personal asset protection',
            'Full corporate status with 1 single director & shareholder',
            'Seamless conversion to Private Limited as business revenue scales',
          ],
          packageUrl: '/services/one-person-company',
        };
      } else {
        return {
          title: 'Sole Proprietorship (GST + MSME Udyam)',
          tagline: 'Fastest & Most Affordable Setup for Solo Freelancers, Traders & Local Outlets',
          slug: 'gst-registration',
          price: '₹1,499',
          advanceToken: '₹999',
          features: [
            'Zero MCA statutory audit headaches & minimal recurring compliance burden',
            'Ready in 3–5 working days with 15-Digit GSTIN & Green MSME Udyam Certificate',
            'Instant Current Bank Account opening with partner banks',
          ],
          packageUrl: '/services/gst-registration',
        };
      }
    } else {
      if (wizardFunding === 'vc') {
        return {
          title: 'Private Limited Company (Pvt Ltd)',
          tagline: 'The Gold Standard for High-Growth Startups, Co-Founders & VC Investment',
          slug: 'private-limited-company',
          price: '₹8,999',
          advanceToken: '₹999',
          features: [
            'Mandatory vehicle to raise angel/VC capital, issue equity shares, and grant ESOPs',
            'Limited liability shields founders from company debt and corporate liabilities',
            'Eligible for Startup India 3-Year 100% Tax Exemption (Section 80-IAC)',
          ],
          packageUrl: '/services/private-limited-company?package=startup-launchpad-bundle',
        };
      } else {
        return {
          title: 'Limited Liability Partnership (LLP)',
          tagline: 'Ideal for 2+ Partners, Agencies, Consultancies & Family Businesses',
          slug: 'llp-incorporation',
          price: '₹6,499',
          advanceToken: '₹999',
          features: [
            'Limited liability shield without heavy corporate secretarial compliances',
            'No mandatory statutory audit unless turnover exceeds ₹40 Lakhs or capital exceeds ₹25 Lakhs',
            'Partners enjoy lower tax on profit withdrawals compared to corporate dividend tax',
          ],
          packageUrl: '/services/llp-incorporation',
        };
      }
    }
  }, [wizardFounders, wizardFunding, wizardLiability]);

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

  // Hero MCA Name Checker submit handler
  const handleHeroNameCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroNameQuery.trim()) return;

    setIsCheckingName(true);
    setNameCheckResult(null);

    setTimeout(() => {
      const cleanName = heroNameQuery.trim().toUpperCase();
      const isConflicting = ['TATA', 'RELIANCE', 'INFOSYS', 'NYAYALINK', 'MOBIZ', 'WIPRO', 'HDFC', 'BIRLA'].some((b) =>
        cleanName.includes(b)
      );

      if (isConflicting) {
        setNameCheckResult({
          query: `${heroNameQuery.trim()} ${heroNameSuffix}`,
          isAvailable: false,
          score: 35,
          conflicts: [
            `${heroNameQuery.trim()} TECHNOLOGIES PVT LTD (CIN: U72900MH2021PTC369123)`,
            `${heroNameQuery.trim()} ENTERPRISES LLP (LLPIN: AAB-9921)`,
          ],
          recommendation:
            'This name shares high phonetic similarity with existing registered entities in the MCA V3 registry. ROC CRC scrutiny may reject this application.',
          suggestedNames: [
            `${heroNameQuery.trim()} Global Systems ${heroNameSuffix}`,
            `NextGen ${heroNameQuery.trim()} Solutions ${heroNameSuffix}`,
            `${heroNameQuery.trim()} Enterprise Innovations ${heroNameSuffix}`,
          ],
        });
      } else {
        setNameCheckResult({
          query: `${heroNameQuery.trim()} ${heroNameSuffix}`,
          isAvailable: true,
          score: 96,
          conflicts: [],
          recommendation:
            'Excellent! No identical entity or active trademark conflict found in MCA registry. This name qualifies for RUN / SPICe+ Part A reservation.',
        });
      }
      setIsCheckingName(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-20 lg:pb-0 overflow-x-hidden w-full max-w-[100vw]">

      {/* ======================================================== */}
      {/* 0. PROMINENT 2026 ANNOUNCEMENT & OFFER BANNER            */}
      {/* ======================================================== */}
      {/* Desktop Announcement */}
      <div className="hidden sm:block bg-[#041E30] text-white py-1.5 px-3 sm:px-8 border-b border-cyan-500/20 text-center text-xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-[#0E7490] text-[#F4B942] font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider border border-cyan-400/30">
            🚀 2026 Founder Fast-Track
          </span>
          <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
            Flat ₹999 Booking Advance • Direct CA Supervision • Pure Agent Rule 33 Govt Fee Transparency
          </span>
          <Link
            href="/packages"
            className="text-[#F4B942] hover:text-white font-extrabold text-[11px] sm:text-xs underline underline-offset-2 ml-1"
          >
            Explore Founder Bundles →
          </Link>
        </div>
      </div>

      {/* Mobile-Only Ultra-Compact Announcement Strip (Zero Clutter) */}
      <div className="sm:hidden bg-[#041E30] text-white py-1.5 px-3 border-b border-cyan-500/20 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="bg-[#0E7490] text-[#F4B942] font-black text-[9px] uppercase px-1.5 py-0.5 rounded-full shrink-0 border border-cyan-400/30">
            ⚡ ₹999 Token
          </span>
          <span className="text-slate-200 font-semibold text-[10px] truncate">
            Direct CA Supervision • Rule 33
          </span>
        </div>
        <Link
          href="/packages"
          className="text-[#F4B942] hover:text-white font-black text-[10px] shrink-0 ml-2 underline underline-offset-2"
        >
          Bundles →
        </Link>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP GLOBAL TRUST & ADVISORY RIBBON (DESKTOP ONLY)     */}
      {/* ======================================================== */}
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
              MCA V3, GSTN & IP India Empanelled Desk
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
              placeholder="Search 58 legal and compliance services (e.g. Pvt Ltd, Trademark, GST)..."
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile 1-Tap WhatsApp Rescue */}
            <a
              href="https://wa.me/919920054785?text=Hi%20NyayaLink%2C%20I%20need%20help%20choosing%20the%20right%20business%20registration"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp CA"
              className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition shrink-0"
            >
              <span className="text-xs">💬</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-cyan-400/40 hover:border-[#F4B942] text-white hover:text-[#F4B942] font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition shadow-xs shrink-0"
            >
              <span>🔑</span>
              <span>Log In</span>
            </Link>

            <Link
              href="/vakil"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#F4B942] hover:text-amber-300 font-bold px-2 py-1.5 transition"
            >
              <span>👨‍⚖️</span> Talk to a Lawyer
            </Link>

            <Link
              href="/dashboard"
              className="hidden md:inline-flex bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shrink-0"
            >
              Vault Dashboard
            </Link>

            <Link
              href="/ca/dashboard"
              className="hidden lg:inline-flex bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow items-center gap-1 shrink-0"
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
                Explore All 58 Services ↓
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
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#073B5C] text-white h-full shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto space-y-4 touch-pan-y">
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
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-3 bg-[#F4B942] text-[#073B5C] rounded-xl font-black text-sm uppercase tracking-wider shadow-md"
              >
                <span>🔑</span> Client Log In / Access Vault →
              </Link>
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
              MCA V3 & Bar Council Compliant • Zero Hidden Charges
            </div>

            <h1 className="text-3xl sm:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight text-white">
              Fast, Certified Compliance & Legal Filing in India
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl font-medium">
              Company Incorporation, Trademark protection, GST returns, and FSSAI licenses executed 100% online by empanelled Chartered Accountants and High Court Advocates.
            </p>

            {/* 1. MASTER INTENT SEARCH (SINGLE AUTHORITATIVE SEARCH FIELD) */}
            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl max-w-xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-xl p-2 sm:px-3.5 sm:py-2.5 text-slate-800 shadow-inner">
                  <span className="text-base text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search 58 filings or describe your need (e.g. Pvt Ltd, Trademark, GST, Cloud Kitchen)..."
                    value={heroSearch}
                    onChange={(e) => {
                      setHeroSearch(e.target.value);
                      setIsHeroSearchOpen(true);
                    }}
                    className="w-full text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (heroSearchMatches.length > 0) {
                        router.push(`/services/${heroSearchMatches[0].slug}`);
                      }
                    }}
                    className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition shadow-xs"
                  >
                    Find Service →
                  </button>
                </div>

                {/* Autocomplete dropdown */}
                {isHeroSearchOpen && heroSearchMatches.length > 0 && (
                  <div className="mt-2 bg-white rounded-xl p-2 divide-y divide-slate-100 text-slate-800 shadow-xl max-h-72 overflow-y-auto">
                    {heroSearchMatches.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="p-2.5 hover:bg-slate-50 flex justify-between items-center text-xs rounded-lg transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{s.icon}</span>
                          <span className="font-bold text-[#073B5C]">{s.title}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                          Start for ₹999 Advance
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. GUIDED ADVISORY CALLOUT (UNSURE FOUNDERS) */}
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="text-[#F4B942] font-black text-sm">💡</span>
                <span>Unsure which legal structure fits your business?</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('wizard-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#F4B942] hover:text-white font-extrabold underline underline-offset-2 cursor-pointer transition"
                >
                  Take 30-Sec Entity Matchmaker ↓
                </button>
              </div>

              {/* 3. POPULAR SERVICE PILLS */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider">
                  Popular:
                </span>
                <Link
                  href="/services/private-limited-company"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px]"
                >
                  <span>🏢</span> Pvt Ltd Company
                </Link>
                <Link
                  href="/services/trademark-registration"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px]"
                >
                  <span>™️</span> Trademark Filing
                </Link>
                <Link
                  href="/services/gst-registration"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px]"
                >
                  <span>🧾</span> GST Registration
                </Link>
                <Link
                  href="/services/fssai-food-license"
                  className="bg-white/10 hover:bg-[#0E7490] border border-white/20 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px]"
                >
                  <span>🍽️</span> FSSAI License
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3-Tab Command Center (5 cols) */}
          <div className="lg:col-span-5" id="hero-booking-card">
            <div className="bg-white text-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute -top-3 right-4 sm:right-6 bg-[#F4B942] text-[#073B5C] text-[9px] sm:text-[10px] font-black uppercase px-2.5 sm:px-3.5 py-1 rounded-full shadow-md truncate max-w-[85%]">
                ⚡ Instant Booking & Verification Desk
              </div>

              {/* 3-Tab Switcher: Calculator vs MCA Name Check vs Free Callback */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold gap-0.5">
                <button
                  type="button"
                  onClick={() => setHeroTab('calculator')}
                  className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate ${
                    heroTab === 'calculator'
                      ? 'bg-white text-[#073B5C] shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ⚡ Fee Estimator
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab('name-check')}
                  className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate ${
                    heroTab === 'name-check'
                      ? 'bg-white text-[#073B5C] shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🔍 MCA Name Check
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab('callback')}
                  className={`flex-1 py-1.5 px-1 rounded-lg transition text-center truncate ${
                    heroTab === 'callback'
                      ? 'bg-white text-[#073B5C] shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📞 Free Callback
                </button>
              </div>

              {/* TAB 1: Self-Serve Instant Calculator Mode */}
              {heroTab === 'calculator' && (
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                      Estimate & Book with ₹999 Advance
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Transparent statutory stamp duties & professional retainers upfront.
                    </p>
                  </div>

                  {/* Step 1: Categorized Service Selector */}
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">
                      1. Select Filing Requirement:
                    </label>
                    <select
                      value={estimatorService}
                      onChange={(e) => setEstimatorService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      <optgroup label="🏢 Company & Business Registration">
                        {servicesList
                          .filter((s) => s.category === 'company-reg')
                          .map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.title}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="™️ Trademark & Intellectual Property">
                        {servicesList
                          .filter((s) => s.category === 'trademark-ipr' || s.category === 'copyright')
                          .map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.title}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="🧾 Tax, Accounting & GST">
                        {servicesList
                          .filter((s) => s.category === 'tax-accounting')
                          .map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.title}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="📜 Licenses, Permits & Certifications">
                        {servicesList
                          .filter((s) => s.category === 'licenses-permits')
                          .map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.title}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="🚀 Business Transformation & Tech">
                        {servicesList
                          .filter((s) => s.category === 'business-tech')
                          .map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.title}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Step 2: State selector */}
                  <div>
                    <label className="block font-bold text-[#073B5C] mb-1">
                      2. State of Registered Office:
                    </label>
                    <select
                      value={estimatorState}
                      onChange={(e) => setEstimatorState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} {isCompanyRegService ? `(₹${getStateStampDuty(st.code).amount.toLocaleString()} Stamp Duty)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing Matrix Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>NyayaLink Professional Fee:</span>
                      <strong className="text-slate-900">{formatINR(currentEstimatorService?.price || 0)}</strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>GST @ 18% (ITC Eligible):</span>
                      <strong className="text-slate-900">{formatINR(estimatorGstAmount)}</strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Govt Stamp / Statutory Fee:</span>
                      <strong className="text-slate-900">
                        {estimatorStampDuty > 0 ? formatINR(estimatorStampDuty) : 'Direct at actuals'}
                      </strong>
                    </div>

                    <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center font-extrabold text-[#073B5C] text-sm">
                      <span>Total Payable (GST-Inclusive):</span>
                      <span className="text-base text-emerald-700 font-black">{formatINR(estimatorTotalOutlay)}</span>
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
                    🔒 ₹999 locks in CA review and name reservation. Balance settled after drafting.
                  </p>
                </div>
              )}

              {/* TAB 2: MCA Name Availability Checker Mode */}
              {heroTab === 'name-check' && (
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                      Free MCA Name Availability Check
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Screen against registered companies, LLPs & trademarks before filing.
                    </p>
                  </div>

                  <form onSubmit={handleHeroNameCheck} className="space-y-2.5">
                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">
                        Proposed Company Name:
                      </label>
                      <input
                        type="text"
                        required
                        value={heroNameQuery}
                        onChange={(e) => setHeroNameQuery(e.target.value)}
                        placeholder="e.g. NexaWave Technologies"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">
                        Corporate Entity Suffix:
                      </label>
                      <select
                        value={heroNameSuffix}
                        onChange={(e) => setHeroNameSuffix(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      >
                        <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="OPC Private Limited">One Person Company (OPC)</option>
                        <option value="Limited">Public Limited</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckingName || !heroNameQuery.trim()}
                      className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-xl uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingName ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#F4B942] border-t-transparent rounded-full animate-spin"></span>
                          <span>Searching MCA V3 Registry...</span>
                        </>
                      ) : (
                        <span>Verify Name Availability Now →</span>
                      )}
                    </button>
                  </form>

                  {/* Name Check Result Modal / Box */}
                  {nameCheckResult && (
                    <div
                      className={`p-3 rounded-2xl border ${
                        nameCheckResult.isAvailable
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/90 border-amber-300 text-amber-950'
                      } space-y-2 animate-in fade-in zoom-in-95 duration-150`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">
                          {nameCheckResult.isAvailable ? '🎉 Name Available!' : '⚠️ Conflict Detected'}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            nameCheckResult.isAvailable
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          Score: {nameCheckResult.score}/100
                        </span>
                      </div>

                      <p className="text-[11px] leading-tight font-medium">
                        {nameCheckResult.recommendation}
                      </p>

                      {nameCheckResult.isAvailable ? (
                        <Link
                          href={`/services/private-limited-company?name=${encodeURIComponent(
                            nameCheckResult.query
                          )}`}
                          className="block w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-center text-xs py-2.5 rounded-xl uppercase tracking-wider transition shadow"
                        >
                          Reserve & Incorporate for ₹999 Token →
                        </Link>
                      ) : (
                        nameCheckResult.suggestedNames && (
                          <div className="pt-1 border-t border-amber-200 space-y-1">
                            <span className="text-[10px] font-bold text-amber-900 block">
                              Try These Available Alternatives:
                            </span>
                            <div className="space-y-1">
                              {nameCheckResult.suggestedNames.map((alt, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setHeroNameQuery(alt.replace(` ${heroNameSuffix}`, ''));
                                    setNameCheckResult(null);
                                  }}
                                  className="w-full text-left p-1.5 bg-white/80 hover:bg-white rounded-lg text-[10px] font-bold text-slate-800 border border-amber-200/60 transition flex justify-between items-center"
                                >
                                  <span>{alt}</span>
                                  <span className="text-emerald-700 font-extrabold">Check ↗</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Free 15-Min CA Callback Mode */}
              {heroTab === 'callback' && (
                <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
                  {cbSubmitted ? (
                    <div className="py-8 text-center space-y-2">
                      <span className="text-3xl">🎉</span>
                      <h4 className="font-black text-[#073B5C] text-base">Request Received!</h4>
                      <p className="text-slate-500 text-xs">
                        A dedicated CA from our Mumbai desk will call you within 15 minutes.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCbSubmitted(false);
                          setHeroTab('calculator');
                        }}
                        className="text-xs text-[#0E7490] font-bold underline pt-2"
                      >
                        Back to fee calculator
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-black text-[#073B5C]">Request Expert Legal Callback</h3>
                        <p className="text-[11px] text-slate-500">
                          Direct phone consultation with an empanelled CA/CS. Zero spam.
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        {isSubmittingCb ? 'Connecting...' : 'Request Free 15-Min Callback →'}
                      </button>

                      <p className="text-[10px] text-slate-400 text-center">
                        🔒 Confidential. Covered by Bar Council Advocate-Client confidentiality.
                      </p>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3.1 LIVE ACTIVITY & FILING TICKER BANNER                 */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 4. TRUST & SOCIAL PROOF METRICS BANNER                   */}
      {/* ======================================================== */}
      <section className="bg-white border-b border-slate-200 py-3 sm:py-6 px-3 sm:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile Horizontal Scroll Strip (Space-Saving) */}
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
                <strong className="block text-xs font-black text-[#073B5C]">CA & Advocate</strong>
                <span className="text-[9px] text-[#0E7490] font-semibold whitespace-nowrap">Direct Desk</span>
              </div>
            </div>
          </div>

          {/* Desktop 4-Column Grid */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-xs">
              <strong className="text-3xl font-black text-[#073B5C]">1,200+</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Businesses & Startups Advised</p>
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
              <strong className="text-3xl font-black text-[#073B5C]">CA & Advocate</strong>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Direct Desk Supervision</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4.1 THE NYAYALINK INTEGRITY GUARANTEE & ANTI-TELEMARKETING */}
      {/* ======================================================== */}
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
                <h4 className="font-extrabold text-xs text-white">Direct CA & Advocate Supervision</h4>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Corporate filings are supervised directly by practicing Chartered Accountants; disputes & legal notices vetted by High Court advocates.
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
                <h4 className="font-extrabold text-sm text-white">Direct CA & Bar Council Supervision</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Corporate filings are supervised directly by practicing Chartered Accountants; disputes & legal notices are vetted by verified High Court advocates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4.2 DUAL-TRACK DISPUTE RESOLUTION (HONEST ALTERNATIVE)    */}
      {/* ======================================================== */}
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

            {/* Desktop-Only Action Buttons (Hidden on mobile to eliminate duplication) */}
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

      {/* 4.5 STARTING A BUSINESS: 4 1-CLICK FOUNDER PLAYBOOKS     */}
      {/* ======================================================== */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full overflow-hidden">
        <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-3xl border-2 border-[#0E7490]/30 shadow-md p-4 sm:p-10 space-y-5 sm:space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#0E7490]/10 border border-[#0E7490]/30 px-3 py-1 rounded-full text-xs font-black text-[#0E7490]">
                <span>⚡</span> Zero Guesswork • 1-Click Business Starter Kits
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#073B5C] tracking-tight">
                Starting a New Business in India?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Do not buy fragmented licenses one by one. Choose your business model below to get the exact legal entity, tax registrations, municipal approvals, and bank setup bundled together at discounted package rates.
              </p>
            </div>

            <Link
              href="/packages"
              className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-3 rounded-2xl transition shadow flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All 6 Packages</span>
              <span>→</span>
            </Link>
          </div>

          {/* Mobile Horizontal Slider Swipe Navigator & Dots */}
          <div className="flex md:hidden items-center justify-between pb-1 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#073B5C]">
              <span className="text-amber-500 animate-pulse text-sm">👉</span>
              <span>Swipe Starter Kits</span>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                {activePackageIndex + 1} of 4
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollPackages('left')}
                className="w-10 h-10 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-sm font-black text-[#073B5C] active:bg-slate-100 transition"
                aria-label="Previous package"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollPackages('right')}
                className="w-10 h-10 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-sm font-black text-[#073B5C] active:bg-slate-100 transition"
                aria-label="Next package"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={packagesSliderRef}
            onScroll={handlePackagesScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible md:px-0"
          >
            
            {/* PLAYBOOK 1: SELLING ON AMAZON / FLIPKART */}
            <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-amber-50 rounded-2xl border border-amber-100">🛒</span>
                  <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                    Amazon Ready
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[#073B5C] text-base leading-snug">
                    Selling on Amazon, Flipkart & E-Com
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Sell goods nationwide via online marketplaces or your own Shopify store with full tax authorization.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                  <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>✓ 15-Digit Marketplace GSTIN</li>
                    <li>✓ Lifetime Import Export Code (IEC)</li>
                    <li>✓ MSME Udyam (50% TM Subsidy)</li>
                    <li>✓ GST LUT for 0% Global Export</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block">₹11,496</span>
                    <strong className="text-lg font-black text-[#073B5C]">₹5,999</strong>
                    <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(Save 47%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">⏱️ 3-7 Days</span>
                </div>

                <Link
                  href="/services/gst-registration?package=ecommerce-seller-suite"
                  className="block w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-3 rounded-xl text-center uppercase tracking-wider transition shadow-sm"
                >
                  Start for ₹999 Token →
                </Link>
              </div>
            </div>

            {/* PLAYBOOK 2: RESTAURANT / CAFE / CLOUD KITCHEN */}
            <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-orange-50 rounded-2xl border border-orange-100">🍲</span>
                  <span className="bg-orange-50 text-orange-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-orange-200">
                    FSSAI + Swiggy
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[#073B5C] text-base leading-snug">
                    Restaurant, Cafe & Cloud Kitchen
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    100% compliant food business launch. Fully cleared for Swiggy & Zomato partner onboarding.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                  <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>✓ 14-Digit FoSCoS FSSAI Food License</li>
                    <li>✓ 5% Restaurant GST Scheme</li>
                    <li>✓ Municipal Shop Act (Gumasta)</li>
                    <li>✓ Swiggy/Zomato Document Dossier</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block">₹12,496</span>
                    <strong className="text-lg font-black text-[#073B5C]">₹6,499</strong>
                    <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(Save 48%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">⏱️ 5-10 Days</span>
                </div>

                <Link
                  href="/services/fssai-food-license?package=restaurant-kitchen-compliance-kit"
                  className="block w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-3 rounded-xl text-center uppercase tracking-wider transition shadow-sm"
                >
                  Start for ₹999 Token →
                </Link>
              </div>
            </div>

            {/* PLAYBOOK 3: TECH STARTUP & PVT LTD */}
            <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-5 border-2 border-[#0E7490] transition shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 right-4 bg-[#073B5C] text-[#F4B942] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                Most Popular
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-cyan-50 rounded-2xl border border-cyan-100">🚀</span>
                  <span className="bg-cyan-50 text-cyan-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-cyan-200">
                    Venture Ready
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[#073B5C] text-base leading-snug">
                    Tech Startup & Pvt Ltd Company
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Formal corporate structure with limited liability, investor equity readiness, and bank account setup.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                  <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>✓ MCA SPICe+ Pvt Ltd CoI with CIN</li>
                    <li>✓ 2 Class-3 DSCs + PAN & TAN</li>
                    <li>✓ 15-Digit GSTIN Registration</li>
                    <li>✓ MSME Certificate & INC-20A Filing</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block">₹15,497</span>
                    <strong className="text-lg font-black text-[#073B5C]">₹8,999</strong>
                    <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(Save 42%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">⏱️ 7-10 Days</span>
                </div>

                <Link
                  href="/services/private-limited-company?package=startup-launchpad-bundle"
                  className="block w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-xl text-center uppercase tracking-wider transition shadow-sm"
                >
                  Start for ₹999 Token →
                </Link>
              </div>
            </div>

            {/* PLAYBOOK 4: RETAIL STORE / LOCAL SHOP */}
            <div className="w-[84vw] max-w-[320px] snap-center shrink-0 md:w-auto md:max-w-none md:shrink bg-white rounded-3xl p-5 border border-slate-200 hover:border-[#0E7490] transition shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">🏬</span>
                  <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
                    Municipal Legal
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[#073B5C] text-base leading-snug">
                    Retail Store & Commercial Office
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Physical shop or retail establishment registration under state labor laws with current account opening.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                  <strong className="text-[#073B5C] block text-[10px] uppercase tracking-wider font-extrabold">Included Registrations:</strong>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>✓ Municipal Shop & Establishment (Gumasta)</li>
                    <li>✓ 15-Digit GST Registration</li>
                    <li>✓ Green MSME Udyam Certificate</li>
                    <li>✓ Partner Bank Current Account KYC</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block">₹8,497</span>
                    <strong className="text-lg font-black text-[#073B5C]">₹4,999</strong>
                    <span className="text-[10px] text-emerald-700 font-bold ml-1.5">(Save 41%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">⏱️ 3-5 Days</span>
                </div>

                <Link
                  href="/services/shop-and-establishment-license?package=retail-store-launch-pack"
                  className="block w-full bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs py-3 rounded-xl text-center uppercase tracking-wider transition shadow-sm"
                >
                  Start for ₹999 Token →
                </Link>
              </div>
            </div>

          </div>

          {/* Mobile Swipe Dot Indicators */}
          <div className="flex md:hidden justify-center items-center gap-1.5 pt-1">
            {[0, 1, 2, 3].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  if (packagesSliderRef.current) {
                    const cardWidth = packagesSliderRef.current.clientWidth * 0.85;
                    packagesSliderRef.current.scrollTo({ left: cardWidth * dotIdx, behavior: 'smooth' });
                    setActivePackageIndex(dotIdx);
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  activePackageIndex === dotIdx ? 'w-6 bg-[#0E7490]' : 'w-2 bg-slate-300'
                }`}
                aria-label={`Go to starter kit ${dotIdx + 1}`}
              />
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span>💳</span> <strong>₹999 Booking Token:</strong> Locks in parallel CA execution. Remaining balance billed only after documentation verification.
            </span>
            <span className="flex items-center gap-1.5 text-[#073B5C] font-bold">
              <span>🛡️</span> Supervised by Empanelled Chartered Accountants & Company Secretaries
            </span>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. MAIN SERVICES DIRECTORY (MICRO-COMMITMENT CATALOG)   */}
      {/* ======================================================== */}
      <main id="catalog-section" className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 w-full flex-grow space-y-8">
        
        {/* ======================================================== */}
        {/* INTERACTIVE 3-QUESTION BUSINESS ENTITY MATCHMAKER WIZARD */}
        {/* ======================================================== */}
        <div id="wizard-section" className="bg-white rounded-3xl border-2 border-[#0E7490]/40 shadow-sm p-5 sm:p-8 space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#0E7490]/10 border border-[#0E7490]/30 px-3 py-1 rounded-full text-[11px] font-black text-[#0E7490]">
                <span>🤖</span> 30-Second Business Structure Advisor
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">
                Not Sure Which Legal Entity to Register?
              </h3>
              <p className="text-xs text-slate-500">
                Answer 3 quick questions to discover whether you need a Pvt Ltd, LLP, OPC, or Sole Proprietorship.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWizardOpen(!isWizardOpen)}
              className="text-xs font-bold text-[#0E7490] hover:text-[#073B5C] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              {isWizardOpen ? 'Minimize Helper ▲' : 'Open Entity Advisor ▼'}
            </button>
          </div>

          {isWizardOpen && (
            <div className="space-y-6">
              {/* Stepper Header Pills */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      wizardStep === 1
                        ? 'bg-[#073B5C] text-[#F4B942] shadow-xs'
                        : wizardFounders !== null
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span>{wizardFounders !== null ? '✓' : '1'}</span>
                    <span>1. Founders</span>
                  </button>

                  <span className="text-slate-300">→</span>

                  <button
                    type="button"
                    onClick={() => {
                      if (wizardFounders !== null) setWizardStep(2);
                    }}
                    disabled={wizardFounders === null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                      wizardFounders === null
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                        : wizardStep === 2
                        ? 'bg-[#073B5C] text-[#F4B942] shadow-xs cursor-pointer'
                        : wizardFunding !== null
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                        : 'bg-slate-100 text-slate-600 cursor-pointer'
                    }`}
                  >
                    <span>{wizardFunding !== null ? '✓' : '2'}</span>
                    <span>2. Capital Strategy</span>
                  </button>

                  <span className="text-slate-300">→</span>

                  <button
                    type="button"
                    onClick={() => {
                      if (wizardFounders !== null && wizardFunding !== null) setWizardStep(3);
                    }}
                    disabled={wizardFounders === null || wizardFunding === null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                      wizardFounders === null || wizardFunding === null
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                        : wizardStep === 3
                        ? 'bg-[#073B5C] text-[#F4B942] shadow-xs cursor-pointer'
                        : wizardLiability !== null
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                        : 'bg-slate-100 text-slate-600 cursor-pointer'
                    }`}
                  >
                    <span>{wizardLiability !== null ? '✓' : '3'}</span>
                    <span>3. Liability Shield</span>
                  </button>
                </div>

                {isWizardCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      setWizardFounders(null);
                      setWizardFunding(null);
                      setWizardLiability(null);
                      setWizardStep(1);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-[#073B5C] underline cursor-pointer shrink-0"
                  >
                    ↺ Reset & Start Over
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Interactive Progressive Step Questions */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  {/* STEP 1: Founders */}
                  {wizardStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 1 of 3</div>
                        <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                          How many founders or partners are starting this venture?
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Indian corporate law strictly separates single-owner entities (OPC / Sole Prop) from multi-director corporate structures (Pvt Ltd / LLP).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWizardFounders('solo');
                            setWizardStep(2);
                          }}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 sm:gap-3 group ${
                            wizardFounders === 'solo'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <span className="text-xl sm:text-2xl p-1.5 sm:p-2 bg-white rounded-xl shadow-xs shrink-0">👤</span>
                            <div>
                              <div className="text-xs sm:text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">Just Me Alone</div>
                              <div className="text-[10px] sm:text-[11px] font-bold text-[#0E7490]">Solo Entrepreneur / 1 Owner</div>
                            </div>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                            100% control, single director & shareholder. Ideal for consultants, solo creators, or freelancers (OPC / Sole Prop).
                          </p>
                          <span className="hidden sm:flex text-[11px] font-bold text-[#0E7490] items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select Solo & Continue →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWizardFounders('multi');
                            setWizardStep(2);
                          }}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 sm:gap-3 group ${
                            wizardFounders === 'multi'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <span className="text-xl sm:text-2xl p-1.5 sm:p-2 bg-white rounded-xl shadow-xs shrink-0">👥</span>
                            <div>
                              <div className="text-xs sm:text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">2 or More People</div>
                              <div className="text-[10px] sm:text-[11px] font-bold text-[#0E7490]">Co-Founders / Partners</div>
                            </div>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                            Split equity, assign board seats, and share commercial responsibilities with 2+ partners (Pvt Ltd / LLP).
                          </p>
                          <span className="hidden sm:flex text-[11px] font-bold text-[#0E7490] items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select 2+ Partners & Continue →
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Funding & Capital Strategy */}
                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 2 of 3</div>
                        <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                          What is your funding and capital growth strategy?
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Institutional VC, angel networks, and ESOP pools mandate specific share capital provisions under MCA & RBI regulations.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWizardFunding('vc');
                            setWizardStep(3);
                          }}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 group ${
                            wizardFunding === 'vc'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">🚀</span>
                            <div>
                              <div className="text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">Raise VC / Angel Capital</div>
                              <div className="text-[11px] font-bold text-[#0E7490]">Institutional Equity & ESOPs</div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Plans to pitch venture capitalists, issue preference/equity shares, issue SAFE notes, or create employee stock pools.
                          </p>
                          <span className="text-[11px] font-bold text-[#0E7490] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select External Capital →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWizardFunding('bootstrap');
                            setWizardStep(3);
                          }}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 group ${
                            wizardFunding === 'bootstrap'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">💡</span>
                            <div>
                              <div className="text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">Bootstrapped / Self-Funded</div>
                              <div className="text-[11px] font-bold text-[#0E7490]">Client Funded & Cash Flow</div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Financed from personal savings or client revenue. Priority is keeping operational compliance overhead lean and low-cost.
                          </p>
                          <span className="text-[11px] font-bold text-[#0E7490] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select Bootstrapped →
                          </span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-xs font-bold text-slate-500 hover:text-[#073B5C] flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to Question 1
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Limited Liability Protection */}
                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#0E7490]">Question 3 of 3</div>
                        <h4 className="text-base sm:text-lg font-black text-[#073B5C]">
                          Do you need complete personal asset & limited liability protection?
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Protects your personal home, bank savings, and property from business liabilities, vendor disputes, or bankruptcy.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWizardLiability('shield');
                            setWizardStep(4);
                          }}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 group ${
                            wizardLiability === 'shield'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">🛡️</span>
                            <div>
                              <div className="text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">100% Limited Liability Shield</div>
                              <div className="text-[11px] font-bold text-emerald-700">Shield Personal Wealth</div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Corporate veil legally protects your personal assets. If company suffers losses, personal wealth remains 100% untouched.
                          </p>
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select Shield & See Fit →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWizardLiability('fast');
                            setWizardStep(4);
                          }}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 group ${
                            wizardLiability === 'fast'
                              ? 'border-2 border-[#0E7490] bg-cyan-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-[#0E7490]/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">⚡</span>
                            <div>
                              <div className="text-sm font-black text-[#073B5C] group-hover:text-[#0E7490]">Fastest & Lowest Cost</div>
                              <div className="text-[11px] font-bold text-amber-700">Immediate 3-Day Launch</div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Need a GSTIN and current bank account in 3 days with zero annual MCA secretarial audits. (Sole Proprietorship / Partnership).
                          </p>
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select Fast Launch →
                          </span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-xs font-bold text-slate-500 hover:text-[#073B5C] flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to Question 2
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 / COMPLETED STATE: Summary of Answers */}
                  {wizardStep >= 4 && isWizardCompleted && (
                    <div className="space-y-4 animate-in fade-in duration-200 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">✓</span>
                          <h4 className="text-sm font-black text-[#073B5C]">Your Venture Profile Assessment Completed</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-xs font-bold text-[#0E7490] hover:underline cursor-pointer"
                        >
                          Change Answers
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div
                          onClick={() => setWizardStep(1)}
                          className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#0E7490] transition"
                        >
                          <div className="text-[10px] text-slate-400 font-bold uppercase">1. Founders</div>
                          <div className="font-extrabold text-[#073B5C] mt-0.5">
                            {wizardFounders === 'solo' ? '👤 Solo Founder' : '👥 2+ Co-Founders'}
                          </div>
                        </div>

                        <div
                          onClick={() => setWizardStep(2)}
                          className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#0E7490] transition"
                        >
                          <div className="text-[10px] text-slate-400 font-bold uppercase">2. Funding</div>
                          <div className="font-extrabold text-[#073B5C] mt-0.5">
                            {wizardFunding === 'vc' ? '🚀 VC / Angel Equity' : '💡 Bootstrapped'}
                          </div>
                        </div>

                        <div
                          onClick={() => setWizardStep(3)}
                          className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[#0E7490] transition"
                        >
                          <div className="text-[10px] text-slate-400 font-bold uppercase">3. Liability</div>
                          <div className="font-extrabold text-[#073B5C] mt-0.5">
                            {wizardLiability === 'shield' ? '🛡️ 100% Limited Shield' : '⚡ Fast / Low Cost'}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-cyan-50/60 rounded-xl border border-[#0E7490]/20 text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-base shrink-0">💡</span>
                        <span>
                          Based on Indian Corporate Law (Companies Act 2013 & LLP Act 2008), see your customized structure recommendation on the right.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Live Diagnostic Engine or Recommendation Card */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  {!isWizardCompleted ? (
                    /* Step Progress Diagnostic Card */
                    <div className="bg-gradient-to-br from-[#073B5C] via-[#052A42] to-[#041E30] text-white p-6 rounded-3xl flex flex-col justify-between space-y-5 shadow-lg border border-cyan-800 relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E7490]/20 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                            ⏳ Live Statutory Engine
                          </span>
                          <span className="text-[#F4B942] text-xs font-mono font-bold">
                            Question {wizardStep} of 3
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-white">
                            Analyzing Corporate Structure Fit
                          </h4>
                          <p className="text-xs text-cyan-200 mt-1 leading-relaxed">
                            Our engine cross-references your answers against MCA V3 thresholds, tax compliance brackets, and liability protections.
                          </p>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>Diagnostic Progress</span>
                            <span className="font-bold text-[#F4B942]">
                              {wizardStep === 1 ? '33%' : wizardStep === 2 ? '66%' : '90%'}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0E7490] to-[#F4B942] rounded-full transition-all duration-300"
                              style={{
                                width: wizardStep === 1 ? '33%' : wizardStep === 2 ? '66%' : '90%',
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Checklist Factors */}
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2.5 text-xs">
                          <strong className="text-[#F4B942] block text-[10px] uppercase tracking-wider font-extrabold">
                            Statutory Checkpoint Evaluation:
                          </strong>
                          <ul className="space-y-2 text-[11px]">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">1. Quorum & Ownership Type</span>
                              {wizardFounders !== null ? (
                                <span className="text-emerald-400 font-bold">✓ Selected</span>
                              ) : (
                                <span className="text-slate-400 font-mono">Waiting...</span>
                              )}
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">2. External Equity & ESOP Rules</span>
                              {wizardFunding !== null ? (
                                <span className="text-emerald-400 font-bold">✓ Selected</span>
                              ) : (
                                <span className="text-slate-400 font-mono">Waiting...</span>
                              )}
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">3. Corporate Veil Asset Protection</span>
                              {wizardLiability !== null ? (
                                <span className="text-emerald-400 font-bold">✓ Selected</span>
                              ) : (
                                <span className="text-slate-400 font-mono">Waiting...</span>
                              )}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 relative z-10 text-center">
                        <span className="text-xs text-slate-300">
                          👈 Complete Question {wizardStep} on the left to reveal recommendation
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Final Recommendation Card (Revealed only after user completes wizard) */
                    <div className="bg-gradient-to-br from-[#073B5C] via-[#052A42] to-[#041E30] text-white p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-lg border-2 border-[#F4B942]/60 relative overflow-hidden h-full animate-in zoom-in-95 duration-200">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4B942]/10 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="bg-[#F4B942] text-[#073B5C] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                            ⭐ Recommended Starting Point
                          </span>
                          <span className="text-emerald-400 text-xs font-bold font-mono">
                            ✓ Tailored to Profile
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                            {entityRecommendation.title}
                          </h4>
                          <p className="text-xs text-cyan-200 mt-1 leading-relaxed">
                            {entityRecommendation.tagline}
                          </p>
                        </div>

                        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
                          <strong className="text-[#F4B942] block text-[10px] uppercase tracking-wider font-extrabold">
                            Why This Fits You Best:
                          </strong>
                          <ul className="text-slate-200 space-y-1.5 text-[11px]">
                            {entityRecommendation.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Full Package Fee</span>
                          <span className="text-lg font-black text-[#F4B942]">{entityRecommendation.price}</span>
                          <span className="text-[10px] text-emerald-400 block font-bold">Start with {entityRecommendation.advanceToken} Token</span>
                        </div>

                        <Link
                          href={entityRecommendation.packageUrl}
                          className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-5 py-3 rounded-xl transition shadow text-center uppercase tracking-wider shrink-0 cursor-pointer"
                        >
                          Start for ₹999 Token →
                        </Link>
                      </div>

                      <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2 text-center">
                        Facilitation guidance. Statutory filings handled by empanelled CAs/Advocates.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

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
            onClick={() => {
              setActiveCategory('all');
              setIsAllServicesExpanded(false);
            }}
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
              onClick={() => {
                setActiveCategory(cat.id);
                setIsAllServicesExpanded(false);
              }}
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
              displayedServices.map((srv) => (
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
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium flex-wrap">
                        <span className="truncate">⏱️ {srv.sla}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold shrink-0">₹999 Token</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${getPricingModelBadge(srv.slug, srv.category).badgeClass}`}>
                          {getPricingModelBadge(srv.slug, srv.category).shortBadge}
                        </span>
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
            displayedServices.map((srv) => {
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
                      
                      {/* Statutory Pricing Transparency Pill */}
                      <div className="pt-1.5 pb-0.5">
                        <span
                          className={`inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getPricingModelBadge(srv.slug, srv.category).badgeClass}`}
                          title={getPricingModelBadge(srv.slug, srv.category).tooltip}
                        >
                          {getPricingModelBadge(srv.slug, srv.category).label}
                        </span>
                      </div>

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
        {/* Progressive Disclosure Banner for "All Verticals" (Curated 8 vs Full 58) */}
        {activeCategory === 'all' && !directorySearch.trim() && filteredServices.length > INITIAL_VISIBLE_SERVICES && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-white via-cyan-50/40 to-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-[#073B5C]">
                Showing <span className="font-black text-[#0E7490]">{displayedServices.length}</span> of <span className="font-black">{filteredServices.length}</span> Services
              </div>
              <p className="text-[11px] text-slate-500">
                {isAllServicesExpanded
                  ? 'Showing the entire catalog across Company Registration, Tax & GST, Trademark, and Legal Services.'
                  : `Showing top ${INITIAL_VISIBLE_SERVICES} popular services. Choose a category above or view all 58 offerings.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsAllServicesExpanded(!isAllServicesExpanded)}
                className="px-5 py-2.5 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>
                  {isAllServicesExpanded
                    ? '▲ Show Top 8 Services'
                    : `▼ Show All ${filteredServices.length} Services (${filteredServices.length - INITIAL_VISIBLE_SERVICES} More)`}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 6. WHY NYAYALINK 3-WAY COMPARISON MATRIX                */}
      {/* ======================================================== */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
              The NyayaLink Advantage
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Why Choose NyayaLink vs. Other Portals & Offline CAs
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Compare transparent digital execution against high upfront portals and unpredictable offline practices.
            </p>
          </div>

                    {/* Desktop Full 3-Way Comparison Table (hidden on mobile) */}
          <div className="hidden md:block rounded-3xl border-2 border-slate-200 shadow-md bg-white overflow-hidden">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[#073B5C]">
                  {/* Column 1: Dimension */}
                  <th className="py-4 px-5 align-middle w-[24%] border-r border-slate-200/80 bg-slate-50/90">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                      Execution Dimension
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Standard Operating Model</span>
                  </th>

                  {/* Column 2: NyayaLink Winner (No negative margin clipping!) */}
                  <th className="py-4 px-5 align-middle w-[32%] bg-gradient-to-b from-[#0E7490]/15 to-cyan-50/70 border-x-2 border-[#0E7490] relative shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1 bg-[#F4B942] text-[#073B5C] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs border border-amber-300">
                        ⚡ Recommended for Founders
                      </span>
                      <span className="text-[10px] font-bold text-[#0E7490] uppercase tracking-wider">
                        Pure Agent ₹0
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base font-black text-[#073B5C]">
                      <span className="w-6 h-6 rounded-lg bg-[#073B5C] text-[#F4B942] flex items-center justify-center text-xs shadow-xs">
                        ⚖️
                      </span>
                      <span>NyayaLink Portal</span>
                    </div>
                  </th>

                  {/* Column 3: Big Portals */}
                  <th className="py-4 px-5 align-middle w-[22%] border-r border-slate-200/80 bg-slate-50/60">
                    <div className="text-xs font-black text-slate-700">Big Legal Portals</div>
                    <div className="text-[10px] text-slate-400 font-normal">Vakilsearch / IndiaFilings</div>
                  </th>

                  {/* Column 4: Offline CA / Lawyer */}
                  <th className="py-4 px-5 align-middle w-[22%] bg-slate-50/60">
                    <div className="text-xs font-black text-slate-700">Traditional Offline CA</div>
                    <div className="text-[10px] text-slate-400 font-normal">Independent Practice</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Row 1: Advance Booking Model */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        💳
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Advance Booking Model
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Token Commitment
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          ₹999 Split-Ticket Token
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Pay balance only after drafting verification & official MCA name approval.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          100% Locked Upfront
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          ₹7,000–₹12,000 paid before drafting or filing begins.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Unclear Cash Advances
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Open-ended hourly retainers or lump-sum advances.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 2: Statutory Stamp Duty */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        🏛️
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Statutory Stamp Duty
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Rule 33 Compliance
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          Pure Agent ₹0 Markup
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          State duty passed-through at exact govt receipt (Rule 33 statutory pass-through).
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Hidden Portal Markups
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Inflated state stamp fees and surprise checkout additions.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Unitemized Out-of-Pocket
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Opaque reimbursement claims with uncertain state stamp duty.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 3: Legal Supervision */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        ⚖️
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Legal Supervision
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Filing Authority
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          Empanelled CA & Advocate Desk
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Every dossier signed and filed by licensed corporate practitioners.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Call-Center Sales Reps
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Junior relationship coordinators reading scripted FAQs.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Experienced Practitioner
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Competent, but hard to reach during peak corporate tax seasons.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 4: Live Status Tracking */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        📡
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Live Status Tracking
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Real-time Room
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          Real-Time SRN Tracking Room
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Live MCA V3, GSTN & IP India status sync directly in your vault.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Delayed Email Queues
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Manual ticket replies with opaque queue status.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Manual Follow-ups
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Frequent phone calls required with uncertain timelines.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 5: Document Security */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        🔐
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Document Security
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Storage & Vault
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          256-Bit SSL Lifetime Vault
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Permanent cloud storage for COI, PAN, TAN & annual filings.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Expiring Download Links
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Temporary email download links expiring after 30 to 60 days.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          Physical Paper Files
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Physical files prone to misplacement, tears, or wear.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 6: Turnaround SLA Guarantee */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 align-top border-r border-slate-200/80 bg-slate-50/30">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        ⏱️
                      </span>
                      <div>
                        <span className="font-black text-[#073B5C] text-xs block leading-snug">
                          Turnaround SLA Guarantee
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Delivery Timeline
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        ✓
                      </span>
                      <div>
                        <strong className="text-xs font-black text-[#073B5C] block leading-snug">
                          3–7 Working Days Guaranteed
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Automated 4-hour SLA orphan escalation to senior CS desk.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top border-r border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          10–20 Days Average
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Severe delays due to mass call-center backlogs.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✕
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-700 block leading-snug">
                          2–4 Weeks Turnaround
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Subject to practitioner's offline litigation workload.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          {/* Desktop Trust Strip */}
          <div className="hidden md:flex bg-gradient-to-r from-[#073B5C] via-[#052A42] to-[#073B5C] text-white p-5 rounded-3xl items-center justify-between gap-4 shadow-sm border border-cyan-800/40">
            <div className="space-y-0.5">
              <span className="text-[#F4B942] font-black text-xs uppercase tracking-wider block">
                Rule 33 Pure Agent Transparency Guarantee
              </span>
              <p className="text-xs text-slate-200">
                You never pay marked-up government stamp duties or surprise filing charges. Original MCA and GSTN challans are delivered directly to your vault.
              </p>
            </div>
            <Link
              href="/#catalog-section"
              className="px-5 py-2.5 bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs rounded-xl shadow transition shrink-0 uppercase tracking-wider"
            >
              Start Any Filing for ₹999 →
            </Link>
          </div>

          {/* Mobile Head-to-Head Comparison Experience (md:hidden) */}
          <div className="md:hidden space-y-4">
            {/* Segmented Competitor Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between text-xs font-bold">
              <span className="text-[11px] text-slate-500 pl-2 font-semibold">Compare vs:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setComparisonCompetitor('portals')}
                  className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition cursor-pointer ${
                    comparisonCompetitor === 'portals'
                      ? 'bg-[#073B5C] text-[#F4B942] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Big Portals
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonCompetitor('offline')}
                  className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition cursor-pointer ${
                    comparisonCompetitor === 'offline'
                      ? 'bg-[#073B5C] text-[#F4B942] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Offline CA / Lawyer
                </button>
              </div>
            </div>

            {/* Focused 2-Column Side-by-Side Comparison Cards */}
            <div className="space-y-2.5">
              {[
                {
                  icon: '💳',
                  title: 'Advance Booking Model',
                  nyayalinkTitle: '₹999 Token',
                  nyayalinkDesc: 'Pay balance only after draft approval',
                  competitorTitle: comparisonCompetitor === 'portals' ? '100% Upfront' : 'Unclear Advances',
                  competitorDesc: comparisonCompetitor === 'portals' ? '₹7k–₹12k locked before start' : 'Hourly retainers or cash',
                },
                {
                  icon: '🏛️',
                  title: 'Statutory Stamp Duty',
                  nyayalinkTitle: 'Pure Agent ₹0 Markup',
                  nyayalinkDesc: 'Exact state govt receipt pass-through',
                  competitorTitle: comparisonCompetitor === 'portals' ? 'Hidden Markups' : 'Unitemized Out-of-Pocket',
                  competitorDesc: comparisonCompetitor === 'portals' ? 'Surprise fees added later' : 'Opaque expense claims',
                },
                {
                  icon: '⚖️',
                  title: 'Legal Supervision',
                  nyayalinkTitle: 'Empanelled CA Desk',
                  nyayalinkDesc: 'Direct licensed practitioner filing',
                  competitorTitle: comparisonCompetitor === 'portals' ? 'Call-Center Reps' : 'Hard to Reach',
                  competitorDesc: comparisonCompetitor === 'portals' ? 'Junior sales support agents' : 'Busy during peak tax season',
                },
                {
                  icon: '📡',
                  title: 'Live Status Tracking',
                  nyayalinkTitle: 'Real-Time SRN Room',
                  nyayalinkDesc: 'Live MCA V3 & GSTN sync in vault',
                  competitorTitle: comparisonCompetitor === 'portals' ? 'Opaque Queue' : 'Manual Phone Calls',
                  competitorDesc: comparisonCompetitor === 'portals' ? 'Delayed email ticket answers' : 'Unpredictable follow-up cycles',
                },
                {
                  icon: '🔐',
                  title: 'Document Security',
                  nyayalinkTitle: 'Lifetime Cloud Vault',
                  nyayalinkDesc: '256-Bit SSL permanent repository',
                  competitorTitle: comparisonCompetitor === 'portals' ? 'Expiring Links' : 'Paper Files',
                  competitorDesc: comparisonCompetitor === 'portals' ? 'Downloads vanish after 30d' : 'Vulnerable to loss or wear',
                },
                {
                  icon: '⏱️',
                  title: 'Turnaround SLA',
                  nyayalinkTitle: '3–7 Days SLA',
                  nyayalinkDesc: '4h automated orphan escalation',
                  competitorTitle: comparisonCompetitor === 'portals' ? '10–20 Days' : '2–4 Weeks',
                  competitorDesc: comparisonCompetitor === 'portals' ? 'Call-center queue backlogs' : 'Depends on offline workload',
                },
              ].map((row, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{row.icon}</span>
                    <span className="font-extrabold text-[#073B5C] text-xs">{row.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    {/* NyayaLink Winner */}
                    <div className="p-2.5 bg-cyan-50/80 border-2 border-[#0E7490] rounded-xl space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#073B5C] text-[9px] uppercase tracking-wider">NyayaLink</span>
                        <span className="bg-[#F4B942] text-[#073B5C] text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">Best</span>
                      </div>
                      <div className="font-black text-[#073B5C] text-[11px] leading-tight">
                        ✓ {row.nyayalinkTitle}
                      </div>
                      <div className="text-[10px] text-slate-600 leading-snug">
                        {row.nyayalinkDesc}
                      </div>
                    </div>

                    {/* Competitor */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                          {comparisonCompetitor === 'portals' ? 'Big Portals' : 'Offline CA'}
                        </span>
                        <span className="bg-rose-100 text-rose-700 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase">✕</span>
                      </div>
                      <div className="font-bold text-rose-700 text-[11px] leading-tight">
                        {row.competitorTitle}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">
                        {row.competitorDesc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <Link
              href="/#catalog-section"
              className="block w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-xl text-center uppercase tracking-wider shadow-xs transition"
            >
              Start Any Filing for ₹999 Token →
            </Link>
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
      {/* 7.1 VERIFIED FOUNDER REVIEWS & SOCIAL PROOF              */}
      {/* ======================================================== */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header & Overall Rating Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
                Verified Founder Reviews
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
                Trusted by 50,000+ Founders Across 28 States
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                Real feedback from Indian entrepreneurs, D2C brands, and growth-stage companies who incorporated and protected their IP with NyayaLink.
              </p>
            </div>

            {/* Overall Rating Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-xs">
              <div className="text-center">
                <span className="text-2xl font-black text-[#073B5C] block">4.9 / 5</span>
                <span className="text-amber-500 text-sm tracking-tighter">★★★★★</span>
              </div>
              <div className="border-l border-slate-200 pl-4 text-left">
                <strong className="text-xs font-bold text-slate-800 block">Google & Trustpilot Verified</strong>
                <span className="text-[10px] text-slate-500">2,400+ Independent Client Ratings</span>
              </div>
            </div>
          </div>

          {/* 4 Testimonials Grid */}
          {/* 5 VERIFIED FOUNDER REVIEWS: HORIZONTAL AUTO-SLIDING CAROUSEL */}
          <div className="space-y-4">
            {/* Mobile Auto-Sliding Single Review Card (sm:hidden) */}
            <div className="sm:hidden">
              <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 shadow-sm min-h-[190px] flex flex-col justify-between transition-all duration-500 animate-in fade-in">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500 text-xs tracking-tight">
                      {FOUNDER_REVIEWS[activeReviewIndex].stars}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                      ✓ Verified Founder
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">
                    {FOUNDER_REVIEWS[activeReviewIndex].quote}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <strong className="block text-[#073B5C] font-extrabold text-xs">
                      {FOUNDER_REVIEWS[activeReviewIndex].name}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      {FOUNDER_REVIEWS[activeReviewIndex].role}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0E7490] bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 shrink-0">
                    {FOUNDER_REVIEWS[activeReviewIndex].service}
                  </span>
                </div>
              </div>

              {/* Mobile Carousel Navigation & Dot Indicators */}
              <div className="flex items-center justify-between pt-3 px-1">
                <div className="flex items-center gap-1.5">
                  {FOUNDER_REVIEWS.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveReviewIndex(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeReviewIndex === dotIdx
                          ? 'w-6 bg-[#073B5C]'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to review ${dotIdx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewIndex((prev) => (prev - 1 + FOUNDER_REVIEWS.length) % FOUNDER_REVIEWS.length)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center text-xs font-bold text-[#073B5C] active:bg-slate-100"
                    aria-label="Previous review"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveReviewIndex((prev) => (prev + 1) % FOUNDER_REVIEWS.length)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center text-xs font-bold text-[#073B5C] active:bg-slate-100"
                    aria-label="Next review"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop / Tablet Grid (Hidden on Mobile) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {FOUNDER_REVIEWS.map((rev, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-amber-500 text-xs tracking-tight">{rev.stars}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                        ✓ Verified Customer
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {rev.quote}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    <strong className="block text-[#073B5C] font-extrabold text-xs">{rev.name}</strong>
                    <span className="text-[10px] text-slate-500 block">{rev.role}</span>
                    <span className="text-[10px] font-bold text-[#0E7490] mt-0.5 inline-block">{rev.service}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. HOMEPAGE FAQS (CURATED 4 QUESTIONS + FULL KNOWLEDGE BASE LINK) */}
      {/* ======================================================== */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Quick answers to the most common legal & filing questions.</p>
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
