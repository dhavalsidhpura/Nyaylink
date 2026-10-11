'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusSelector from './StatusSelector';
import type { AdminOrderRow } from './page';

interface Props {
  orders: AdminOrderRow[];
  canEdit: boolean;
}

export default function AdminOrdersClient({ orders, canEdit }: Props) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = statusFilter === 'ALL' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="bg-[#073B5C] text-white border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-extrabold text-xl px-3 py-1 rounded-xl font-mono">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="bg-[#F4B942] text-[#073B5C] font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded tracking-wider">
              Operations Desk
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-[#F4B942] hover:underline font-bold">
              Exit to Main Site →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</span>
            <strong className="text-2xl font-extrabold text-[#073B5C] block">{orders.length}</strong>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] text-amber-600 font-bold uppercase">Pending Resubmissions</span>
            <strong className="text-2xl font-extrabold text-amber-600 block">
              {orders.filter((o) => o.status === 'QUERY_RAISED').length}
            </strong>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] text-cyan-600 font-bold uppercase">In Progress Filings</span>
            <strong className="text-2xl font-extrabold text-[#0E7490] block">
              {orders.filter((o) => o.status === 'IN_PROGRESS').length}
            </strong>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Approved / COI Issued</span>
            <strong className="text-2xl font-extrabold text-emerald-600 block">
              {orders.filter((o) => o.status === 'APPROVED').length}
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-[#073B5C] text-[#F4B942]">
            📋 All Client Orders ({orders.length})
          </span>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500 font-bold">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none text-xs font-bold text-[#073B5C]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="DOCS_PENDING">Docs Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="QUERY_RAISED">Query Raised</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order / SRN</th>
                  <th className="p-4">Client Details</th>
                  <th className="p-4">Service Required</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Assigned CA/CS</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No orders match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#073B5C]">
                        <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                        {order.srn && <span className="text-[10px] text-[#0E7490] font-mono block mt-0.5">{order.srn}</span>}
                      </td>
                      <td className="p-4">
                        <strong className="text-[#073B5C] block">{order.client.name}</strong>
                        <span className="text-[11px] text-slate-500 block">{order.client.email}</span>
                        <span className="text-[10px] text-slate-400 block">{order.client.phone}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{order.service.title}</td>
                      <td className="p-4 font-extrabold text-[#073B5C]">₹{order.totalAmount.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">{order.paymentStatus.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="p-4 font-bold text-[#0E7490]">{order.assignedCA?.name || 'Unassigned'}</td>
                      <td className="p-4 text-right">
                        {canEdit ? (
                          <StatusSelector compact orderId={order.id} currentStatus={order.status} />
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-slate-600">{order.status.replace(/_/g, ' ')}</span>
                        )}
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
