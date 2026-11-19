'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const ALL_FAQS: FAQItem[] = [
  // 1. Company & LLP Incorporation
  {
    category: 'Incorporation & MCA',
    q: 'What is the ₹999 Advance Token option and how does it work?',
    a: 'The ₹999 advance token allows you to initiate your statutory filing (including MCA name reservation, constitutional document drafting, and CA pre-audit) without paying the full package fee upfront. Once your documents are CA-verified and the name is reserved, the remaining balance is settled transparently in your Order Tracking Room.',
  },
  {
    category: 'Incorporation & MCA',
    q: 'How long does company incorporation or registration take from start to finish?',
    a: 'Private Limited and LLP incorporations typically complete within 3 to 7 working days, subject to Central Registration Centre (CRC) processing. GST registrations take 3 to 5 working days, while MSME Udyam certificates are issued within 24 to 48 hours.',
  },
  {
    category: 'Incorporation & MCA',
    q: 'How does NyayaLink guarantee government filing accuracy?',
    a: 'Every filing undergoes a 2-stage verification workflow: automated algorithmic validation against MCA V3, GSTN, and IP India rules, followed by meticulous scrutiny and digital certification from practicing Chartered Accountants, Company Secretaries, or High Court Advocates before submission.',
  },
  {
    category: 'Incorporation & MCA',
    q: 'Is the entire registration process 100% online and paperless?',
    a: 'Yes, 100% digital and paperless. You never need to visit a physical government office or courier physical papers. Identity verification and document signing are handled securely via Class-3 Digital Signature Certificates (DSC) or Aadhaar OTP, and all documents are stored in your encrypted NyayaLink Vault.',
  },
  {
    category: 'Incorporation & MCA',
    q: 'What post-incorporation compliances are required after company registration?',
    a: 'Under the Companies Act 2013, newly incorporated companies must complete three mandatory steps: (1) Open a corporate bank current account and file MCA Form INC-20A (Commencement of Business) within 180 days, (2) Appoint a statutory auditor via Form ADT-1 within 30 days, and (3) Complete annual Director DIR-3 KYC filings before September 30.',
  },
  {
    category: 'Incorporation & MCA',
    q: 'Can a single person register a company in India?',
    a: 'Yes! Under the Companies Act 2013, a single Indian citizen can incorporate a One Person Company (OPC). It gives you limited liability protection and corporate status while allowing 100% sole ownership with one designated nominee director.',
  },

  // 2. Pricing & Pure Agent
  {
    category: 'Pricing & Govt Fees',
    q: 'Are government statutory fees and state stamp duties included?',
    a: 'NyayaLink packages clearly itemize professional fees and standard portal charges. State-specific stamp duties (which vary by authorized capital and registered state, e.g., Maharashtra, Delhi, Karnataka) and official registry fees are passed through strictly at actual government challan receipts with zero markup under Rule 33 of CGST Rules.',
  },
  {
    category: 'Pricing & Govt Fees',
    q: 'Can my business claim GST Input Tax Credit (ITC) on NyayaLink invoices?',
    a: 'Yes. NyayaLink issues valid GST tax invoices with our active GSTIN for all professional services. Simply enter your company GSTIN during checkout or in your Vault profile, and you can claim full 18% Input Tax Credit on your monthly GSTR-3B filings.',
  },
  {
    category: 'Pricing & Govt Fees',
    q: 'What is Pure Agent Rule 33 transparency?',
    a: 'Under Rule 33 of the Central Goods and Services Tax Rules, an agent who pays government treasury fees (such as MCA name approval fees, state stamp duties, and trademark statutory application fees) on behalf of a client is legally required to pass them through at actual receipts without charging GST or profit markup on the government fee component. We upload the official government treasury receipts directly into your Vault.',
  },
  {
    category: 'Pricing & Govt Fees',
    q: 'What is NyayaLink’s refund and cancellation policy?',
    a: 'We offer an upfront, fair cancellation policy. If your filing has not yet been drafted by our CA team, you are eligible for an immediate full refund minus nominal payment gateway processing charges. Once statutory challans are paid to government treasuries (MCA/GSTN/IP India), government fees cannot be refunded as per Ministry rules.',
  },

  // 3. Trademark & IPR
  {
    category: 'Trademark & Intellectual Property',
    q: 'What is the MSME 50% government fee concession for trademarks?',
    a: 'Under official IP India rules, individual applicants, startups, and MSME-registered enterprises pay a discounted government filing fee of ₹4,500 per class instead of ₹9,000 for standard companies. If you do not have MSME registration, NyayaLink includes MSME Udyam registration in our Startup bundles so you qualify for the 50% statutory discount.',
  },
  {
    category: 'Trademark & Intellectual Property',
    q: 'How long does trademark registration take in India?',
    a: 'You receive your official TM Application Number and can use the ™ symbol within 24 hours of filing. Complete registration (from examination report, publication in the Trade Marks Journal, to the ® Certificate) takes approximately 6 to 12 months, depending on whether an examination objection or third-party opposition is raised.',
  },
  {
    category: 'Trademark & Intellectual Property',
    q: 'What happens if my trademark application faces an objection?',
    a: 'Over 60% of trademark applications in India face an initial examination objection under Section 9 (distinctiveness) or Section 11 (similarity). Our verified High Court Advocates draft a formal, statutory reply citing relevant case law within the mandatory 30-day window.',
  },

  // 4. Tax, GST & Accounting
  {
    category: 'GST & Compliance',
    q: 'Is GST registration mandatory for an online e-commerce business?',
    a: 'Yes. Under Section 24 of the CGST Act, interstate suppliers of taxable goods selling through electronic commerce operators (such as Amazon, Flipkart, or your own Shopify store) are required to obtain compulsory GST registration regardless of turnover threshold.',
  },
  {
    category: 'GST & Compliance',
    q: 'What documents are required to apply for a GST certificate?',
    a: 'You need: (1) PAN card of the business/proprietor, (2) Aadhaar card for biometric/OTP authentication, (3) Proof of principal place of business (electricity bill, property tax receipt, or rent agreement with owner NOC), and (4) Cancelled cheque or bank statement showing business name and IFSC.',
  },
  {
    category: 'GST & Compliance',
    q: 'What is a GST LUT (Letter of Undertaking)?',
    a: 'A Letter of Undertaking (LUT) allows registered exporters and service providers to export goods or services outside India with 0% IGST payment upfront without blocking working capital. It is valid for one financial year and must be renewed annually.',
  },

  // 5. Legal Disputes & ODR
  {
    category: 'Disputes & Consumer Law',
    q: 'What is an Advocate Demand Notice and when should I send one?',
    a: 'A statutory advocate demand notice is a formal legal warning sent on a verified advocate’s letterhead detailing your claim, breach of contract, or financial dues. It is dispatched via Registered Speed Post with Proof of Delivery (POD) giving the defaulter 15 to 30 days to settle before civil or criminal court action begins. It successfully resolves over 70% of consumer and vendor disputes without litigation.',
  },
  {
    category: 'Disputes & Consumer Law',
    q: 'Can I file a consumer complaint online through e-Daakhil?',
    a: 'Yes. The Ministry of Consumer Affairs operates the e-Daakhil portal allowing digital filing of consumer complaints before District, State, and National Consumer Commissions. Empanelled advocates on NyayaLink draft the petition, affidavit, and index of documents and file directly through the portal.',
  },

  // 6. Security & Document Vault
  {
    category: 'Security & Vault',
    q: 'How do I download and preserve my approved government certificates?',
    a: 'Once approved by statutory authorities (MCA, GSTN, DGFT, or IP India), all official certificates (Certificate of Incorporation, PAN/TAN cards, GSTIN registration certificate, Trademark TM-A receipts) are permanently archived in your encrypted digital Vault with verifiable QR codes for instant lifetime download.',
  },
  {
    category: 'Security & Vault',
    q: 'Are my confidential business documents safe on NyayaLink?',
    a: 'Yes. All company agreements, director IDs, and financial records are encrypted using AES-256 GCM encryption at rest and TLS 1.3 in transit. Our infrastructure runs on sovereign Indian data center regions complying with ISO 27001 and Digital Personal Data Protection (DPDP) Act standards.',
  },
];

