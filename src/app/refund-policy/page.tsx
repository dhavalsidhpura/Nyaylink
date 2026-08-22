import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-[#073B5C] text-white py-4 px-4 sm:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#073B5C]">Cancellation & Refund Policy</h1>
          <p className="text-xs text-slate-500">Clear and transparent fee guidelines</p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#073B5C]">1. Pre-Filing Cancellation</h2>
          <p>
            Clients may request an order cancellation within 24 hours of payment, provided document ingestion has not commenced. In such cases, professional retainer fees are eligible for a 100% refund after deducting gateway transaction processing charges (2%).
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">2. Non-Refundable Statutory Government Fees</h2>
          <p>
            Once a Service Request Number (SRN), government challan, or stamp duty payment is generated on official government portals (MCA, GSTN, DGFT, IP India), that portion of the fee is strictly non-refundable under government treasury rules.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">3. Refund Processing SLA</h2>
          <p>
            Approved refunds are credited back to the original payment source (UPI / Bank Account) within 5–7 business days.
          </p>
        </section>
      </main>
    </div>
  );
}