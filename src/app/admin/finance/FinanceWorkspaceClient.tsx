'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Role, TxnType } from '@prisma/client';
import { formatINR, stateName } from '@/lib/pricing';
import type { FinanceData } from './page';

type Props = FinanceData & { role: Role };

export default function FinanceWorkspaceClient({
  role,
  invoices,
  ledger,
  balance,
  orders,
  payableConsultations,
  pendingPayouts,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'gstr1' | 'ledger' | 'payouts'>('overview');
  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('ALL');
  const [busy, setBusy] = useState(false);

  // New Ledger Entry form
  const [newLedgerType, setNewLedgerType] = useState<TxnType>('GOVT_FEES_DEBIT');
  const [newLedgerDesc, setNewLedgerDesc] = useState('');
  const [newLedgerAmount, setNewLedgerAmount] = useState<number>(0);
  const [newLedgerMode, setNewLedgerMode] = useState('BANK_TRANSFER');
  const [newLedgerOrderRef, setNewLedgerOrderRef] = useState('');

  // Financial aggregates
  const totalTaxable = invoices.reduce((sum, i) => sum + (i.taxableAmount || 0), 0);
  const totalCGST = invoices.reduce((sum, i) => sum + (i.cgst || 0), 0);
  const totalSGST = invoices.reduce((sum, i) => sum + (i.sgst || 0), 0);
  const totalIGST = invoices.reduce((sum, i) => sum + (i.igst || 0), 0);
  const totalGSTLiability = totalCGST + totalSGST + totalIGST;
  const totalPureAgentGovt = invoices.reduce((sum, i) => sum + (i.reimbursements || 0), 0);
  const totalInvoicedVolume = totalTaxable + totalGSTLiability + totalPureAgentGovt;

  // Rule 33 Escrow health calculation
  const totalGovtDebited = ledger
    .filter((l) => l.type === 'GOVT_FEES_DEBIT')
    .reduce((sum, l) => sum + (l.debit || 0), 0);
  const escrowRemaining = Math.max(0, totalPureAgentGovt - totalGovtDebited);
  const escrowHealthRatio =
    totalPureAgentGovt > 0
      ? Math.min(100, Math.round((totalGovtDebited / totalPureAgentGovt) * 100))
      : 100;

  const handleAddLedgerTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newLedgerType,
          description: newLedgerDesc,
          amount: newLedgerAmount,
          mode: newLedgerMode,
          orderId: newLedgerOrderRef || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to record transaction.');
        return;
      }
      setShowAddLedgerModal(false);
      setNewLedgerDesc('');
      setNewLedgerAmount(0);
      setNewLedgerOrderRef('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleExportGstr1Csv = () => {
    if (invoices.length === 0) {
      alert('No invoices available to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Billed To Name',
      'Billed To GSTIN',
      'Place of Supply',
      'State Name',
      'SAC Code',
      'Taxable Value (₹)',
      'CGST (₹)',
      'SGST (₹)',
      'IGST (₹)',
      'Pure Agent Govt Fee (₹)',
      'Total Value (₹)',
      'Invoice Type',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNo,
      new Date(inv.createdAt).toISOString().slice(0, 10),
      `"${inv.billedToName.replace(/"/g, '""')}"`,
      inv.billedToGstin || 'URP',
      inv.placeOfSupply,
      `"${stateName(inv.placeOfSupply)}"`,
      inv.sacCode || '998221',
      inv.taxableAmount.toFixed(2),
      inv.cgst.toFixed(2),
      inv.sgst.toFixed(2),
      inv.igst.toFixed(2),
      inv.reimbursements.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.billedToGstin ? 'B2B' : 'B2C-Small',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NyayaLink_GSTR1_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLedger =
    ledgerTypeFilter === 'ALL' ? ledger : ledger.filter((l) => l.type === ledgerTypeFilter);

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
              Finance &amp; Pure Agent Desk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-[#F4B942] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-700 shadow-sm"
            >
              ← Super Controller HQ
            </Link>
            <button
              onClick={() => setShowAddLedgerModal(true)}
              className="bg-[#0E7490] hover:bg-cyan-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Post Ledger Entry
            </button>
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
            <Link href="/admin/orders" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              📋 CA Operations Desk
            </Link>
            <span className="bg-[#073B5C] text-[#F4B942] font-black px-3 py-1 rounded-lg">
              🏛️ Pure Agent &amp; Tax Desk
            </span>
            <Link href="/admin/lawyers" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              ⚖️ Advocate Console
            </Link>
            <Link href="/admin/pricing" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              🏷️ Rates &amp; Catalog
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGstr1Csv}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span> Export GSTR-1 CSV
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow space-y-6">
        {/* Rule 33 Pure Agent Statutory Escrow Health Card */}
        <div className="bg-gradient-to-br from-[#073B5C] to-[#0A4E78] text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-cyan-800/80 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#F4B942] tracking-wider block">
                Statutory Compliance &amp; CGST Act 2017
              </span>
              <h2 className="text-lg font-black">Rule 33 Pure Agent Dual-Ledger &amp; Escrow Health</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                100% Tax Compliant
              </span>
              <span className="bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                Zero GST on Govt Fees
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-300 font-semibold block text-[11px]">Gross Invoiced Volume</span>
              <strong className="text-2xl font-black text-white block">₹{formatINR(totalInvoicedVolume)}</strong>
              <span className="text-[10px] text-slate-300">Total customer collections</span>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-emerald-300 font-semibold block text-[11px]">Operating Platform Fee</span>
              <strong className="text-2xl font-black text-emerald-400 block">₹{formatINR(totalTaxable)}</strong>
              <span className="text-[10px] text-emerald-200">Taxable revenue (Facilitation)</span>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[#F4B942] font-semibold block text-[11px]">Govt Pass-Through Escrow</span>
              <strong className="text-2xl font-black text-[#F4B942] block">₹{formatINR(totalPureAgentGovt)}</strong>
              <span className="text-[10px] text-amber-200">ROC / Stamp Treasury / TM</span>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-cyan-300 font-semibold block text-[11px]">Output GST Liability (18%)</span>
              <strong className="text-2xl font-black text-cyan-300 block">₹{formatINR(totalGSTLiability)}</strong>
              <span className="text-[10px] text-cyan-200">CGST + SGST + IGST liability</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-300 font-semibold block">Pure Agent Statutory Challan Reconciliation:</span>
              <p className="text-[11px] text-slate-300">
                Total statutory advances collected: <strong className="text-white">₹{formatINR(totalPureAgentGovt)}</strong> · Disbursed on Bharatkosh / MCA Challans:{' '}
                <strong className="text-emerald-300">₹{formatINR(totalGovtDebited)}</strong> · Remaining Escrow:{' '}
                <strong className="text-[#F4B942]">₹{formatINR(escrowRemaining)}</strong>
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="w-32 bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: `${escrowHealthRatio}%` }} />
              </div>
              <span className="font-mono font-black text-xs text-white">{escrowHealthRatio}% Cleared</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {[
            ['overview', '📊 Financial Summary'],
            ['invoices', `🧾 B2B/B2C Invoices (${invoices.length})`],
            ['gstr1', '🏛️ GSTR-1 & Tax Return Engine'],
            ['ledger', `📒 Dual Ledger (${ledger.length})`],
            ['payouts', '⚖️ Section 194J CA / Advocate Payouts'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
                activeTab === key
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Net Operating Cash Balance
                </span>
                <strong className="text-3xl font-black text-[#073B5C]">₹{formatINR(balance)}</strong>
                <p className="text-[11px] text-slate-500">Live bank balance after gateway fees and govt pass-throughs.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Total Tax Invoices Issued
                </span>
                <strong className="text-3xl font-black text-[#0E7490]">{invoices.length}</strong>
                <p className="text-[11px] text-slate-500">Auto-generated Section 31 tax receipts with place of supply.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Pending CA/Advocate TDS
                </span>
                <strong className="text-3xl font-black text-amber-600">
                  {pendingPayouts.length + payableConsultations.length} Cases
                </strong>
                <p className="text-[11px] text-slate-500">Section 194J 10% withholding tax pending disbursement.</p>
              </div>
            </div>

            {/* Recent Orders with Financial Reconciliation */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-[#073B5C]">Recent Paid Orders &amp; Tax Split</h3>
                  <p className="text-xs text-slate-400">Order-level segregation of taxable fee, pure agent govt fees, and GST.</p>
                </div>
                <Link href="/admin/orders" className="text-xs font-bold text-[#0E7490] hover:underline">
                  View Order Desk →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Order / Service</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Place of Supply</th>
                      <th className="p-4">Taxable Professional</th>
                      <th className="p-4">Pure Agent Govt Fee</th>
                      <th className="p-4">GST (18%)</th>
                      <th className="p-4 text-right">Total Invoiced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <strong className="text-[#073B5C] font-extrabold block">{o.orderNumber}</strong>
                          <span className="text-[11px] text-slate-500">{o.service.title}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{o.client.name}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {o.clientState} - {stateName(o.clientState)}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-emerald-700">₹{formatINR(o.professionalFee)}</td>
                        <td className="p-4 font-bold text-amber-700">₹{formatINR(o.govtFee)}</td>
                        <td className="p-4 font-bold text-[#0E7490]">₹{formatINR(o.gstAmount)}</td>
                        <td className="p-4 text-right font-black text-slate-900">₹{formatINR(o.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVOICES */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#073B5C]">Official GST Tax Invoices</h3>
                <p className="text-xs text-slate-500">
                  Invoices issued under Section 31 of CGST Act with SAC 998221 / 998222.
                </p>
              </div>
              <button
                onClick={handleExportGstr1Csv}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>📥</span> Download All Invoices (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Customer Name &amp; GSTIN</th>
                    <th className="p-4">Place of Supply</th>
                    <th className="p-4">Taxable Value</th>
                    <th className="p-4">CGST + SGST</th>
                    <th className="p-4">IGST</th>
                    <th className="p-4">Pure Agent Govt Fee</th>
                    <th className="p-4 text-right">Invoice Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#073B5C]">
                          {inv.invoiceNo}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {new Date(inv.createdAt).toISOString().slice(0, 10)}
                          </span>
                        </td>
                        <td className="p-4">
                          <strong className="text-slate-900 block">{inv.billedToName}</strong>
                          <span className="text-[10px] font-mono text-slate-500">{inv.billedToGstin || 'B2C (Unregistered)'}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {inv.placeOfSupply} ({stateName(inv.placeOfSupply)})
                        </td>
                        <td className="p-4 font-extrabold text-emerald-700">₹{formatINR(inv.taxableAmount)}</td>
                        <td className="p-4 font-bold text-slate-700">
                          {inv.cgst + inv.sgst > 0 ? `₹${formatINR(inv.cgst + inv.sgst)}` : '—'}
                        </td>
                        <td className="p-4 font-bold text-slate-700">{inv.igst > 0 ? `₹${formatINR(inv.igst)}` : '—'}</td>
                        <td className="p-4 font-bold text-amber-700">₹{formatINR(inv.reimbursements)}</td>
                        <td className="p-4 text-right font-black text-[#073B5C]">₹{formatINR(inv.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GSTR-1 & TAX ENGINE */}
        {activeTab === 'gstr1' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#073B5C]">GSTR-1 Monthly Tax Return Preparation</h3>
                  <p className="text-xs text-slate-500">
                    Pre-aggregated tables ready for export to GST Offline Tool (Form GSTR-1).
                  </p>
                </div>
                <button
                  onClick={handleExportGstr1Csv}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>📥</span> Export Official GSTR-1 Table (CSV)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Table 4A - B2B Invoices</span>
                  <strong className="text-xl font-black text-[#073B5C] block">
                    {invoices.filter((i) => i.billedToGstin).length} Invoices
                  </strong>
                  <span className="text-[11px] text-slate-500">Registered taxable supplies</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Table 7 - B2C Small</span>
                  <strong className="text-xl font-black text-[#073B5C] block">
                    {invoices.filter((i) => !i.billedToGstin).length} Invoices
                  </strong>
                  <span className="text-[11px] text-slate-500">Unregistered retail consumers</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Total Taxable Value</span>
                  <strong className="text-xl font-black text-emerald-700 block">₹{formatINR(totalTaxable)}</strong>
                  <span className="text-[11px] text-emerald-600">Net platform fee base</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-cyan-700 font-extrabold uppercase">Total Output Tax</span>
                  <strong className="text-xl font-black text-cyan-700 block">₹{formatINR(totalGSTLiability)}</strong>
                  <span className="text-[11px] text-cyan-600">Payable in GSTR-3B return</span>
                </div>
              </div>
            </div>

            {/* Place of Supply Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h4 className="font-extrabold text-sm text-[#073B5C]">Place of Supply (State-wise GST Distribution)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                {Object.entries(
                  invoices.reduce((acc, inv) => {
                    const st = inv.placeOfSupply || 'MH';
                    acc[st] = (acc[st] || 0) + (inv.totalAmount || 0);
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([st, amt]) => (
                  <div key={st} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-extrabold text-[#073B5C] block">{st} - {stateName(st)}</span>
                    <strong className="font-mono text-emerald-700 block">₹{formatINR(amt)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUAL LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-base text-[#073B5C]">Rule 33 Dual Ledger</h3>
                <p className="text-xs text-slate-500">
                  Chronological record of platform revenue vs government disbursements and CA payouts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ledgerTypeFilter}
                  onChange={(e) => setLedgerTypeFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#073B5C] focus:outline-none"
                >
                  <option value="ALL">All Transaction Types</option>
                  <option value="CLIENT_PAYMENT">Client Payments (Credit)</option>
                  <option value="GOVT_FEES_DEBIT">Govt Fees Debit (Pass-Through)</option>
                  <option value="CA_PAYOUT">CA Fulfillment Payouts</option>
                  <option value="LAWYER_PAYOUT">Advocate Payouts</option>
                  <option value="REFUND">Refunds</option>
                </select>
                <button
                  onClick={() => setShowAddLedgerModal(true)}
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-4 py-2 rounded-xl transition shadow cursor-pointer whitespace-nowrap"
                >
                  + Post Transaction
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Txn Ref #</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description &amp; Order Ref</th>
                      <th className="p-4">Debit (-)</th>
                      <th className="p-4">Credit (+)</th>
                      <th className="p-4 text-right">Payment Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No ledger entries found for this category.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#073B5C]">
                            {entry.txnNo}
                            <span className="block text-[10px] text-slate-400 font-sans">
                              {new Date(entry.createdAt).toISOString().slice(0, 10)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                entry.type === 'CLIENT_PAYMENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : entry.type === 'GOVT_FEES_DEBIT'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {entry.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <strong className="text-slate-900 block">{entry.description}</strong>
                            {entry.order && (
                              <span className="text-[10px] text-[#0E7490] font-bold">
                                Order: {entry.order.orderNumber}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-rose-600">
                            {entry.debit > 0 ? `- ₹${formatINR(entry.debit)}` : '—'}
                          </td>
                          <td className="p-4 font-bold text-emerald-600">
                            {entry.credit > 0 ? `+ ₹${formatINR(entry.credit)}` : '—'}
                          </td>
                          <td className="p-4 text-right font-semibold text-slate-500">{entry.mode}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECTION 194J TDS PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073B5C]">
                Section 194J CA &amp; Advocate Payouts (TDS Withholding)
              </h3>
              <p className="text-xs text-slate-500">
                Income Tax Act Section 194J mandates 10% TDS withholding on professional facilitation fees.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pending Advocate Batches</span>
                  <strong className="text-2xl font-black text-[#073B5C] block">
                    {payableConsultations.length} Advocates
                  </strong>
                  <span className="text-[11px] text-slate-500">Completed consultations ready for payout</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase">Pending Processing</span>
                  <strong className="text-2xl font-black text-amber-600 block">
                    {pendingPayouts.length} Batches
                  </strong>
                  <span className="text-[11px] text-amber-700">Bank transfers waiting for release</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-cyan-700 font-extrabold uppercase">Statutory TDS Rate</span>
                  <strong className="text-2xl font-black text-[#0E7490] block">10.0%</strong>
                  <span className="text-[11px] text-cyan-700">Form 26Q quarterly compliance</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Professional / Lawyer</th>
                      <th className="p-4">Gross Fee</th>
                      <th className="p-4">TDS (10% u/s 194J)</th>
                      <th className="p-4">Net Payout Payable</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {payableConsultations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          All completed consultations have been settled. No pending payouts.
                        </td>
                      </tr>
                    ) : (
                      payableConsultations.map((p) => {
                        const gross = p._sum.fee || 0;
                        const tds = Math.round(gross * 0.1);
                        const net = gross - tds;
                        return (
                          <tr key={p.lawyerId} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">
                              Lawyer ID: {p.lawyerId.slice(0, 10)}... ({p._count} sessions)
                            </td>
                            <td className="p-4 font-bold text-slate-800">₹{formatINR(gross)}</td>
                            <td className="p-4 font-bold text-rose-600">- ₹{formatINR(tds)}</td>
                            <td className="p-4 font-black text-emerald-700">₹{formatINR(net)}</td>
                            <td className="p-4 text-right">
                              <Link
                                href="/admin/lawyers"
                                className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[10px] px-3 py-1.5 rounded-lg transition inline-block"
                              >
                                Disburse Payout →
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Record Ledger Transaction */}
      {showAddLedgerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Post Ledger Transaction</h3>
              <button onClick={() => setShowAddLedgerModal(false)} className="font-bold text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddLedgerTxn} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Category *</label>
                <select
                  value={newLedgerType}
                  onChange={(e) => setNewLedgerType(e.target.value as TxnType)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-[#073B5C] focus:outline-none"
                >
                  <option value="GOVT_FEES_DEBIT">Govt Fees Debit (MCA Challan / Bharatkosh / Stamp Treasury)</option>
                  <option value="CLIENT_PAYMENT">Client Payment (Direct Bank Transfer / NEFT / RTGS)</option>
                  <option value="CA_PAYOUT">CA Fulfillment Honorarium Payout</option>
                  <option value="LAWYER_PAYOUT">Advocate Consultation Payout</option>
                  <option value="REFUND">Customer Refund (Bank Transfer)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description &amp; Challan / UTR Ref *</label>
                <input
                  type="text"
                  required
                  value={newLedgerDesc}
                  onChange={(e) => setNewLedgerDesc(e.target.value)}
                  placeholder="e.g. Bharatkosh SPICe+ Challan MH-2026-9812"
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newLedgerAmount || ''}
                    onChange={(e) => setNewLedgerAmount(Number(e.target.value))}
                    placeholder="e.g. 4500"
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Channel</label>
                  <select
                    value={newLedgerMode}
                    onChange={(e) => setNewLedgerMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="BHARATKOSH">Bharatkosh Gateway</option>
                    <option value="GRAS_TREASURY">State GRAS Treasury</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="UPI">Corporate UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order Number (Optional)</label>
                <input
                  type="text"
                  value={newLedgerOrderRef}
                  onChange={(e) => setNewLedgerOrderRef(e.target.value)}
                  placeholder="e.g. NYA-2026-0042"
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black py-3 rounded-xl uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 mt-2"
              >
                {busy ? 'Posting Entry...' : 'Post to Official Ledger →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
