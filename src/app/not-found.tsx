import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Bar */}
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Return to Homepage
          </Link>
        </div>
      </header>

      {/* Main 404 Centerpiece */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-center mx-auto text-3xl sm:text-4xl shadow-inner">
            🔍
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0E7490] bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              Error 404 • Page Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Looking for a Legal Filing?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              The page, statutory service, or document link you requested does not exist or may have been relocated.
            </p>
          </div>

          {/* Quick Action Destination Pills */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-left">
            <strong className="block text-[11px] font-extrabold uppercase text-[#073B5C] tracking-wider text-center">
              Popular Compliance Portals
            </strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/#catalog-section"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#073B5C] flex items-center justify-between transition"
              >
                <span>🏢 All 51 Services</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href="/packages"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#073B5C] flex items-center justify-between transition"
              >
                <span>📦 Bundled Packages</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href="/tools/company-name-search"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#073B5C] flex items-center justify-between transition"
              >
                <span>🔎 MCA Name Search</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href="/tools/trademark-search"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#073B5C] flex items-center justify-between transition"
              >
                <span>™️ Trademark Search</span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </div>

          {/* Bottom Help Desk */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition shadow text-center"
            >
              Back to Home →
            </Link>
            <a
              href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20hit%20a%20404%20page%20and%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow text-center flex items-center justify-center gap-1.5"
            >
              <span>💬</span> WhatsApp Helpdesk
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
