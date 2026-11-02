'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface TrackedStatutoryItem {
  id: string;
  category: 'TRADEMARK' | 'FSSAI' | 'DIR3_KYC' | 'INC20A' | 'GST_LUT' | 'IEC' | 'SHOP_ACT';
  title: string;
  identifier: string;
  validitySpan: string;
  issuedDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'COMPLETED';
  statutoryAct: string;
  riskDescription: string;
  penaltyAmount: string;
  renewalFee: string;
  actionUrl?: string;
}

const DEFAULT_TRACKED_ITEMS: TrackedStatutoryItem[] = [
  {
    id: 'fssai-01',
    category: 'FSSAI',
    title: 'FOSCOS State Food Business License',
    identifier: 'Lic #11524034000891 (Cloud Kitchen & Packaged Goods)',
    validitySpan: '1 to 5 Years',
    issuedDate: '15 Dec 2025',
    expiryDate: '15 Dec 2026',
    daysRemaining: 42,
    status: 'WARNING',
    statutoryAct: 'Section 31, Food Safety and Standards Act, 2006',
    riskDescription: 'Must be renewed at least 30 days prior to expiry on FoSCoS portal. Filing within 1–30 days incurs ₹100/day late penalty. Post-expiry filing is rejected and requires fresh application.',
    penaltyAmount: '₹100/day late fine + ₹5,00,000 unlicenced seizure penalty',
    renewalFee: '₹1,499 Renewal Token',
    actionUrl: '/#catalog-section',
  },
  {
    id: 'dir3-01',
    category: 'DIR3_KYC',
    title: 'Director Annual DIR-3 KYC',
    identifier: 'DIN 09841203 (Dhaval Sidhpura)',
    validitySpan: 'Annual (Every 30 September)',
    issuedDate: '01 Oct 2025',
    expiryDate: '30 Sep 2027',
    daysRemaining: 331,
    status: 'SAFE',
    statutoryAct: 'Section 157 & Rule 12A, Companies (Appointment and Qualification of Directors) Rules',
    riskDescription: 'Every DIN holder must file annual web KYC. Missing the September 30 deadline permanently deactivates the director DIN and triggers a non-compoundable late fee.',
    penaltyAmount: 'Flat ₹5,000 per DIN + Automatic DIN Deactivation',
    renewalFee: '₹799 per Director',
    actionUrl: '/#catalog-section',
  },
  {
    id: 'tm-01',
    category: 'TRADEMARK',
    title: 'Trademark Registration (Brand & Device Mark)',
    identifier: 'App #5910248 (Class 42 — LegalTech & Cloud Software)',
    validitySpan: '10 Years (Decennial Cycle)',
    issuedDate: '14 Oct 2024',
    expiryDate: '14 Oct 2034',
    daysRemaining: 2872,
    status: 'SAFE',
    statutoryAct: 'Section 25, Trade Marks Act, 1999 (Form TM-R)',
    riskDescription: 'Trademarks remain valid for 10 years. Form TM-R must be filed within 6 months prior to expiry. If not renewed, the mark is advertised in the TM Journal as removed and opens up to squatters.',
    penaltyAmount: 'Loss of exclusive trademark ownership + ₹4,500 restoration surcharge',
    renewalFee: '₹2,999 Form TM-R Desk',
    actionUrl: '/#catalog-section',
  },
  {
    id: 'gst-lut-01',
    category: 'GST_LUT',
    title: 'GST Letter of Undertaking (LUT)',
    identifier: 'LUT-MH-2026-00491 (Export Services without IGST)',
    validitySpan: '1 Financial Year (Expires 31 March)',
    issuedDate: '01 Apr 2026',
    expiryDate: '31 Mar 2027',
    daysRemaining: 148,
    status: 'SAFE',
    statutoryAct: 'Rule 96A, CGST Rules, 2017',
    riskDescription: 'Mandatory for all IT exporters and freelancers to invoice international clients without 18% IGST. Expires automatically on March 31 of each financial year.',
    penaltyAmount: '18% IGST blocked upfront on all foreign wire transfers',
    renewalFee: '₹999 Annual Filing',
    actionUrl: '/#catalog-section',
  },
  {
    id: 'inc20a-01',
    category: 'INC20A',
    title: 'MCA Form INC-20A (Commencement of Business)',
    identifier: 'SRN AA9182301 (Post-Incorporation Compliance)',
    validitySpan: '180 Days Mandatory Milestone',
    issuedDate: '15 May 2026',
    expiryDate: '11 Nov 2026',
    daysRemaining: 0,
    status: 'COMPLETED',
    statutoryAct: 'Section 10A, Companies Act, 2013',
    riskDescription: 'Mandatory proof of paid-up capital deposit by subscribers within 180 days. Successfully filed and certified by CRC.',
    penaltyAmount: 'Zero Penalty (Saved ₹50,000 corporate penalty + ₹1,000/day director fine)',
    renewalFee: 'Completed',
  },
];

