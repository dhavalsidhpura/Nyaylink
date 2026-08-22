'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock Data Models
interface FilingOrder {
  id: string;
  srn: string;
  serviceTitle: string;
  category: string;
  currentStep: number;
  totalSteps: number;
  steps: { title: string; status: 'completed' | 'active' | 'pending' }[];
  eta: string;
  assignedCA: string;
  queryPending?: boolean;
  queryNote?: string;
}

interface VaultDocument {
  id: string;
  name: string;
  category: 'Entity' | 'Tax' | 'License' | 'Audit';
  fileSize: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'Verified' | 'Expiring Soon' | 'Action Needed';
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  serviceName: string;
  date: string;
  govtFee: number;
  stampDuty: number;
  profFee: number;
  totalAmount: number;
  status: 'Paid' | 'Pending';
}

interface SupportTicket {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  status: 'Open' | 'Resolved' | 'In Review';
  lastUpdated: string;
  messagesCount: number;
}

export default function ComprehensiveCustomerDashboard() {
  // Navigation & Entity State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'filings' | 'vault' | 'dsc' | 'billing' | 'support' | 'team'
  >('overview');
  const [selectedEntity, setSelectedEntity] = useState('Acme Technologies Pvt Ltd');

  // Interactive Modals & Forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Filings State
  const [filings] = useState<FilingOrder[]>([
    {
      id: '1',
      srn: 'MCA-SPICE-2026-9941',
      serviceTitle: 'Private Limited Company Registration',
      category: 'Company Registration',
      currentStep: 2,
      totalSteps: 4,
      steps: [
        { title: 'Class 3 DSC & Name Booking', status: 'completed' },
        { title: 'SPICe+ Part B & MOA/AOA e-Sign', status: 'active' },
        { title: 'MCA Approval & COI Issuance', status: 'pending' },
        { title: 'Bank Current Account & INC-20A', status: 'pending' },
      ],
      eta: '4 Days Remaining',
      assignedCA: 'CA Rajiv Sharma (Senior Partner)',
      queryPending: true,
      queryNote: 'ROC requested updated Landlord Utility Bill under 2 months old.',
    },
    {
      id: '2',
      srn: 'GST-REG-2026-1102',
      serviceTitle: 'New GSTIN Registration',
      category: 'GST & Income Tax',
      currentStep: 3,
      totalSteps: 3,
      steps: [
        { title: 'TRN Generation & OTP Verification', status: 'completed' },
        { title: 'Aadhaar Biometric Linkage', status: 'completed' },
        { title: 'GSTIN Certificate Issued (REG-06)', status: 'completed' },
      ],
      eta: 'Completed',
      assignedCA: 'CS Neha Verma',
    },
  ]);

  // Document Vault State
  const [documents, setDocuments] = useState<VaultDocument[]>([
    {
      id: 'd1',
      name: 'Certificate_of_Incorporation_COI.pdf',
      category: 'Entity',
      fileSize: '1.2 MB',
      uploadDate: '12 Feb 2026',
      status: 'Verified',
    },
    {
      id: 'd2',
      name: 'GSTIN_Registration_Certificate_REG06.pdf',
      category: 'Tax',
      fileSize: '850 KB',
      uploadDate: '28 Feb 2026',
      status: 'Verified',
    },
    {
      id: 'd3',
      name: 'FSSAI_Food_Safety_License.pdf',
      category: 'License',
      fileSize: '2.1 MB',
      uploadDate: '10 Jan 2025',
      expiryDate: '15 Sep 2026',
      status: 'Expiring Soon',
    },
    {
      id: 'd4',
      name: 'Director_1_PAN_Card.pdf',
      category: 'Entity',
      fileSize: '420 KB',
      uploadDate: '01 Feb 2026',
      status: 'Verified',
    },
  ]);

  // Invoices State
  const [invoices] = useState<InvoiceItem[]>([
    {
      id: 'i1',
      invoiceNo: 'NYA/2026/0491',
      serviceName: 'Private Limited Company Registration',
      date: '01 Mar 2026',
      govtFee: 1000,
      stampDuty: 1000,
      profFee: 4999,
      totalAmount: 6999,
      status: 'Paid',
    },
    {
      id: 'i2',
      invoiceNo: 'NYA/2026/0312',
      serviceName: 'New GSTIN Registration',
      date: '15 Feb 2026',
      govtFee: 0,
      stampDuty: 0,
      profFee: 1499,
      totalAmount: 1499,
      status: 'Paid',
    },
  ]);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't1',
      ticketNo: 'TCK-8821',
      subject: 'Clarification regarding Landlord NOC for Office Proof',
      category: 'Document Filing Query',
      status: 'Open',
      lastUpdated: '10 mins ago',
      messagesCount: 3,
    },
    {
      id: 't2',
      ticketNo: 'TCK-7012',
      subject: 'GSTIN Registration Bank Account Linkage Issue',
      category: 'GST Support',
      status: 'Resolved',
      lastUpdated: '2 days ago',
      messagesCount: 5,
    },
  ]);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Document Filing Query');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: SupportTicket = {
      id: Date.now().toString(),
      ticketNo: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      status: 'Open',
      lastUpdated: 'Just now',
      messagesCount: 1,
    };
    setTickets([newT, ...tickets]);
    setShowTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
    alert('Support Ticket created! Assigned CA will respond within 2-4 hours.');
  };

  const handleSimulatedFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: VaultDocument = {
      id: Date.now().toString(),
      name: 'Uploaded_Statutory_Proof.pdf',
      category: 'Entity',
      fileSize: '1.4 MB',
      uploadDate: 'Today',
      status: 'Verified',
    };
    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    alert('Document uploaded successfully to your 256-Bit Encrypted Vault.');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col antialiased">
      
      {/* 1. TOP DASHBOARD NAVIGATION BAR */}
      <header className="bg-[#073B5C] text-white border-b border-[#0E7490]/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-[#0E7490] text-white font-extrabold text-xl px-3 py-1 rounded-xl font-mono shadow border border-cyan-500/30">
                Nyaya<span className="text-[#F4B942]">Link</span>
              </div>
            </Link>

            {/* Entity Switcher */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">Entity:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="Acme Technologies Pvt Ltd" className="bg-slate-900">🏢 Acme Technologies Pvt Ltd</option>
                <option value="Nexus Digital LLP" className="bg-slate-900">🤝 Nexus Digital LLP</option>
                <option value="Dhaval Sidhpura (Individual)" className="bg-slate-900">👤 Dhaval Sidhpura (Individual)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
              🟢 Live CA Desk Connected
            </span>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow cursor-pointer"
            >
              📞 Schedule CA Call
            </button>

            <Link href="/" className="text-slate-300 hover:text-white text-xs font-semibold underline pl-2">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DASHBOARD WORKSPACE BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* User Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0E7490] text-white font-extrabold text-lg flex items-center justify-center shadow">
                DS
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-[#073B5C] text-sm truncate">Dhaval Sidhpura</h3>
                <span className="text-[11px] text-slate-500 block truncate">dhaval@mobizspare.com</span>
                <span className="text-[10px] text-emerald-700 font-extrabold block mt-0.5">Role: Primary Founder / Director</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Client ID:</span>
              <strong className="text-[#073B5C]">NY-2026-8821</strong>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📊</span> Overview & Health
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">85%</span>
            </button>

            <button
              onClick={() => setActiveTab('filings')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'filings'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📋</span> Active Filings & SRNs
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">1 Pending</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🔒</span> Document Vault
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{documents.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('dsc')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'dsc'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🗝️</span> DSC & Identity Hub
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Valid</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🧾</span> Billing & GST Invoices
              </span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🎧</span> Advisory & Tickets
              </span>
              <span className="text-[10px] bg-cyan-100 text-[#0E7490] font-bold px-2 py-0.5 rounded-full">{tickets.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#073B5C] text-[#F4B942] shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>👥</span> Team & Security
              </span>
            </button>
          </nav>

          {/* Assigned CA Card */}
          <div className="bg-gradient-to-br from-[#073B5C] to-[#0E7490] text-white p-5 rounded-2xl space-y-3 shadow-md">
            <span className="text-[10px] bg-[#F4B942] text-[#073B5C] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Assigned Legal Desk
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-white">CA Rajiv Sharma</h4>
              <span className="text-[11px] text-slate-300 block">Senior Partner — MCA & Corporate Tax</span>
              <span className="text-[10px] text-emerald-300 font-bold block mt-1">📍 Mumbai HQ (Kandivali West)</span>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
            >
              Send Direct Message →
            </button>
          </div>

        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW & COMPLIANCE HEALTH */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Compliance Score Gauge & Quick Actions */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                    <span>🛡️ Corporate Compliance Score: 85 / 100</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#073B5C]">
                    {selectedEntity}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your entity is in <strong className="text-emerald-700">Good Legal Standing</strong>. GSTIN and DIR-3 KYC records are up to date.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-[#0E7490] hover:bg-cyan-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      + Upload Document
                    </button>
                    <Link
                      href="/#catalog-section"
                      className="bg-[#073B5C] hover:bg-slate-800 text-[#F4B942] text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Apply New Service →
                    </Link>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Statutory Audit Standing</span>
                  <div className="text-4xl font-extrabold text-emerald-600">85%</div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">Next Mandatory Filing: DIR-3 KYC (Due Sept 30)</span>
                </div>
              </div>

              {/* Statutory Calendar & Upcoming Deadlines */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-[#073B5C] text-base">Upcoming Statutory Compliance Calendar</h3>
                    <p className="text-xs text-slate-500">Automated deadline tracking for MCA, GST, and Income Tax.</p>
                  </div>
                  <span className="text-xs text-[#0E7490] font-bold">2026 - 2027 FY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                        Due in 12 Days
                      </span>
                      <span className="text-xs font-bold text-amber-900">20th Sept</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#073B5C]">Monthly GSTR-3B Filing</h4>
                    <p className="text-[11px] text-slate-600">Summary of outward supplies & ITC reconciliation for August 2026.</p>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                        On Schedule
                      </span>
                      <span className="text-xs font-bold text-emerald-900">30th Sept</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#073B5C]">Director DIR-3 e-KYC Update</h4>
                    <p className="text-[11px] text-slate-600">Mandatory web-KYC verification for all active DIN holders.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                        Upcoming
                      </span>
                      <span className="text-xs font-bold text-slate-700">30th Oct</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#073B5C]">Form AOC-4 Financial Filing</h4>
                    <p className="text-[11px] text-slate-600">Filing audited financial statements with ROC under MCA V3.</p>
                  </div>
                </div>
              </div>

              {/* Action Banner: Resubmission / Attention Needed */}
              {filings.some((f) => f.queryPending) && (
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider block">
                      ⚠️ Action Required on Active Application
                    </span>
                    <p className="text-xs text-amber-800">
                      <strong>ROC Query Flagged:</strong> {filings.find((f) => f.queryPending)?.queryNote}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('filings')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    View & Resolve Query →
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ACTIVE FILINGS & LIVE SRN TRACKER */}
          {activeTab === 'filings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-[#073B5C]">Active Filings & Applications</h2>
                  <p className="text-xs text-slate-500">Track real-time government SRN status and progress milestones.</p>
                </div>
              </div>

              <div className="space-y-6">
                {filings.map((filing) => (
                  <div key={filing.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md uppercase">
                          SRN / Reference: {filing.srn}
                        </span>
                        <h3 className="text-lg font-bold text-[#073B5C] mt-1">{filing.serviceTitle}</h3>
                        <span className="text-xs text-slate-500 block">Assigned Officer: {filing.assignedCA}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block uppercase">SLA Status</span>
                        <strong className="text-xs font-extrabold text-[#073B5C] bg-slate-100 px-3 py-1 rounded-full inline-block mt-0.5">
                          ⏱️ {filing.eta}
                        </strong>
                      </div>
                    </div>

                    {/* Query Banner if pending */}
                    {filing.queryPending && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-900">
                        <strong className="block font-bold">⚠️ Government Resubmission Remark:</strong>
                        <p>{filing.queryNote}</p>
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-amber-700"
                        >
                          Upload Clarification Document →
                        </button>
                      </div>
                    )}

                    {/* Step Pipeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {filing.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                            step.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : step.status === 'active'
                              ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase block">
                            Step {idx + 1}: {step.status}
                          </span>
                          <strong className="font-bold block leading-tight">{step.title}</strong>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT VAULT */}
          {activeTab === 'vault' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#073B5C]">256-Bit Encrypted Document Vault</h2>
                  <p className="text-xs text-slate-500">Access and download verified statutory certificates and identity proofs.</p>
                </div>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-[#0E7490] hover:bg-cyan-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  + Upload New Document
                </button>
              </div>

              {/* Vault Files List */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Document Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Size</th>
                        <th className="p-4">Upload Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-[#073B5C] flex items-center gap-2">
                            <span>📄</span> {doc.name}
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase">
                              {doc.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{doc.fileSize}</td>
                          <td className="p-4 text-slate-500">{doc.uploadDate}</td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                                doc.status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => alert(`Downloading ${doc.name}...`)}
                              className="text-[#0E7490] hover:underline font-bold"
                            >
                              Download
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

          {/* TAB 4: DSC & IDENTITY HUB */}
          {activeTab === 'dsc' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Class 3 Digital Signature (DSC) & Identity Hub</h2>
                <p className="text-xs text-slate-500">Manage hardware USB Crypto Tokens and Video KYC statuses for directors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-[#0E7490]">Director 1 Token</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Active Class 3
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#073B5C] text-base">Dhaval Kishor Sidhpura</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>DIN:</strong> 08291024</p>
                    <p><strong>Token Hardware:</strong> HYP2003 FIPS Crypto USB</p>
                    <p><strong>Validity:</strong> Valid until 14th March 2028</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-[#0E7490]">Video KYC Verification</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Completed
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#073B5C] text-base">Mobile Video Link Authenticated</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Identity verified via mobile video link.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & GST INVOICES */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Billing, Receipts & GST Tax Invoices</h2>
                <p className="text-xs text-slate-500">Itemized breakdown of government fees, stamp duties, and professional charges.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[#073B5C] font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Invoice No</th>
                        <th className="p-4">Service Description</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Govt Fee</th>
                        <th className="p-4">Stamp Duty</th>
                        <th className="p-4">Professional Fee</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-extrabold text-[#073B5C]">{inv.invoiceNo}</td>
                          <td className="p-4 font-bold">{inv.serviceName}</td>
                          <td className="p-4 text-slate-500">{inv.date}</td>
                          <td className="p-4">₹{inv.govtFee}</td>
                          <td className="p-4">₹{inv.stampDuty}</td>
                          <td className="p-4">₹{inv.profFee}</td>
                          <td className="p-4 font-extrabold text-[#073B5C]">₹{inv.totalAmount}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => alert(`Downloading GST Invoice ${inv.invoiceNo}...`)}
                              className="bg-slate-100 hover:bg-[#073B5C] hover:text-white text-[#073B5C] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer text-[11px]"
                            >
                              Download GST Invoice
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

          {/* TAB 6: CA ADVISORY & SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#073B5C]">CA Advisory & Support Tickets</h2>
                  <p className="text-xs text-slate-500">Communicate directly with your assigned Chartered Accountant and CS team.</p>
                </div>

                <button
                  onClick={() => setShowTicketModal(true)}
                  className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  + Create Support Ticket
                </button>
              </div>

              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#0E7490] uppercase">{t.ticketNo} • {t.category}</span>
                        <h3 className="font-bold text-[#073B5C] text-sm mt-0.5">{t.subject}</h3>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {t.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Updated: {t.lastUpdated}</span>
                      <button
                        onClick={() => alert(`Opening ticket thread for ${t.ticketNo}`)}
                        className="text-[#0E7490] hover:underline font-bold"
                      >
                        View Conversation ({t.messagesCount} replies) →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TEAM & SECURITY */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-extrabold text-[#073B5C]">Team Roles & Security Governance</h2>
                <p className="text-xs text-slate-500">Manage multi-user access control (RBAC) and security settings.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-[#073B5C] text-sm">Authorized Team Members</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Grant access to co-founders or internal accountants.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <strong className="font-bold text-[#073B5C] block">Dhaval Sidhpura</strong>
                      <span className="text-slate-500 text-[11px]">dhaval@mobizspare.com</span>
                    </div>
                    <span className="bg-[#073B5C] text-[#F4B942] font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase">
                      Primary Owner
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <strong className="font-bold text-[#073B5C] block">Pushpa Sidhpura</strong>
                      <span className="text-slate-500 text-[11px]">finance@mobizspare.com</span>
                    </div>
                    <span className="bg-cyan-100 text-[#0E7490] font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase">
                      Accountant (Read/Write)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#073B5C] text-base">Upload Document to Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSimulatedFileUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Select Document Category
                </label>
                <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]">
                  <option>Entity Incorporation Document</option>
                  <option>Director Identity / Address Proof</option>
                  <option>Registered Premises Utility Bill</option>
                  <option>GST / Tax Return Receipt</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl text-center space-y-2 bg-slate-50">
                <span className="text-3xl block">📤</span>
                <span className="text-xs font-bold text-slate-600 block">Click to select file or drag & drop</span>
                <span className="text-[10px] text-slate-400 block">PDF, JPG, PNG up to 25MB</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0E7490] hover:bg-cyan-800 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow"
              >
                Upload & Encrypt File →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE SUPPORT TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#073B5C] text-base">Create CA Advisory Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                >
                  <option value="Document Filing Query">Document Filing Query</option>
                  <option value="GST & Tax Advisory">GST & Tax Advisory</option>
                  <option value="Trademark / Objection Query">Trademark / Objection Query</option>
                  <option value="Billing & Invoicing">Billing & Invoicing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Query regarding Electricity Bill NOC format"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your query in detail for the assigned CA..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow"
              >
                Submit Ticket to CA Desk →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE CALL MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#073B5C] text-base">Schedule Call with Assigned CA</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with <strong>CA Rajiv Sharma</strong> (Mumbai Division Desk).
              </p>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Select Preferred Date
                </label>
                <input type="date" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
                  Select Time Slot
                </label>
                <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
                  <option>11:00 AM - 11:30 AM</option>
                  <option>02:00 PM - 02:30 PM</option>
                  <option>05:00 PM - 05:30 PM</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  alert('Consultation Call confirmed! A calendar invite has been sent to your email.');
                }}
                className="w-full bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer"
              >
                Confirm Consultation Slot →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}