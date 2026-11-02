'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { DashboardData } from './page';
import OrderProgress from '@/components/OrderProgress';
import PayNowButton from '@/components/PayNowButton';
import { formatINR } from '@/lib/pricing';

type Props = DashboardData;

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  DOCS_PENDING: 'Awaiting Documents',
  IN_PROGRESS: 'In Progress',
  QUERY_RAISED: 'Query Raised',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-slate-100 text-slate-700',
  DOCS_PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-800',
  QUERY_RAISED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};


function FilingLifecycleGuide() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            Statutory Transparency &amp; Process SLA
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C]">
            6-Stage Post-Payment Filing Lifecycle
          </h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          Standard 7–10 Working Day SLA
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 text-xs">
        {[
          {
            step: '01',
            icon: '💳',
            title: 'Advance Token (₹999)',
            desc: 'Instant dedicated Client Vault initialized; dedicated CA/CS compliance desk assigned to your docket within 4 hours.',
          },
          {
            step: '02',
            icon: '🔒',
            title: 'Encrypted Vault Upload',
            desc: 'Upload Masked Aadhaar (first 8 digits redacted), PAN, and utility bill NOC directly to AES-256 S3 storage.',
          },
          {
            step: '03',
            icon: '✍️',
            title: 'CA Scrutiny & Class 3 DSC',
            desc: 'Certified CA drafts e-MOA/e-AOA, verifies director eligibility, and provisions cryptographic Class 3 signing tokens.',
          },
          {
            step: '04',
            icon: '🏛️',
            title: 'MCA CRC SPICe+ Filing',
            desc: 'Filing submitted directly to MCA V3 portal; government SRN generated and Pure Agent pass-through fees settled.',
          },
          {
            step: '05',
            icon: '🔎',
            title: 'Scrutiny & Resubmission',
            desc: 'Live tracking of CRC processing; zero-fee drafting modifications included if the Registrar requests clarification.',
          },
          {
            step: '06',
            icon: '📜',
            title: 'COI & Kit Allotment',
            desc: 'Official 21-digit CIN, PAN, TAN, EPFO, ESIC registration, and digital MOA/AOA delivered to your vault.',
          },
        ].map((item) => (
          <div key={item.step} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-black bg-[#073B5C] text-[#F4B942] px-2 py-0.5 rounded">
                Stage {item.step}
              </span>
              <span className="text-base">{item.icon}</span>
            </div>
            <strong className="text-slate-800 text-xs font-bold block pt-1">{item.title}</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient({ user, orders, documents, invoices, consultations }: Props) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'filings' | 'consultations' | 'vault' | 'billing' | 'support'
  >('overview');

  const activeOrders = orders.filter((o) => o.status !== 'APPROVED' && o.status !== 'REJECTED');
  const queriesPending = orders.filter((o) => o.status === 'QUERY_RAISED');
  const unpaid = orders.filter((o) => o.paymentStatus === 'UNPAID' || o.paymentStatus === 'PARTIALLY_PAID');
  const rejectedDocs = documents.filter((d) => d.status === 'REJECTED');
  const upcoming = consultations.filter((c) => c.status === 'CONFIRMED' && new Date(c.startsAt) > new Date());
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col antialiased">
      {/* TOP DASHBOARD NAVIGATION BAR */}
      <header className="bg-[#073B5C] text-white border-b border-[#0E7490]/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-[#0E7490] text-white font-extrabold text-xl px-3 py-1 rounded-xl font-mono shadow border border-cyan-500/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER'].includes(user.role) && (
              <Link href="/admin" className="bg-[#F4B942] text-[#073B5C] px-3 py-1 rounded-xl text-xs font-black shadow hover:bg-amber-400">
                ⚡ Staff Console ({user.role}) →
              </Link>
            )}
            {user.role === 'LAWYER' && (
              <Link href="/lawyer/dashboard" className="text-[#F4B942] text-xs font-bold hover:underline">
                Advocate dashboard →
              </Link>
            )}
            <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
              🟢 Client Vault
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-300 hover:text-white text-xs font-semibold underline pl-2 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {user.email?.endsWith('.local') && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-950 px-4 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              Staging / Demo Session
            </span>
            <span className="text-slate-700">
              Authenticated with test identity <strong>{user.email}</strong>. Live customer filings and real payments are strictly isolated in production.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Sandbox Mode</span>
        </div>
      )}


      {['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER'].includes(user.role) && (
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 text-xs font-medium flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm border-b border-amber-600">
          <div className="flex items-center gap-2">
            <span className="bg-black text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Staff Mode ({user.role})
            </span>
            <span>You are previewing the Client Vault as <strong>{user.name}</strong> ({user.email}).</span>
          </div>
          <Link
            href="/admin"
            className="bg-slate-950 hover:bg-black text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow whitespace-nowrap transition"
          >
            Open Staff Workspace →
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0E7490] text-white font-extrabold text-lg flex items-center justify-center shadow">
                {initials}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-[#073B5C] text-sm truncate">{user.name}</h3>
                <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
            {([
              ['overview', '📊', 'Overview', activeOrders.length ? `${activeOrders.length} Active` : null],
              ['filings', '📋', 'Filings & SRNs', queriesPending.length ? `${queriesPending.length} Query` : null],
              ['consultations', '⚖️', 'Consultations', upcoming.length ? `${upcoming.length} Upcoming` : null],
              ['vault', '🔒', 'Document Vault', rejectedDocs.length ? `${rejectedDocs.length} Re-upload` : documents.length ? String(documents.length) : null],
              ['billing', '🧾', 'Billing & Invoices', null],
              ['support', '🎧', 'Advisory & Support', null],
            ] as const).map(([key, icon, label, badge]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === key ? 'bg-[#073B5C] text-[#F4B942] shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>{icon}</span> {label}
                </span>
                {badge && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-[#073B5C]">{orders.length}</div>
                  <span className="text-[11px] text-slate-500 font-semibold">Total Filings</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-amber-600">{activeOrders.length}</div>
                  <span className="text-[11px] text-slate-500 font-semibold">In Progress</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    {orders.filter((o) => o.status === 'APPROVED').length}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">Completed</span>
                </div>
              </div>

              {(unpaid.length > 0 || rejectedDocs.length > 0) && (
                <div className="space-y-3">
                  {unpaid.map((o) => (
                    <div key={o.id} className="bg-white border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <p className="text-xs text-amber-900">
                        <strong>{o.orderNumber}</strong> · {o.service.title} — payment of {formatINR(o.totalAmount - o.amountPaid)} pending.
                      </p>
                      <Link href={`/orders/${o.orderNumber}`} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl text-center shrink-0">
                        Complete payment →
                      </Link>
                    </div>
                  ))}
                  {rejectedDocs.map((d) => (
                    <div key={d.id} className="bg-white border border-rose-300 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <p className="text-xs text-rose-900">
                        <strong>{d.name}</strong> was not accepted{d.rejectNote ? `: ${d.rejectNote}` : '.'}
                      </p>
                      {d.order && (
                        <Link href={`/orders/${d.order.orderNumber}`} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl text-center shrink-0">
                          Re-upload →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {queriesPending.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider block">
                      ⚠️ Action Required
                    </span>
                    <p className="text-xs text-amber-800">
                      <strong>{queriesPending[0].orderNumber}</strong> has a query from your assigned desk.
                    </p>
                  </div>
                  <Link
                    href={`/orders/${queriesPending[0].orderNumber}`}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    View & Resolve →
                  </Link>
                </div>
              )}

              {orders.length === 0 && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
                  <p className="text-sm text-slate-600">You haven't started any filings yet.</p>
                  <Link
                    href="/#catalog-section"
                    className="inline-block bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Browse Services →
                  </Link>
                </div>
              )}

              {/* Post-Incorporation Day 1 Founder Activation Checklist */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                      Statutory Post-Incorporation Compliance
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C]">
                      Day 1 Founder Activation &amp; Compliance Checklist
                    </h3>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-extrabold self-start sm:self-auto">
                    Section 10A Companies Act &bull; 180-Day Rule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Step 1: Bank Account */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black bg-[#073B5C] text-[#F4B942] px-2 py-0.5 rounded">
                        Step 1 &bull; Immediate
                      </span>
                      <span className="text-base">🏦</span>
                    </div>
                    <strong className="text-slate-900 font-bold block text-xs">Open Corporate Bank Current Account</strong>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Deposit paid-up capital from initial subscribers. Fast-tracked with our banking partners (ICICI Bank, HDFC, Axis).
                    </p>
                    <div className="pt-1 flex gap-2">
                      <a
                        href="https://www.icicibank.com/business-banking/current-account"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[10px] px-3 py-1.5 rounded-lg transition"
                      >
                        Fast-Track Account &rarr;
                      </a>
                    </div>
                  </div>

                  {/* Step 2: INC-20A */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2 hover:border-amber-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded">
                        Step 2 &bull; 180 Days
                      </span>
                      <span className="text-base">⏰</span>
                    </div>
                    <strong className="text-amber-950 font-bold block text-xs">MCA Form INC-20A (Commencement of Business)</strong>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Must be filed within 180 days of incorporation. Failure attracts <strong>₹50,000 corporate penalty + ₹1,000/day on directors</strong> and risks ROC strike-off.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/#catalog-section"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition inline-block"
                      >
                        File INC-20A with CA Desk &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Step 3: ADT-1 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black bg-[#073B5C] text-[#F4B942] px-2 py-0.5 rounded">
                        Step 3 &bull; 30 Days
                      </span>
                      <span className="text-base">📑</span>
                    </div>
                    <strong className="text-slate-900 font-bold block text-xs">Appoint Statutory Auditor (Form ADT-1)</strong>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Board must appoint the first auditor within 30 days of incorporation under Section 139(6) of Companies Act, 2013.
                    </p>
                  </div>

                  {/* Step 4: Startup India */}
                  <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-2 hover:border-cyan-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black bg-[#0E7490] text-white px-2 py-0.5 rounded">
                        Step 4 &bull; Tax Benefits
                      </span>
                      <span className="text-base">🚀</span>
                    </div>
                    <strong className="text-[#073B5C] font-bold block text-xs">Startup India DPIIT &amp; 80-IAC 3-Year Tax Holiday</strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Verify your eligibility for 100% income tax exemption under Section 80-IAC and fast-tracked patent rebates.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/tools/startup-india-checker"
                        className="bg-[#0E7490] hover:bg-cyan-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition inline-block"
                      >
                        Check 80-IAC Eligibility (Free) &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Assigned Chartered Accountant Desk Card */}
              <div className="bg-gradient-to-br from-[#073B5C] to-[#0A4E78] text-white rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-cyan-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#F4B942] tracking-wider block">
                      Dedicated Professional Desk
                    </span>
                    <h3 className="text-base font-black">Assigned Chartered Accountant &amp; Secretarial Lead</h3>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                    ICAI / ICSI Verified
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm font-extrabold text-white block">NyayaLink Senior Legal &amp; CA Desk</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Your business docket is overseen by our empanelled Chartered Accountants and Company Secretaries. All filings adhere strictly to MCA CRC guidelines and Section 31 GST invoicing standards.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href="https://wa.me/919820012345?text=Namaste%20NyayaLink%2C%20I%20have%20a%20question%20regarding%20my%20company%20filing."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
                    >
                      <span>💬</span> WhatsApp Compliance Desk
                    </a>
                  </div>
                </div>
              </div>

              <FilingLifecycleGuide />
            </div>
          )}

          {activeTab === 'filings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Active Filings & Applications</h2>
                <p className="text-xs text-slate-500">Track government SRN status and CA remarks.</p>
              </div>

              {orders.length === 0 ? (
                <>
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
                  <span className="text-4xl block">🚀</span>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-[#073B5C] text-base">No Active Filings Yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Your business registrations, trademark dockets, and compliance filings will appear here with live MCA/GSTN milestone tracking once booked.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs">
                    <Link
                      href="/services/private-limited-company"
                      className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black px-4 py-2.5 rounded-xl transition shadow-xs"
                    >
                      🏢 Incorporate Pvt Ltd Company →
                    </Link>
                    <Link
                      href="/services/trademark-registration"
                      className="bg-white hover:bg-slate-50 text-[#073B5C] border border-slate-300 font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      ™️ File Trademark
                    </Link>
                    <Link
                      href="/services/consumer-complaint-notice"
                      className="bg-white hover:bg-slate-50 text-[#073B5C] border border-slate-300 font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      ⚖️ Send Legal Notice
                    </Link>
                  </div>
                </div>

                <FilingLifecycleGuide />
                </>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md uppercase">
                            {order.orderNumber}
                            {order.srn ? ` · SRN ${order.srn}` : ''}
                          </span>
                          <h3 className="text-lg font-bold text-[#073B5C] mt-1">{order.service.title}</h3>
                          <span className="text-xs text-slate-500 block">
                            Assigned: {order.assignedCA?.name || 'Not yet assigned'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${STATUS_STYLE[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>

                      <OrderProgress status={order.status} />
                      <Link href={`/orders/${order.orderNumber}`} className="inline-block text-xs font-bold text-[#0E7490] hover:underline">
                        Open documents, messages & payments →
                      </Link>

                      {order.statusLogs.length > 0 && (
                        <div className="space-y-3">
                          {order.statusLogs.slice(0, 4).map((log) => (
                            <div key={log.id} className="border-l-2 border-cyan-500 pl-4 py-0.5 text-xs">
                              <div className="flex justify-between text-slate-500">
                                <strong className="text-slate-700">{STATUS_LABEL[log.status] || log.status.replace(/_/g, ' ').toLowerCase()}</strong>
                                <span>{new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>
                              {log.remarks && <p className="text-slate-600 mt-0.5">{log.remarks}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#073B5C]">Lawyer Consultations</h2>
                  <p className="text-xs text-slate-500">Bookings made through वकील Search. Times shown in IST.</p>
                </div>
                <Link href="/vakil" className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] text-xs font-bold px-4 py-2.5 rounded-xl text-center">
                  Find a lawyer →
                </Link>
              </div>
              {consultations.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">No consultations yet.</div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <ConsultationCard key={c.id} c={c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#073B5C]">Encrypted Document Vault</h2>
                  <p className="text-xs text-slate-500">Documents uploaded against your filings.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                  🔒 256-Bit SSL Encrypted
                </span>
              </div>

              <div className="bg-cyan-50/80 border border-cyan-200 p-3.5 rounded-2xl text-xs text-[#073B5C] flex items-start gap-2.5">
                <span className="text-lg shrink-0">🪪</span>
                <div className="space-y-0.5">
                  <strong>UIDAI & DPDP Privacy Compliance:</strong>
                  <p className="text-[11px] text-slate-600">
                    For director and signatory KYC, please upload <strong>Masked Aadhaar</strong> copies (showing only the last 4 digits) as mandated by UIDAI. Documents are restricted strictly to your assigned Chartered Accountant.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Document Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Upload Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            No documents uploaded yet.
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-[#073B5C] flex items-center gap-2">
                              <span>📄</span>
                              <span>
                                {doc.name}
                                {doc.rejectNote && doc.status === 'REJECTED' && (
                                  <span className="block text-[10px] font-semibold text-rose-700">{doc.rejectNote}</span>
                                )}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase">
                                {doc.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</td>
                            <td className="p-4">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                                  doc.status === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : doc.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {doc.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-[#0E7490] hover:underline font-bold">
                                View
                              </a>
                              {doc.status === 'REJECTED' && doc.order && (
                                <Link href={`/orders/${doc.order.orderNumber}`} className="ml-3 text-rose-700 hover:underline font-bold">
                                  Re-upload
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Billing & GST Invoices</h2>
                <p className="text-xs text-slate-500">Itemized tax breakdown for each completed payment.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Invoice No</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Taxable Amt</th>
                        <th className="p-4">CGST + SGST</th>
                        <th className="p-4">IGST</th>
                        <th className="p-4">Total</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-400">
                            No invoices generated yet.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-extrabold text-[#073B5C] font-mono">{inv.invoiceNo}</td>
                            <td className="p-4 font-bold">{inv.order?.service.title || inv.payment?.description}</td>
                            <td className="p-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="p-4">₹{inv.taxableAmount.toLocaleString('en-IN')}</td>
                            <td className="p-4">₹{(inv.cgst + inv.sgst).toLocaleString('en-IN')}</td>
                            <td className="p-4">₹{inv.igst.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-extrabold text-[#073B5C]">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                            <td className="p-4">
                              <Link href={`/invoices/${encodeURIComponent(inv.invoiceNo)}`} className="text-[#0E7490] font-bold hover:underline">
                                View / PDF
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Advisory & Support</h2>
                <p className="text-xs text-slate-500">Get in touch with your compliance desk directly.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
                <p className="text-sm text-slate-600">
                  For anything about a specific filing, use the <strong>Messages</strong> panel on that order — it goes straight to your
                  assigned desk. For everything else:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a href="tel:+919920054785" className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                    📞 Call +91 9920054785
                  </a>
                  <a href="mailto:info@nyayalink.com" className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                    ✉️ info@nyayalink.com
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ConsultationCard({ c }: { c: DashboardData['consultations'][number] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const starts = new Date(c.startsAt);
  const canCancel =
    c.status === 'PENDING_PAYMENT' || (c.status === 'CONFIRMED' && starts.getTime() - Date.now() > 24 * 60 * 60 * 1000);

  const cancel = async () => {
    if (!confirm(c.status === 'CONFIRMED' ? 'Cancel this consultation? You will receive a full refund.' : 'Release this slot?')) return;
    setBusy(true);
    const res = await fetch(`/api/consultations/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    const data = await res.json();
    if (!data.success) alert(data.error || 'Could not cancel.');
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
      <div className="space-y-1 text-xs">
        <span className="text-[10px] font-extrabold uppercase text-[#0E7490]">
          {c.number} · {c.mode.replace('_', ' ')} · {c.status.replace(/_/g, ' ')}
        </span>
        <h3 className="text-sm font-extrabold text-[#073B5C]">
          <Link href={`/vakil/${c.lawyer.slug}`} className="hover:underline">
            {c.lawyer.user.name}
          </Link>
        </h3>
        <p className="text-slate-600">
          🗓️ {starts.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}
        </p>
        {c.meetingUrl && c.status === 'CONFIRMED' && (
          <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-[#0E7490] font-bold hover:underline">
            Join meeting →
          </a>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        {c.status === 'PENDING_PAYMENT' && c.payments[0] && <PayNowButton paymentId={c.payments[0].id} amount={c.totalAmount} />}
        {canCancel && (
          <button onClick={cancel} disabled={busy} className="text-[11px] font-bold text-rose-700 hover:underline disabled:opacity-50">
            {busy ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </div>
  );
}
