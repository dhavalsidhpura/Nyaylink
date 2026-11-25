'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // If on a specific service page, let the service detail sticky booking bar take priority
  // to maximize checkout conversion!
  const isServiceDetailPage = pathname?.startsWith('/services/') && pathname !== '/services';

  if (
    isServiceDetailPage ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/ca') ||
    pathname?.startsWith('/lawyer/dashboard') ||
    pathname?.startsWith('/unauthorized')
  ) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Services', href: '/packages', icon: '📋' },
    {
      label: 'Advisor',
      isAdvisor: true,
      icon: '🤖',
      highlight: true,
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/919920054785?text=Hello%20NyayaLink%2C%20I%20need%20assistance%20with%20company%20registration%20and%20compliance.',
      icon: '💬',
      isExternal: true,
    },
    { label: 'Account', href: '/dashboard', icon: '👤' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#073B5C]/95 backdrop-blur-md border-t border-cyan-800/40 shadow-2xl print:hidden">
      <nav className="max-w-md mx-auto grid grid-cols-5 items-center px-1 py-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)]">
        {items.map((item, idx) => {
          const isActive = pathname === item.href;
          if (item.isAdvisor) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('nyaylink_open_advisor'));
                  }
                }}
                className="flex flex-col items-center justify-center py-1 text-center group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0E7490] border border-cyan-400/50 text-[#F4B942] flex items-center justify-center text-base shadow-sm group-active:scale-95 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] sm:text-[11px] font-bold text-cyan-300 mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          }
          if (item.isExternal) {
            return (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-1 text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm group-active:scale-95 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] sm:text-[11px] font-bold text-emerald-300 mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href || '#'}
              className={`flex flex-col items-center justify-center py-1 text-center group ${
                isActive ? 'text-[#F4B942]' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-lg leading-none group-active:scale-95 transition-transform">
                {item.icon}
              </span>
              <span
                className={`text-[11px] sm:text-[11px] font-extrabold mt-0.5 leading-none truncate max-w-full ${
                  isActive ? 'text-[#F4B942]' : 'text-slate-300'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
