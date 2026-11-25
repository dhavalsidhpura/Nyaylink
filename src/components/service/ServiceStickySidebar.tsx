'use client';

import Link from 'next/link';
import type { PackageItem } from '@/data/packages';
import { INDIAN_STATES, getStateStampDuty, formatINR } from '@/lib/pricing';

interface PricingModelBadge {
  label: string;
  badgeClass: string;
  tooltip: string;
}

interface StateStampInfo {
  amount: number;
  baseStamp?: number;
  breakdown: string;
}

export interface ServiceStickySidebarProps {
  displayTitle: string;
  displaySla: string;
  pricingModel: PricingModelBadge;
  isStatutoryFiling: boolean;
  isStateSpecificService: boolean;
  isPureService: boolean;
  isServiceActive: boolean;
  selectedState: string;
  onSelectState: (code: string) => void;
  stateStamp: StateStampInfo;
  effectivePackage: PackageItem | null;
  activeProfFee: number;
  activeGovtFee: number;
  gstRate: number;
  gstAmount: number;
  totalEstimatedCost: number;
  payAdvance: boolean;
  onSelectPayAdvance: (adv: boolean) => void;
  activePayAmount: number;
  onOpenCheckout: () => void;
}

export default function ServiceStickySidebar({
  displayTitle,
  displaySla,
  pricingModel,
  isStatutoryFiling,
  isStateSpecificService,
  isPureService,
  isServiceActive,
  selectedState,
  onSelectState,
  stateStamp,
  effectivePackage,
  activeProfFee,
  activeGovtFee,
  gstRate,
  gstAmount,
  totalEstimatedCost,
  payAdvance,
  onSelectPayAdvance,
  activePayAmount,
  onOpenCheckout,
}: ServiceStickySidebarProps) {
  return (
    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-7 shadow-xl space-y-5">
        {/* Header with Fast-Track Badge */}
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <span className="bg-cyan-100 text-[#0E7490] font-black text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              ⚡ Fast-Track Filing
            </span>
            <span className="text-xs text-slate-500 font-bold">CA Supervised</span>
          </div>
          <h3 className="font-black text-[#073B5C] text-lg sm:text-xl">
            {displayTitle}
          </h3>
          <div className="pt-1">
            <span
              className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${pricingModel.badgeClass}`}
              title={pricingModel.tooltip}
            >
              {pricingModel.label}
            </span>
          </div>
        </div>

        {/* STATE SELECTION DROPDOWN */}
        <div className="space-y-1.5">
          <label htmlFor="card-state" className="block text-xs font-bold text-[#073B5C]">
            {isStatutoryFiling
              ? isStateSpecificService
                ? 'Select Incorporation State'
                : 'Select Statutory Jurisdiction'
              : 'Select Operational State (Place of Supply)'}
          </label>
          <select
            id="card-state"
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-extrabold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer"
          >
            {INDIAN_STATES.map((st) => {
              const stDuty = getStateStampDuty(st.code);
              return (
                <option key={st.code} value={st.code}>
                  {st.name} {isStateSpecificService && stDuty.baseStamp ? `(₹${stDuty.amount.toLocaleString('en-IN')} Stamp)` : ''}
                </option>
              );
            })}
          </select>
          <p className="text-xs text-slate-500">
            {isStatutoryFiling
              ? isStateSpecificService
                ? `Stamp Duty calculated automatically for ${stateStamp.breakdown}.`
                : 'Determines official jurisdiction & portal state registration.'
              : 'Determines Place of Supply for valid B2B GST tax invoice & Input Tax Credit (ITC).'}
          </p>
        </div>

        {/* PRICING BREAKDOWN MATRIX */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-600 font-medium">
              {effectivePackage ? effectivePackage.title : isPureService ? 'Professional Retainer Fee' : 'NyayaLink Professional Fee'}
            </span>
            <strong className="text-slate-900 font-extrabold shrink-0">{formatINR(activeProfFee)}</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">GST @ {gstRate}%</span>
            <strong className="text-slate-900 font-extrabold">{formatINR(gstAmount)}</strong>
          </div>

          {isStatutoryFiling ? (
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <span>Govt Stamp Duty &amp; Fee</span>
                {isStateSpecificService && <span className="text-xs text-emerald-700 font-bold">(Live)</span>}
              </span>
              <strong className="text-slate-900 font-extrabold">
                {activeGovtFee > 0 ? formatINR(activeGovtFee) : '₹0 (At Actuals)'}
              </strong>
            </div>
          ) : null}

          <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-[#073B5C]">
            <span>{isPureService ? 'Total Invoiced Amount' : 'Total Estimated Outlay'}</span>
            <span className="text-base text-slate-900">{formatINR(totalEstimatedCost)}</span>
          </div>
          {isPureService && (
            <p className="text-xs text-emerald-700 font-medium pt-0.5">
              ✓ 100% Tax Deductible B2B Expense (Eligible for Full GST ITC)
            </p>
          )}
        </div>

        {/* SPLIT-TICKET PROPOSITION BOX */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
              💳 Split-Ticket Option
            </span>
            <span className="bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
              Save Capital
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelectPayAdvance(true)}
              className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                payAdvance
                  ? 'bg-white text-emerald-800 border-emerald-400 shadow-sm'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60'
              }`}
            >
              <div>₹999 Advance</div>
              <div className="text-[11px] font-normal text-slate-500">Balance later</div>
            </button>
            <button
              type="button"
              onClick={() => onSelectPayAdvance(false)}
              className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                !payAdvance
                  ? 'bg-white text-[#073B5C] border-cyan-400 shadow-sm'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60'
              }`}
            >
              <div>Pay Full {formatINR(totalEstimatedCost)}</div>
              <div className="text-[11px] font-normal text-slate-500">One-time</div>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-snug">
            {payAdvance
              ? isPureService
                ? 'Start onboarding with your dedicated CA/Legal Expert today for ₹999. Remaining balance is billed after preliminary review & scope sign-off.'
                : 'Start name reservation and document drafting today for ₹999. Remaining balance is billed after CA verification.'
              : isPureService
              ? 'Complete payment upfront. Immediate dedicated CA assignment and kickoff.'
              : 'Complete payment upfront. Direct fast-track filing into statutory portal queue.'}
          </p>
        </div>

        {/* IMPULSE CTA BUTTON */}
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
              <Link
                href="/vakil"
                className="block text-center w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-2xl uppercase transition shadow"
              >
                Book Expert Consultation Instead →
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-sm py-4 rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Start Now for {formatINR(activePayAmount)} {payAdvance ? 'Advance' : ''} →</span>
            </button>
          )}

          <div className="p-2.5 bg-cyan-50/70 border border-cyan-200/80 rounded-xl text-center">
            <span className="text-xs font-extrabold text-[#073B5C] flex items-center justify-center gap-1.5">
              <span>⚡ Typical Turnaround:</span>
              <span className="text-[#0E7490]">{displaySla}</span>
            </span>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 text-center text-xs text-emerald-900 font-bold space-y-0.5">
          <span className="block font-black text-emerald-800">🛡️ 100% Paperless &amp; Zero Physical Visits</span>
          <span className="text-xs text-emerald-700 block font-normal">
            Never visit government offices or courts. Certified CAs sign electronically on your behalf.
          </span>
        </div>

        {isPureService ? (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl space-y-1 text-emerald-950 text-xs">
            <div className="flex items-center gap-1.5 font-black text-emerald-900">
              <span>🛡️</span> Dedicated Professional Retainer
            </div>
            <p className="text-xs text-emerald-800 leading-snug">
              Assigned Chartered Accountant / Legal Advocate directly handles your scope. Full client confidentiality guaranteed under strict NDA and professional ethics.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl space-y-1 text-emerald-950 text-xs">
            <div className="flex items-center gap-1.5 font-black text-emerald-900">
              <span>🛡️</span> Zero Markup on Statutory Fees
            </div>
            <p className="text-xs text-emerald-800 leading-snug">
              Statutory portal fees (MCA, FoSCoS, Labor, GSTN) pass through strictly at actuals under Rule 33 of CGST. Official government treasury e-Challan receipts are uploaded directly to your Vault.
            </p>
          </div>
        )}

        <div className="pt-1 space-y-1.5 text-xs text-slate-500 text-center font-medium">
          <div className="flex items-center justify-center gap-2.5 text-slate-600 font-semibold flex-wrap">
            <span>🔒 256-Bit SSL</span>
            <span>•</span>
            <span>{isPureService ? '📑 GST Tax Invoice' : '🛡️ Pre-Checked Registry Search'}</span>
            <span>•</span>
            <span>🤝 Zero Hidden Fees</span>
          </div>
          <p className="text-xs text-slate-500">
            {isPureService
              ? 'Transparent professional retainer billing with zero hidden hourly surcharges.'
              : 'Government stamp duty is strictly pass-through at actuals. Never marked up.'}
          </p>
        </div>
      </div>
    </div>
  );
}