const CATEGORIES = [
  'All',
  'Incorporation & MCA',
  'Pricing & Govt Fees',
  'Trademark & Intellectual Property',
  'GST & Compliance',
  'Disputes & Consumer Law',
  'Security & Vault',
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = ALL_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 pb-20 lg:pb-12">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#031522] via-[#073B5C] to-[#031522] text-white py-12 px-4 sm:px-8 border-b border-cyan-800/40">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0E7490]/30 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-black text-[#F4B942]">
            <span>📖</span> Official NyayaLink Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Clear, transparent answers about company incorporation, statutory government fees, Pure Agent pass-through rules, and certified CA workflows.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. ₹999 token, stamp duty, GST, trademark)..."
                className="w-full bg-white text-slate-800 text-xs sm:text-sm py-3 pl-10 pr-4 rounded-2xl shadow-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#F4B942]"
                aria-label="Search frequently asked questions"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 snap-start text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0E7490]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing {filteredFaqs.length} of {ALL_FAQS.length} answers</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-[#0E7490] hover:underline font-bold"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 font-extrabold text-[#073B5C] text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0E7490] block">
                      {faq.category}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <span className="text-sm font-mono text-slate-400 shrink-0 mt-0.5">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-3">
              <span className="text-3xl">🔎</span>
              <h3 className="font-bold text-sm text-[#073B5C]">No matching questions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need specific legal advice for your company? Talk directly to our empanelled Chartered Accountants and Advocates.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/919920054785?text=Hi%20NyayaLink%2C%20I%20have%20a%20question%20not%20covered%20in%20the%20FAQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>💬</span> Ask a CA on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-8 bg-gradient-to-br from-[#073B5C] to-[#0A4E7A] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-black text-white">
              Still have questions about your registration?
            </h3>
            <p className="text-xs text-slate-200">
              Our empanelled Chartered Accountants in Mumbai are available on direct desk.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`tel:${BRAND.phoneTel}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              📞 Call Desk
            </a>
            <a
              href="https://wa.me/919920054785?text=Hi%20NyayaLink%2C%20I%20need%20clarification%20on%20a%20legal%20filing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-xs px-4 py-2.5 rounded-xl transition shadow"
            >
              💬 Chat on WhatsApp →
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/" className="text-xs font-bold text-[#0E7490] hover:underline">
            ← Back to NyayaLink Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
