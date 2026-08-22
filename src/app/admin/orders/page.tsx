'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  orderNumber: string;
  srn: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  amount: number;
  date: string;
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'QUERY_RAISED' | 'APPROVED';
  assignedCA: string;
}

export default function AdminOrdersDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'leads' | 'cas'>('orders');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: '1',
      orderNumber: 'NYA-2026-9941',
      srn: 'MCA-SPICE-2026-9941',
      clientName: 'Dhaval Sidhpura',
      clientEmail: 'dhaval@mobizspare.com',
      clientPhone: '+91 9920054785',
      serviceTitle: 'Private Limited Company Registration',
      amount: 6999,
      date: '11 Aug 2026',
      status: 'QUERY_RAISED',
      assignedCA: 'CA Rajiv Sharma',
    },
    {
      id: '2',
      orderNumber: 'NYA-2026-3102',
      srn: 'GST-REG-2026-1102',
      clientName: 'Pushpa Sidhpura',
      clientEmail: 'finance@mobizspare.com',
      clientPhone: '+91 9820012345',
      serviceTitle: 'New GSTIN Registration',
      amount: 1499,
      date: '10 Aug 2026',
      status: 'APPROVED',
      assignedCA: 'CS Neha Verma',
    },
    {
      id: '3',
      orderNumber: 'NYA-2026-4410',
      srn: 'TM-REG-2026-8810',
      clientName: 'Rahul Mehta',
      clientEmail: 'rahul@techstart.in',
      clientPhone: '+91 9870098765',
      serviceTitle: 'Online Trademark Registration',
      amount: 6499,
      date: '09 Aug 2026',
      status: 'IN_PROGRESS',
      assignedCA: 'Adv. Amit Kulkarni',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: OrderItem['status']) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    alert(`Order ${id} status updated to ${newStatus}`);
  };

  const filteredOrders =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* ADMIN HEADER */}
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
            <span className="text-slate-300">Admin: <strong>Operations HQ (Mumbai)</strong></span>
            <Link href="/" className="text-[#F4B942] hover:underline font-bold">
              Exit to Main Site →
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* STATS METRICS BAR */}
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

        {/* TABS & FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'orders' ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              📋 All Client Orders ({orders.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500 font-bold">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none text-xs font-bold text-[#073B5C]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="QUERY_RAISED">Query Raised</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>

        {/* ORDERS TABLE */}
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
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-[#073B5C]">
                      <div>{order.orderNumber}</div>
                      <span className="text-[10px] text-[#0E7490] font-mono block mt-0.5">{order.srn}</span>
                    </td>
                    <td className="p-4">
                      <strong className="text-[#073B5C] block">{order.clientName}</strong>
                      <span className="text-[11px] text-slate-500 block">{order.clientEmail}</span>
                      <span className="text-[10px] text-slate-400 block">{order.clientPhone}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{order.serviceTitle}</td>
                    <td className="p-4 font-extrabold text-[#073B5C]">₹{order.amount}</td>
                    <td className="p-4 font-bold text-[#0E7490]">{order.assignedCA}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          order.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'QUERY_RAISED'
                            ? 'bg-amber-100 text-amber-900'
                            : order.status === 'IN_PROGRESS'
                            ? 'bg-cyan-100 text-[#0E7490]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderItem['status'])
                        }
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-[#073B5C] focus:outline-none cursor-pointer"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="QUERY_RAISED">Query Raised</option>
                        <option value="APPROVED">Approved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}