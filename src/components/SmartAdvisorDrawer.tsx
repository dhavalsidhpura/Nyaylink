'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/lib/constants';

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
    entity: 'GST Registration (15-Digit GSTIN)',
    slug: 'gst-registration',
    summary: 'Mandatory for selling goods online interstate. Includes 15-digit GSTIN, HSN/SAC mapping, and REG-06 certificate.',
    mandatoryDocs: ['PAN Card', 'Aadhaar Card', 'Electricity Bill / NOC', 'Bank Cancelled Cheque'],
    advancePrice: 999,
    totalPrice: 1499,
    sla: '3 - 7 Working Days',
  },
  {
    id: 'cloud-kitchen',
    label: 'Cloud Kitchen & Food Brand',
    icon: '🍳',
    entity: 'FSSAI Food License (FoSCoS)',
    slug: 'fssai-food-license',
    summary: 'Required by Swiggy, Zomato, and municipal health inspectors before commercial cooking operations begin.',
    mandatoryDocs: ['Photo & ID Proof', 'Premises Rent Agreement', 'Food Category List', 'Water Test Report'],
    advancePrice: 999,
    totalPrice: 1999,
    sla: '3 - 7 Working Days',
  },
  {
    id: 'tech-saas',
    label: 'AI SaaS / Tech Startup',
    icon: '🤖',
    entity: 'Private Limited Company',
    slug: 'private-limited-company',
    summary: 'Limited liability shield for equity dilution, ESOPs, and angel/VC funding. Includes RUN name, 2 DINs, PAN, TAN, and 2 DSCs.',
    mandatoryDocs: ['2 Director PANs & Aadhaar', 'Bank Statements (< 2 mo)', 'Registered Office Utility Bill'],
    advancePrice: 999,
    totalPrice: 6999,
    sla: '7 - 10 Working Days',
  },
  {
    id: 'freelancer',
    label: 'Consultant / Freelancer',
    icon: '💼',
    entity: 'Sole Proprietorship / Shop Setup',
    slug: 'business-registration-license',
    summary: 'Lowest compliance cost for solo developers, designers, and consultants billing domestic or international clients.',
    mandatoryDocs: ['PAN Card', 'Aadhaar Card', 'Commercial Address Proof', 'Bank Cheque'],
    advancePrice: 999,
    totalPrice: 1999,
    sla: '3 - 7 Working Days',
  },
  {
    id: 'partners',
    label: '2+ Partners (Bootstrapped)',
    icon: '🤝',
    entity: 'Limited Liability Partnership (LLP)',
    slug: 'llp-registration',
    summary: 'Corporate liability shield without heavy annual secretarial burden until ₹40 Lakh turnover.',
    mandatoryDocs: ['Partner PANs & Aadhaar', 'Office Proof & NOC', 'Partner Address Proofs'],
    advancePrice: 999,
    totalPrice: 4999,
    sla: '10 - 14 Working Days',
  },
];

