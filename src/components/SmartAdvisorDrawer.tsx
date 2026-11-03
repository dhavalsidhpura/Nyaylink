'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PresetOption {
  id: string;
  label: string;
  icon: string;
  entity: string;
  slug: string;
  summary: string;
  mandatoryDocs: string[];
  advancePrice: number;
  totalPrice: number;
  sla: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'ecommerce',
    label: 'Amazon / Flipkart Seller',
    icon: '🛒',
    entity: 'GSTIN + IEC + Brand Trademark',
    slug: 'gst-registration',
    summary: 'Mandatory for selling goods online interstate. Includes 15-digit GSTIN, lifetime DGFT Import Export Code, and MSME 50% trademark subsidy.',
    mandatoryDocs: ['PAN Card', 'Aadhaar Card', 'Electricity Bill / NOC', 'Bank Cancelled Cheque'],
    advancePrice: 999,
    totalPrice: 2499,
    sla: '3 - 5 Working Days',
  },
  {
    id: 'cloud-kitchen',
    label: 'Cloud Kitchen & Food Brand',
    icon: '🍳',
    entity: 'FSSAI State / Basic + GSTIN + Shop Act',
    slug: 'fssai-food-license',
    summary: 'Required by Swiggy, Zomato, and local municipal health inspectors before commercial cooking operations begin.',
    mandatoryDocs: ['Kitchen Layout Plan', 'Premises Rent Agreement', 'Water Test Report', 'ID Proof'],
    advancePrice: 999,
    totalPrice: 3499,
    sla: '5 - 10 Working Days',
  },
  {
    id: 'tech-saas',
    label: 'AI SaaS / Tech Startup',
    icon: '🤖',
    entity: 'Private Limited Company (DPIIT Ready)',
    slug: 'private-limited-company',
    summary: 'Limited liability shield for equity dilution, ESOPs, and institutional angel/VC funding. Includes RUN name, 2 DINs, PAN, TAN, and 48-hr bank account.',
    mandatoryDocs: ['2 Director PANs & Aadhaar', 'Bank Statements (< 2 mo)', 'Registered Office Utility Bill'],
    advancePrice: 999,
    totalPrice: 6999,
    sla: '5 - 7 Working Days',
  },
  {
    id: 'freelancer',
    label: 'Consultant / Freelancer',
    icon: '💼',
    entity: 'Sole Proprietorship / Section 44ADA',
    slug: 'proprietorship-setup',
    summary: 'Lowest compliance cost for solo developers, designers, and marketing experts billing domestic or international clients (0% GST LUT export).',
    mandatoryDocs: ['PAN Card', 'Aadhaar Card', 'Bank Cheque'],
    advancePrice: 999,
    totalPrice: 1999,
    sla: '2 - 3 Working Days',
  },
  {
    id: 'partners',
    label: '2+ Partners (Bootstrapped)',
    icon: '🤝',
    entity: 'Limited Liability Partnership (LLP)',
    slug: 'llp-registration',
    summary: 'Corporate liability shield without the heavy statutory audit and secretarial burden of a Pvt Ltd until ₹40 Lakh turnover.',
    mandatoryDocs: ['Partner PANs & Aadhaar', 'Partnership Agreement Draft', 'Office Proof'],
    advancePrice: 999,
    totalPrice: 5999,
    sla: '7 - 10 Working Days',
  },
];

