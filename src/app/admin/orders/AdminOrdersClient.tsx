'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusSelector from './StatusSelector';
import type { AdminOrderRow } from './page';
import { formatINR, stateName } from '@/lib/pricing';

interface Props {
  orders: AdminOrderRow[];
  canEdit: boolean;
}

export default function AdminOrdersClient({ orders, canEdit }: Props) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' ? true : o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      (o.srn && o.srn.toLowerCase().includes(q)) ||
      o.client.name.toLowerCase().includes(q) ||
      o.client.email.toLowerCase().includes(q) ||
      (o.client.phone && o.client.phone.includes(q)) ||
      o.service.title.toLowerCase().includes(q) ||
      (o.assignedCA?.name && o.assignedCA.name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const queryCount = orders.filter((o) => o.status === 'QUERY_RAISED').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const approvedCount = orders.filter((o) => o.status === 'APPROVED').length;
  const docsPendingCount = orders.filter((o) => o.status === 'DOCS_PENDING').length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-[#073B5C] text-white border-b border-cyan-900/60 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow-inner border border-cyan-400/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
              CA &amp; CS Legal Operations Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-[#F4B942] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-700 shadow-sm"
            >
              ← Super Controller HQ
            </Link>
            <Link
              href="/"
              className="text-xs text-slate-300 hover:text-white font-bold underline"
            >
              Exit to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Cross-Department Subnav */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 sticky top-[53px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Workspaces:</span>
            <Link href="/admin/crm" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              💼 Sales CRM
            </Link>
            <span className="bg-[#073B5C] text-[#F4B942] font-black px-3 py-1 rounded-lg">
              📋 CA Operations Desk
            </span>
            <Link href="/admin/finance" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              🏛️ Pure Agent &amp; Tax Desk
            </Link>
            <Link href="/admin/lawyers" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              ⚖️ Advocate Console
            </Link>
            <Link href="/admin/pricing" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              🏷️ Rates &amp; Catalog
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
              MCA 15-Day SLA Watch: {queryCount} Active Queries
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Pipeline Filings</span>
            <strong className="text-2xl font-black text-[#073B5C] block">{orders.length}</strong>
            <span className="text-[10px] text-slate-400">Total client applications</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">ROC Resubmission Queries</span>
            <strong className="text-2xl font-black text-amber-600 block">{queryCount}</strong>
            <span className="text-[10px] text-amber-700">15-day statutory deadline ticking</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cyan-200 bg-cyan-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-cyan-800 font-extrabold uppercase tracking-wider block">Active CRC Drafting &amp; SPICe+</span>
            <strong className="text-2xl font-black text-[#0E7490] block">{inProgressCount}</strong>
            <span className="text-[10px] text-cyan-700">Class 3 DSC &amp; e-MOA/AoA</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Approved / COI Issued</span>
            <strong className="text-2xl font-black text-emerald-600 block">{approvedCount}</strong>
            <span className="text-[10px] text-emerald-700">CIN allotted &amp; vault unlocked</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders by Order #, SRN, Client Name, Email, or Service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500 font-bold whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none text-xs font-bold text-[#073B5C]"
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="QUERY_RAISED">⚠️ Query Raised / Resubmission ({queryCount})</option>
              <option value="DOCS_PENDING">🟡 Docs Pending ({docsPendingCount})</option>
              <option value="IN_PROGRESS">🔵 In Progress ({inProgressCount})</option>
              <option value="APPROVED">🟢 Approved / COI Issued ({approvedCount})</option>
              <option value="PENDING_PAYMENT">💳 Pending Payment</option>
              <option value="REJECTED">✕ Rejected</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order / SRN</th>
                  <th className="p-4">Client Details</th>
                  <th className="p-4">Service &amp; Place of Supply</th>
                  <th className="p-4">Billing &amp; Fees</th>
                  <th className="p-4">Assigned CA/CS Lead</th>
                  <th className="p-4">Statutory Urgency</th>
                  <th className="p-4 text-right">Verification Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No orders match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#073B5C]">
                        <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline font-mono text-xs">
                          {order.orderNumber}
                        </Link>
                        {order.srn ? (
                          <span className="text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 font-mono font-bold px-1.5 py-0.5 rounded block mt-1">
                            SRN: {order.srn}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">SRN not issued</span>
                        )}
                      </td>
                      <td className="p-4">
                        <strong className="text-[#073B5C] block font-bold">{order.client.name}</strong>
                        <span className="text-[11px] text-slate-500 block">{order.client.email}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{order.client.phone || '—'}</span>
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-800 font-bold block">{order.service.title}</strong>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded inline-block mt-1">
                          {order.clientState} - {stateName(order.clientState)}
                        </span>
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-900 font-extrabold block">₹{formatINR(order.totalAmount)}</strong>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Paid: ₹{formatINR(order.amountPaid)}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.paymentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <strong className="text-[#0E7490] font-bold block">
                          {order.assignedCA?.name || 'Unassigned'}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          {order.assignedCA?.role ? order.assignedCA.role.replace(/_/g, ' ') : 'Open in Queue'}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.status === 'QUERY_RAISED' ? (
                          <span className="text-[10px] bg-orange-100 text-orange-900 border border-orange-300 font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 animate-pulse">
                            <span>⚠️</span> Resubmission Due
                          </span>
                        ) : order.status === 'APPROVED' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                            <span>✓</span> COI Approved
                          </span>
                        ) : order.status === 'DOCS_PENDING' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-full uppercase">
                            Docs Pending
                          </span>
                        ) : (
                          <span className="text-[10px] bg-cyan-100 text-cyan-900 font-black px-2.5 py-1 rounded-full uppercase">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <StatusSelector compact orderId={order.id} currentStatus={order.status} />
                          )}
                          <Link
                            href={`/admin/orders/${order.orderNumber}`}
                            className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[10px] px-3 py-1.5 rounded-lg transition shadow-xs whitespace-nowrap"
                          >
                            Open Dual-Pane Desk &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
