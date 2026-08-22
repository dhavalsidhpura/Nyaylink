'use client';

import { useState } from 'react';
import Link from 'next/link';

// Hydration-safe INR formatter
function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(amount);
}

type UserRole = 'SUPER_ADMIN' | 'OPS_MANAGER' | 'CA_CS_LEAD' | 'FINANCE_MANAGER';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization: string;
  activeCases: number;
  maxCapacity: number;
  status: 'ACTIVE' | 'ON_LEAVE';
}

interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  source: string;
  type: string;
  date: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'DISQUALIFIED';
  assignedTo: string;
}

interface ServiceCatalogItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  startingPrice: number;
  govtFeeNote: string;
  sla: string;
  sacCode: string;
  status: 'ACTIVE' | 'DRAFT';
}

interface LedgerEntry {
  id: string;
  txnNo: string;
  date: string;
  type: 'CLIENT_PAYMENT' | 'GOVT_FEES_DEBIT' | 'CA_PAYOUT' | 'REFUND';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  mode: 'RAZORPAY' | 'BANK_TRANSFER' | 'STAMP_PORTAL';
}

interface GSTInvoiceRecord {
  id: string;
  invoiceNo: string;
  clientName: string;
  clientGSTIN: string;
  date: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  sacCode: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  srn: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  amount: number;
  govtFee: number;
  date: string;
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'QUERY_RAISED' | 'APPROVED';
  assignedCA: string;
  assignedExec: string;
  slaDaysRemaining: number;
}

