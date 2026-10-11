'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { STATE_STAMP_RULES } from '@/lib/pricing';

interface ServiceRequirement {
  id?: string;
  key: string;
  label: string;
  required: boolean;
  sortOrder?: number;
}

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  professionalFee: number;
  govtFee: number;
  govtFeeNote: string;
  gstRate: number;
  sla: string;
  sacCode: string;
  isActive: boolean;
  requirements?: ServiceRequirement[];
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'company-reg', label: 'Company Registration' },
  { value: 'business-compliance', label: 'Annual Compliance' },
  { value: 'trademark-ip', label: 'Trademark & IP' },
  { value: 'tax-gst', label: 'Tax & GST' },
  { value: 'licenses', label: 'Licenses & Registrations' },
];

export default function AdminPricingConsole() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'stamp'>('services');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused'>('all');

  // Add Service Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState('business-compliance');
  const [newProfFee, setNewProfFee] = useState<number>(4999);
  const [newGovtFee, setNewGovtFee] = useState<number>(0);
  const [newGovtFeeNote, setNewGovtFeeNote] = useState('Direct portal charges at actuals');
  const [newSla, setNewSla] = useState('5–7 working days');
  const [newSacCode, setNewSacCode] = useState('998221');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newReqList, setNewReqList] = useState<string[]>([
    'Identity Proof (PAN / Aadhaar)',
    'Registered Address & Utility Proof',
  ]);
  const [newReqInput, setNewReqInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Edit / Docs Modal
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProfFee, setEditProfFee] = useState(0);
  const [editGovtFee, setEditGovtFee] = useState(0);
  const [editGovtFeeNote, setEditGovtFeeNote] = useState('');
  const [editSla, setEditSla] = useState('');
  const [editSacCode, setEditSacCode] = useState('');
  const [editReqList, setEditReqList] = useState<string[]>([]);
  const [editReqInput, setEditReqInput] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick inline update
  const handleQuickUpdate = async (
    slug: string,
    patch: Partial<Pick<ServiceItem, 'professionalFee' | 'govtFee' | 'govtFeeNote' | 'isActive'>>
  ) => {
    setSavingSlug(slug);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...patch }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.map((s) => (s.slug === slug ? { ...s, ...patch } : s)));
        showNotification(`Updated ${slug} successfully.`);
      } else {
        alert(data.error || 'Failed to update rate');
      }
    } catch {
      alert('Error updating rate');
    } finally {
      setSavingSlug(null);
    }
  };

  // Auto-slugify when title changes in Add modal
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setNewSlug(slugified);
  };

  const handleAddReq = () => {
    if (!newReqInput.trim()) return;
    setNewReqList([...newReqList, newReqInput.trim()]);
    setNewReqInput('');
  };

  const handleRemoveReq = (idx: number) => {
    setNewReqList(newReqList.filter((_, i) => i !== idx));
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      alert('Please provide a title and slug');
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim(),
          category: newCategory,
          professionalFee: Number(newProfFee),
          govtFee: Number(newGovtFee),
          govtFeeNote: newGovtFeeNote.trim(),
          sla: newSla.trim(),
          sacCode: newSacCode.trim() || '998221',
          isActive: newIsActive,
          requirements: newReqList,
        }),
      });
      const data = await res.json();
      if (data.success && data.service) {
        setServices((prev) => [data.service, ...prev]);
        setIsAddModalOpen(false);
        showNotification(`🎉 New service "${data.service.title}" created successfully!`);
        // Reset form
        setNewTitle('');
        setNewSlug('');
        setNewProfFee(4999);
        setNewGovtFee(0);
        setNewGovtFeeNote('Direct portal charges at actuals');
        setNewSla('5–7 working days');
      } else {
        alert(data.error || 'Failed to create service');
      }
    } catch {
      alert('Failed to connect to server');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit / Docs Modal
  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditCategory(service.category);
    setEditProfFee(service.professionalFee);
    setEditGovtFee(service.govtFee);
    setEditGovtFeeNote(service.govtFeeNote);
    setEditSla(service.sla);
    setEditSacCode(service.sacCode);
    setEditReqList(service.requirements ? service.requirements.map((r) => r.label) : []);
    setEditReqInput('');
  };

  const handleAddEditReq = () => {
    if (!editReqInput.trim()) return;
    setEditReqList([...editReqList, editReqInput.trim()]);
    setEditReqInput('');
  };

  const handleRemoveEditReq = (idx: number) => {
    setEditReqList(editReqList.filter((_, i) => i !== idx));
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingService.slug,
          title: editTitle.trim(),
          category: editCategory.trim(),
          professionalFee: Number(editProfFee),
          govtFee: Number(editGovtFee),
          govtFeeNote: editGovtFeeNote.trim(),
          sla: editSla.trim(),
          sacCode: editSacCode.trim(),
          requirements: editReqList,
        }),
      });
      const data = await res.json();
      if (data.success && data.service) {
        setServices((prev) => prev.map((s) => (s.slug === editingService.slug ? data.service : s)));
        setEditingService(null);
        showNotification(`Saved changes for ${data.service.title}.`);
      } else {
        alert(data.error || 'Failed to update service details');
      }
    } catch {
      alert('Error updating service details');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered list
  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && s.isActive) ||
        (selectedStatus === 'paused' && !s.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, search, selectedCategory, selectedStatus]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 sm:p-8 antialiased font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* NOTIFICATION TOAST */}
        {actionMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#073B5C] text-[#F4B942] font-black text-xs px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/40 animate-in fade-in slide-in-from-top-4">
            ✓ {actionMessage}
          </div>
        )}

        {/* HEADER BAR */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#073B5C] text-[#F4B942] font-black text-[11px] px-3 py-1 rounded-xl">
                Staff Console
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#073B5C]">
                Service Catalog & Dynamic Pricing Manager
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage professional fees, government portal charges, required KYC documents, active states, and add brand-new statutory services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0E7490] hover:bg-[#073B5C] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span> Add New Service
            </button>
            <Link
              href="/admin"
              className="text-xs text-slate-600 hover:text-[#073B5C] font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              ← Main Dashboard
            </Link>
          </div>
        </div>

        {/* TABS & FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`text-xs font-black px-4 py-1.5 rounded-lg transition ${
                activeTab === 'services'
                  ? 'bg-white text-[#073B5C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Services & Pricing ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stamp')}
              className={`text-xs font-black px-4 py-1.5 rounded-lg transition ${
                activeTab === 'stamp'
                  ? 'bg-white text-[#073B5C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              State Stamp Duty Matrix (16 States)
            </button>
          </div>

          {activeTab === 'services' && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search service by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">Status: All</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: SERVICES TABLE */}
        {activeTab === 'services' && (
          <>
            {loading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                Loading statutory rate matrix...
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#073B5C] text-white">
                        <th className="py-3 px-4 font-bold">Service & Category</th>
                        <th className="py-3 px-4 font-bold w-36">NyayaLink Fee (₹)</th>
                        <th className="py-3 px-4 font-bold w-32">Govt Fee (₹)</th>
                        <th className="py-3 px-4 font-bold">Govt Fee Note</th>
                        <th className="py-3 px-4 font-bold w-24 text-center">Docs Required</th>
                        <th className="py-3 px-4 font-bold w-20 text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right w-44">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400">
                            No services match your filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <RateRow
                            key={item.slug}
                            item={item}
                            onQuickSave={handleQuickUpdate}
                            onOpenEdit={openEditModal}
                            isSaving={savingSlug === item.slug}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: STATE STAMP DUTY MATRIX */}
        {activeTab === 'stamp' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <h2 className="text-base font-extrabold text-[#073B5C]">
                  Automated State Stamp Duty Calculation Engine
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                For Company Incorporation services (Private Limited, LLP, OPC, Section 8, etc.), Ministry of Corporate Affairs (MCA) SPICe+ statutory stamp duties vary based on the state of registration. NyayaLink calculates these live at checkout and displays them transparently so clients pay exact statutory fees with zero markup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(STATE_STAMP_RULES).map(([code, rule]) => (
                <div
                  key={code}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0E7490] transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <strong className="text-sm font-black text-[#073B5C]">{rule.name}</strong>
                    <span className="bg-cyan-50 text-[#0E7490] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      {code}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Base SPICe+ Stamp:</span>
                      <strong className="text-slate-800">₹{rule.baseStamp.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>PAN & TAN Allotment:</span>
                      <strong className="text-slate-800">₹{rule.panTanFee}</strong>
                    </div>
                    <div className="border-t border-slate-100 pt-1 flex justify-between font-extrabold text-[#073B5C]">
                      <span>Total Statutory Outlay:</span>
                      <span>₹{(rule.baseStamp + rule.panTanFee).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 leading-tight">{rule.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW SERVICE                                */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  Service Creation
                </span>
                <h3 className="text-lg font-black text-[#073B5C]">Add New Legal & Compliance Service</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="overflow-y-auto space-y-4 text-xs pr-1 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Startup India DPIIT Recognition"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="e.g. startup-india-dpiit"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                  <span className="text-[10px] text-slate-400">Public URL: /services/{newSlug || '...'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="company-reg">Company Registration</option>
                    <option value="business-compliance">Annual Compliance</option>
                    <option value="trademark-ip">Trademark & IP</option>
                    <option value="tax-gst">Tax & GST</option>
                    <option value="licenses">Licenses & Certifications</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Turnaround SLA</label>
                  <input
                    type="text"
                    value={newSla}
                    onChange={(e) => setNewSla(e.target.value)}
                    placeholder="e.g. 5–7 working days"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Professional Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newProfFee}
                    onChange={(e) => setNewProfFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Govt Fee Upfront (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newGovtFee}
                    onChange={(e) => setNewGovtFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">SAC Code</label>
                  <input
                    type="text"
                    value={newSacCode}
                    onChange={(e) => setNewSacCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#073B5C] mb-1">Govt Fee Description Note</label>
                <input
                  type="text"
                  value={newGovtFeeNote}
                  onChange={(e) => setNewGovtFeeNote(e.target.value)}
                  placeholder="e.g. Direct statutory portal charges at actuals"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-700"
                />
              </div>

              {/* KYC Document Checklist */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block font-bold text-[#073B5C]">
                  Required Documents Checklist ({newReqList.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReqInput}
                    onChange={(e) => setNewReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReq();
                      }
                    }}
                    placeholder="Type document name (e.g. Board Resolution, Electricity Bill)..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddReq}
                    className="bg-[#073B5C] text-[#F4B942] font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {newReqList.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReq(idx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="new-active-check"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#0E7490] cursor-pointer"
                />
                <label htmlFor="new-active-check" className="font-bold text-slate-700 cursor-pointer">
                  Publish service live immediately for online booking
                </label>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black rounded-xl uppercase transition shadow"
                >
                  {isCreating ? 'Creating Service...' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT SERVICE & DOCUMENT REQUIREMENTS           */}
      {/* ======================================================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  Service Configuration & KYC
                </span>
                <h3 className="text-lg font-black text-[#073B5C]">{editingService.title}</h3>
                <span className="text-[10px] font-mono text-slate-400">/{editingService.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="overflow-y-auto space-y-4 text-xs pr-1 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Professional Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProfFee}
                    onChange={(e) => setEditProfFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Govt Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editGovtFee}
                    onChange={(e) => setEditGovtFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">Turnaround SLA</label>
                  <input
                    type="text"
                    value={editSla}
                    onChange={(e) => setEditSla(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#073B5C] mb-1">Govt Fee Note (shown to clients)</label>
                <input
                  type="text"
                  value={editGovtFeeNote}
                  onChange={(e) => setEditGovtFeeNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-700"
                />
              </div>

              {/* Document Requirements Manager */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#073B5C]">
                    Required KYC Documents ({editReqList.length})
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Changes reflect immediately in the customer document vault
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editReqInput}
                    onChange={(e) => setEditReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditReq();
                      }
                    }}
                    placeholder="Add required document (e.g. Electricity Bill, Board Resolution)..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditReq}
                    className="bg-[#073B5C] text-[#F4B942] font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
                  {editReqList.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <span className="font-medium text-slate-800">{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditReq(idx)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-0.5 rounded cursor-pointer"
                        title="Remove requirement"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                  {editReqList.length === 0 && (
                    <p className="text-slate-400 text-xs italic">No specific documents specified yet.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <Link
                  href={`/services/${editingService.slug}`}
                  target="_blank"
                  className="text-xs text-[#0E7490] font-bold hover:underline"
                >
                  View Public Page ↗
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black rounded-xl uppercase transition shadow"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function RateRow({
  item,
  onQuickSave,
  onOpenEdit,
  isSaving,
}: {
  item: ServiceItem;
  onQuickSave: (slug: string, patch: Partial<Pick<ServiceItem, 'professionalFee' | 'govtFee' | 'govtFeeNote' | 'isActive'>>) => void;
  onOpenEdit: (service: ServiceItem) => void;
  isSaving: boolean;
}) {
  const [fee, setFee] = useState(item.professionalFee);
  const [govtFee, setGovtFee] = useState(item.govtFee);
  const [note, setNote] = useState(item.govtFeeNote);

  // Sync state if item changes from outside
  useEffect(() => {
    setFee(item.professionalFee);
    setGovtFee(item.govtFee);
    setNote(item.govtFeeNote);
  }, [item]);

  const dirty = fee !== item.professionalFee || govtFee !== item.govtFee || note !== item.govtFeeNote;
  const inputClass =
    'bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0E7490]';

  return (
    <tr className={`hover:bg-slate-50/80 transition ${item.isActive ? '' : 'bg-slate-100/50 opacity-70'}`}>
      <td className="py-3 px-4">
        <strong className="text-[#073B5C] block font-extrabold text-xs">{item.title}</strong>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
            {item.category}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">/{item.slug}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        <input
          type="number"
          min={0}
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          className={`w-28 font-bold text-[#073B5C] ${inputClass}`}
        />
      </td>

      <td className="py-3 px-4">
        <input
          type="number"
          min={0}
          value={govtFee}
          onChange={(e) => setGovtFee(Number(e.target.value))}
          className={`w-24 font-bold text-[#073B5C] ${inputClass}`}
        />
      </td>

      <td className="py-3 px-4">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`w-full text-xs text-slate-700 ${inputClass}`}
        />
      </td>

      <td className="py-3 px-4 text-center">
        <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
          📁 {item.requirements ? item.requirements.length : 0} docs
        </span>
      </td>

      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => onQuickSave(item.slug, { isActive: !item.isActive })}
          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase cursor-pointer transition ${
            item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}
          title="Click to toggle live or paused status"
        >
          {item.isActive ? 'Active' : 'Paused'}
        </button>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            className="text-[11px] font-bold text-[#0E7490] hover:text-[#073B5C] bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            Manage Docs
          </button>
          <button
            type="button"
            onClick={() => onQuickSave(item.slug, { professionalFee: fee, govtFee, govtFeeNote: note })}
            disabled={isSaving || !dirty}
            className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-200 disabled:text-slate-400 text-[#F4B942] font-black text-[10px] px-3 py-1.5 rounded-lg uppercase transition shadow cursor-pointer"
          >
            {isSaving ? '...' : 'Save'}
          </button>
        </div>
      </td>
    </tr>
  );
}
