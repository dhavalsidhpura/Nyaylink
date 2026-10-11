import { INDIAN_STATES } from '@/lib/pricing';

// Offline structural validation of Indian tax identifiers. This proves an identifier is
// well-formed — NOT that it exists or who owns it. Live verification needs a licensed KYC
// provider (e.g. Sandbox, Surepass) and should be wired in here when credentials are available.

const PAN_HOLDER_TYPES: Record<string, string> = {
  P: 'Individual',
  C: 'Company',
  H: 'Hindu Undivided Family (HUF)',
  F: 'Firm / LLP',
  A: 'Association of Persons',
  T: 'Trust',
  B: 'Body of Individuals',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government',
};

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function decodePan(raw: string) {
  const pan = raw.trim().toUpperCase();
  if (!PAN_REGEX.test(pan)) return null;
  return { pan, holderType: PAN_HOLDER_TYPES[pan[3]] || 'Unknown' };
}

function gstinCheckDigit(first14: string) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const product = GSTIN_CHARS.indexOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36];
}

export function decodeGstin(raw: string) {
  const gstin = raw.trim().toUpperCase();
  if (!GSTIN_REGEX.test(gstin)) return null;
  const checksumValid = gstinCheckDigit(gstin.slice(0, 14)) === gstin[14];
  const stateGstCode = gstin.slice(0, 2);
  const state = INDIAN_STATES.find((s) => s.gstCode === stateGstCode);
  const pan = decodePan(gstin.slice(2, 12));
  return {
    gstin,
    checksumValid,
    stateGstCode,
    stateCode: state?.code ?? null,
    stateName: state?.name ?? 'Unknown state code',
    pan: pan?.pan ?? gstin.slice(2, 12),
    holderType: pan?.holderType ?? 'Unknown',
    registrationNumber: Number.parseInt(gstin[12], 36),
  };
}
