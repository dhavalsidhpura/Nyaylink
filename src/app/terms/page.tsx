import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#073B5C]">Terms of Service</h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#073B5C]">1. Nature of Platform & Legal Technology Disclaimer</h2>
          <p>
            NyayaLink provides a cloud-based technology platform facilitating corporate compliance, regulatory filings, and document management. NyayaLink is not a law firm and does not provide formal legal representation. All professional advisory and statutory document verification services are handled independently by empanelled Chartered Accountants (CAs), Company Secretaries (CSs), and Advocates.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">2. Accuracy of Client Information</h2>
          <p>
            The client is solely responsible for the authenticity and validity of all documents, identity proofs (PAN, Aadhaar), and information submitted for MCA, GST, FSSAI, DGFT, and Trademark filings. NyayaLink and its empanelled professionals bear no liability for penalties resulting from false or misleading statutory submissions.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">3. Service Level Timelines (SLAs)</h2>
          <p>
            Stated service timelines (e.g., 7–10 days for incorporation) represent standard operational processing times. Processing timelines are subject to government portal availability, server maintenance windows, and ROC/GST officer verification turnaround.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">4. Governing Law & Jurisdiction</h2>
          <p>
            Any disputes, claims, or proceedings arising from the use of this portal shall be governed exclusively by the laws of India and subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
          </p>
        </section>
      </main>
    </div>
  );
}