'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { CADashboardData } from './page';

type Props = CADashboardData;

function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', badge: 'bg-slate-100 text-slate-700' },
  DOCS_PENDING: { label: 'Docs Awaited', badge: 'bg-amber-100 text-amber-800' },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-cyan-100 text-cyan-800' },
  QUERY_RAISED: { label: 'Query Raised', badge: 'bg-orange-100 text-orange-800' },
  APPROVED: { label: 'Approved & Filed', badge: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejected', badge: 'bg-rose-100 text-rose-800' },
};

const STATUTORY_DEADLINES = [
  { day: '07th Every Month', title: 'Monthly TDS / TCS Challan 281 Deposit', category: 'Income Tax', urgency: 'High' },
  { day: '11th Every Month', title: 'GSTR-1 Monthly Outward Supplies Filing', category: 'GST', urgency: 'High' },
  { day: '13th Every Month', title: 'GSTR-1 IFF (Quarterly QRMP Taxpayers)', category: 'GST', urgency: 'Medium' },
  { day: '20th Every Month', title: 'GSTR-3B Summary Return & Tax Settlement', category: 'GST', urgency: 'Critical' },
  { day: '30th September', title: 'Mandatory Annual Director DIR-3 KYC Verification', category: 'MCA / ROC', urgency: 'Critical' },
  { day: '30th October', title: 'MCA Form AOC-4 (Financial Statements Filing)', category: 'MCA / ROC', urgency: 'High' },
  { day: '29th November', title: 'MCA Form MGT-7 / 7A (Annual Return Filing)', category: 'MCA / ROC', urgency: 'High' },
  { day: '31st December', title: 'GSTR-9 & GSTR-9C Annual GST Reconciliation', category: 'GST', urgency: 'High' },
];

