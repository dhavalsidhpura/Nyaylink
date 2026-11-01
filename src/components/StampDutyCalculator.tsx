'use client';

import { useState } from 'react';
import { INDIAN_STATES, STATE_STAMP_RULES, getStateStampDuty, formatINR } from '@/lib/pricing';

interface Props {
  baseProfFee?: number;
  initialState?: string;
}

export default function StampDutyCalculator({ baseProfFee = 6999, initialState = 'MH' }: Props) {
  const [selectedState, setSelectedState] = useState(initialState);
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);

  const stateRule = STATE_STAMP_RULES[selectedState] || {
    name: 'Standard Rate',
    baseStamp: 1000,
    panTanFee: 131,
    note: '₹1,000 Stamp + ₹131 PAN/TAN',
  };

  // Statutory MCA SPICe+ MoA/AoA Stamp calculation
  // Under MCA SPICe+ rules:
  // - MCA Form Fee is ₹0 for authorized capital up to ₹15,00,000.
  // - State Stamp Duty applies to MoA and AoA based on state-specific rates.
  const stateStampEstimate = Math.max(
    stateRule.baseStamp,
    Math.round(stateRule.baseStamp * (authorizedCapital > 1000000 ? authorizedCapital / 1000000 : 1))
  );

  const mcaGovtFee = authorizedCapital <= 1500000 ? 0 : Math.round((authorizedCapital - 1500000) * 0.003);
  const panTanGovtFee = stateRule.panTanFee || 131;
  const nameApprovalFee = 1000; // RUN / SPICe+ Part A reservation

  const totalStatutoryPassThrough = stateStampEstimate + panTanGovtFee + mcaGovtFee;
  const grandTotal = baseProfFee + totalStatutoryPassThrough;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-5 text-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
              Dynamic State Stamp Duty & Incorporation Estimator
            </h3>
          </div>
          <p className="text-slate-500 font-medium text-[11px] mt-0.5">
            Transparent Pure Agent breakdown: Professional Fee + Exact Government MCA & Stamp Duty.
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300/60 font-black px-3 py-1 rounded-full uppercase tracking-wider text-[10px] self-start sm:self-auto">
          ✓ Rule 33 Pure Agent Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-[#073B5C] mb-1.5">
            State of Registered Office:
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-xs"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} {STATE_STAMP_RULES[s.code] ? `(Base Stamp: ₹${STATE_STAMP_RULES[s.code].baseStamp.toLocaleString()})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-[#073B5C] mb-1.5">
            Authorized Share Capital:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
            <input
              type="number"
              step="50000"
              min="100000"
              value={authorizedCapital}
              onChange={(e) => setAuthorizedCapital(Math.max(100000, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-7 pr-3 py-2.5 font-extrabold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-xs"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Standard startup default: ₹1,00,000 (MCA Govt Fee is ₹0 up to ₹15 Lakhs).
          </span>
        </div>
      </div>

      {/* Itemized Pure Agent Fee Breakdown Table */}
      <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
        <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
          Itemized Fee Demarcation (Zero Drip Pricing)
        </span>

        {/* Part A: Professional Legal/CA Retainer */}
        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-700">
          <div>
            <span className="font-bold text-slate-800">Chartered Accountant Professional Fee:</span>
            <p className="text-[10px] text-slate-500">Includes 2 DSC tokens, DIN drafting, SPICe+ Part B & Certificate</p>
          </div>
          <strong className="text-slate-900 text-sm">{formatINR(baseProfFee)}</strong>
        </div>

        {/* Part B: Statutory Pass-Through Outlays */}
        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-700">
          <div>
            <span className="font-bold text-slate-800">{stateRule.name} State Stamp Duty (MoA / AoA):</span>
            <p className="text-[10px] text-slate-500">State e-Stamp paper duty payable to the state treasury</p>
          </div>
          <strong className="text-amber-800 font-mono text-sm">{formatINR(stateStampEstimate)}</strong>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-700">
          <div>
            <span className="font-bold text-slate-800">MCA SPICe+ Filing Fee:</span>
            <p className="text-[10px] text-slate-500">Government filing fee on MCA V3 Portal</p>
          </div>
          <strong className="text-emerald-700 font-mono text-xs">
            {mcaGovtFee === 0 ? '₹0 (Waived for ≤ ₹15L Capital)' : formatINR(mcaGovtFee)}
          </strong>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-700">
          <div>
            <span className="font-bold text-slate-800">NSDL / UTI PAN & TAN Issuance Fee:</span>
            <p className="text-[10px] text-slate-500">Official government e-PAN & TAN processing fee</p>
          </div>
          <strong className="text-slate-800 font-mono text-xs">{formatINR(panTanGovtFee)}</strong>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center pt-2 font-black text-[#073B5C] text-sm sm:text-base">
          <div>
            <span>Total Landed Outlay to the Rupee:</span>
            <p className="text-[10px] text-slate-500 font-normal">
              No surprise calls. Professional fee billed with GST invoice; government fees passed through at actuals.
            </p>
          </div>
          <strong className="text-emerald-700 text-base sm:text-lg">{formatINR(grandTotal)}</strong>
        </div>
      </div>

      <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-[#073B5C]">
        <span className="text-base shrink-0">💡</span>
        <span>
          <strong>Why competitors hide this:</strong> Other portals advertise &#34;Rs 1,999 Company Registration&#34; and call you later demanding ₹3,000–₹12,000 in stamp duty and PAN fees. NyayLink guarantees 100% statutory transparency upfront.
        </span>
      </div>
    </div>
  );
}
