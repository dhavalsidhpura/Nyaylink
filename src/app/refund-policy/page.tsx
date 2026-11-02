import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | NyayaLink',
  description:
    'Transparent fee policies, ₹999 booking token rules, pre-filing cancellation windows, statutory pass-through guidelines, and 5-7 business day refund SLA.',
};

export default function RefundPolicyPage() {
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
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-cyan-200 hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            Statutory Transparency & Fair Commercial Practice
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#073B5C]">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: November 2026 • Governed by Indian Contract Act, 1872 & Consumer Protection Act, 2019
          </p>
        </div>

        {/* Policy Highlights Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3">
            <strong className="text-[#073B5C] block text-sm">⏱️ 24-Hour Cancellation</strong>
            <p className="text-slate-500">100% refund of professional fees if cancelled before drafting begins.</p>
          </div>
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3">
            <strong className="text-[#073B5C] block text-sm">🏛️ Pure Agent Separation</strong>
            <p className="text-slate-500">Government fees are non-refundable once challans or stamp duties are issued.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#073B5C] block text-sm">💳 5–7 Day SLA</strong>
            <p className="text-slate-500">Refunds returned directly to original source (UPI / Card / NetBanking).</p>
          </div>
        </div>

        <section className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              1. Treatment of the ₹999 Advance Booking Token
            </h2>
            <p>
              NyayaLink offers a split-ticket advance booking option (₹999) to initiate legal and corporate filings without requiring full upfront capital.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Full Adjustment:</strong> The ₹999 token is 100% credited against your final professional fee invoice upon case completion.
              </li>
              <li>
                <strong>Cancellation Prior to Work:</strong> If you request cancellation within 24 hours of booking and prior to the assignment of a Chartered Accountant or preliminary name/trademark search, the ₹999 is refundable minus actual payment gateway processing fees (typically 2%).
              </li>
              <li>
                <strong>Post-Commencement:</strong> Once our CA or legal team has initiated the comprehensive preliminary search, name conflict analysis, or charter drafting, the ₹999 advance represents compensation for professional time expended and is non-refundable.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              2. Non-Refundable Statutory Government Outlays (Pure Agent)
            </h2>
            <p>
              Under Rule 33 of the Central Goods and Services Tax (CGST) Rules, 2017, government fees, state stamp duties, and official portal charges are collected purely as pass-through disbursements.
            </p>
            <p>
              Once an official Service Request Number (SRN), MCA SPICe+ challan, IP India trademark fee receipt, state e-Stamp certificate, or PAN/TAN acknowledgement is generated, <strong>such statutory disbursements are irrevocably remitted to the Consolidated Fund of India or respective State Government Treasury and cannot be refunded by NyayaLink.</strong>
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              3. MCA Name Reservation & Resubmission Assurance
            </h2>
            <p>
              Name approval under the Companies Act, 2013 is subject to the sole statutory discretion of the Ministry of Corporate Affairs Central Registration Centre (CRC). While NyayaLink conducts rigorous preliminary phonetics and trademark screening:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                If a proposed company or LLP name is queried or rejected by the CRC Registrar, NyayaLink provides <strong>free drafting and re-filing of revised names</strong> within the statutory resubmission window without charging additional professional fees.
              </li>
              <li>
                Government resubmission fees (if applicable after expiry of statutory resubmission periods) shall be payable at actuals.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              4. Advocate & Legal Consultation Bookings
            </h2>
            <p>
              For consultations booked through the <strong>वकील (Lawyer) Marketplace</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Rescheduling:</strong> Clients may reschedule an appointment up to 2 hours before the confirmed slot time at zero penalty.
              </li>
              <li>
                <strong>Advocate No-Show:</strong> In the rare event an empanelled advocate fails to attend the scheduled video/telephonic session, the client is entitled to either an immediate 100% refund or an expedited priority rescheduling.
              </li>
              <li>
                <strong>Client No-Show:</strong> If a client fails to attend a confirmed consultation without prior notification, the consultation fee is retained to compensate the advocate for reserved calendar time.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              5. Dormant & Unresponsive Dockets
            </h2>
            <p>
              If a client fails to upload mandatory statutory KYC documents (PAN, Masked Aadhaar, Utility Bills) or execute required DSC signatures for more than 60 consecutive days after repeated reminders via email and WhatsApp, the docket will be marked Dormant. The docket can be reactivated within 180 days upon submission of updated documents at zero reinstatement fee.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#073B5C]">
              6. Refund SLA & Escalation Contact
            </h2>
            <p>
              To request a refund or cancellation, submit your order number and registered email address to:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-1 text-slate-800">
              <div><strong>Grievance & Accounts Desk:</strong> refunds@nyayalink.com</div>
              <div><strong>Grievance Officer:</strong> grievance@nyayalink.com</div>
              <div><strong>Escalation Phone:</strong> +91 9920054785 (10:00 AM – 6:30 PM IST, Mon–Fri)</div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              All eligible refunds are reviewed by the finance controller within 24–48 hours and disbursed directly to the original payment source within 5–7 banking days.
            </p>
          </div>

        </section>
      </main>
    </div>
  );
}
