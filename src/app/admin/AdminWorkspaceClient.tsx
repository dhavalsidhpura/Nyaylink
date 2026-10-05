'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Role } from '@prisma/client';
import type { AdminData } from './page';

function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount);
}

type Props = AdminData & { role: Role };

const CAN = {
  finance: (r: Role) => r === 'SUPER_ADMIN' || r === 'FINANCE_MANAGER',
  docs: (r: Role) => ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC'].includes(r),
  ops: (r: Role) => r === 'SUPER_ADMIN' || r === 'OPS_MANAGER',
  superAdmin: (r: Role) => r === 'SUPER_ADMIN',
};

export default function AdminWorkspaceClient({ role, team, leads, orders, pendingDocuments, invoices, ledger, balance }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'crm' | 'orders' | 'docs' | 'catalog' | 'lawyers' | 'tax_gst' | 'ledger' | 'team'
  >('overview');

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [busy, setBusy] = useState(false);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('COMPLIANCE_EXEC');

  const [newLedgerType, setNewLedgerType] = useState<'CLIENT_PAYMENT' | 'GOVT_FEES_DEBIT' | 'CA_PAYOUT' | 'LAWYER_PAYOUT' | 'REFUND'>('GOVT_FEES_DEBIT');
  const [newLedgerDesc, setNewLedgerDesc] = useState('');
  const [newLedgerAmount, setNewLedgerAmount] = useState(0);
  const [newLedgerMode, setNewLedgerMode] = useState('BANK_TRANSFER');

  const totalTaxable = invoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  const totalCGST = invoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSGST = invoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalIGST = invoices.reduce((sum, i) => sum + i.igst, 0);
  const totalGSTLiability = totalCGST + totalSGST + totalIGST;

  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStaffName, email: newStaffEmail, role: newStaffRole }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to onboard staff.');
        return;
      }
      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

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
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDocApprove = async (documentId: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, status: 'VERIFIED' }),
      });
      const data = await res.json();
      if (!data.success) alert(data.error || 'Failed to verify document.');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDocRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: showRejectModal, status: 'REJECTED', rejectNote: rejectionReasonInput }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to reject document.');
        return;
      }
      setShowRejectModal(null);
      setRejectionReasonInput('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const TABS = (
    [
      ['overview', '📊', 'Executive Overview', null, true],
      ['crm', '📥', 'Lead CRM', leads.filter((l) => l.status === 'NEW').length || null, true],
      ['orders', '📋', 'Order Pipeline', orders.length || null, true],
      ['docs', '🔒', 'Document Review', pendingDocuments.length || null, CAN.docs(role)],
      ['catalog', '🏷️', 'Service Catalog', null, CAN.ops(role)],
      ['lawyers', '⚖️', 'वकील Search', null, CAN.ops(role) || CAN.finance(role)],
      ['tax_gst', '🏛️', 'Tax & GST Engine', null, CAN.finance(role)],
      ['ledger', '📒', 'Financial Ledger', null, CAN.finance(role)],
      ['team', '👥', 'Staff Roster', null, true],
    ] as const
  ).filter((t) => t[4]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="bg-[#073B5C] text-white border-b border-cyan-900/60 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3 py-1 rounded-xl font-mono shadow-inner border border-cyan-400/30 flex items-center gap-1">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
              Main Operations Console
            </span>
          </div>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[#F4B942] font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm">
            Exit to Site →
          </Link>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[53px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(([key, icon, label, badge]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                  activeTab === key ? 'bg-[#073B5C] text-[#F4B942] shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
                }`}
              >
                <span>{icon}</span> {label}
                {badge !== null && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black">{badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Bank Cash Ledger</span>
                <strong className="text-2xl font-black text-[#073B5C] block">{CAN.finance(role) ? `₹${formatINR(balance)}` : '—'}</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">GST Output Tax</span>
                <strong className="text-2xl font-black text-[#0E7490] block">{CAN.finance(role) ? `₹${formatINR(totalGSTLiability)}` : '—'}</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wider">ROC Resubmissions</span>
                <strong className="text-2xl font-black text-amber-600 block">
                  {orders.filter((o) => o.status === 'QUERY_RAISED').length} Pending
                </strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] text-emerald-800 font-extrabold uppercase tracking-wider">Unassigned Leads</span>
                <strong className="text-2xl font-black text-emerald-600 block">
                  {leads.filter((l) => l.status === 'NEW').length} New Lead
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-[#073B5C] text-sm sm:text-base">Recent Order Pipeline</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#0E7490] hover:underline">
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-1">
                          <strong className="text-xs font-extrabold text-[#073B5C]">{o.orderNumber}</strong>
                          <span className="text-xs font-bold text-slate-800 block">{o.service.title}</span>
                          <span className="text-[11px] text-slate-500 block">Client: {o.client.name} | CA: {o.assignedCA?.name || 'Unassigned'}</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded-full uppercase">
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No orders yet.</p>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-[#073B5C] text-sm">Staff Load Monitor</h3>
                    <button onClick={() => setActiveTab('team')} className="text-xs font-bold text-[#0E7490] hover:underline">
                      Roster →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {team.map((m) => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs font-bold text-[#073B5C]">{m.name}</strong>
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded uppercase">
                            {m.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Active Cases: {m.assignedOrders.filter((o) => o.status !== 'APPROVED' && o.status !== 'REJECTED').length}
                        </span>
                      </div>
                    ))}
                    {team.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No staff onboarded yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-[#073B5C]">Inbound Lead CRM</h2>
              <p className="text-xs text-slate-500">Leads captured from the homepage quick-filing form.</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Applicant Name</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Inquiry Category</th>
                      <th className="p-4">Assigned Agent</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {leads.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No leads captured yet.</td></tr>
                    ) : (
                      leads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-extrabold text-slate-900">{l.fullName}</td>
                          <td className="p-4">
                            <span className="block font-bold text-slate-800">{l.phone}</span>
                            <span className="text-slate-400 text-[11px]">{l.email}</span>
                          </td>
                          <td className="p-4 font-bold text-[#0E7490]">{l.complianceType}</td>
                          <td className="p-4 font-bold text-slate-700">{l.assignedTo?.name || 'Unassigned'}</td>
                          <td className="p-4">
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-full uppercase">{l.status}</span>
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

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Recent Orders</h2>
                <p className="text-xs text-slate-500">Full status management lives in the Operations Console.</p>
              </div>
              <Link href="/admin/orders" className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                Open Full Order Console →
              </Link>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Order / SRN</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Fee</th>
                      <th className="p-4">Assigned CA</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#073B5C]">
                          <Link href={`/admin/orders/${o.orderNumber}`} className="hover:underline">{o.orderNumber}</Link>
                        </td>
                        <td className="p-4 font-bold">{o.client.name}</td>
                        <td className="p-4">{o.service.title}</td>
                        <td className="p-4 font-extrabold text-emerald-700">₹{formatINR(o.totalAmount)}</td>
                        <td className="p-4 font-bold text-[#0E7490]">{o.assignedCA?.name || 'Unassigned'}</td>
                        <td className="p-4 text-right font-bold uppercase text-amber-800">{o.status.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-[#073B5C]">Document Review Queue</h2>
              <p className="text-xs text-slate-500">Approve or reject client-uploaded KYC and supporting documents.</p>
            </div>
            <div className="space-y-3">
              {pendingDocuments.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  No documents pending review.
                </div>
              ) : (
                pendingDocuments.map((d) => (
                  <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <strong className="text-[#073B5C] font-bold text-sm block">{d.name}</strong>
                      <span className="text-xs text-slate-500">
                        Client: {d.owner.name} {d.order ? `· ${d.order.service.title}` : ''} · v{d.version} · {(d.sizeBytes / 1024).toFixed(0)} KB
                      </span>
                      {d.order && (
                        <Link href={`/admin/orders/${d.order.orderNumber}`} className="text-[11px] text-[#0E7490] font-bold hover:underline block">
                          {d.order.orderNumber} →
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-xs px-3.5 py-2 rounded-xl">
                        👁 View
                      </a>
                      <button disabled={busy} onClick={() => handleDocApprove(d.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer disabled:opacity-50">
                        ✓ Approve
                      </button>
                      <button disabled={busy} onClick={() => setShowRejectModal(d.id)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer disabled:opacity-50">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <h2 className="text-xl font-extrabold text-[#073B5C]">Service Catalog & Rate Management</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Pricing and rate management lives in the dedicated Rate Manager, backed by the live database.
            </p>
            <Link href="/admin/pricing" className="inline-block bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors">
              Open Rate & Fee Manager →
            </Link>
          </div>
        )}

        {activeTab === 'lawyers' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <h2 className="text-xl font-extrabold text-[#073B5C]">वकील Search Marketplace</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Verify advocate Bar Council enrolments, manage listings, and run consultation fee payouts.
            </p>
            <Link href="/admin/lawyers" className="inline-block bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors">
              Open Advocate Console →
            </Link>
          </div>
        )}

        {activeTab === 'tax_gst' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-[#073B5C]">GST Management & Tax Invoicing</h2>
              <p className="text-xs text-slate-500">Aggregated from generated invoices.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                ['Taxable Value', totalTaxable],
                ['CGST + SGST (intra-state)', totalCGST + totalSGST],
                ['IGST (inter-state)', totalIGST],
                ['Total Output GST Liability', totalGSTLiability],
              ] as const).map(([label, value]) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{label}</span>
                  <strong className="text-xl font-extrabold text-[#073B5C]">₹{formatINR(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Financial Ledger</h2>
                <p className="text-xs text-slate-500">
                  Net balance: <strong className="text-[#073B5C]">₹{formatINR(balance)}</strong> · Gateway payments, refunds and payouts post automatically.
                </p>
              </div>
              <button onClick={() => setShowAddLedgerModal(true)} className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
                + Record Transaction
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Txn Ref</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Debit</th>
                      <th className="p-4">Credit</th>
                      <th className="p-4 text-right">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {ledger.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No transactions recorded yet.</td></tr>
                    ) : (
                      ledger.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#073B5C]">{e.txnNo}</td>
                          <td className="p-4 text-slate-800 font-bold">{e.description}</td>
                          <td className="p-4 font-bold text-rose-600">{e.debit > 0 ? `- ₹${formatINR(e.debit)}` : '—'}</td>
                          <td className="p-4 font-bold text-emerald-600">{e.credit > 0 ? `+ ₹${formatINR(e.credit)}` : '—'}</td>
                          <td className="p-4 font-bold text-slate-500 text-right">{e.mode}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Staff Roster</h2>
                <p className="text-xs text-slate-500">Internal team members with console access. Staff sign in with an email one-time code.</p>
              </div>
              <button hidden={!CAN.superAdmin(role)} onClick={() => setShowAddStaffModal(true)} className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
                + Onboard Staff
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Active Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {team.length === 0 ? (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-400">No staff onboarded yet.</td></tr>
                    ) : (
                      team.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{m.name} ({m.email})</td>
                          <td className="p-4 font-bold text-[#0E7490]">{m.role.replace(/_/g, ' ')}</td>
                          <td className="p-4 font-extrabold text-[#073B5C]">
                            {m.assignedOrders.filter((o) => o.status !== 'APPROVED' && o.status !== 'REJECTED').length}
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
      </main>

      {showAddLedgerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Record Ledger Transaction</h3>
              <button onClick={() => setShowAddLedgerModal(false)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleAddLedgerTxn} className="space-y-3 text-xs">
              <select value={newLedgerType} onChange={(e) => setNewLedgerType(e.target.value as any)} className="w-full bg-slate-50 border p-2.5 rounded-xl">
                <option value="GOVT_FEES_DEBIT">Govt Fees Debit</option>
                <option value="CLIENT_PAYMENT">Client Payment (offline / bank transfer)</option>
                <option value="CA_PAYOUT">CA Payout</option>
                <option value="REFUND">Refund (offline)</option>
              </select>
              <input type="text" required value={newLedgerDesc} onChange={(e) => setNewLedgerDesc(e.target.value)} placeholder="Transaction Description" className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
              <input type="number" required value={newLedgerAmount} onChange={(e) => setNewLedgerAmount(Number(e.target.value))} placeholder="Amount (₹)" className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
              <button type="submit" disabled={busy} className="w-full bg-[#073B5C] text-[#F4B942] font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow disabled:opacity-50">
                {busy ? 'Posting...' : 'Post Transaction →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Onboard Staff Member</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleAddStaffMember} className="space-y-3 text-xs">
              <input type="text" required value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
              <input type="email" required value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
              <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="w-full bg-slate-50 border p-2.5 rounded-xl">
                <option value="COMPLIANCE_EXEC">Compliance Executive</option>
                <option value="CA_CS_LEAD">Senior CA / CS Lead</option>
                <option value="OPS_MANAGER">Operations Manager</option>
                <option value="FINANCE_MANAGER">Finance Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <button type="submit" disabled={busy} className="w-full bg-[#073B5C] text-[#F4B942] font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow disabled:opacity-50">
                {busy ? 'Creating...' : 'Create Account →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Reject Document & Flag Note</h3>
              <button onClick={() => setShowRejectModal(null)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleDocRejectSubmit} className="space-y-3 text-xs">
              <textarea required minLength={5} rows={3} value={rejectionReasonInput} onChange={(e) => setRejectionReasonInput(e.target.value)} placeholder="Reason for rejection (sent to customer)..." className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"></textarea>
              <button type="submit" disabled={busy} className="w-full bg-rose-600 text-white font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow disabled:opacity-50">
                {busy ? 'Submitting...' : 'Reject & Flag Note →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
