'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected client-side exceptions
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header */}
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Home
          </Link>
        </div>
      </header>

      {/* Main Error Centerpiece */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">
            ⚠️
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              System Recovery
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B5C]">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              An unexpected interface error occurred. Your order progress and document vault records remain completely secure.
            </p>
          </div>

          {error.digest && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500">
              Reference ID: {error.digest}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
            >
              🔄 Try Again
            </button>
            <a
              href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20encountered%20an%20application%20error"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow flex items-center justify-center gap-1.5"
            >
              <span>💬</span> WhatsApp CA
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-[#0E7490] font-bold hover:underline">
              ← Return to homepage safely
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