export default function SmartAdvisorDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'advisor' | 'callback'>('advisor');
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>(PRESET_OPTIONS[0]);
  const [userQuery, setUserQuery] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = original;
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('nyaylink_open_advisor', handleOpen);
    return () => window.removeEventListener('nyaylink_open_advisor', handleOpen);
  }, []);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.length < 10) return;
    setIsSubmitting(true);
    setCallbackError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: callbackName.trim().length >= 2 ? callbackName.trim() : 'Advisor Callback Lead',
          phone: callbackPhone,
          complianceType: selectedPreset.entity,
          source: 'smart_advisor_drawer',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCallbackError(data.error || 'Could not save your callback request. Please try WhatsApp.');
        return;
      }
      setCallbackSubmitted(true);
    } catch {
      setCallbackError('Network error while submitting request. Please reach us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPresets = userQuery.trim()
    ? PRESET_OPTIONS.filter(
        (p) =>
          p.label.toLowerCase().includes(userQuery.toLowerCase()) ||
          p.entity.toLowerCase().includes(userQuery.toLowerCase()) ||
          p.summary.toLowerCase().includes(userQuery.toLowerCase())
      )
    : PRESET_OPTIONS;

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/ca') ||
    pathname?.startsWith('/lawyer/dashboard') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/unauthorized')
  ) {
    return null;
  }

  return (
    <>
      {/* Subtle Docked Trigger Button (No auto-popup interruption) */}
      <aside aria-label="Quick Advisory Help" className="hidden md:flex fixed bottom-6 right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#073B5C] hover:bg-[#0A4E7A] text-white px-4 py-2.5 rounded-full shadow-lg border border-cyan-400/40 hover:border-[#F4B942] transition-colors cursor-pointer text-xs font-bold"
          aria-label="Open Legal Structure Helper"
        >
          <span>⚖️</span>
          <span>Need Help Choosing?</span>
        </button>
      </aside>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 print:hidden flex justify-end" role="dialog" aria-modal="true" aria-label="NyayaLink Quick Advisor">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-white text-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden">
            <div className="bg-[#073B5C] text-white p-5 flex items-center justify-between border-b border-cyan-900">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 bg-white/10 rounded-xl">⚖️</span>
                <div>
                  <h3 className="font-black text-sm text-white">NyayaLink Quick Advisor</h3>
                  <span className="text-xs text-cyan-200">Pick a business model or request a CA callback</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition cursor-pointer"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('advisor')}
                className={`flex-1 py-3 text-center transition cursor-pointer ${
                  activeTab === 'advisor' ? 'bg-white text-[#073B5C] border-b-2 border-[#0E7490] font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quick Recommender
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('callback')}
                className={`flex-1 py-3 text-center transition cursor-pointer ${
                  activeTab === 'callback' ? 'bg-white text-[#073B5C] border-b-2 border-[#0E7490] font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Request Callback
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {activeTab === 'advisor' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 text-xs">Search business type</label>
                    <input
                      type="text"
                      placeholder="e.g. cloud kitchen, e-com, SaaS..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(filteredPresets.length > 0 ? filteredPresets : PRESET_OPTIONS).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                          selectedPreset.id === preset.id ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#0E7490] block">Recommended Filing</span>
                      <strong className="text-base font-black text-[#073B5C] block mt-0.5">{selectedPreset.entity}</strong>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{selectedPreset.summary}</p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[11px] text-slate-500 uppercase font-bold block">Basic Documents:</span>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {selectedPreset.mandatoryDocs.map((doc, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div>
                        <span className="text-slate-500">Professional Fee:</span>
                        <strong className="text-sm font-black text-[#073B5C] block">₹{selectedPreset.totalPrice.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">Timeline:</span>
                        <span className="font-mono font-bold text-slate-800 block">{selectedPreset.sla}</span>
                      </div>
                    </div>

                    <Link
                      href={`/services/${selectedPreset.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-center py-3 rounded-xl uppercase tracking-wider text-xs transition shadow"
                    >
                      View & Start (₹{selectedPreset.advancePrice} Token) →
                    </Link>
                  </div>
                </>
              )}

              {activeTab === 'callback' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                    <strong className="text-sm font-black text-[#073B5C] block">Speak Directly to a Practicing CA</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      10-minute discovery call during business hours (Mon–Sat 9AM–7PM IST). No automated call centers.
                    </p>
                  </div>

                  {callbackSubmitted ? (
                    <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl text-center text-xs font-bold border border-emerald-200 space-y-2">
                      <div className="text-2xl">✅</div>
                      <strong>Callback Request Received</strong>
                      <p className="text-xs text-emerald-800 font-normal">
                        Our compliance desk will reach out shortly during business hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCallbackSubmit} className="space-y-3">
                      {callbackError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                          {callbackError}
                        </div>
                      )}
                      <div>
                        <label className="block font-bold text-[#073B5C] mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          minLength={2}
                          placeholder="e.g. Rahul Sharma"
                          value={callbackName}
                          onChange={(e) => setCallbackName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#073B5C] mb-1">10-Digit Mobile Number *</label>
                        <div className="flex">
                          <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl px-3 py-3 text-xs font-bold text-slate-600 flex items-center">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            value={callbackPhone}
                            onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full bg-slate-50 border border-slate-300 rounded-r-xl p-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || callbackPhone.length < 10 || callbackName.trim().length < 2}
                        className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
                      >
                        {isSubmitting ? 'Submitting...' : 'Request Callback →'}
                      </button>

                      <div className="text-center pt-1">
                        <a
                          href={BRAND.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold text-xs underline"
                        >
                          💬 Or message us directly on WhatsApp
                        </a>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-3 border-t border-slate-200 text-center text-xs text-slate-500">
              {BRAND.name} · Supervised by practicing CAs &amp; Advocates
            </div>
          </div>
        </div>
      )}
    </>
  );
}
