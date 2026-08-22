'use client';

import { useState } from 'react';

const STATE_STAMP_RULES: Record<string, { name: string; baseStamp: number; capMultiplier: number; panTanFee: number }> = {
  MH: { name: 'Maharashtra', baseStamp: 1000, capMultiplier: 0.001, panTanFee: 131 },
  DL: { name: 'Delhi', baseStamp: 300, capMultiplier: 0.0005, panTanFee: 131 },
  KA: { name: 'Karnataka', baseStamp: 1000, capMultiplier: 0.0015, panTanFee: 131 },
  GJ: { name: 'Gujarat', baseStamp: 500, capMultiplier: 0.001, panTanFee: 131 },
  UP: { name: 'Uttar Pradesh', baseStamp: 500, capMultiplier: 0.002, panTanFee: 131 },
  PB: { name: 'Punjab', baseStamp: 2000, capMultiplier: 0.0025, panTanFee: 131 },
  TN: { name: 'Tamil Nadu', baseStamp: 800, capMultiplier: 0.001, panTanFee: 131 },
};

export default function StampDutyCalculator({ baseProfFee = 6999 }: { baseProfFee?: number }) {
  const [selectedState, setSelectedState] = useState('MH');
  const [authorizedCapital, setAuthorizedCapital] = useState(100000);

  const stateRule = STATE_STAMP_RULES[selectedState] || STATE_STAMP_RULES.MH;
  
  // Calculate stamp duty (capped or proportional)
  const estimatedStampDuty = Math.max(
    stateRule.baseStamp,
    Math.round(authorizedCapital * stateRule.capMultiplier)
  );

  const mcaGovtFee = authorizedCapital <= 1500000 ? 0 : Math.round((authorizedCapital - 1500000) * 0.003);
  const totalGovtOutlay = estimatedStampDuty + stateRule.panTanFee + mcaGovtFee;
  const totalInvoiceAmount = baseProfFee + totalGovtOutlay;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-[#073B5C]">Dynamic State Stamp Duty Calculator</h3>
          <p className="text-[#0E7490] font-semibold">Real-time government fee & stamp duty estimate</p>
        </div>
        <span className="bg-[#F4B942] text-[#073B5C] font-black px-2.5 py-1 rounded uppercase tracking-wider text-[10px]">
          Live MCA Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-[#073B5C] mb-1">Select Entity State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
          >
            {Object.entries(STATE_STAMP_RULES).map(([code, rule]) => (
              <option key={code} value={code}>
                {rule.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-[#073B5C] mb-1">Authorized Capital (₹)</label>
          <input
            type="number"
            step="50000"
            min="100000"
            value={authorizedCapital}
            onChange={(e) => setAuthorizedCapital(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
          />
        </div>
      </div>

      {/* Breakdown Summary Table */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-600">Base Professional Fee:</span>
          <strong className="text-slate-900">₹{baseProfFee.toLocaleString()}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">{stateRule.name} Stamp Duty (MOA/AOA):</span>
          <strong className="text-amber-800">₹{estimatedStampDuty.toLocaleString()}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">PAN + TAN Application Fee:</span>
          <strong className="text-slate-900">₹{stateRule.panTanFee}</strong>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-[#073B5C]">
          <span>Total Payable Amount:</span>
          <strong className="text-emerald-700 text-sm">₹{totalInvoiceAmount.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}