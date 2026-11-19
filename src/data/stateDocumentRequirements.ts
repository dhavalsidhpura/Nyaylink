// Dynamic state-filtered documentary intelligence for Indian statutory registries (MCA V3, GSTN, State Labor).
// Replaces static multi-state text dumps with proactive, state-specific compliance checklists.

export interface StateDocRequirement {
  title: string;
  desc: string;
  mandatory: boolean;
  authority: string;
}

export const STATE_DOCUMENT_MAP: Record<string, StateDocRequirement[]> = {
  MH: [
    {
      title: 'Registered Leave & License Agreement',
      desc: 'Formally registered with the Sub-Registrar / IGR Maharashtra with verifiable document registration number (notarized plain paper not accepted for GST/MCA in MH).',
      mandatory: true,
      authority: 'IGR Maharashtra & State GST Dept',
    },
    {
      title: 'Maharashtra Professional Tax (P-Tax) Enrollment',
      desc: 'PTRC (Employer) or PTEC (Director/Entity) certificate under the Maharashtra State Tax on Professions Act, 1975.',
      mandatory: true,
      authority: 'Maharashtra Dept of State Tax',
    },
    {
      title: 'Municipal / Local Body NOC or Property Tax Receipt',
      desc: 'BMC / PMC / NMMC property tax receipt or commercial NOC confirming authorized non-residential use.',
      mandatory: false,
      authority: 'Municipal Corporation',
    },
  ],
  DL: [
    {
      title: 'MCD Business / Trade License or BRL NOC',
      desc: 'Municipal Corporation of Delhi (MCD) trade license certificate or commercial conversion charge receipt for the registered premises.',
      mandatory: true,
      authority: 'MCD (North/South/East)',
    },
    {
      title: 'BSES / Tata Power DDL Electricity Bill (< 60 Days)',
      desc: 'Active commercial electricity consumer bill with matching exact address and meter reading.',
      mandatory: true,
      authority: 'BSES / Tata Power Delhi',
    },
    {
      title: 'Property Owner Notarized NOC & Title Deed',
      desc: 'Consent letter from premises owner accompanied by ownership proof (Sale deed / Conveyance deed / House tax receipt).',
      mandatory: true,
      authority: 'Delhi Revenue Department',
    },
  ],
  KA: [
    {
      title: 'BBMP Trade License / Business Registration License (BRL)',
      desc: 'Bruhat Bengaluru Mahanagara Palike trade license certificate or commercial establishment intimation.',
      mandatory: true,
      authority: 'BBMP / Karnataka Urban Development',
    },
    {
      title: '1st Class Judicial Magistrate / Sub-Registrar Stamped Agreement',
      desc: 'Commercial lease deed stamped per the Karnataka Stamp Act, 1957 (e-stamp of appropriate denomination).',
      mandatory: true,
      authority: 'Dept of Stamps & Registration Karnataka',
    },
    {
      title: 'Karnataka Professional Tax (PT) Form 1 Enrollment',
      desc: 'Mandatory PT registration certificate under the Karnataka Tax on Professions Act, 1976.',
      mandatory: true,
      authority: 'Commercial Taxes Dept Karnataka',
    },
  ],
  TS: [
    {
      title: 'GHMC Trade License / Commercial Permit',
      desc: 'Greater Hyderabad Municipal Corporation trade license or Telangana TS-bPASS commercial clearance.',
      mandatory: true,
      authority: 'GHMC / Telangana Govt',
    },
    {
      title: 'Telangana Stamped Lease Deed & TSSPDCL Bill',
      desc: 'Registered lease agreement on Telangana non-judicial stamp paper plus recent TSSPDCL commercial electricity bill.',
      mandatory: true,
      authority: 'TSSPDCL & TS Registration Dept',
    },
  ],
  TN: [
    {
      title: 'Greater Chennai Corporation / Local Body Trade License',
      desc: 'GCC trade license certificate or Panchayat commercial D&O resolution.',
      mandatory: true,
      authority: 'Greater Chennai Corporation',
    },
    {
      title: 'TANGEDCO Electricity Card / Bill & Owner NOC',
      desc: 'Latest consumer tariff card/white meter card from TANGEDCO with owner consent letter.',
      mandatory: true,
      authority: 'TANGEDCO',
    },
  ],
  GJ: [
    {
      title: 'Gumasta Dhara (Shop & Establishment) Certificate',
      desc: 'Form B / Registration certificate issued by Ahmedabad / Surat / Vadodara Municipal Corporation under Gujarat Shops Act.',
      mandatory: true,
      authority: 'Gujarat Labor Dept & AMC/SMC',
    },
    {
      title: 'Municipal Property Tax Assessment Receipt',
      desc: 'Latest assessment bill with Tenement number verifying commercial property occupancy.',
      mandatory: true,
      authority: 'Gujarat Urban Development Dept',
    },
  ],
  WB: [
    {
      title: 'KMC Certificate of Enlistment (Trade License)',
      desc: 'Kolkata Municipal Corporation or municipality trade enlistment certificate for commercial operations.',
      mandatory: true,
      authority: 'Kolkata Municipal Corporation',
    },
    {
      title: 'West Bengal Professional Tax (PT) Enrollment',
      desc: 'Certificate of Enrolment under the West Bengal State Tax on Professions Act.',
      mandatory: true,
      authority: 'WB Directorate of Commercial Taxes',
    },
    {
      title: 'CESC / WBSEDCL Commercial Electric Bill',
      desc: 'Paid electricity consumer bill under 2 months with premises owner NOC.',
      mandatory: true,
      authority: 'CESC / WBSEDCL',
    },
  ],
  UP: [
    {
      title: 'Nagar Nigam Trade Tax / BRL Certificate',
      desc: 'Commercial trade registration issued by Municipal Corporation (Noida / Lucknow / Kanpur / Ghaziabad).',
      mandatory: true,
      authority: 'UP Urban Development Dept',
    },
    {
      title: 'UP Notarized Lease Deed & UPPCL Power Bill',
      desc: 'Lease deed on UP non-judicial stamp paper accompanied by active UPPCL commercial power bill.',
      mandatory: true,
      authority: 'UPPCL & UP Stamp Registry',
    },
  ],
  BR: [
    {
      title: 'Lease Agreement on ₹1,000 Non-Judicial Stamp Paper',
      desc: 'Bihar state gazette mandates minimum ₹1,000 non-judicial stamp paper with notary / magistrate attestation for commercial leases.',
      mandatory: true,
      authority: 'Bihar Registration Dept',
    },
    {
      title: 'Municipal Holding Tax Receipt & SBPDCL / NBPDCL Bill',
      desc: 'Holding tax receipt from Municipal Corporation plus recent SBPDCL/NBPDCL electricity bill.',
      mandatory: true,
      authority: 'Bihar Urban Development Dept',
    },
  ],
  AP: [
    {
      title: 'AP Municipal Trade License / Commercial Permit',
      desc: 'Urban Local Body trade certificate issued through Andhra Pradesh Meeseva portal.',
      mandatory: true,
      authority: 'AP Urban Development & Meeseva',
    },
    {
      title: 'APCPDCL / APEPDCL Electricity Bill & Owner NOC',
      desc: 'Active commercial electricity consumer bill with consent letter from premises owner.',
      mandatory: true,
      authority: 'AP Discoms',
    },
  ],
  RJ: [
    {
      title: 'Rajasthan Commercial Lease & Urban Local Body NOC',
      desc: 'Commercial lease deed on Rajasthan e-Stamp paper plus Municipal Corporation / Council NOC.',
      mandatory: true,
      authority: 'Rajasthan Revenue Dept',
    },
    {
      title: 'JVVNL / AVVNL / JdVVNL Electricity Bill',
      desc: 'Paid electricity utility bill under 2 months verifying address occupancy.',
      mandatory: true,
      authority: 'Rajasthan Discoms',
    },
  ],
  HR: [
    {
      title: 'Haryana Shop & Commercial Establishment Registration',
      desc: 'Labor department registration certificate issued through Haryana Enterprise Promotion Portal (HEPC).',
      mandatory: true,
      authority: 'Haryana Labor Dept',
    },
    {
      title: 'DHBVN / UHBVN Electricity Bill & Registered Lease',
      desc: 'Consumer electricity bill from DHBVN (Gurugram/Faridabad) or UHBVN plus lease agreement.',
      mandatory: true,
      authority: 'Haryana Discoms',
    },
  ],
};