interface DocReviewItem {
  id: string;
  clientName: string;
  entityName: string;
  docName: string;
  docCategory: string;
  uploadDate: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export default function MasterAdminWorkspace() {
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'crm' | 'orders' | 'docs' | 'catalog' | 'tax_gst' | 'ledger' | 'team'
  >('overview');

  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals Controls
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // 1. Staff Team & RBAC State
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: 'TM-1',
      name: 'CA Rajiv Sharma',
      email: 'rajiv.sharma@nyayalink.com',
      role: 'CA_CS_LEAD',
      specialization: 'MCA V3 & Corporate Tax',
      activeCases: 12,
      maxCapacity: 15,
      status: 'ACTIVE',
    },
    {
      id: 'TM-2',
      name: 'CS Neha Verma',
      email: 'neha.verma@nyayalink.com',
      role: 'CA_CS_LEAD',
      specialization: 'LLP & Trademark Rights',
      activeCases: 8,
      maxCapacity: 15,
      status: 'ACTIVE',
    },
    {
      id: 'TM-3',
      name: 'Amit Kulkarni',
      email: 'amit.kulkarni@nyayalink.com',
      role: 'COMPLIANCE_EXEC',
      specialization: 'SPICe+ & GST Verification',
      activeCases: 10,
      maxCapacity: 12,
      status: 'ACTIVE',
    },
  ]);

  // 2. Lead CRM State
  const [leads, setLeads] = useState<LeadItem[]>([
    {
      id: 'LD-101',
      fullName: 'Vikram Mehta',
      phone: '+91 9820011223',
      email: 'vikram@horizon.io',
      source: 'Hero Consultation Form',
      type: 'Pvt Ltd Company',
      date: 'Today, 10:15 AM',
      status: 'NEW',
      assignedTo: 'Unassigned',
    },
    {
      id: 'LD-102',
      fullName: 'Ananya Roy',
      phone: '+91 9930044556',
      email: 'ananya@designstudio.in',
      source: 'Free Compliance Check',
      type: 'GSTIN Audit',
      date: 'Yesterday',
      status: 'CONTACTED',
      assignedTo: 'Amit Kulkarni',
    },
  ]);

  // 3. Service Catalog & Rates State
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([
    {
      id: 'srv-1',
      slug: 'private-limited-company',
      title: 'Private Limited Company Registration',
      category: 'Company Registration',
      startingPrice: 6999,
      govtFeeNote: '₹0 MCA Fee (Capital ≤ ₹15L) + Stamp Duty',
      sla: '7 - 12 Working Days',
      sacCode: '998221',
      status: 'ACTIVE',
    },
    {
      id: 'srv-2',
      slug: 'gst-registration',
      title: 'Online GST Registration',
      category: 'GST & Income Tax',
      startingPrice: 1499,
      govtFeeNote: '₹0 Official Portal Fee',
      sla: '3 - 7 Working Days',
      sacCode: '998231',
      status: 'ACTIVE',
    },
    {
      id: 'srv-3',
      slug: 'trademark-registration',
      title: 'Online Trademark Registration',
      category: 'Trademark & IPR',
      startingPrice: 1999,
      govtFeeNote: '₹4,500 MSME / Individual Govt Fee',
      sla: '1 - 2 Days Filing',
      sacCode: '998399',
      status: 'ACTIVE',
    },
  ]);

  // 4. Financial Ledger State
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    {
      id: 'L-101',
      txnNo: 'TXN-2026-8801',
      date: '11 Aug 2026',
      type: 'CLIENT_PAYMENT',
      description: 'Pvt Ltd Setup Fee - Dhaval Sidhpura',
      debit: 0,
      credit: 6999,
      balance: 145000,
      mode: 'RAZORPAY',
    },
    {
      id: 'L-102',
      txnNo: 'TXN-2026-8802',
      date: '11 Aug 2026',
      type: 'GOVT_FEES_DEBIT',
      description: 'MAHARASHTRA Stamp Duty Disbursal (SPICe+)',
      debit: 1131,
      credit: 0,
      balance: 143869,
      mode: 'STAMP_PORTAL',
    },
  ]);

  // 5. GST Invoices State
  const [gstInvoices] = useState<GSTInvoiceRecord[]>([
    {
      id: 'INV-01',
      invoiceNo: 'NYA/2026/0491',
      clientName: 'Mobizspare Technologies Pvt Ltd',
      clientGSTIN: '27AABCU9603R1ZM',
      date: '01 Aug 2026',
      taxableAmount: 5931.36,
      cgst: 533.82,
      sgst: 533.82,
      igst: 0,
      totalAmount: 6999,
      sacCode: '998221',
    },
  ]);

  // 6. Orders State
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
      govtFee: 1131,
      date: '11 Aug 2026',
      status: 'QUERY_RAISED',
      assignedCA: 'CA Rajiv Sharma',
      assignedExec: 'Amit Kulkarni',
      slaDaysRemaining: 4,
    },
  ]);

  // 7. Document Queue State
  const [docQueue, setDocQueue] = useState<DocReviewItem[]>([
    {
      id: 'DQ-1',
      clientName: 'Dhaval Sidhpura',
      entityName: 'Mobizspare Technologies Pvt Ltd',
      docName: 'Landlord_Utility_Bill_Aug2026.pdf',
      docCategory: 'Office Premises Proof',
      uploadDate: 'Today, 08:30 AM',
      status: 'PENDING_REVIEW',
    },
  ]);

  // Form Field States
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('COMPLIANCE_EXEC');

  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvSlug, setNewSrvSlug] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Company Registration');
  const [newSrvPrice, setNewSrvPrice] = useState(1999);
  const [newSrvGovtNote, setNewSrvGovtNote] = useState('');
  const [newSrvSLA, setNewSrvSLA] = useState('3 - 5 Days');
  const [newSrvSAC, setNewSrvSAC] = useState('998221');

  const [newLedgerType, setNewLedgerType] = useState<LedgerEntry['type']>('CLIENT_PAYMENT');
  const [newLedgerDesc, setNewLedgerDesc] = useState('');
  const [newLedgerAmount, setNewLedgerAmount] = useState(0);
  const [newLedgerMode, setNewLedgerMode] = useState<LedgerEntry['mode']>('RAZORPAY');

  // Calculations
  const totalTaxable = gstInvoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  const totalCGST = gstInvoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSGST = gstInvoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalGSTLiability = totalCGST + totalSGST;

  // Handlers
  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: `TM-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      specialization: 'General Compliance',
      activeCases: 0,
      maxCapacity: 12,
      status: 'ACTIVE',
    };
    setTeam([...team, newMember]);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffEmail('');
    alert(`Staff member ${newStaffName} onboarded successfully!`);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const newServiceItem: ServiceCatalogItem = {
      id: `srv-${Date.now()}`,
      slug: newSrvSlug || newSrvTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: newSrvTitle,
      category: newSrvCategory,
      startingPrice: Number(newSrvPrice),
      govtFeeNote: newSrvGovtNote || 'Official fees extra',
      sla: newSrvSLA,
      sacCode: newSrvSAC,
      status: 'ACTIVE',
    };
    setCatalog([...catalog, newServiceItem]);
    setShowAddServiceModal(false);
    setNewSrvTitle('');
    alert(`Service "${newSrvTitle}" added to live catalog!`);
  };

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setCatalog(catalog.map((s) => (s.id === editingService.id ? editingService : s)));
    setEditingService(null);
    alert(`Updated rate for ${editingService.title}`);
  };

  const handleAddLedgerTxn = (e: React.FormEvent) => {
    e.preventDefault();
    const isCredit = newLedgerType === 'CLIENT_PAYMENT';
    const lastBal = ledger[0]?.balance || 100000;
    const newBal = isCredit ? lastBal + Number(newLedgerAmount) : lastBal - Number(newLedgerAmount);

    const newTxn: LedgerEntry = {
      id: `L-${Date.now()}`,
      txnNo: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Today',
      type: newLedgerType,
      description: newLedgerDesc,
      debit: isCredit ? 0 : Number(newLedgerAmount),
      credit: isCredit ? Number(newLedgerAmount) : 0,
      balance: newBal,
      mode: newLedgerMode,
    };
    setLedger([newTxn, ...ledger]);
    setShowAddLedgerModal(false);
    setNewLedgerDesc('');
    setNewLedgerAmount(0);
    alert('Ledger transaction recorded!');
  };

  const handleOrderStatusChange = (orderId: string, newStatus: OrderItem['status']) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const handleDocApprove = (id: string) => {
    setDocQueue(docQueue.map((d) => (d.id === id ? { ...d, status: 'VERIFIED' } : d)));
  };

  const handleDocRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    setDocQueue(
      docQueue.map((d) =>
        d.id === showRejectModal
          ? { ...d, status: 'REJECTED', rejectionReason: rejectionReasonInput }
          : d
      )
    );
    setShowRejectModal(null);
    setRejectionReasonInput('');
    alert('Document rejected and flagged to customer dashboard.');
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.srn.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* 1. TOP EXECUTIVE HEADER */}
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-cyan-200 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>11 Aug 2026 • Live Sync</span>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1 flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="SUPER_ADMIN" className="bg-slate-900">🔑 Super Admin / Founder</option>
                <option value="OPS_MANAGER" className="bg-slate-900">📊 Operations Manager</option>
                <option value="FINANCE_MANAGER" className="bg-slate-900">💼 Finance Lead</option>
                <option value="CA_CS_LEAD" className="bg-slate-900">👨‍💼 Senior CA / CS Lead</option>
              </select>
            </div>

            <Link href="/" className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[#F4B942] font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm">
              Exit to Site →
            </Link>
          </div>
        </div>
      </header>

      {/* 2. USER-FRIENDLY TAB NAVIGATION (NO VISUAL SCROLLBAR CLUTTER) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[53px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>📊</span> Executive Overview
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'crm'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>📥</span> Lead CRM
              <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                {leads.filter((l) => l.status === 'NEW').length} New
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>📋</span> Order Pipeline
              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'docs'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>🔒</span> Document Review
              <span className="bg-cyan-100 text-[#0E7490] text-[10px] px-2 py-0.5 rounded-full font-black">
                {docQueue.filter((d) => d.status === 'PENDING_REVIEW').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>🏷️</span> Service Catalog ({catalog.length})
            </button>

            <button
              onClick={() => setActiveTab('tax_gst')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'tax_gst'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>🏛️</span> Tax & GST Engine
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>📒</span> Financial Ledger
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'team'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#073B5C]'
              }`}
            >
              <span>👥</span> Staff Roster
            </button>

          </nav>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow space-y-6">
        
        {/* ================================================================= */}
        {/* EXECUTIVE OVERVIEW TAB */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-[#0E7490] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Bank Cash Ledger
                  </span>
                  <span className="text-xl">💰</span>
                </div>
                <strong suppressHydrationWarning className="text-2xl font-black text-[#073B5C] block">
                  ₹{formatINR(ledger[0]?.balance || 0)}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                  <span>🟢</span> Live Working Balance
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-[#0E7490] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
                    GST Output Tax
                  </span>
                  <span className="text-xl">🏛️</span>
                </div>
                <strong suppressHydrationWarning className="text-2xl font-black text-[#0E7490] block">
                  ₹{formatINR(totalGSTLiability)}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium block">
                  18% GST Liability (CGST + SGST)
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-[#0E7490] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wider">
                    ROC Resubmissions
                  </span>
                  <span className="text-xl">⚠️</span>
                </div>
                <strong className="text-2xl font-black text-amber-600 block">
                  {orders.filter((o) => o.status === 'QUERY_RAISED').length} Pending
                </strong>
                <span className="text-[10px] text-amber-700 font-semibold block">
                  Action required from customer
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-[#0E7490] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-emerald-800 font-extrabold uppercase tracking-wider">
                    Unassigned Leads
                  </span>
                  <span className="text-xl">📥</span>
                </div>
                <strong className="text-2xl font-black text-emerald-600 block">
                  {leads.filter((l) => l.status === 'NEW').length} New Lead
                </strong>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  Awaiting CA callback assignment
                </span>
              </div>
            </div>

            {/* Quick Action Shortcuts & Operational Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Quick Action Bar & Pipeline Stream */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Executive Quick Actions */}
                <div className="bg-gradient-to-r from-[#073B5C] to-[#0E7490] text-white p-5 rounded-3xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-sm">Executive Operational Shortcuts</h3>
                      <p className="text-[11px] text-slate-300">Quickly post entries, add catalog items, or review docs.</p>
                    </div>
                    <span className="text-xs bg-[#F4B942] text-[#073B5C] font-extrabold px-2.5 py-1 rounded-md uppercase">
                      NyayaLink Ops
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      + Add New Service
                    </button>
                    <button
                      onClick={() => setShowAddLedgerModal(true)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      + Record Ledger Txn
                    </button>
                    <button
                      onClick={() => setShowAddStaffModal(true)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      + Onboard Staff
                    </button>
                    <button
                      onClick={() => setActiveTab('docs')}
                      className="bg-[#F4B942] hover:bg-amber-400 text-[#073B5C] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow"
                    >
                      Audit Uploaded Proofs →
                    </button>
                  </div>
                </div>

                {/* Active Order Stream Widget */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-[#073B5C] text-sm sm:text-base">Active Order Pipeline</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#0E7490] hover:underline">
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-extrabold text-[#073B5C]">{o.orderNumber}</strong>
                            <span className="text-[10px] bg-cyan-100 text-[#0E7490] font-mono px-2 py-0.5 rounded font-bold">
                              {o.srn}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-800 block">{o.serviceTitle}</span>
                          <span className="text-[11px] text-slate-500 block">Client: {o.clientName} | CA: {o.assignedCA}</span>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <span suppressHydrationWarning className="text-xs font-black text-[#073B5C]">
                            ₹{formatINR(o.amount)}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded-full uppercase">
                            {o.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Capacity & Inbound CRM Stream */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Staff Capacity Gauge Widget */}
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
                            {m.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Cases: {m.activeCases} / {m.maxCapacity}</span>
                          <span>{Math.round((m.activeCases / m.maxCapacity) * 100)}% Load</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${(m.activeCases / m.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fresh Inbound Leads Widget */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-[#073B5C] text-sm">Recent Inbound Requests</h3>
                    <button onClick={() => setActiveTab('crm')} className="text-xs font-bold text-[#0E7490] hover:underline">
                      Open CRM →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {leads.map((l) => (
                      <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="font-bold text-[#073B5C]">{l.fullName}</strong>
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
                            {l.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">📞 {l.phone}</p>
                        <span className="text-[10px] text-[#0E7490] font-bold block">{l.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* CRM TAB */}
        {/* ================================================================= */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Inbound Lead CRM & Assignment Desk</h2>
                <p className="text-xs text-slate-500">Route website consultation leads to Support Desk agents or CAs.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Lead Ref</th>
                      <th className="p-4">Applicant Name</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Inquiry Category</th>
                      <th className="p-4">Assigned Agent</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#073B5C]">{l.id}</td>
                        <td className="p-4 font-extrabold text-slate-900">{l.fullName}</td>
                        <td className="p-4">
                          <span className="block font-bold text-slate-800">{l.phone}</span>
                          <span className="text-slate-400 text-[11px]">{l.email}</span>
                        </td>
                        <td className="p-4 font-bold text-[#0E7490]">{l.type}</td>
                        <td className="p-4 font-bold text-slate-700">{l.assignedTo}</td>
                        <td className="p-4">
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-full uppercase">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CATALOG TAB */}
        {/* ================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Service Catalog & Rate Management</h2>
                <p className="text-xs text-slate-500">Configure prices, government fee notices, SAC codes, and add new services to the live portal.</p>
              </div>

              <button
                onClick={() => setShowAddServiceModal(true)}
                className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                + Add New Service Offering
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Service Title</th>
                      <th className="p-4">SAC Code</th>
                      <th className="p-4">Base Professional Rate</th>
                      <th className="p-4">SLA Time</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {catalog.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#073B5C]">
                          <div>{srv.title}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{srv.slug}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#0E7490]">{srv.sacCode}</td>
                        <td suppressHydrationWarning className="p-4 font-extrabold text-emerald-700 text-sm">
                          ₹{formatINR(srv.startingPrice)}
                        </td>
                        <td className="p-4 text-slate-600">{srv.sla}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setEditingService(srv)}
                            className="bg-slate-100 hover:bg-[#073B5C] hover:text-white text-[#073B5C] font-bold px-3 py-1.5 rounded-lg transition-colors text-[11px] cursor-pointer"
                          >
                            Edit Rate ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAX & GST TAB */}
        {/* ================================================================= */}
        {activeTab === 'tax_gst' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-[#073B5C]">GST Management & Tax Invoicing Engine</h2>
              <p className="text-xs text-slate-500">Calculate CGST, SGST, IGST liabilities and manage SAC codes for GSTR-1 returns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CGST Collected (9%)</span>
                <strong suppressHydrationWarning className="text-xl font-extrabold text-[#073B5C]">
                  ₹{formatINR(totalCGST)}
                </strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">SGST Collected (9%)</span>
                <strong suppressHydrationWarning className="text-xl font-extrabold text-[#073B5C]">
                  ₹{formatINR(totalSGST)}
                </strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Output GST Liability</span>
                <strong suppressHydrationWarning className="text-xl font-extrabold text-emerald-600">
                  ₹{formatINR(totalGSTLiability)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* LEDGER TAB */}
        {/* ================================================================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Double-Entry Financial Ledger</h2>
                <p className="text-xs text-slate-500">Track client payments, government stamp duty debits, and CA payout disbursements.</p>
              </div>

              <button
                onClick={() => setShowAddLedgerModal(true)}
                className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
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
                      <th className="p-4">Debit (Out)</th>
                      <th className="p-4">Credit (In)</th>
                      <th className="p-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {ledger.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#073B5C]">{e.txnNo}</td>
                        <td className="p-4 text-slate-800 font-bold">{e.description}</td>
                        <td suppressHydrationWarning className="p-4 font-bold text-rose-600">
                          {e.debit > 0 ? `- ₹${formatINR(e.debit)}` : '—'}
                        </td>
                        <td suppressHydrationWarning className="p-4 font-bold text-emerald-600">
                          {e.credit > 0 ? `+ ₹${formatINR(e.credit)}` : '—'}
                        </td>
                        <td suppressHydrationWarning className="p-4 font-extrabold text-[#073B5C] text-right">
                          ₹{formatINR(e.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ORDERS TAB */}
        {/* ================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <input
                type="text"
                placeholder="Search Client Name, Order ID, or SRN..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full sm:w-80 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />

              <div className="flex items-center gap-2 text-xs font-medium w-full sm:w-auto justify-end">
                <span className="text-slate-500 font-bold">Status Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#073B5C] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="QUERY_RAISED">QUERY_RAISED</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Order / SRN</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Service Required</th>
                      <th className="p-4">Fee Charged</th>
                      <th className="p-4">Assigned CA</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#073B5C]">{o.orderNumber} ({o.srn})</td>
                        <td className="p-4 font-bold">{o.clientName}</td>
                        <td className="p-4">{o.serviceTitle}</td>
                        <td suppressHydrationWarning className="p-4 font-extrabold text-emerald-700">
                          ₹{formatINR(o.amount)}
                        </td>
                        <td className="p-4 font-bold text-[#0E7490]">{o.assignedCA}</td>
                        <td className="p-4 font-bold uppercase text-amber-800">{o.status}</td>
                        <td className="p-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderItem['status'])}
                            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-[#073B5C] cursor-pointer"
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="QUERY_RAISED">QUERY_RAISED</option>
                            <option value="APPROVED">APPROVED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* DOCUMENTS TAB */}
        {/* ================================================================= */}
        {activeTab === 'docs' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-3">
              {docQueue.map((d) => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div>
                    <strong className="text-[#073B5C] font-bold text-sm block">{d.docName}</strong>
                    <span className="text-xs text-slate-500">Client: {d.clientName} ({d.entityName})</span>
                  </div>
                  <div className="flex gap-2">
                    {d.status === 'PENDING_REVIEW' ? (
                      <>
                        <button onClick={() => handleDocApprove(d.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer">
                          ✓ Approve Document
                        </button>
                        <button onClick={() => setShowRejectModal(d.id)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer">
                          ✕ Reject & Flag Note
                        </button>
                      </>
                    ) : (
                      <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-200">
                        {d.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TEAM ROSTER TAB */}
        {/* ================================================================= */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Staff Roster & Access Controls</h2>
                <p className="text-xs text-slate-500">Manage internal team assignments and case loads.</p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
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
                      <th className="p-4">Specialization</th>
                      <th className="p-4">Active Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {team.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{m.name} ({m.email})</td>
                        <td className="p-4 font-bold text-[#0E7490]">{m.role.replace('_', ' ')}</td>
                        <td className="p-4 text-slate-600 font-medium">{m.specialization}</td>
                        <td className="p-4 font-extrabold text-[#073B5C]">{m.activeCases} / {m.maxCapacity} Cases</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Add New Service</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newSrvTitle}
                onChange={(e) => setNewSrvTitle(e.target.value)}
                placeholder="Service Title"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <input
                type="number"
                required
                value={newSrvPrice}
                onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                placeholder="Starting Rate (₹)"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <button type="submit" className="w-full bg-[#073B5C] text-[#F4B942] font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow">
                Publish Service →
              </button>
            </form>
          </div>
        </div>
      )}

      {editingService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Edit Rate: {editingService.title}</h3>
              <button onClick={() => setEditingService(null)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-3 text-xs">
              <input
                type="number"
                required
                value={editingService.startingPrice}
                onChange={(e) => setEditingService({ ...editingService, startingPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold text-sm"
              />
              <button type="submit" className="w-full bg-[#0E7490] text-white font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow">
                Save Rate Modifications →
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddLedgerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Record Ledger Transaction</h3>
              <button onClick={() => setShowAddLedgerModal(false)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddLedgerTxn} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newLedgerDesc}
                onChange={(e) => setNewLedgerDesc(e.target.value)}
                placeholder="Transaction Description"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <input
                type="number"
                required
                value={newLedgerAmount}
                onChange={(e) => setNewLedgerAmount(Number(e.target.value))}
                placeholder="Amount (₹)"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <button type="submit" className="w-full bg-[#073B5C] text-[#F4B942] font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow">
                Post Transaction →
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
              <input
                type="text"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <button type="submit" className="w-full bg-[#073B5C] text-[#F4B942] font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow">
                Create Account →
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
              <textarea
                required
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Reason for rejection (sent to customer)..."
                className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              ></textarea>
              <button type="submit" className="w-full bg-rose-600 text-white font-extrabold py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow">
                Reject & Flag Note →
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}