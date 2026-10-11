'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ChecklistDoc {
  id: string;
  name: string;
  requirementKey: string | null;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUPERSEDED';
  rejectNote: string | null;
  version: number;
  originalName: string;
  uploadedAt: string | Date;
}

export interface ChecklistRequirement {
  key: string;
  label: string;
  required: boolean;
}

interface Props {
  orderId: string;
  requirements: ChecklistRequirement[];
  documents: ChecklistDoc[];
  mode: 'client' | 'staff';
  locked?: boolean; // e.g. order closed or unpaid
  lockedReason?: string;
}

const STATUS_UI: Record<string, { label: string; style: string }> = {
  MISSING: { label: 'Not uploaded', style: 'bg-slate-100 text-slate-600' },
  PENDING_REVIEW: { label: 'Under review', style: 'bg-amber-100 text-amber-800' },
  VERIFIED: { label: 'Verified', style: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Re-upload needed', style: 'bg-rose-100 text-rose-800' },
};

export default function DocumentChecklist({ orderId, requirements, documents, mode, locked, lockedReason }: Props) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const current = documents.filter((d) => d.status !== 'SUPERSEDED');
  const latestFor = (key: string) =>
    current.filter((d) => d.requirementKey === key).sort((a, b) => b.version - a.version)[0];
  const extras = current.filter((d) => !d.requirementKey || !requirements.some((r) => r.key === d.requirementKey));

  const done = requirements.filter((r) => latestFor(r.key)?.status === 'VERIFIED').length;
  const uploaded = requirements.filter((r) => latestFor(r.key)).length;

  const [preValidationSuccess, setPreValidationSuccess] = useState<string | null>(null);

  const validateFile = (key: string, file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // 1. File size checks
      if (file.size < 5 * 1024) {
        resolve('File appears empty or corrupted (smaller than 5 KB). Please upload a valid document.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        resolve('File exceeds 10 MB limit. Please compress or optimize the file.');
        return;
      }

      // 2. MIME & extension checks
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(file.type) && !['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
        resolve('Unsupported format. MCA V3 and IP India registries strictly require PDF, JPG, or PNG files.');
        return;
      }

      // 3. Keyword mismatch heuristic
      const req = requirements.find((r) => r.key === key);
      const reqLabel = (req?.label || '').toLowerCase();
      const fileName = file.name.toLowerCase();
      if (reqLabel.includes('pan') && (fileName.includes('bill') || fileName.includes('rent') || fileName.includes('noc'))) {
        const proceed = window.confirm(
          `Notice: You are uploading "${file.name}" for "${req?.label}". This filename suggests an address/utility proof rather than a PAN card. Do you wish to continue?`
        );
        if (!proceed) {
          resolve('Upload cancelled. Please select the correct PAN card file.');
          return;
        }
      }

      // 4. Image resolution checks if an image file
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          if (img.width < 250 || img.height < 250) {
            resolve('Image resolution appears too low (< 250px). Ensure identity details are crisp and legible.');
          } else {
            resolve(null);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          resolve(null);
        };
        return;
      }

      resolve(null);
    });
  };

  const upload = async (key: string, file: File) => {
    setError('');
    setPreValidationSuccess(null);

    const validationError = await validateFile(key, file);
    if (validationError) {
      setError(validationError);
      if (inputs.current[key]) inputs.current[key]!.value = '';
      return;
    }

    setBusyKey(key);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('orderId', orderId);
      if (key !== '__extra') form.append('requirementKey', key);
      const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Upload failed.');
      } else {
        setPreValidationSuccess(`✓ "${file.name}" verified and securely stored.`);
        setTimeout(() => setPreValidationSuccess(null), 4000);
        router.refresh();
      }
    } catch {
      setError('Upload failed. Please check your connection and try again.');
    } finally {
      setBusyKey(null);
      if (inputs.current[key]) inputs.current[key]!.value = '';
    }
  };

  const review = async (documentId: string, status: 'VERIFIED' | 'REJECTED') => {
    setError('');
    setBusyKey(documentId);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status === 'REJECTED' ? { documentId, status, rejectNote } : { documentId, status }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error || 'Review failed.');
      else {
        setRejecting(null);
        setRejectNote('');
        router.refresh();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const fileInput = (key: string, label: string) => (
    <>
      <input
        ref={(el) => {
          inputs.current[key] = el;
        }}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(key, e.target.files[0])}
      />
      <button
        type="button"
        disabled={locked || busyKey !== null}
        onClick={() => inputs.current[key]?.click()}
        className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer whitespace-nowrap"
      >
        {busyKey === key ? 'Uploading…' : label}
      </button>
    </>
  );

  const docRow = (doc: ChecklistDoc | undefined, title: string, key: string, required: boolean, isRequirement = true) => {
    const ui = STATUS_UI[doc?.status || 'MISSING'];
    const canUpload = isRequirement && (mode === 'staff' || !doc || doc.status !== 'VERIFIED');
    return (
      <li key={key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-xs text-[#073B5C]">{title}</strong>
            {required && <span className="text-[9px] font-bold text-rose-600 uppercase">Required</span>}
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${ui.style}`}>{ui.label}</span>
          </div>
          {doc && (
            <p className="text-[11px] text-slate-500 truncate">
              {doc.originalName} · v{doc.version} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
            </p>
          )}
          {doc?.status === 'REJECTED' && doc.rejectNote && (
            <p className="text-[11px] text-rose-700 font-semibold">Reason: {doc.rejectNote}</p>
          )}
          {rejecting === doc?.id && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Reason (sent to client)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
              <button
                onClick={() => review(doc!.id, 'REJECTED')}
                disabled={rejectNote.trim().length < 5 || busyKey !== null}
                className="bg-rose-600 disabled:bg-slate-300 text-white font-bold text-[11px] px-3 py-2 rounded-xl"
              >
                Send rejection
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {doc && (
            <a
              href={`/api/documents/${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-[11px] px-3.5 py-2 rounded-xl"
            >
              View
            </a>
          )}
          {mode === 'staff' && doc?.status === 'PENDING_REVIEW' && (
            <>
              <button
                onClick={() => review(doc.id, 'VERIFIED')}
                disabled={busyKey !== null}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer"
              >
                ✓ Verify
              </button>
              <button
                onClick={() => setRejecting(rejecting === doc.id ? null : doc.id)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer"
              >
                ✕ Reject
              </button>
            </>
          )}
          {canUpload && fileInput(key, doc ? 'Re-upload' : 'Upload')}
        </div>
      </li>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 space-y-2">
        <div className="flex justify-between items-center gap-3">
          <h3 className="font-extrabold text-[#073B5C] text-sm">Document Checklist</h3>
          <span className="text-[11px] font-bold text-slate-500">
            {done}/{requirements.length} verified · {uploaded} uploaded
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden" aria-hidden>
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${requirements.length ? (done / requirements.length) * 100 : 0}%` }} />
        </div>
        <p className="text-[11px] text-slate-500">
          PDF, JPG or PNG up to 10 MB. On mobile you can photograph the document directly. Files are stored encrypted and only your
          assigned compliance team can open them.
        </p>
        {locked && lockedReason && <p className="text-[11px] font-bold text-amber-700">{lockedReason}</p>}
        {error && <p className="text-[11px] font-bold text-rose-700">{error}</p>}
        {preValidationSuccess && (
          <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {preValidationSuccess}
          </p>
        )}
      </div>
      <ul className="divide-y divide-slate-100">
        {requirements.map((r) => docRow(latestFor(r.key), r.label, r.key, r.required))}
        {extras.map((d) => docRow(d, d.name, d.id, false, false))}
      </ul>
      {!locked && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
          <span className="text-[11px] text-slate-500">Anything else your compliance desk asked for?</span>
          {fileInput('__extra', '+ Other document')}
        </div>
      )}
    </div>
  );
}