const DEFAULT_STATE_DOCS: StateDocRequirement[] = [
  {
    title: 'Commercial Lease / Rent Agreement on State Stamp Paper',
    desc: 'Lease deed executed on state-appropriate non-judicial stamp paper with notary attestation.',
    mandatory: true,
    authority: 'State Revenue & Stamp Department',
  },
  {
    title: 'Discom Commercial Electricity Bill (< 60 Days)',
    desc: 'Recent utility bill verifying registered office address with active consumer number.',
    mandatory: true,
    authority: 'State Electricity Distribution Company',
  },
  {
    title: 'Property Owner Notarized NOC & Identity Proof',
    desc: 'Signed consent letter from premises title holder with self-attested identity proof (Aadhaar / PAN).',
    mandatory: true,
    authority: 'Premises Title Holder',
  },
];

/**
 * Returns state-specific requirements for statutory filings (Company Registration, GST, LLP).
 * Pure services (Software, Bookkeeping, Consulting, Legal Notices) have zero state premises requirements.
 */
export function getStateDocumentRequirements(stateCode: string, isStatutoryFiling: boolean): StateDocRequirement[] {
  if (!isStatutoryFiling) return [];
  const normalized = (stateCode || '').trim().toUpperCase();
  return STATE_DOCUMENT_MAP[normalized] || DEFAULT_STATE_DOCS;
}
