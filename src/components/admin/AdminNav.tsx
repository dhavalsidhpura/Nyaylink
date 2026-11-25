'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export type AdminSection = 'hq' | 'crm' | 'orders' | 'finance' | 'lawyers' | 'pricing';

export interface AdminNavProps {
  active: AdminSection;
  subtitle?: string;
  role?: string;
  actions?: ReactNode;
}

const ADMIN_LINKS: Array<{ key: AdminSection; href: string; label: string; icon: string }> = [
  { key: 'hq', href: '/admin', label: 'HQ Overview', icon: '🎛️' },
  { key: 'crm', href: '/admin/crm', label: 'Sales CRM', icon: '💼' },
  { key: 'orders', href: '/admin/orders', label: 'Orders', icon: '📋' },
  { key: 'finance', href: '/admin/finance', label: 'Finance', icon: '🏛️' },
  { key: 'lawyers', href: '/admin/lawyers', label: 'Advocates', icon: '⚖️' },
  { key: 'pricing', href: '/admin/pricing', label: 'Pricing', icon: '🏷️' },
];

export default function AdminNav({ active, subtitle, role, actions }: AdminNavProps) {
  return (
    <header className="bg-[#073B5C] text-white border-b border-cyan-900/60 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin"
            className="bg-[#0E7490] text-white font-black text-base sm:text-lg px-2.5 py-1 rounded-xl font-mono border border-cyan-400/30 shrink-0"
          >
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>

          <nav aria-label="Admin Workspaces" className="hidden lg:flex items-center gap-1 text-xs">
            {ADMIN_LINKS.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F4B942] text-[#073B5C]'
                      : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {subtitle && (
            <span className="lg:hidden text-xs font-bold text-[#F4B942] truncate">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {role && (
            <span className="hidden xl:inline text-xs bg-cyan-950 text-cyan-200 border border-cyan-800 px-2.5 py-1 rounded-lg font-mono font-bold">
              {role}
            </span>
          )}
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[#F4B942] font-bold text-xs px-3 py-1.5 rounded-xl transition whitespace-nowrap"
          >
            Exit →
          </Link>
        </div>
      </div>

      {/* Mobile / Tablet Admin Switcher */}
      <div className="lg:hidden bg-slate-900/90 border-t border-cyan-900/50 px-4 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs">
        {ADMIN_LINKS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition ${
                isActive ? 'bg-[#F4B942] text-[#073B5C]' : 'text-cyan-100 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
