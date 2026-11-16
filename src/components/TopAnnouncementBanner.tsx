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
      className="bg-gradient-to-r from-[#073B5C] via-[#0E7490] to-[#073B5C] text-white px-3 sm:px-4 py-2 border-b border-cyan-400/20 text-xs shadow-xs relative z-50 animate-in fade-in duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] uppercase px-2 py-0.5 rounded-full shrink-0 shadow-xs">
            ⚡ 2026 Statutory Benefit
          </span>
          <p className="text-[11px] sm:text-xs text-slate-100 font-medium truncate sm:whitespace-normal">
            <strong className="text-[#F4B942]">50% Govt Fee Concession</strong> on MSME Trademarks (Save ₹4,500) • MCA Pure Agent Zero Markup • Lock In with <strong>₹999 Token</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/services/trademark-registration"
            className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-lg transition shadow-xs whitespace-nowrap"
          >
            Claim ₹999 Token →
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="text-cyan-200 hover:text-white text-sm font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
