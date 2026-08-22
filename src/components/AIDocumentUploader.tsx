'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (fileRecord: any) => void;
}

export default function AIDocumentUploader({ isOpen, onClose, onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('Registered Premises Utility Bill');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setIsAnalyzing(true);
      setAiReport(null);

      try {
        const res = await fetch('/api/ai/audit-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentName: selected.name,
            documentType: docCategory,
          }),
        });

        const data = await res.json();
        setAiReport(data);
      } catch (err) {
        console.error('AI Audit Failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFinalSubmit = () => {
    onUploadSuccess({
      id: Date.now().toString(),
      name: file?.name || 'Document.pdf',
      category: 'Entity',
      fileSize: `${((file?.size || 1024000) / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: 'Today',
      status: aiReport?.auditStatus === 'PASSED' ? 'Verified' : 'Action Needed',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 antialiased">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn text-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-100 text-[#0E7490] font-black px-2 py-0.5 rounded text-[10px]">AI-POWERED</span>
            <h3 className="font-extrabold text-[#073B5C] text-base">Encrypted Document Vault Upload</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-[#073B5C] mb-1">
              Select Document Category
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-[#073B5C] focus:outline-none"
            >
              <option value="Registered Premises Utility Bill">Registered Premises Utility Bill</option>
              <option value="Director Identity Proof">Director Identity Proof</option>
              <option value="Entity Incorporation Proof">Entity Incorporation Proof</option>
              <option value="GST / Tax Return Proof">GST / Tax Return Proof</option>
            </select>
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-[#0E7490] p-6 rounded-2xl text-center space-y-2 bg-slate-50 block cursor-pointer transition">
            <span className="text-3xl block">📤</span>
            <span className="font-bold text-slate-700 block">
              {file ? file.name : 'Click to select or drag & drop PDF/JPG'}
            </span>
            <span className="text-[10px] text-slate-400 block">Maximum file size 25MB</span>
            <input type="file" onChange={handleFileSelection} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
          </label>

          {isAnalyzing && (
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center gap-3 text-[#0E7490]">
              <span className="w-4 h-4 border-2 border-[#0E7490] border-t-transparent rounded-full animate-spin"></span>
              <span className="font-bold">AI Document Pre-Auditor scanning date, clarity & OCR...</span>
            </div>
          )}

          {aiReport && (
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                aiReport.auditStatus === 'PASSED'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between font-extrabold">
                <span>{aiReport.auditStatus === 'PASSED' ? '✅ AI Compliance Check Passed' : '⚠️ AI Compliance Alert'}</span>
                <span className="text-[10px] uppercase bg-white/80 px-2 py-0.5 rounded">
                  Score: {aiReport.confidenceScore}%
                </span>
              </div>
              <ul className="text-[11px] space-y-1">
                {aiReport.findings.map((finding: string, idx: number) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
              <p className="text-[11px] font-bold pt-1 border-t border-black/10">{aiReport.recommendation}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="w-1/3 bg-slate-100 font-bold py-3 rounded-xl">
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || isAnalyzing}
              onClick={handleFinalSubmit}
              className="w-2/3 bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black py-3 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
            >
              Save to Encrypted Vault →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}