export default function CADashboardClient({ user, myOrders, unclaimedOrders, pendingDocs, metrics }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'assigned' | 'pool' | 'docs' | 'srn' | 'earnings' | 'calendar'>('assigned');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [busy, setBusy] = useState(false);

  // Status/SRN Update Modal State
  const [selectedOrder, setSelectedOrder] = useState<typeof myOrders[0] | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [srnInput, setSrnInput] = useState<string>('');
  const [remarksInput, setRemarksInput] = useState<string>('');

  // Document Reject Modal State
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Claim Order Action
  const handleClaimOrder = async (orderId: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/ca/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to claim docket.');
        return;
      }
      router.refresh();
      setActiveTab('assigned');
    } catch {
      alert('An error occurred while claiming docket.');
    } finally {
      setBusy(false);
    }
  };

  // Submit Status & SRN Update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          newStatus,
          remarks: remarksInput.trim() || undefined,
          srn: srnInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to update docket.');
        return;
      }
      setSelectedOrder(null);
      setRemarksInput('');
      setSrnInput('');
      router.refresh();
    } catch {
      alert('Failed to update docket status.');
    } finally {
      setBusy(false);
    }
  };

  // Document Review Actions
  const handleDocVerify = async (documentId: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, status: 'VERIFIED' }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to verify document.');
      }
      router.refresh();
    } catch {
      alert('Error verifying document.');
    } finally {
      setBusy(false);
    }
  };

  const handleDocReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: rejectingDocId,
          status: 'REJECTED',
          rejectNote: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to reject document.');
        return;
      }
      setRejectingDocId(null);
      setRejectReason('');
      router.refresh();
    } catch {
      alert('Error rejecting document.');
    } finally {
      setBusy(false);
    }
  };

  const filteredOrders = myOrders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col antialiased">
      {/* HEADER BAR */}
      <header className="bg-[#073B5C] text-white border-b border-[#0E7490]/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-extrabold text-xl px-3 py-1 rounded-xl font-mono shadow border border-cyan-500/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <div className="border-l border-slate-600 pl-3">
              <span className="text-xs font-bold text-[#F4B942] uppercase tracking-wider block">
                CA & Compliance Partner Portal
              </span>
              <span className="text-[10px] text-slate-300">Empanelled Professional Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#052A42] px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-[#0E7490] text-white font-black text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-white block leading-tight">{user.name}</span>
                <span className="text-[9px] text-[#F4B942] font-semibold block uppercase">
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs text-slate-300 hover:text-white underline font-semibold px-2 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* TOP KPI CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">My Active Dockets</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#073B5C] font-mono">{metrics.activeDocketsCount}</span>
              <span className="text-xs text-cyan-600 font-semibold">in progress</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unclaimed Docket Pool</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600 font-mono">{metrics.unclaimedCount}</span>
              <span className="text-xs text-amber-700 font-semibold">ready to claim</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Docs Awaiting Review</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-orange-600 font-mono">{metrics.pendingDocsCount}</span>
              <span className="text-xs text-orange-700 font-semibold">KYC / Filings</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Earned Partner Retainer</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 font-mono">₹{formatINR(metrics.earnedRetainer)}</span>
              <span className="text-xs text-emerald-600 font-semibold">({metrics.approvedCount} completed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDE NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
            {[
              ['assigned', '📋', 'My Filing Dockets', `${myOrders.length} Dockets`],
              ['pool', '⚡', 'Claim Open Dockets', metrics.unclaimedCount ? `${metrics.unclaimedCount} New` : null],
              ['docs', '📑', 'Doc Review Desk', metrics.pendingDocsCount ? `${metrics.pendingDocsCount} Pending` : null],
              ['srn', '🏛️', 'Submit SRN / Challan', null],
              ['earnings', '💰', 'Earnings & Payouts', `₹${formatINR(metrics.earnedRetainer)}`],
              ['calendar', '📅', 'Statutory Due Dates', '8 Deadlines'],
            ].map(([key, icon, label, badge]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-[#073B5C] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#073B5C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      activeTab === key ? 'bg-[#F4B942] text-[#073B5C]' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Help Card */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#0E7490] font-bold">
              <span>💡</span> Professional Standards
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ensure all MCA V3 challans, GST ARNs, and Trade Marks Examination replies are cross-verified with official government portals before issuing final approval.
            </p>
          </div>
        </aside>

        {/* WORKSPACE CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: MY ASSIGNED DOCKETS */}
          {activeTab === 'assigned' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#073B5C]">Assigned Filing Dockets</h2>
                  <p className="text-xs text-slate-500">Corporate registrations, GST dockets, and statutory files under your supervision.</p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700"
                  >
                    <option value="ALL">All Statuses ({myOrders.length})</option>
                    <option value="DOCS_PENDING">Docs Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="QUERY_RAISED">Query Raised</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">📂</div>
                  <h3 className="font-extrabold text-slate-700 text-sm">No dockets in this category</h3>
                  <p className="text-xs text-slate-500">Check the open docket pool to claim new client filings.</p>
                  <button
                    onClick={() => setActiveTab('pool')}
                    className="bg-[#0E7490] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#073B5C] transition-colors cursor-pointer"
                  >
                    Browse Open Docket Pool →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((o) => {
                    const st = STATUS_CONFIG[o.status] || { label: o.status, badge: 'bg-slate-100 text-slate-800' };
                    const hasPendingDocs = o.documents.some((d) => d.status === 'PENDING_REVIEW');
                    return (
                      <div
                        key={o.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-sm text-[#073B5C]">{o.orderNumber}</span>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${st.badge}`}>
                                {st.label}
                              </span>
                              {hasPendingDocs && (
                                <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                                  Docs Need Review
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-sm">{o.service.title}</h3>
                            <p className="text-xs text-slate-500">
                              Client: <strong className="text-slate-700">{o.client.name}</strong> ({o.client.email} | {o.client.phone || 'No phone'}) · State: {o.client.state || 'MH'}
                            </p>
                          </div>

                          <div className="text-right sm:shrink-0 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">SLA Window</span>
                            <span className="text-xs font-extrabold text-[#0E7490]">{o.service.sla}</span>
                            {o.srn && (
                              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-1">
                                SRN: {o.srn}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Documents Summary */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">Uploaded Documents:</span>
                            <span className="font-mono font-bold text-slate-700">{o.documents.length} files</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-emerald-700 font-semibold">
                              {o.documents.filter((d) => d.status === 'VERIFIED').length} verified
                            </span>
                            {o.documents.filter((d) => d.status === 'REJECTED').length > 0 && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span className="text-rose-700 font-semibold">
                                  {o.documents.filter((d) => d.status === 'REJECTED').length} rejected
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setNewStatus(o.status);
                                setSrnInput(o.srn || '');
                              }}
                              className="bg-[#073B5C] hover:bg-[#052A42] text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              Update Status / SRN
                            </button>
                            <Link
                              href={`/admin/orders/${o.orderNumber}`}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Open Case Desk ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNCLAIMED DOCKET POOL */}
          {activeTab === 'pool' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#073B5C]">Claim Open Dockets</h2>
                <p className="text-xs text-slate-500">
                  Real-time pool of verified, pre-paid client applications waiting for an empanelled CA / CS assignment.
                </p>
              </div>

              {unclaimedOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">🎉</div>
                  <h3 className="font-extrabold text-slate-700 text-sm">All dockets are assigned!</h3>
                  <p className="text-xs text-slate-500">There are currently no unassigned client orders in the intake queue.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unclaimedOrders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#073B5C]">{o.orderNumber}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Pre-Paid Client
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{o.service.title}</h4>
                        <p className="text-xs text-slate-500">
                          Client: {o.client.name} · State: {o.client.state || 'MH'} · SLA: {o.service.sla}
                        </p>
                      </div>

                      <button
                        onClick={() => handleClaimOrder(o.id)}
                        disabled={busy}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer shrink-0"
                      >
                        ⚡ Claim This Docket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENT REVIEW DESK */}
          {activeTab === 'docs' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#073B5C]">Document Verification Desk</h2>
                <p className="text-xs text-slate-500">
                  Inspect client identity documents, MOA/AOA drafts, bank statements, and PAN proofs awaiting verification.
                </p>
              </div>

              {pendingDocs.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">✅</div>
                  <h3 className="font-extrabold text-slate-700 text-sm">All documents verified!</h3>
                  <p className="text-xs text-slate-500">No documents are currently pending verification in your docket queue.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-[#073B5C] truncate">{doc.name}</strong>
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">
                          File: <span className="font-mono text-slate-800">{doc.originalName}</span> · Uploaded by: {doc.owner.name} ({doc.owner.email})
                        </p>
                        {doc.order && (
                          <p className="text-[11px] text-slate-400">
                            Docket: <span className="font-mono font-bold text-slate-600">{doc.order.orderNumber}</span> ({doc.order.service.title})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/api/documents/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-200 hover:bg-slate-300 text-[#073B5C] font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          👁️ View File
                        </a>

                        <button
                          onClick={() => handleDocVerify(doc.id)}
                          disabled={busy}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          ✓ Approve
                        </button>

                        <button
                          onClick={() => setRejectingDocId(doc.id)}
                          disabled={busy}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          ✕ Raise Query
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUBMIT SRN & CHALLAN */}
          {activeTab === 'srn' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#073B5C]">Government Filing & SRN Submission</h2>
                <p className="text-xs text-slate-500">
                  Record official MCA Service Request Numbers (SRN), GST Application Reference Numbers (ARN), or Trade Marks Registry numbers.
                </p>
              </div>

              <div className="space-y-4">
                {myOrders.filter((o) => o.status !== 'REJECTED').map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#073B5C]">{o.orderNumber}</span>
                        <span className="text-xs font-bold text-slate-800">{o.service.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">Client: {o.client.name} ({o.client.email})</p>
                      {o.srn ? (
                        <p className="text-xs text-emerald-700 font-mono font-bold">
                          Current Government SRN: {o.srn}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">⚠️ No government SRN recorded yet</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setNewStatus(o.status);
                        setSrnInput(o.srn || '');
                      }}
                      className="bg-[#0E7490] hover:bg-[#073B5C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      {o.srn ? 'Update SRN / Status' : 'Enter Official SRN'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PARTNER RETINER & EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#073B5C]">Partner Retainer & Payout Ledger</h2>
                <p className="text-xs text-slate-500">
                  Track earned professional fees across all filed corporate dockets. Payouts are reconciled and settled bi-weekly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Earned Retainer</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                    ₹{formatINR(metrics.earnedRetainer)}
                  </span>
                  <span className="text-[11px] text-emerald-700">From {metrics.approvedCount} approved filings</span>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-cyan-700 uppercase block">Projected In-Progress Fees</span>
                  <span className="text-2xl font-black text-cyan-900 font-mono mt-1 block">
                    ₹{formatINR(metrics.pendingRetainer)}
                  </span>
                  <span className="text-[11px] text-cyan-700">From {metrics.activeDocketsCount} ongoing dockets</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Average Fee / Docket</span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
                    ₹{metrics.approvedCount > 0 ? formatINR(Math.round(metrics.earnedRetainer / metrics.approvedCount)) : '0'}
                  </span>
                  <span className="text-[11px] text-slate-500">Based on standard 70% share</span>
                </div>
              </div>

              {/* Statement Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Docket Number</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Government SRN</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">CA Retainer Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myOrders.map((o) => {
                      const share = Math.round(Number(o.professionalFee) * 0.7);
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-[#073B5C]">{o.orderNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{o.service.title}</td>
                          <td className="p-3 font-mono text-slate-600">{o.srn || 'Pending'}</td>
                          <td className="p-3">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                o.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {o.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">₹{formatINR(share)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: STATUTORY DUE DATES CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#073B5C]">National Statutory Compliance Calendar</h2>
                <p className="text-xs text-slate-500">
                  Critical recurring deadlines across MCA, GST, Income Tax, and Trade Marks registries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STATUTORY_DEADLINES.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#073B5C] text-white font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                          {d.day}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{d.category}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs">{d.title}</h4>
                    </div>

                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        d.urgency === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : d.urgency === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}
                    >
                      {d.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* UPDATE STATUS & SRN MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Docket Workspace</span>
              <h3 className="text-base font-extrabold text-[#073B5C]">{selectedOrder.orderNumber}</h3>
              <p className="text-xs text-slate-600 font-medium">{selectedOrder.service.title}</p>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Filing Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="DOCS_PENDING">Docs Pending</option>
                  <option value="IN_PROGRESS">In Progress (Drafting & Review)</option>
                  <option value="QUERY_RAISED">Query Raised (Client Correction Needed)</option>
                  <option value="APPROVED">Approved & Filed (Certificate Issued)</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Government SRN / ARN / Challan Reference</label>
                <input
                  type="text"
                  value={srnInput}
                  onChange={(e) => setSrnInput(e.target.value)}
                  placeholder="e.g. F12345678 or AA270324123456P"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Audit Remarks (Sent to Client in Email Update)</label>
                <textarea
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="e.g. SPICe+ Part B submitted to MCA. SRN generated. Awaiting approval."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#073B5C] hover:bg-[#052A42] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-colors cursor-pointer"
                >
                  Save & Notify Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT DOCUMENT MODAL */}
      {rejectingDocId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-rose-700">Raise Defect / Re-upload Notice</h3>
              <p className="text-xs text-slate-500">
                Specify the exact defect in the document. The client will receive an urgent email notification with this note.
              </p>
            </div>

            <form onSubmit={handleDocReject} className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Utility bill is older than 2 months. Please upload electricity bill dated within the last 60 days."
                rows={3}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingDocId(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || rejectReason.trim().length < 5}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Send Re-upload Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
