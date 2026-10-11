'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type AgreementType = 'nda' | 'founder' | 'msa';

interface AgreementConfig {
  type: AgreementType;
  title: string;
  tagline: string;
  badge: string;
  icon: string;
}

const AGREEMENT_TYPES: AgreementConfig[] = [
  {
    type: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    tagline: 'Standard 2-way bilateral confidentiality contract protecting proprietary trade secrets & pitch decks.',
    badge: 'Most Popular',
    icon: '🔒',
  },
  {
    type: 'founder',
    title: 'Founders Restrictive Stock & Vesting Agreement',
    tagline: 'Defines 4-year vesting, 1-year cliff, cap-table equity splits, and 100% intellectual property assignment.',
    badge: 'Venture Ready',
    icon: '👥',
  },
  {
    type: 'msa',
    title: 'Freelancer & Consultant Master Service Agreement',
    tagline: 'Work-made-for-hire contract securing 100% IP ownership, deliverables, and payment release milestones.',
    badge: 'B2B Standard',
    icon: '💼',
  },
];

const FAQS = [
  {
    q: 'Are agreements generated on NyayaLink legally valid in Indian courts?',
    a: 'Yes. Under Section 10 of the Indian Contract Act, 1872 and Section 65B of the Indian Evidence Act, contracts executed with mutual consent, lawful consideration, and electronic authentication or physical execution are 100% legally binding and enforceable.',
  },
  {
    q: 'Does an NDA require stamp paper in India?',
    a: 'Yes. Under state stamp duty laws (such as the Maharashtra Stamp Act or Delhi Stamp Act), non-disclosure agreements generally require a non-judicial stamp paper of ₹100 or ₹500 depending on the state of execution.',
  },
  {
    q: 'What is a 1-Year Vesting Cliff in Founders Agreements?',
    a: 'A 1-year cliff ensures that if a co-founder leaves within the first 12 months of incorporation, they forfeit 100% of their unvested shares, protecting the remaining founders and future angel or venture capital investors.',
  },
  {
    q: 'Can NyayaLink print this on stamp paper and execute it for me?',
    a: 'Yes. You can book an empanelled advocate consultation or select our Legal Drafting docket. Our team will verify the clauses, purchase the non-judicial e-stamp paper in your state, and coordinate physical or digital execution.',
  },
];

