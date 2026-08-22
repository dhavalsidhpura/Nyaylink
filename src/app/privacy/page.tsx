import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#073B5C]">Privacy & Data Protection Policy</h1>
          <p className="text-xs text-slate-500">Compliant with Information Technology Act, 2000</p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#073B5C]">1. Collection of Client Identity Information</h2>
          <p>
            To fulfill statutory filings on government portals (MCA SPICe+, CBIC GSTN, FoSCoS, DGFT), we collect identification records including Director PAN numbers, Aadhaar details, utility bills, and bank statements.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">2. Storage & Vault Encryption</h2>
          <p>
            All documents uploaded to the NyayaLink Document Vault are encrypted in transit via SSL/TLS and stored securely. Documents are accessible strictly to assigned compliance leads and authorized account holders.
          </p>

          <h2 className="text-base font-bold text-[#073B5C]">3. Non-Disclosure to Third Parties</h2>
          <p>
            We do not sell, rent, or trade client business data, cap tables, or contact details to third-party telemarketers. Information is shared exclusively with designated government registry departments and certified panel professionals processing the specific order.
          </p>
        </section>
      </main>
    </div>
  );
}