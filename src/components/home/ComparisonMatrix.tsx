'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComparisonMatrix() {
  const [comparisonCompetitor, setComparisonCompetitor] = useState<'portals' | 'offline'>('portals');

  return (
    <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
            The NyayaLink Advantage
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
            Why Choose NyayaLink vs. Other Portals &amp; Offline CAs
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

                {/* Column 2: NyayaLink Winner */}
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
                  <div className="text-[10px] text-slate-400 font-normal">Online Legal India / IndiaFilings</div>
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
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        Client cashflow risk &amp; commitment
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        Flat ₹999 Advance Token
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Pay ₹999 to start name approval &amp; draft documents. Settle remaining professional fee only after drafting verification.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">100% Upfront (₹7,999+)</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Full payment demanded upfront before name search or drafting begins. Zero refund safety.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-amber-700">
                    <span className="font-black text-base shrink-0 leading-none">⚠️</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">50% Advance (₹10,000+)</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        High cash outlay required upfront, often without formalized receipt or milestone SLA tracking.
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
                      📜
                    </span>
                    <div>
                      <span className="font-black text-[#073B5C] text-xs block leading-snug">
                        Statutory Stamp Duty
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        State MoA/AoA treasury fees
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        Pure Agent Rule 33 Pass-Through
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        State-specific stamp duty itemized to the exact rupee at checkout with zero markup. Actual Bharatkosh challan uploaded to Vault.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Hidden &quot;+ Govt Fee&quot; Trap</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Quoted as &quot;₹7,999 + Govt Fee&quot;; customer is contacted days later for surprise payments of ₹3,500 to ₹6,500.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="font-black text-base shrink-0 leading-none text-emerald-600">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">At Actuals (Manual Challan)</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Paid at actuals, but requires manual reimbursement trips or cash disbursement coordination.
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
                        Legal Supervision &amp; Desk
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        Who actually handles your file
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        Named CA &amp; High Court Advocate
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Direct Order Room access to certified CAs and advocates in Mumbai with direct WhatsApp communication. Zero sales rep gatekeepers.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Call Center Telemarketers</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Customer interacts solely with sales reps on commission. Filings outsourced to low-bid freelance data-entry desks.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-emerald-700">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Qualified Professional</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Professional handling, but consultation is strictly limited to office visits or intermittent phone calls.
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
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        Transparency into filing stages
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        Real-Time Government SRN Portal
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Official MCA SRN &amp; GST ARN tracking with instant WhatsApp milestone notifications at each verification stage.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Generic Dashboard</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Static progress bars with delayed manual updates; SRN/ARN numbers often withheld until full settlement.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Zero Online Tracking</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Requires regular follow-up calls or office visits to check if the registrar has approved the file.
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
                      🔒
                    </span>
                    <div>
                      <span className="font-black text-[#073B5C] text-xs block leading-snug">
                        Document Security &amp; Vault
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        Client KYC &amp; PAN safety
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        AES-256 Encrypted Vault + S3 Direct
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Strict role-based access. KYC documents are stored encrypted; zero selling of client phone numbers or email lists.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Shared Unencrypted Storage</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        KYC documents handled over unencrypted shared inboxes and passed to third-party telemarketing lead brokers.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-amber-700">
                    <span className="font-black text-base shrink-0 leading-none">⚠️</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Physical Photocopies</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Documents stored in physical paper folders or local office hard drives with varying backup and security rigor.
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
                      ⚡
                    </span>
                    <div>
                      <span className="font-black text-[#073B5C] text-xs block leading-snug">
                        Turnaround SLA Guarantee
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                        Filing velocity &amp; execution
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top bg-cyan-50/40 border-x-2 border-[#0E7490]">
                  <div className="flex items-start gap-2 text-emerald-800">
                    <span className="font-black text-base shrink-0 leading-none">✓</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-extrabold text-emerald-900">
                        5–7 Working Days (Pvt Ltd)
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Deterministic 4-hour document review SLA with automated escalation if unassigned past compliance thresholds.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600 border-r border-slate-200/80">
                  <div className="flex items-start gap-2 text-rose-700">
                    <span className="font-black text-base shrink-0 leading-none">✕</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Unpredictable (2–6 Weeks)</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Files frequently stall across departments due to bureaucratic ticket handoffs and priority queue upsells.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 align-top text-slate-600">
                  <div className="flex items-start gap-2 text-amber-700">
                    <span className="font-black text-base shrink-0 leading-none">⚠️</span>
                    <div className="space-y-0.5">
                      <strong className="block text-xs font-bold text-slate-700">Variable (7–21 Days)</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Subject to practitioner workload during tax audit and GST filing deadlines (July, September, October).
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Head-to-Head Comparison Experience (md:hidden) */}
        <div className="md:hidden space-y-4">
          {/* Segmented Competitor Switcher */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setComparisonCompetitor('portals')}
              className={`flex-1 py-2 rounded-xl transition text-center cursor-pointer ${
                comparisonCompetitor === 'portals'
                  ? 'bg-white text-[#073B5C] shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              vs. Big Portals
            </button>
            <button
              type="button"
              onClick={() => setComparisonCompetitor('offline')}
              className={`flex-1 py-2 rounded-xl transition text-center cursor-pointer ${
                comparisonCompetitor === 'offline'
                  ? 'bg-white text-[#073B5C] shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              vs. Offline Traditional CA
            </button>
          </div>

          {/* Focused 2-Column Side-by-Side Comparison Cards */}
          <div className="space-y-3">
            {[
              {
                dimension: 'Advance Booking',
                icon: '💳',
                nyayaTitle: '₹999 Token Advance',
                nyayaDesc: 'Pay ₹999 to start name reservation; balance paid only after drafting approval.',
                compTitle: comparisonCompetitor === 'portals' ? '100% Upfront (₹7,999+)' : '50% Retainer (₹10,000+)',
                compDesc:
                  comparisonCompetitor === 'portals'
                    ? 'Demands full fee upfront with zero refund guarantee before work begins.'
                    : 'Requires high cash advance with manual tracking and visits.',
                compTone: 'bad',
              },
              {
                dimension: 'Govt Stamp Duty',
                icon: '📜',
                nyayaTitle: 'Pure Agent Rule 33',
                nyayaDesc: 'Itemized state stamp duty at exact actuals; zero markup; Bharatkosh receipts in Vault.',
                compTitle: comparisonCompetitor === 'portals' ? 'Hidden "+ Govt Fee"' : 'Challan at Actuals',
                compDesc:
                  comparisonCompetitor === 'portals'
                    ? 'Bait-and-switch: quotes ₹7,999 and subsequently demands ₹4,000+ for stamp duty.'
                    : 'Passed at actuals, but requires manual reimbursement coordination.',
                compTone: comparisonCompetitor === 'portals' ? 'bad' : 'neutral',
              },
              {
                dimension: 'Legal Supervision',
                icon: '⚖️',
                nyayaTitle: 'Named CA & Advocate',
                nyayaDesc: 'Direct Order Room connection to verified Mumbai practitioners with direct WhatsApp access.',
                compTitle: comparisonCompetitor === 'portals' ? 'Call Center Reps' : 'Practicing CA/CS',
                compDesc:
                  comparisonCompetitor === 'portals'
                    ? 'Only talk to sales agents; filings outsourced to low-cost bulk data entry desks.'
                    : 'Qualified professional, but strictly limited to office visits or intermittent phone calls.',
                compTone: comparisonCompetitor === 'portals' ? 'bad' : 'good',
              },
              {
                dimension: 'Filing Tracking',
                icon: '📡',
                nyayaTitle: 'Live MCA SRN Portal',
                nyayaDesc: 'Live government tracking with WhatsApp updates at every stage.',
                compTitle: comparisonCompetitor === 'portals' ? 'Static Dashboard' : 'Manual Phone Calls',
                compDesc:
                  comparisonCompetitor === 'portals'
                    ? 'Unreliable updates; SRN/ARN often hidden until full payment is made.'
                    : 'Requires repetitive phone follow-ups with the CA’s article clerk.',
                compTone: 'bad',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-black text-xs text-[#073B5C] uppercase tracking-wider">{item.dimension}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* NyayaLink Winner */}
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-xs">
                      <span>✓</span>
                      <span>NyayaLink</span>
                    </div>
                    <strong className="block text-slate-800 font-bold leading-tight">{item.nyayaTitle}</strong>
                    <p className="text-[10px] text-slate-600 leading-snug">{item.nyayaDesc}</p>
                  </div>

                  {/* Competitor */}
                  <div
                    className={`p-2.5 rounded-xl space-y-1 border ${
                      item.compTone === 'bad'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : item.compTone === 'neutral'
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <span>{item.compTone === 'bad' ? '✕' : item.compTone === 'neutral' ? '⚠️' : '✓'}</span>
                      <span className="truncate">{comparisonCompetitor === 'portals' ? 'Online Portals' : 'Traditional CA'}</span>
                    </div>
                    <strong className="block font-bold leading-tight">{item.compTitle}</strong>
                    <p className="text-[10px] leading-snug opacity-90">{item.compDesc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="pt-2 text-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-6 py-3 rounded-2xl transition shadow-sm"
            >
              <span>Explore Transparent Bundles →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
