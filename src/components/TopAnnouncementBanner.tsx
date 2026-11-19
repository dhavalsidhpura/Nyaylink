'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopAnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = sessionStorage.getItem('nyaylink_top_banner_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('nyaylink_top_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Statutory fee announcement"
      className="bg-gradient-to-r from-[#073B5C] via-[#0E7490] to-[#073B5C] text-white px-3 sm:px-4 py-1.5 sm:py-2 border-b border-cyan-400/20 text-xs shadow-xs relative z-50 animate-in fade-in duration-300 overflow-hidden w-full max-w-[100vw]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="bg-[#F4B942] text-[#073B5C] font-black text-[9px] sm:text-[10px] uppercase px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 shadow-xs">
            ⚡ MSME Benefit
          </span>
          <p className="text-[10px] sm:text-xs text-slate-100 font-medium truncate leading-tight">
            <strong className="text-[#F4B942]">50% Govt Fee Concession</strong> on Trademarks • Lock In with <strong>₹999 Token</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/services/trademark-registration"
            className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg transition shadow-xs whitespace-nowrap"
          >
            Claim Token →
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="text-cyan-200 hover:text-white text-xs sm:text-sm font-bold px-1 py-0.5 rounded transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
