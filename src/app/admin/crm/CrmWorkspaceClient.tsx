'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Role, LeadStatus } from '@prisma/client';
import type { CrmData } from './page';

type Props = CrmData & {
  currentRole: Role;
  currentUserId: string;
};

const STATUS_COLUMNS: { key: LeadStatus; label: string; badgeColor: string; bgLight: string }[] = [
  { key: 'NEW', label: '1. New Inbound Leads', badgeColor: 'bg-emerald-500 text-white', bgLight: 'bg-emerald-50/50 border-emerald-200' },
  { key: 'CONTACTED', label: '2. Attempting Contact / Calling', badgeColor: 'bg-amber-500 text-white', bgLight: 'bg-amber-50/50 border-amber-200' },
  { key: 'CONVERTED', label: '3. Won (Paid ₹999 Token)', badgeColor: 'bg-cyan-600 text-white', bgLight: 'bg-cyan-50/50 border-cyan-200' },
  { key: 'DISQUALIFIED', label: '4. Disqualified / Inactive', badgeColor: 'bg-slate-400 text-white', bgLight: 'bg-slate-50/50 border-slate-200' },
];

function formatTimeAgo(isoString: string | Date): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CrmWorkspaceClient({ leads, staffMembers, services, currentRole, currentUserId }: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('ALL');
  const [unmaskPhones, setUnmaskPhones] = useState(currentRole === 'SUPER_ADMIN');
  const [busy, setBusy] = useState(false);

  // Modals state
  const [selectedLeadForPayment, setSelectedLeadForPayment] = useState<any | null>(null);
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<any | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Payment Link modal form
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(services[0]?.slug || 'private-limited-company');
  const [selectedState, setSelectedState] = useState('MH');
  const [tokenAmount, setTokenAmount] = useState(999);
  const [generatedLinkData, setGeneratedLinkData] = useState<{ checkoutUrl: string; whatsappScript: string; quote: any } | null>(null);

  // New Lead form
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadService, setNewLeadService] = useState('Private Limited Company');
  const [newLeadSource, setNewLeadSource] = useState('Phone Call Inbound');

  const canSuperAdmin = currentRole === 'SUPER_ADMIN';

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.complianceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStaff =
      selectedStaffFilter === 'ALL'
        ? true
        : selectedStaffFilter === 'UNASSIGNED'
        ? !l.assignedToId
        : l.assignedToId === selectedStaffFilter;

    return matchesSearch && matchesStaff;
  });

  const countNew = leads.filter((l) => l.status === 'NEW').length;
  const countContacted = leads.filter((l) => l.status === 'CONTACTED').length;
  const countConverted = leads.filter((l) => l.status === 'CONVERTED').length;
  const conversionRate = leads.length > 0 ? ((countConverted / leads.length) * 100).toFixed(1) : '0';

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    setBusy(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to update lead status');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleAssignLead = async (leadId: string, assignedToId: string | null) => {
    setBusy(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, assignedToId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to assign lead');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForPayment) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/crm/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadForPayment.id,
          serviceSlug: selectedServiceSlug,
          clientState: selectedState,
          tokenAmount,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to generate payment link');
        return;
      }
      setGeneratedLinkData(data);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleAddNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail || undefined,
          complianceType: newLeadService,
          source: newLeadSource,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to create lead');
        return;
      }
      setShowAddLeadModal(false);
      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const maskPhone = (phone: string) => {
    if (unmaskPhones) return phone;
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 10) {
      return `+91 ${clean.slice(0, 5)}XXXXX`;
    }
    return phone.slice(0, 4) + 'XXXX';
  };

  const openWhatsAppDirect = (lead: any, templateType: 'quote' | 'token' | 'kyc') => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const firstName = lead.fullName.split(' ')[0] || lead.fullName;

    let text = '';
    if (templateType === 'quote') {
      text = `Namaste ${firstName} ji! 🙏 Greetings from NyayaLink Legal Operations. We received your request regarding *${lead.complianceType}*. Our senior compliance desk is ready to prepare your documentation and file with MCA/GSTN. Would you like a 5-minute call to discuss your state stamp duty & timeline?`;
    } else if (templateType === 'token') {
      text = `Namaste ${firstName} ji! 🙏 To begin your *${lead.complianceType}* filing today and lock your assigned CA/CS lead, you can pay the advance token of *₹999* here: https://nyayalink.vercel.app/services/private-limited-company?advance=true. Let us know once completed so we can initiate your DSC tokens!`;
    } else {
      text = `Namaste ${firstName} ji! 🙏 This is NyayaLink Compliance desk. To expedite your filing, please upload your Aadhaar (front & back), PAN card, and a recent electricity bill (< 60 days old) to your private portal vault. Let us know if you need assistance!`;
    }

    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`, '_blank');
  };

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
              Inbound Sales &amp; Telecalling CRM
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
              onClick={() => setShowAddLeadModal(true)}
              className="bg-[#0E7490] hover:bg-cyan-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Add Walk-in Lead
            </button>
          </div>
        </div>
      </header>

      {/* Subnav & Cross-Department Switcher */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 sticky top-[53px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Workspaces:</span>
            <span className="bg-[#073B5C] text-[#F4B942] font-black px-3 py-1 rounded-lg">💼 Sales CRM</span>
            <Link href="/admin/orders" className="text-slate-600 hover:text-[#073B5C] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition">
              📋 CA Operations Desk
            </Link>
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

          <div className="flex items-center gap-3">
            {canSuperAdmin && (
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer select-none bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={unmaskPhones}
                  onChange={(e) => setUnmaskPhones(e.target.checked)}
                  className="rounded text-[#0E7490] focus:ring-0 cursor-pointer"
                />
                <span>DLP: Unmask Full Phone Numbers</span>
              </label>
            )}
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-[#073B5C] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#073B5C] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Pipeline</span>
            <strong className="text-2xl font-black text-[#073B5C]">{leads.length}</strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">New Inbound</span>
            <strong className="text-2xl font-black text-emerald-600">{countNew}</strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">In Calling Follow-up</span>
            <strong className="text-2xl font-black text-amber-600">{countContacted}</strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-cyan-200 bg-cyan-50/20 shadow-xs space-y-1">
            <span className="text-[10px] text-cyan-800 font-extrabold uppercase tracking-wider block">Won (₹999 Token)</span>
            <strong className="text-2xl font-black text-[#0E7490]">{countConverted}</strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider block">Token Win Rate</span>
            <strong className="text-2xl font-black text-purple-700">{conversionRate}%</strong>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search leads by client name, phone number, service, or email..."
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500 whitespace-nowrap">Assigned Rep:</span>
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#073B5C] focus:outline-none"
            >
              <option value="ALL">All Representatives</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {staffMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {STATUS_COLUMNS.map((col) => {
              const columnLeads = filteredLeads.filter((l) => l.status === col.key);

              return (
                <div key={col.key} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 space-y-3 flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-extrabold text-xs text-[#073B5C]">{col.label}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnLeads.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium text-center p-4">
                        No leads in this stage
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-sm font-extrabold text-[#073B5C] block">{lead.fullName}</strong>
                              <span className="text-[11px] font-bold text-[#0E7490] block">{lead.complianceType}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                              {formatTimeAgo(lead.createdAt)}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Phone:</span>
                              <span className="font-mono font-bold text-slate-800">{maskPhone(lead.phone)}</span>
                            </div>
                            {lead.email && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-medium">Email:</span>
                                <span className="font-medium text-slate-700 truncate max-w-[140px]">{lead.email}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className="text-slate-400">Source:</span>
                              <span className="text-slate-600 font-semibold">{lead.source}</span>
                            </div>
                          </div>

                          {/* Representative Assignment */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-slate-400 font-semibold text-[10px]">Rep:</span>
                            <select
                              value={lead.assignedToId || ''}
                              disabled={busy}
                              onChange={(e) => handleAssignLead(lead.id, e.target.value || null)}
                              className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none"
                            >
                              <option value="">Unassigned</option>
                              {staffMembers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Telecaller Action Buttons */}
                          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
                            <button
                              onClick={() => setSelectedLeadForCall(lead)}
                              title="Click-to-Call & Log Outcome"
                              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[10px] py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>📞</span> Call
                            </button>
                            <button
                              onClick={() => setSelectedLeadForWhatsApp(lead)}
                              title="Official WhatsApp Quick Scripts"
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>💬</span> Script
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeadForPayment(lead);
                                setGeneratedLinkData(null);
                              }}
                              title="1-Click ₹999 Payment Link Generator"
                              className="bg-cyan-50 hover:bg-cyan-100 text-[#0E7490] font-black text-[10px] py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>⚡</span> ₹999 Link
                            </button>
                          </div>

                          {/* Stage Transition Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-1">
                            {col.key !== 'NEW' && (
                              <button
                                disabled={busy}
                                onClick={() => handleUpdateStatus(lead.id, col.key === 'DISQUALIFIED' ? 'CONTACTED' : col.key === 'CONVERTED' ? 'CONTACTED' : 'NEW')}
                                className="text-[10px] text-slate-500 hover:text-slate-800 font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 transition cursor-pointer"
                              >
                                ← Prev
                              </button>
                            )}
                            <div className="flex-1" />
                            {col.key === 'NEW' && (
                              <button
                                disabled={busy}
                                onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-md transition cursor-pointer"
                              >
                                Call Started →
                              </button>
                            )}
                            {col.key === 'CONTACTED' && (
                              <button
                                disabled={busy}
                                onClick={() => handleUpdateStatus(lead.id, 'CONVERTED')}
                                className="text-[10px] bg-cyan-100 hover:bg-cyan-200 text-[#073B5C] font-black px-2 py-0.5 rounded-md transition cursor-pointer"
                              >
                                Won (₹999 Paid) →
                              </button>
                            )}
                            {col.key !== 'DISQUALIFIED' && col.key !== 'CONVERTED' && (
                              <button
                                disabled={busy}
                                onClick={() => handleUpdateStatus(lead.id, 'DISQUALIFIED')}
                                className="text-[10px] text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Mark Junk / Disqualified"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabular View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Applicant Name</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Filing Intent</th>
                    <th className="p-4">Lead Source</th>
                    <th className="p-4">Assigned Telecaller</th>
                    <th className="p-4">Pipeline Stage</th>
                    <th className="p-4 text-right">Instant Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No leads match this search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <strong className="text-slate-900 font-extrabold block">{lead.fullName}</strong>
                          <span className="text-[10px] text-slate-400">{formatTimeAgo(lead.createdAt)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-slate-800 block">{maskPhone(lead.phone)}</span>
                          <span className="text-slate-500 text-[11px]">{lead.email || '—'}</span>
                        </td>
                        <td className="p-4 font-bold text-[#0E7490]">{lead.complianceType}</td>
                        <td className="p-4 text-slate-600 font-medium">{lead.source}</td>
                        <td className="p-4">
                          <select
                            value={lead.assignedToId || ''}
                            disabled={busy}
                            onChange={(e) => handleAssignLead(lead.id, e.target.value || null)}
                            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {staffMembers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            disabled={busy}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                            className="text-[10px] font-black uppercase px-2 py-1 rounded-full border border-slate-200 bg-white"
                          >
                            <option value="NEW">1. New Inbound</option>
                            <option value="CONTACTED">2. Attempting Contact</option>
                            <option value="CONVERTED">3. Won (Paid Token)</option>
                            <option value="DISQUALIFIED">4. Disqualified</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLeadForCall(lead)}
                              className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                            >
                              📞 Call
                            </button>
                            <button
                              onClick={() => setSelectedLeadForWhatsApp(lead)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                            >
                              💬 WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeadForPayment(lead);
                                setGeneratedLinkData(null);
                              }}
                              className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[10px] px-3 py-1.5 rounded-lg transition shadow-xs"
                            >
                              ⚡ ₹999 Link
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Click-to-Call & Outcome Disposition */}
      {selectedLeadForCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
                  Telephony &amp; Calling Desk
                </span>
                <h3 className="font-extrabold text-[#073B5C] text-base">{selectedLeadForCall.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedLeadForCall(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Inquiry:</span>
                <strong className="text-[#073B5C]">{selectedLeadForCall.complianceType}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phone Number:</span>
                <strong className="font-mono text-sm text-slate-800">
                  {unmaskPhones ? selectedLeadForCall.phone : maskPhone(selectedLeadForCall.phone)}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${selectedLeadForCall.phone.replace(/\D/g, '')}`}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow"
              >
                <span>📞</span> Click to Dial Customer on Mobile / Softphone
              </a>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-extrabold text-slate-600 block">Log Call Disposition &amp; Advance Stage:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedLeadForCall.id, 'CONTACTED');
                    setSelectedLeadForCall(null);
                  }}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-left transition cursor-pointer"
                >
                  ⏳ Connected (Follow-up Scheduled)
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedLeadForCall.id, 'CONVERTED');
                    setSelectedLeadForCall(null);
                  }}
                  className="p-2.5 rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-[#073B5C] font-extrabold text-left transition cursor-pointer"
                >
                  🎯 Interested (Won ₹999 Token)
                </button>
                <button
                  onClick={() => {
                    setSelectedLeadForCall(null);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-left transition cursor-pointer"
                >
                  📴 Ringing / No Answer
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedLeadForCall.id, 'DISQUALIFIED');
                    setSelectedLeadForCall(null);
                  }}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-left transition cursor-pointer"
                >
                  ✕ Invalid / Not Interested
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Pre-Approved WhatsApp Scripts */}
      {selectedLeadForWhatsApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider block">
                  Official WhatsApp Desk
                </span>
                <h3 className="font-extrabold text-[#073B5C] text-base">{selectedLeadForWhatsApp.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedLeadForWhatsApp(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a pre-approved compliant template to reach the founder directly via WhatsApp:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-[#073B5C]">Template 1: Introduction &amp; Quotation</strong>
                  <button
                    onClick={() => openWhatsAppDirect(selectedLeadForWhatsApp, 'quote')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg transition"
                  >
                    Open in WhatsApp →
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Namaste {selectedLeadForWhatsApp.fullName.split(' ')[0]} ji! Greetings from NyayaLink Legal Operations. We received your request regarding {selectedLeadForWhatsApp.complianceType}...
                </p>
              </div>

              <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-[#073B5C]">Template 2: ₹999 Advance Token Link</strong>
                  <button
                    onClick={() => openWhatsAppDirect(selectedLeadForWhatsApp, 'token')}
                    className="bg-[#0E7490] hover:bg-cyan-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg transition"
                  >
                    Open in WhatsApp →
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Lock your dedicated CA/CS compliance desk and begin name reservation filing today for just ₹999 advance token...
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-[#073B5C]">Template 3: KYC Document Reminder</strong>
                  <button
                    onClick={() => openWhatsAppDirect(selectedLeadForWhatsApp, 'kyc')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg transition"
                  >
                    Open in WhatsApp →
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To expedite your filing, please upload your Aadhaar, PAN card, and recent utility bill (&lt; 60 days old) to your vault...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 1-Click Custom ₹999 Payment Link Generator */}
      {selectedLeadForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
                  Payment Link Generator
                </span>
                <h3 className="font-extrabold text-[#073B5C] text-base">
                  Generate Checkout Link for {selectedLeadForPayment.fullName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedLeadForPayment(null);
                  setGeneratedLinkData(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {!generatedLinkData ? (
              <form onSubmit={handleCreatePaymentLink} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Service Package</label>
                  <select
                    value={selectedServiceSlug}
                    onChange={(e) => setSelectedServiceSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.title} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Incorporation State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="MH">Maharashtra</option>
                      <option value="DL">Delhi</option>
                      <option value="KA">Karnataka</option>
                      <option value="KL">Kerala</option>
                      <option value="TN">Tamil Nadu</option>
                      <option value="TS">Telangana</option>
                      <option value="UP">Uttar Pradesh</option>
                      <option value="GJ">Gujarat</option>
                      <option value="WB">West Bengal</option>
                      <option value="RJ">Rajasthan</option>
                      <option value="HR">Haryana</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Advance Token Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min={99}
                        max={100000}
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-7 pr-3 font-bold text-[#073B5C] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>Pure Agent Rule 33:</strong> The ₹{tokenAmount} token secures the client vault, initiates director DSCs, and prepares Rule 8 name clearance. Balance pass-through stamp duty is billed at SPICe+ Part B stage.
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs py-3 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Generating Link...' : 'Generate 24h Razorpay Checkout Link →'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-800 uppercase">Payment Link Active</span>
                    <span className="text-xs font-extrabold text-emerald-700">₹{tokenAmount} Advance Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLinkData.checkoutUrl}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLinkData.checkoutUrl);
                        alert('Payment Link copied to clipboard!');
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 block">Pre-Formatted WhatsApp Message:</span>
                  <textarea
                    rows={4}
                    readOnly
                    value={generatedLinkData.whatsappScript}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-sans text-slate-700 leading-relaxed"
                  />
                  <button
                    onClick={() => {
                      const cleanPhone = selectedLeadForPayment.phone.replace(/\D/g, '');
                      const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                      window.open(
                        `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(generatedLinkData.whatsappScript)}`,
                        '_blank'
                      );
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <span>💬</span> Forward Directly via Official WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: Add Walk-in Lead */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#073B5C] text-base">Add Inbound / Walk-in Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewLead} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9820012345"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. vikram@startup.in"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Compliance Service</label>
                  <select
                    value={newLeadService}
                    onChange={(e) => setNewLeadService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="LLP Registration">LLP Registration</option>
                    <option value="GST Registration">GST Registration</option>
                    <option value="Trademark Registration">Trademark Registration</option>
                    <option value="FSSAI Food License">FSSAI Food License</option>
                    <option value="Startup India 80-IAC">Startup India 80-IAC</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  >
                    <option value="Phone Call Inbound">Phone Call Inbound</option>
                    <option value="WhatsApp Inbound">WhatsApp Inbound</option>
                    <option value="Calculator Intake">Calculator Intake</option>
                    <option value="Referral Partner">Referral Partner</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black py-3 rounded-xl uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 mt-2"
              >
                {busy ? 'Saving...' : 'Add Lead to Pipeline →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