export default function StatutoryExpiryRadar({
  userPhone,
  userEmail,
}: {
  userPhone?: string | null;
  userEmail?: string;
}) {
  const [items, setItems] = useState<TrackedStatutoryItem[]>(DEFAULT_TRACKED_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WARNING' | 'SAFE'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<TrackedStatutoryItem['category']>('TRADEMARK');
  const [formTitle, setFormTitle] = useState('');
  const [formIdentifier, setFormIdentifier] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');

  const warningCount = items.filter((i) => i.status === 'WARNING' || i.status === 'CRITICAL').length;
  const safeCount = items.filter((i) => i.status === 'SAFE').length;

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'WARNING') return item.status === 'WARNING' || item.status === 'CRITICAL';
    if (activeFilter === 'SAFE') return item.status === 'SAFE';
    return true;
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formIdentifier || !formExpiryDate) {
      alert('Please fill out all fields to activate monitoring.');
      return;
    }

    const expiryTime = new Date(formExpiryDate).getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)));

    let status: TrackedStatutoryItem['status'] = 'SAFE';
    if (daysRemaining <= 60) status = 'WARNING';
    if (daysRemaining <= 15) status = 'CRITICAL';

    const newItem: TrackedStatutoryItem = {
      id: `custom-${Date.now()}`,
      category: formCategory,
      title: formTitle,
      identifier: formIdentifier,
      validitySpan: formCategory === 'TRADEMARK' ? '10 Years' : formCategory === 'FSSAI' ? '1-5 Years' : 'Annual',
      issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: new Date(formExpiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      daysRemaining,
      status,
      statutoryAct: 'Monitored under Indian Corporate & IP Registry',
      riskDescription: 'Monitored by NyayaLink Automated Radar with WhatsApp and email alerts before deadlines.',
      penaltyAmount: 'Protected against statutory late fines',
      renewalFee: '₹999 Token',
      actionUrl: '/#catalog-section',
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    setFormTitle('');
    setFormIdentifier('');
    setFormExpiryDate('');

    setToastMessage(`🎉 Successfully linked ${newItem.title}! Automated WhatsApp & Email radar is now active.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-base">✕</button>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#073B5C] via-[#0A4E78] to-[#0E7490] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-cyan-800/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                LIFETIME COMPLIANCE RADAR
              </span>
              <span className="text-xs text-cyan-200">MCA V3 · IP India · FoSCoS · GSTN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black pt-1">
              Statutory Expiry &amp; Renewal Engine
            </h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>+</span> Link Existing License / Mark
          </button>
        </div>

        <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-3xl">
          Never lose your trademark or incur government penalties again. NyayaLink tracks every license, trademark, DIN KYC, and corporate return in your vault. Automated alerts are dispatched to WhatsApp &amp; Email at <strong>T-90, T-30, and T-7 days</strong> before statutory expirations.
        </p>

        {/* METRIC STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-cyan-200 uppercase font-black block">Active Licenses</span>
            <strong className="text-xl font-black text-white">{items.length}</strong>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30">
            <span className="text-[10px] text-amber-200 uppercase font-black block">Window Open (Soon)</span>
            <strong className="text-xl font-black text-[#F4B942]">{warningCount}</strong>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30">
            <span className="text-[10px] text-emerald-200 uppercase font-black block">Safe / Protected</span>
            <strong className="text-xl font-black text-emerald-300">{safeCount}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-cyan-200 uppercase font-black block">Late Fines Incurred</span>
            <strong className="text-xl font-black text-white">₹0.00</strong>
          </div>
        </div>
      </div>

      {/* WHATSAPP & MULTI-CHANNEL DISPATCH RADAR STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 font-bold">
            📱
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-black text-slate-900">Multi-Channel Compliance Notification Radar</strong>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct notifications scheduled for WhatsApp <span className="font-mono text-slate-700 font-bold">{userPhone || '+91 9920054785'}</span> and Email <span className="font-mono text-slate-700 font-bold">{userEmail || 'admin@business.in'}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
          <span>🔔 90-Day Warning</span>
          <span>&bull;</span>
          <span>⚡ 30-Day Urgent</span>
          <span>&bull;</span>
          <span>🚨 7-Day CA Call</span>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeFilter === 'ALL' ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Registrations ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('WARNING')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeFilter === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            ⚠️ Renewals Due Soon ({warningCount})
          </button>
          <button
            onClick={() => setActiveFilter('SAFE')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeFilter === 'SAFE' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            🟢 Safe ({safeCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          Rule 33 Pure Agent Statutory Guarantee
        </span>
      </div>

      {/* TRACKED ITEMS GRID */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isWarning = item.status === 'WARNING';
          const isSafe = item.status === 'SAFE';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition hover:shadow-md space-y-4 ${
                isWarning
                  ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-black bg-[#073B5C] text-[#F4B942] px-2.5 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Cycle: {item.validitySpan}
                    </span>
                    {isWarning && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        ⚠️ Early Renewal Window Open ({item.daysRemaining} Days Left)
                      </span>
                    )}
                    {isSafe && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        🟢 Active &bull; {item.daysRemaining} Days Remaining
                      </span>
                    )}
                    {isCompleted && (
                      <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        ✓ Milestone Certified
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-[#073B5C]">{item.title}</h3>
                  <p className="text-xs font-mono font-bold text-slate-700">{item.identifier}</p>
                </div>

                <div className="shrink-0 flex flex-col sm:items-end gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Statutory Expiration</span>
                  <strong className="text-sm font-extrabold text-slate-900">{item.expiryDate}</strong>
                  <span className="text-[10px] text-slate-500">Issued: {item.issuedDate}</span>
                </div>
              </div>

              {/* Progress bar for validity */}
              {!isCompleted && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>Statutory Life Span</span>
                    <span className={isWarning ? 'text-amber-700 font-black' : 'text-slate-600'}>
                      {item.daysRemaining} Days Remaining Before Penalties
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(12, (item.daysRemaining / (item.category === 'TRADEMARK' ? 3650 : 365)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Legal & Penalty Context */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    Statutory Rule &amp; Consequence
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>{item.statutoryAct}:</strong> {item.riskDescription}
                  </p>
                </div>
                <div className="space-y-1 md:border-l md:border-slate-200 md:pl-3">
                  <span className="text-[10px] font-black uppercase text-rose-700 block">
                    Non-Compliance Penalty If Missed
                  </span>
                  <p className="text-[11px] font-bold text-rose-900 leading-relaxed">
                    {item.penaltyAmount}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">NyayaLink Desk Rate:</span>
                  <span className="text-xs font-black text-[#073B5C] bg-slate-100 px-2 py-0.5 rounded">
                    {item.renewalFee}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isWarning ? (
                    <Link
                      href="/#catalog-section"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                    >
                      <span>⚡</span> Renew License with CA Desk &rarr;
                    </Link>
                  ) : isCompleted ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                      ✓ No Action Required
                    </span>
                  ) : (
                    <a
                      href={`https://wa.me/919920054785?text=Namaste%20NyayaLink%2C%20I%20want%20to%20verify%20my%20renewal%20schedule%20for%20${encodeURIComponent(item.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
                    >
                      💬 Inquire Expiry Schedule
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HOW NYAYALINK REVENUE & RENEWAL MODEL PROTECTS YOU */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            HOW THE LIFETIME RENEWAL ENGINE WORKS
          </span>
          <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
            How We Identify, Track, and Monetize Every Statutory Expiry
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-black bg-[#073B5C] text-[#F4B942] px-2 py-0.5 rounded">
                Stage 1
              </span>
              <span className="text-base">🗄️</span>
            </div>
            <strong className="text-slate-900 font-bold block">Permanent Vault Custody</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When an order completes, our engine extracts the Government ARN/SRN, registration date, and statutory validity (e.g. 10 years for Trademarks, 1-5 years for FSSAI). Every asset is cataloged with statutory penalty metrics.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-black bg-[#0E7490] text-white px-2 py-0.5 rounded">
                Stage 2
              </span>
              <span className="text-base">📡</span>
            </div>
            <strong className="text-slate-900 font-bold block">T-90, T-30, T-7 Day Radar</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              No founder remembers dates 1, 5, or 10 years later. Automated WhatsApp reminders, emails, and telecall alerts are fired proactively before the government penalty window opens.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">
                Stage 3
              </span>
              <span className="text-base">💰</span>
            </div>
            <strong className="text-slate-900 font-bold block">1-Click Token Renewal</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Clients don&apos;t look for another portal. They tap &quot;Renew for ₹999 Token&quot; directly on WhatsApp or in their Vault. Zero CAC (Customer Acquisition Cost) for NyayaLink, 80%+ margin recurring revenue.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: LINK EXISTING LICENSE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  FREE LIFETIME CUSTODY
                </span>
                <h3 className="text-lg font-black text-[#073B5C]">Link an Existing License or Trademark</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Did you register with another portal or offline CA previously? Add your license details below. We monitor it in your vault for free and alert you on WhatsApp before government fines apply.
            </p>

            <form onSubmit={handleAddAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">Registration Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TrackedStatutoryItem['category'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="TRADEMARK">Trademark (Form TM-A · 10 Years)</option>
                  <option value="FSSAI">FSSAI Food License (FoSCoS · 1-5 Years)</option>
                  <option value="DIR3_KYC">Director DIN KYC (Annual · Sept 30)</option>
                  <option value="GST_LUT">GST LUT (Annual · March 31)</option>
                  <option value="IEC">Import Export Code (IEC Annual Update)</option>
                  <option value="SHOP_ACT">Shop &amp; Establishment / Gumasta</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">Entity / Trade Name</label>
                <input
                  type="text"
                  placeholder="e.g. NyayaLink Technologies Private Limited"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E7490]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  License / Registration Number / DIN
                </label>
                <input
                  type="text"
                  placeholder="e.g. TM-5910248 or FSSAI-11524034000891"
                  value={formIdentifier}
                  onChange={(e) => setFormIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E7490]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Estimated Expiration Date
                </label>
                <input
                  type="date"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E7490]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-2.5 rounded-xl transition shadow cursor-pointer"
                >
                  Activate Radar Monitoring &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
