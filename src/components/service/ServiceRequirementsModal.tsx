'use client';

import { useEffect } from 'react';

export interface ServiceRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: string[];
}

export default function ServiceRequirementsModal({ isOpen, onClose, documents }: ServiceRequirementsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="All Required Documents"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[85vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider block">
              Document Checklist
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
              All Required Documents
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document checklist"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 text-xs pr-1">
          <p className="text-slate-600 text-xs pb-1">
            You do not need these immediately. You can book now and upload them anytime inside your secure Vault:
          </p>
          {documents.map((doc, idx) => (
            <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
              <span className="text-emerald-700 font-black text-sm mt-0.5">✓</span>
              <span className="text-slate-700 font-medium leading-relaxed">{doc}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
          <span className="text-slate-500">Format: PDF, PNG, JPG (&lt; 10MB)</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#073B5C] text-[#F4B942] font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
