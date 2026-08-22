'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from /api/orders/[orderNumber]
    // Default fallback state for immediate preview:
    setOrder({
      orderNumber: orderNumber || 'NYA-2026-84920',
      srn: 'MCA-SPICE-2026-84920',
      serviceTitle: 'Private Limited Company Registration',
      clientName: 'Dhaval Sidhpura',
      status: 'DOCS_PENDING',
      paymentStatus: 'PAID',
      amount: 8258,
      assignedCA: 'CA Suresh Mehta (Mumbai Bench)',
      desk: 'Charkop Operations Desk',
      createdAt: '2026-08-16',
      checklist: [
        { name: 'PAN & Aadhaar Card of Directors', status: 'VERIFIED' },
        { name: 'Passport Size Photographs', status: 'VERIFIED' },
        { name: 'Registered Office Electricity Bill', status: 'PENDING' },
        { name: 'Landlord NOC & Rent Agreement', status: 'PENDING' },
      ],
    });
    setLoading(false);
  }, [orderNumber]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs">Loading filing workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Back to Customer Vault
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow space-y-6">
        {/* Order Banner */}
        <div className="bg-[#073B5C] text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-md border border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#F4B942] text-[#073B5C] font-extrabold text-[10px] uppercase px-3 py-1 rounded">
              Order #{order.orderNumber}
            </span>
            <span className="text-xs text-slate-300 font-mono">Government SRN: <strong>{order.srn}</strong></span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold">{order.serviceTitle}</h1>
          
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-200">
            <span>👤 Applicant: <strong>{order.clientName}</strong></span>
            <span>🏛️ Assigned: <strong>{order.assignedCA}</strong></span>
            <span>📍 Desk: <strong>{order.desk}</strong></span>
          </div>
        </div>

        {/* Status Tracker & Document Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-[#073B5C] text-base border-b border-slate-100 pb-2">
              Statutory Document Verification Checklist
            </h3>

            <div className="space-y-3">
              {order.checklist.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-[#073B5C] text-base border-b border-slate-100 pb-2">
              Filing Summary
            </h3>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Fee Paid:</span>
                <strong className="text-slate-900">₹{order.amount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-emerald-700 font-bold">PAID (Razorpay)</span>
              </div>
              <div className="flex justify-between">
                <span>Filing Stage:</span>
                <span className="text-[#0E7490] font-bold">Document Ingestion</span>
              </div>
            </div>

            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl text-[11px] text-cyan-900 space-y-1">
              <span className="font-bold block">Need direct assistance?</span>
              <p>Contact your assigned CA desk at <strong>+91 9920054785</strong> or email <strong>info@nyayalink.com</strong>.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}