import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy & Data Protection Policy | NyayaLink',
  description:
    'Institutional data privacy policy compliant with Digital Personal Data Protection Act, 2023 (DPDP), IT Act 2000, and UIDAI Masked Aadhaar circulars.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-[#073B5C] text-white py-4 px-4 sm:px-6 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-[#F4B942] hover:underline">
              ← Back to Home
            </Link>
            <Link href="/terms" className="text-cyan-200 hover:text-white">
              Terms
            </Link>
            <Link href="/refund-policy" className="text-cyan-200 hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            Digital Personal Data Protection Act (DPDP), 2023 Compliant
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#073B5C]">
            Privacy & Data Governance Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: November 2026 • Data Fiduciary: NyayaLink Legal Services Pvt. Ltd. (Mumbai, India)
          </p>
        </div>

        {/* DPDP Quick Compliance Badges */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3">
            <strong className="text-[#073B5C] block text-sm">🪪 Masked Aadhaar Only</strong>
            <p className="text-slate-500">Strict adherence to UIDAI circulars; full unmasked Aadhaar numbers are never stored.</p>
          </div>
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3">
            <strong className="text-[#073B5C] block text-sm">🔐 256-Bit S3 Vault</strong>
            <p className="text-slate-500">Documents encrypted at rest with immutable SHA-256 access audit trails.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#073B5C] block text-sm">🚫 Zero Telemarketing</strong>
            <p className="text-slate-500">Your phone number and email are never shared, traded, or sold to third parties.</p>
          </div>
        </div>

        <section className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              1. Identity of the Data Fiduciary
            </h2>
            <p>
              NyayaLink Legal Services Pvt. Ltd. (&ldquo;NyayaLink&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates as a Data Fiduciary under the Digital Personal Data Protection Act, 2023. We determine the purpose and means of processing personal data strictly necessary to execute company incorporations, tax filings, intellectual property registrations, and legal notice drafting.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              2. Categorization of Data Collected & Purpose Specification
            </h2>
            <p>
              We collect and process personal and commercial data solely for specific statutory purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Director & Signatory Identity KYC:</strong> Permanent Account Number (PAN), Passport/Voter ID, Director Identification Number (DIN), and Digital Signature Certificate (DSC) files required under the Companies Act, 2013 and Rule 9 of the Companies (Incorporation) Rules, 2014.
              </li>
              <li>
                <strong>Aadhaar Guidelines (UIDAI Compliance):</strong> In accordance with UIDAI regulations, users are instructed to upload exclusively <strong>Masked Aadhaar</strong> copies (wherein the first 8 digits are obscured, leaving only the last 4 digits visible). NyayaLink does not require or store unredacted Aadhaar numbers.
              </li>
              <li>
                <strong>Address & Premises Verification:</strong> Utility bills (electricity, water, telephone &lt; 2 months old), Rent Agreements, and No-Objection Certificates (NOC) required by the MCA Central Registration Centre and CBIC GSTN portals.
              </li>
              <li>
                <strong>Transactional & Authentication Data:</strong> Mobile numbers and email addresses used for one-time verification (OTP), multi-factor authentication, and order milestone alerts.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              3. Encryption Architecture & Storage Security
            </h2>
            <p>
              All client documents uploaded to the NyayaLink Platform are protected by defense-in-depth security standards:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>In-Transit Encryption:</strong> All HTTP traffic is enforced over TLS 1.3 / SSL with strict HSTS headers.</li>
              <li><strong>At-Rest Storage:</strong> Private documents are stored in server-side encrypted AWS S3 buckets (AES-256) with short-lived presigned download URLs.</li>
              <li><strong>Access Control:</strong> Document access is strictly segregated based on Role-Based Access Control (RBAC). Only the verified Chartered Accountant or advocate assigned to your docket can review your uploaded files.</li>
              <li><strong>Immutable Audit Logs:</strong> Every file upload, review, and download generates a tamper-evident audit record (<code className="font-mono bg-slate-100 px-1 rounded">DocumentAccessLog</code>) logging actor ID, timestamp, and IP address.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              4. Data Retention & Cryptographic Disposal Schedule
            </h2>
            <p>
              NyayaLink maintains strict data lifecycle schedules:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>During Active Processing:</strong> Documents remain available in your encrypted Vault for verification, portal submission, and client downloads.
              </li>
              <li>
                <strong>Statutory Accounting & Tax Retention:</strong> Under Section 128 of the Companies Act, 2013 and Section 36 of the CGST Act, 2017, books of accounts, tax invoices, and statutory incorporation records must be preserved for eight (8) years following the close of the relevant financial year.
              </li>
              <li>
                <strong>Right to Erasure / Shredding:</strong> Upon expiration of mandatory statutory audit retention periods or upon verified client account deletion requests (where no active statutory obligation applies), files are subjected to permanent cryptographic deletion.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              5. Authorized Sub-Processors & Data Transfers
            </h2>
            <p>
              We engage only audited, enterprise-grade infrastructure providers under strict Data Processing Agreements:
            </p>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 font-bold text-[#073B5C] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Sub-Processor</th>
                    <th className="p-2.5">Purpose</th>
                    <th className="p-2.5">Hosting Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold">AWS (Amazon Web Services)</td>
                    <td className="p-2.5">Encrypted S3 Document Vault & Cloud Compute</td>
                    <td className="p-2.5">Mumbai (ap-south-1), India</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Supabase PostgreSQL</td>
                    <td className="p-2.5">Encrypted Database Storage & Auth Session Store</td>
                    <td className="p-2.5">ap-northeast-1 / India peering</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Razorpay Software Pvt. Ltd.</td>
                    <td className="p-2.5">PCI-DSS Level 1 Payment Processing</td>
                    <td className="p-2.5">India (Strict RBI Tokenization)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              6. Data Principal Rights & Grievance Redressal
            </h2>
            <p>
              Under Section 11–14 of the DPDP Act, 2023, you possess the right to access summaries of personal data processed, request correction of inaccurate data, and nominate a representative in the event of death or incapacity.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-1 text-slate-800">
              <div><strong>Designated Data Protection & Grievance Officer:</strong></div>
              <div>NyayaLink Legal Services Pvt. Ltd.</div>
              <div>Charkop, Kandivali West, Mumbai, MH 400067, India</div>
              <div>Email: <strong>privacy@nyayalink.com</strong> / <strong>grievance@nyayalink.com</strong></div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Grievance inquiries receive formal acknowledgement within 24 business hours and comprehensive resolution within 30 days.
            </p>
          </div>

        </section>
      </main>
    </div>
  );
}
