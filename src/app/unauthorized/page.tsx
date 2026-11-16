'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || 'the requested page';
  const role = searchParams?.get('role') || 'CURRENT_ROLE';

  const getDashboardHref = () => {
    if (role === 'LAWYER') return '/lawyer/dashboard';
    if (role === 'CA_CS_LEAD' || role === 'COMPLIANCE_EXEC') return '/ca/dashboard';
    if (['SUPER_ADMIN', 'OPS_MANAGER', 'FINANCE_MANAGER'].includes(role)) return '/admin/crm';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-xs">
          🔒
        </div>

        <div className="space-y-2">
          <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
            403 • Role Access Denied
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#073B5C]">
            Restricted Role Clearance
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            You are signed in with the identity role <strong className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[#073B5C]">{role.replace(/_/g, ' ')}</strong>.
            This account does not have authorization to access <code className="text-[#0E7490] font-bold">{from}</code>.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1 text-left">
          <div className="font-bold text-[#073B5C] flex items-center gap-1.5">
            <span>🛡️</span> Multi-Tenant RBAC Guard
          </div>
          <p className="text-[11px] leading-relaxed">
            Client data, advocate consultations, CA dockets, and finance ledgers are isolated in accordance with the Advocates Act and Indian IT Act rules.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href={getDashboardHref()}
            className="block w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black py-3 rounded-xl uppercase tracking-wider text-xs transition shadow cursor-pointer"
          >
            Go to My Authorized Dashboard →
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/login?callbackUrl=${encodeURIComponent(from)}` })}
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200 cursor-pointer"
          >
            Switch Account / Sign in with Another Role
          </button>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
            ← Back to NyayaLink Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500">Checking permissions...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
