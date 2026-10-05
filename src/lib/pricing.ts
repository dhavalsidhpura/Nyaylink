// Pure pricing / GST maths — safe to import from both server and client components.
// All arithmetic is done in integer paise to avoid floating-point drift.

export const SUPPLIER_STATE = process.env.NEXT_PUBLIC_SUPPLIER_STATE || 'MH';

export const INDIAN_STATES: { code: string; name: string; gstCode: string }[] = [
  { code: 'AN', name: 'Andaman & Nicobar Islands', gstCode: '35' },
  { code: 'AP', name: 'Andhra Pradesh', gstCode: '37' },
  { code: 'AR', name: 'Arunachal Pradesh', gstCode: '12' },
  { code: 'AS', name: 'Assam', gstCode: '18' },
  { code: 'BR', name: 'Bihar', gstCode: '10' },
  { code: 'CH', name: 'Chandigarh', gstCode: '04' },
  { code: 'CG', name: 'Chhattisgarh', gstCode: '22' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', gstCode: '26' },
  { code: 'DL', name: 'Delhi', gstCode: '07' },
  { code: 'GA', name: 'Goa', gstCode: '30' },
  { code: 'GJ', name: 'Gujarat', gstCode: '24' },
  { code: 'HR', name: 'Haryana', gstCode: '06' },
  { code: 'HP', name: 'Himachal Pradesh', gstCode: '02' },
  { code: 'JK', name: 'Jammu & Kashmir', gstCode: '01' },
  { code: 'JH', name: 'Jharkhand', gstCode: '20' },
  { code: 'KA', name: 'Karnataka', gstCode: '29' },
  { code: 'KL', name: 'Kerala', gstCode: '32' },
  { code: 'LA', name: 'Ladakh', gstCode: '38' },
  { code: 'LD', name: 'Lakshadweep', gstCode: '31' },
  { code: 'MP', name: 'Madhya Pradesh', gstCode: '23' },
  { code: 'MH', name: 'Maharashtra', gstCode: '27' },
  { code: 'MN', name: 'Manipur', gstCode: '14' },
  { code: 'ML', name: 'Meghalaya', gstCode: '17' },
  { code: 'MZ', name: 'Mizoram', gstCode: '15' },
  { code: 'NL', name: 'Nagaland', gstCode: '13' },
  { code: 'OD', name: 'Odisha', gstCode: '21' },
  { code: 'PY', name: 'Puducherry', gstCode: '34' },
  { code: 'PB', name: 'Punjab', gstCode: '03' },
  { code: 'RJ', name: 'Rajasthan', gstCode: '08' },
  { code: 'SK', name: 'Sikkim', gstCode: '11' },
  { code: 'TN', name: 'Tamil Nadu', gstCode: '33' },
  { code: 'TS', name: 'Telangana', gstCode: '36' },
  { code: 'TR', name: 'Tripura', gstCode: '16' },
  { code: 'UP', name: 'Uttar Pradesh', gstCode: '09' },
  { code: 'UK', name: 'Uttarakhand', gstCode: '05' },
  { code: 'WB', name: 'West Bengal', gstCode: '19' },
];

export const isValidState = (code: string) => INDIAN_STATES.some((s) => s.code === code);
export const stateName = (code: string) => INDIAN_STATES.find((s) => s.code === code)?.name || code;

const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

export interface GstSplit {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  intraState: boolean;
}

/** Splits a GST amount into CGST+SGST (same state) or IGST (inter-state). */
export function splitGst(gstAmount: number, placeOfSupply: string, supplierState = SUPPLIER_STATE): GstSplit {
  const gst = toPaise(gstAmount);
  const intraState = placeOfSupply === supplierState;
  if (!intraState) return { cgst: 0, sgst: 0, igst: toRupees(gst), total: toRupees(gst), intraState };
  const cgst = Math.floor(gst / 2);
  return { cgst: toRupees(cgst), sgst: toRupees(gst - cgst), igst: 0, total: toRupees(gst), intraState };
}

export interface Quote {
  professionalFee: number;
  govtFee: number; // pass-through, collected as pure agent — not part of GST value
  gstRate: number;
  gstAmount: number;
  gst: GstSplit;
  total: number;
}

export function computeQuote(
  pricing: { professionalFee: number; govtFee: number; gstRate: number },
  clientState: string,
  supplierState = SUPPLIER_STATE
): Quote {
  const fee = toPaise(pricing.professionalFee);
  const govt = toPaise(pricing.govtFee);
  const gst = Math.round((fee * pricing.gstRate) / 100);
  return {
    professionalFee: toRupees(fee),
    govtFee: toRupees(govt),
    gstRate: pricing.gstRate,
    gstAmount: toRupees(gst),
    gst: splitGst(toRupees(gst), clientState, supplierState),
    total: toRupees(fee + gst + govt),
  };
}

/** Consultation pricing: the advocate's fee is collected on their behalf; GST applies to the platform fee only. */
export const PLATFORM_FEE_PERCENT = 10;

export function computeConsultationQuote(lawyerFee: number, gstRate = 18) {
  const fee = toPaise(lawyerFee);
  const platform = Math.round((fee * PLATFORM_FEE_PERCENT) / 100);
  const gst = Math.round((platform * gstRate) / 100);
  return {
    lawyerFee: toRupees(fee),
    platformFee: toRupees(platform),
    gstAmount: toRupees(gst),
    total: toRupees(fee + platform + gst),
  };
}

export function formatINR(amount: number | string): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export interface StateStampRule {
  name: string;
  baseStamp: number;
  panTanFee: number;
  note: string;
}

export const STATE_STAMP_RULES: Record<string, StateStampRule> = {
  MH: { name: 'Maharashtra', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  DL: { name: 'Delhi', baseStamp: 300, panTanFee: 131, note: '₹300 Stamp + ₹131 PAN/TAN' },
  KA: { name: 'Karnataka', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  GJ: { name: 'Gujarat', baseStamp: 500, panTanFee: 131, note: '₹500 Stamp + ₹131 PAN/TAN' },
  UP: { name: 'Uttar Pradesh', baseStamp: 500, panTanFee: 131, note: '₹500 Stamp + ₹131 PAN/TAN' },
  PB: { name: 'Punjab', baseStamp: 2000, panTanFee: 131, note: '₹2,000 Stamp + ₹131 PAN/TAN' },
  TN: { name: 'Tamil Nadu', baseStamp: 800, panTanFee: 131, note: '₹800 Stamp + ₹131 PAN/TAN' },
  TS: { name: 'Telangana', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  WB: { name: 'West Bengal', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  RJ: { name: 'Rajasthan', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  HR: { name: 'Haryana', baseStamp: 600, panTanFee: 131, note: '₹600 Stamp + ₹131 PAN/TAN' },
  KL: { name: 'Kerala', baseStamp: 2000, panTanFee: 131, note: '₹2,000 Stamp + ₹131 PAN/TAN' },
  AP: { name: 'Andhra Pradesh', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  MP: { name: 'Madhya Pradesh', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  BR: { name: 'Bihar', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
  OD: { name: 'Odisha', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' },
};

export function getStateStampDuty(stateCode: string): { amount: number; breakdown: string; baseStamp: number } {
  const rule = STATE_STAMP_RULES[stateCode] || { name: 'Standard State Rate', baseStamp: 1000, panTanFee: 131, note: '₹1,000 Stamp + ₹131 PAN/TAN' };
  return {
    amount: rule.baseStamp + rule.panTanFee,
    breakdown: rule.note,
    baseStamp: rule.baseStamp,
  };
}