export default function SmartAdvisorDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>(PRESET_OPTIONS[0]);
  const [userQuery, setUserQuery] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gentle auto-peek after 35s of reading homepage (once per session)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = sessionStorage.getItem('nyaya_advisor_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 35000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismissPrompt = () => {
    setHasPrompted(false);
    sessionStorage.setItem('nyaya_advisor_dismissed', 'true');
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.length < 10) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quick Drawer Lead',
          phone: callbackPhone,
          serviceNeeded: selectedPreset.entity,
          source: 'smart_advisor_drawer',
        }),
      });
      setCallbackSubmitted(true);
    } catch {
      setCallbackSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic filter when user types in search
  const filteredPresets = userQuery.trim()
    ? PRESET_OPTIONS.filter(
        (p) =>
          p.label.toLowerCase().includes(userQuery.toLowerCase()) ||
          p.entity.toLowerCase().includes(userQuery.toLowerCase()) ||
          p.summary.toLowerCase().includes(userQuery.toLowerCase())
      )
    : PRESET_OPTIONS;

  return (
    <>
      {/* 1. DOCKED FLOATING BUTTON (BOTTOM RIGHT) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 print:hidden flex flex-col items-end gap-2">
        
        {/* Gentle Auto-Prompt Tooltip (Non-intrusive) */}
        {hasPrompted && !isOpen && (
          <div className="bg-white text-slate-800 p-3.5 rounded-2xl shadow-2xl border-2 border-[#0E7490] max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#073B5C]">
                <span className="text-base">⚡</span>
                <span>Unsure which entity to start?</span>
              </div>
              <button
                type="button"
                onClick={handleDismissPrompt}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none p-1"
                aria-label="Dismiss prompt"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Tap here to get an instant 2026 AI compliance recommendation or talk directly to a practicing CA.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setHasPrompted(false);
              }}
              className="mt-2 w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-2 rounded-xl transition text-center"
            >
              Open AI Recommender →
            </button>
          </div>
        )}

        {/* Trigger Pill */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setHasPrompted(false);
          }}
          className="group flex items-center gap-2.5 bg-[#073B5C] hover:bg-[#0A4E7A] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl border border-cyan-400/40 hover:border-[#F4B942] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Toggle AI Legal Advisor"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-base leading-none">⚖️</span>
          <div className="text-left">
            <span className="block text-[11px] font-black leading-tight text-white group-hover:text-[#F4B942]">
              AI Advisor &amp; CA Desk
            </span>
            <span className="block text-[9px] text-cyan-200 leading-none">
              Instant Guidance
            </span>
          </div>
        </button>
      </div>

      {/* 2. SLIDE-OUT POP-OUT DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 print:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white text-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="bg-[#073B5C] text-white p-5 flex items-center justify-between border-b border-cyan-900">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 bg-white/10 rounded-xl">🤖</span>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>NyayaLink AI Recommender</span>
                    <span className="text-[10px] bg-[#F4B942] text-[#073B5C] font-black px-1.5 py-0.2 rounded">
                      2026
                    </span>
                  </h3>
                  <span className="text-[11px] text-cyan-200">
                    Find the exact licenses &amp; legal structure you need
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Quick Access Utility Strip */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] font-bold">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-[#073B5C] hover:text-[#0E7490] flex items-center gap-1 hover:underline"
              >
                <span>🔑</span> Client Log In
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/tools/track-status"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-[#073B5C] flex items-center gap-1 hover:underline"
              >
                <span>📦</span> Track SRN / Order
              </Link>
              <span className="text-slate-300">|</span>
              <a
                href="https://wa.me/919920054785?text=Hello%20NyayaLink%2C%20I%20need%20help%20deciding%20which%20service%20I%20need."
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-extrabold hover:underline"
              >
                <span>💬</span> WhatsApp CA
              </a>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              
              {/* Question / Filter */}
              <div className="space-y-2">
                <label className="block font-black text-slate-800 text-xs">
                  What type of business are you starting or running?
                </label>
                <input
                  type="text"
                  placeholder="Type (e.g. cloud kitchen, e-com, ai app)..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              {/* Preset Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Select a Business Model:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(filteredPresets.length > 0 ? filteredPresets : PRESET_OPTIONS).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        selectedPreset.id === preset.id
                          ? 'bg-[#073B5C] text-[#F4B942] shadow-sm font-extrabold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="bg-gradient-to-br from-slate-50 via-cyan-50/20 to-amber-50/20 rounded-2xl p-4 border-2 border-[#0E7490]/30 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                      Recommended Legal Structure
                    </span>
                    <strong className="text-sm font-black text-[#073B5C] block mt-0.5">
                      {selectedPreset.entity}
                    </strong>
                  </div>
                  <span className="text-2xl p-1.5 bg-white rounded-xl shadow-xs border border-slate-200">
                    {selectedPreset.icon}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {selectedPreset.summary}
                </p>

                {/* Checklist */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">
                    Required Basic Documents:
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-0.5">
                    {selectedPreset.mandatoryDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & SLA */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium">Professional Fee:</span>
                    <strong className="text-sm font-black text-[#073B5C] block">
                      ₹{selectedPreset.totalPrice.toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium">Est. Delivery:</span>
                    <span className="font-mono font-bold text-slate-800 block">
                      ⏱️ {selectedPreset.sla}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <Link
                  href={`/services/${selectedPreset.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-center py-3 rounded-xl uppercase tracking-wider text-xs transition shadow"
                >
                  Start for ₹{selectedPreset.advancePrice} Token →
                </Link>
              </div>

              {/* Alternative: Talk to CA Callback Form */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <div>
                    <strong className="text-xs font-black text-[#073B5C] block">
                      Prefer Speaking to a Chartered Accountant?
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      100% Zero-Spam Promise • Direct CA advisory
                    </span>
                  </div>
                </div>

                {callbackSubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-center text-xs font-bold border border-emerald-200">
                    ✅ Request Received! Our Senior CA will call you within 15 minutes.
                  </div>
                ) : (
                  <form onSubmit={handleCallbackSubmit} className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter 10-digit phone"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || callbackPhone.length < 10}
                      className="bg-[#0E7490] hover:bg-[#073B5C] disabled:bg-slate-300 text-white font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      {isSubmitting ? '...' : 'Call Me'}
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="bg-slate-100 p-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
              NyayaLink Compliance Engine • Supervised by practicing CAs &amp; Advocates
            </div>

          </div>
        </div>
      )}
    </>
  );
}