export default function AgreementGeneratorPage() {
  const [agreementType, setAgreementType] = useState<AgreementType>('nda');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Common Form Fields
  const [party1Name, setParty1Name] = useState('Acme Technologies Private Limited');
  const [party1Type, setParty1Type] = useState('Private Limited Company');
  const [party1City, setParty1City] = useState('Mumbai, Maharashtra');

  const [party2Name, setParty2Name] = useState('Apex Innovations LLP');
  const [party2Type, setParty2Type] = useState('Limited Liability Partnership');
  const [party2City, setParty2City] = useState('Bengaluru, Karnataka');

  const [effectiveDate, setEffectiveDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [governingState, setGoverningState] = useState('Maharashtra');

  // NDA Specific Fields
  const [confidentialityYears, setConfidentialityYears] = useState('3');
  const [includeNonSolicit, setIncludeNonSolicit] = useState(true);

  // Founders Agreement Specific Fields
  const [founder1Equity, setFounder1Equity] = useState('60');
  const [founder2Equity, setFounder2Equity] = useState('40');
  const [vestingMonths, setVestingMonths] = useState('48');
  const [hasOneYearCliff, setHasOneYearCliff] = useState(true);

  // MSA Specific Fields
  const [feeAmount, setFeeAmount] = useState('50,000');
  const [noticePeriodDays, setNoticePeriodDays] = useState('15');

  // Live Generated Legal Text
  const legalDraftText = useMemo(() => {
    const dateFormatted = new Date(effectiveDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (agreementType === 'nda') {
      return `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

THIS MUTUAL NON-DISCLOSURE AGREEMENT (the "Agreement") is entered into and made effective as of ${dateFormatted} (the "Effective Date"), by and between:

PARTY A:
${party1Name.toUpperCase()}, a ${party1Type} having its principal office at ${party1City} (hereinafter referred to as "First Party", which expression shall unless repugnant to the context include its successors and permitted assigns);

AND

PARTY B:
${party2Name.toUpperCase()}, a ${party2Type} having its principal office at ${party2City} (hereinafter referred to as "Second Party", which expression shall unless repugnant to the context include its successors and permitted assigns).

(The First Party and the Second Party are hereinafter collectively referred to as the "Parties" and individually as a "Party").

RECITALS
WHEREAS, the Parties wish to explore and evaluate a prospective commercial, legal, or investment relationship (the "Permitted Purpose"); and
WHEREAS, during the discussions, each Party may disclose to the other Party certain non-public, proprietary, or confidential commercial and technical information;

NOW, THEREFORE, in consideration of the mutual covenants contained herein and other good and valuable consideration, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by one Party ("Disclosing Party") to the other Party ("Receiving Party"), whether orally, visually, electronically, or in writing, including but not limited to business plans, financial projections, customer data, software code, trade secrets, algorithms, and intellectual property.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall:
(a) Hold all Confidential Information in strict confidence and protect it with the same degree of care it uses for its own confidential assets, being not less than reasonable care;
(b) Not disclose, publish, or disseminate Confidential Information to any third party without prior written authorization from the Disclosing Party;
(c) Disclose Confidential Information solely to its directors, key employees, and legal counsel who have a need to know for the Permitted Purpose and who are bound by written non-disclosure obligations.

3. TERM AND SURVIVAL
This Agreement shall remain in effect for a period of ${confidentialityYears} years from the Effective Date, upon which the confidentiality obligations with respect to disclosed trade secrets and proprietary materials shall survive for an additional period of two (2) years.

${
  includeNonSolicit
    ? `4. NON-SOLICITATION COVENANT
During the term of this Agreement and for twelve (12) months following its termination, neither Party shall directly or indirectly solicit, induce, or attempt to hire any key executive, engineer, or specialist of the other Party without prior written consent.`
    : ''
}

5. REMEDIES FOR BREACH
The Parties acknowledge that any breach of this Agreement would cause irreparable harm for which monetary damages alone would be inadequate. Accordingly, the Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law or in equity.

6. GOVERNING LAW AND ARBITRATION
This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be ${governingState}, India.

IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed by their duly authorized representatives on the date first written above.

For: ${party1Name}
By: ___________________________
Name: Authorized Signatory
Title: Director / Partner

For: ${party2Name}
By: ___________________________
Name: Authorized Signatory
Title: Director / Partner
`;
    }

    if (agreementType === 'founder') {
      return `FOUNDERS' RESTRICTIVE STOCK AND EQUITY VESTING AGREEMENT

THIS FOUNDERS' AGREEMENT is executed on this ${dateFormatted} (the "Effective Date") by and between:

FOUNDER 1: ${party1Name}, residing at ${party1City} ("Founder 1", holding ${founder1Equity}% equity);
AND
FOUNDER 2: ${party2Name}, residing at ${party2City} ("Founder 2", holding ${founder2Equity}% equity).

WHEREAS, the Founders are co-founding an enterprise to build and commercialize scalable technology and commercial services; and
WHEREAS, the Founders desire to establish shareholding ratios, equity vesting schedules, intellectual property assignments, and governance terms;

IT IS HEREBY AGREED AS FOLLOWS:

1. INITIAL EQUITY SPLIT
The initial authorized and paid-up equity shareholding shall be allocated as follows:
- Founder 1: ${founder1Equity}% of issued equity shares.
- Founder 2: ${founder2Equity}% of issued equity shares.

2. VESTING SCHEDULE AND CLIFF
All equity shares held by the Founders shall be subject to a ${vestingMonths}-month reverse vesting schedule:
${
  hasOneYearCliff
    ? `(a) One-Year Cliff: 25% of each Founder's total shares shall vest on the first anniversary of the Effective Date (the "Cliff"). No shares shall vest prior to the Cliff.`
    : '(a) Immediate Monthly Vesting: Shares shall vest in equal monthly installments over the vesting duration.'
}
(b) Post-Cliff: The remaining 75% of shares shall vest in equal monthly installments over the following 36 months, provided the Founder remains in full-time active service.

3. 100% INTELLECTUAL PROPERTY ASSIGNMENT
Each Founder irrevocably assigns, transfers, and conveys to the Company all rights, title, and interest in and to all inventions, algorithms, software, trademarks, designs, and domain names created or developed in connection with the enterprise.

4. GOOD LEAVER VS. BAD LEAVER
(a) Bad Leaver: If a Founder is terminated for cause (fraud, criminal conviction, willful breach of fiduciary duty), the Company shall have the right to repurchase all unvested and vested shares at face value.
(b) Good Leaver: If a Founder departs due to permanent disability or mutual consent, they shall retain all vested shares, and only unvested shares shall revert to the Company pool.

5. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by the laws of India, and courts situated in ${governingState} shall have exclusive jurisdiction.

IN WITNESS WHEREOF, the Founders have signed this Agreement on the Effective Date.

___________________________                     ___________________________
${party1Name} (Founder 1)                       ${party2Name} (Founder 2)
`;
    }

    return `MASTER SERVICES & FREELANCER AGREEMENT (WORK-MADE-FOR-HIRE)

THIS MASTER SERVICES AGREEMENT is made effective as of ${dateFormatted}, by and between:

CLIENT: ${party1Name}, having its office at ${party1City} ("Client");
AND
SERVICE PROVIDER: ${party2Name}, residing/operating at ${party2City} ("Contractor").

1. ENGAGEMENT AND SCOPE OF WORK
Client engages Contractor to perform professional deliverables, software design, or consulting services as mutually defined in writing.

2. COMPENSATION & PAYMENT TERMS
Client agrees to pay Contractor a total professional retainer of ₹${feeAmount} against verified milestone invoices within 15 days of presentation.

3. INTELLECTUAL PROPERTY (WORK MADE FOR HIRE)
Contractor expressly agrees that all works, source code, designs, and deliverables created under this Agreement shall constitute "work made for hire" under the Copyright Act, 1957. 100% proprietary ownership, copyright, and patent rights vest solely and unconditionally with the Client upon fee payment.

4. TERM AND TERMINATION
Either Party may terminate this Agreement by providing ${noticePeriodDays} days written notice to the other Party. Upon termination, Client shall pay for work completed up to the termination date.

5. GOVERNING LAW
Governed by the laws of India with exclusive jurisdiction in ${governingState}.

FOR CLIENT:                                      FOR CONTRACTOR:
___________________________                     ___________________________
${party1Name}                                   ${party2Name}
`;
  }, [
    agreementType,
    party1Name,
    party1Type,
    party1City,
    party2Name,
    party2Type,
    party2City,
    effectiveDate,
    governingState,
    confidentialityYears,
    includeNonSolicit,
    founder1Equity,
    founder2Equity,
    vestingMonths,
    hasOneYearCliff,
    feeAmount,
    noticePeriodDays,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(legalDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([legalDraftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NyayaLink_${agreementType.toUpperCase()}_Agreement.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      {/* TOOL HERO BAR */}
      <section className="bg-[#073B5C] text-white py-10 px-4 sm:px-6 border-b border-[#0E7490]/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#F4B942] font-extrabold uppercase tracking-wider">
            <span>⚖️</span>
            <span>NyayaLink Legal Tech Tools</span>
            <span>•</span>
            <span className="text-cyan-200">Indian Contract Act 1872 Compliant</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Instant Legal Agreement Drafter & Contract Generator
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Generate customized, legally vetted Indian commercial contracts in seconds. Customize mutual NDAs, founders equity vesting schedules, and consultant service agreements ready for signature.
          </p>

          {/* TEMPLATE PICKER PILLS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {AGREEMENT_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setAgreementType(t.type)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  agreementType === t.type
                    ? 'bg-white text-[#073B5C] border-white shadow-lg'
                    : 'bg-[#052A42]/60 hover:bg-[#052A42] border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.icon}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      agreementType === t.type ? 'bg-[#073B5C] text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-xs sm:text-sm mt-2 leading-tight">{t.title}</h3>
                <p className="text-[11px] opacity-80 mt-1 line-clamp-2">{t.tagline}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WORKBENCH: FORM ON LEFT, LIVE PREVIEW ON RIGHT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        {/* LEFT COLUMN: INTERACTIVE FORM (40%) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#073B5C]">1. Contract Parties & Jurisdiction</h2>
              <p className="text-xs text-slate-500">Provide legal entity names and addresses for both parties.</p>
            </div>

            {/* PARTY 1 */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
                Party A (First Party / Disclosing)
              </span>
              <div>
                <label className="text-xs font-bold text-slate-700">Legal Entity Name</label>
                <input
                  type="text"
                  value={party1Name}
                  onChange={(e) => setParty1Name(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Entity Type</label>
                  <input
                    type="text"
                    value={party1Type}
                    onChange={(e) => setParty1Type(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">City, State</label>
                  <input
                    type="text"
                    value={party1City}
                    onChange={(e) => setParty1City(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* PARTY 2 */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
                Party B (Second Party / Receiving)
              </span>
              <div>
                <label className="text-xs font-bold text-slate-700">Legal Entity / Individual Name</label>
                <input
                  type="text"
                  value={party2Name}
                  onChange={(e) => setParty2Name(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Entity Type</label>
                  <input
                    type="text"
                    value={party2Type}
                    onChange={(e) => setParty2Type(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">City, State</label>
                  <input
                    type="text"
                    value={party2City}
                    onChange={(e) => setParty2City(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* JURISDICTION & DATE */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Arbitration State</label>
                  <select
                    value={governingState}
                    onChange={(e) => setGoverningState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Maharashtra">Maharashtra (Mumbai)</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="Karnataka">Karnataka (Bengaluru)</option>
                    <option value="Telangana">Telangana (Hyderabad)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                    <option value="Gujarat">Gujarat (Ahmedabad)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SPECIFIC CLAUSES */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-[#073B5C] uppercase tracking-wider">
                2. Agreement Specific Options
              </h3>

              {agreementType === 'nda' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Confidentiality Term (Years)</label>
                    <select
                      value={confidentialityYears}
                      onChange={(e) => setConfidentialityYears(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                    >
                      <option value="2">2 Years</option>
                      <option value="3">3 Years (Recommended)</option>
                      <option value="5">5 Years</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNonSolicit}
                      onChange={(e) => setIncludeNonSolicit(e.target.checked)}
                      className="accent-[#0E7490] w-4 h-4 rounded"
                    />
                    Include 12-Month Non-Solicitation Clause
                  </label>
                </div>
              )}

              {agreementType === 'founder' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Founder 1 Equity (%)</label>
                      <input
                        type="number"
                        value={founder1Equity}
                        onChange={(e) => setFounder1Equity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Founder 2 Equity (%)</label>
                      <input
                        type="number"
                        value={founder2Equity}
                        onChange={(e) => setFounder2Equity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Vesting Duration</label>
                    <select
                      value={vestingMonths}
                      onChange={(e) => setVestingMonths(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                    >
                      <option value="36">36 Months (3 Years)</option>
                      <option value="48">48 Months (4 Years - Silicon Valley Standard)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOneYearCliff}
                      onChange={(e) => setHasOneYearCliff(e.target.checked)}
                      className="accent-[#0E7490] w-4 h-4 rounded"
                    />
                    Include Mandatory 1-Year Cliff (25% initial unlock)
                  </label>
                </div>
              )}

              {agreementType === 'msa' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Total Project Retainer / Fee (₹)</label>
                    <input
                      type="text"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Termination Notice Period (Days)</label>
                    <select
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                    >
                      <option value="7">7 Days</option>
                      <option value="15">15 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ADVOCATE REVIEW CROSS-SELL BANNER */}
          <div className="bg-[#052A42] text-white p-5 rounded-3xl border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-[#F4B942] font-black text-xs uppercase">
              <span>👨‍⚖️</span> Need High Court Advocate Verification?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have our empanelled corporate advocates verify custom covenants, draft bespoke non-compete clauses, or stamp this contract on official state non-judicial stamp paper.
            </p>
            <Link
              href="/vakil"
              className="inline-block bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Consult an Advocate for ₹999 →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE LEGAL DOCUMENT VIEWER (60%) */}
        <div className="lg:col-span-7 space-y-4">
          {/* ACTION BUTTON BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-extrabold text-[#073B5C] flex items-center gap-1.5">
              <span>📄</span> Ready-to-Sign Legal Draft
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="bg-[#073B5C] hover:bg-[#052A42] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>💾</span>
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* PARCHMENT VIEWER */}
          <div className="bg-white rounded-3xl border-2 border-slate-300/80 shadow-lg p-6 sm:p-10 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[800px] overflow-y-auto selection:bg-[#F4B942] selection:text-[#073B5C]">
            {legalDraftText}
          </div>
        </div>
      </main>

      {/* FAQS SECTION */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#073B5C]">Legal Drafting & Enforceability FAQs</h2>
            <p className="text-xs text-slate-500">Guidelines on electronic contracts, stamp paper, and commercial enforceability in India.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-xs sm:text-sm text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-base text-[#0E7490] font-mono shrink-0">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
