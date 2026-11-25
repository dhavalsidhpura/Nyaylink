'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopAnnouncementBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const isAppOrAuthRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/ca') ||
    pathname?.startsWith('/lawyer') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/orders') ||
    pathname?.startsWith('/invoices') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/unauthorized');

  useEffect(() => {
    if (typeof window === 'undefined' || isAppOrAuthRoute) return;
    const dismissed = sessionStorage.getItem('nyaylink_top_banner_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [isAppOrAuthRoute]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('nyaylink_top_banner_dismissed', 'true');
  };

  if (!isVisible || isAppOrAuthRoute) return null;

  return (
    <aside
      aria-label="Statutory fee announcement"
      className="bg-[#052A42] text-white px-3 sm:px-4 py-1.5 border-b border-cyan-400/20 text-xs relative z-50 w-full"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="bg-[#F4B942] text-[#073B5C] font-black text-[11px] uppercase px-2 py-0.5 rounded-full shrink-0">
            MSME Benefit
          </span>
          <p className="text-xs text-slate-100 font-medium truncate">
            <strong className="text-[#F4B942]">50% Govt Fee Concession</strong> on Trademarks · Start with ₹999 Token
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/services/trademark-registration"
            className="text-[#F4B942] hover:underline font-bold text-xs whitespace-nowrap"
          >
            Learn more →
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
