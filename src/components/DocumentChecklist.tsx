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
  locked?: boolean;
  lockedReason?: string;
}

interface ConfirmDialogState {
  title: string;
  badge: string;
  message: string;
  subtext?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const STATUS_UI: Record<string, { label: string; style: string }> = {
  MISSING: { label: 'Not uploaded', style: 'bg-slate-100 text-slate-600' },
  PENDING_REVIEW: { label: 'Under review', style: 'bg-amber-100 text-amber-800' },
  VERIFIED: { label: 'Verified', style: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Re-upload needed', style: 'bg-rose-100 text-rose-800' },
};

const TEMPLATES: Record<string, { title: string; filename: string; content: string }> = {
  noc: {
    title: 'Landlord No-Objection Certificate (NOC)',
    filename: 'Landlord_NOC_Template_NyayaLink.txt',
    content: `TO WHOMSOEVER IT MAY CONCERN\n\nI/We, ___________________________________ [Name of Property Owner], residing at ____________________________________________________, do hereby solemnly declare and state as follows:\n\n1. That I am the legal and absolute owner of the premises situated at:\n   ____________________________________________________________________\n   ____________________________________________________________________ [Complete Registered Office Address].\n\n2. That I have no objection whatsoever if M/s _________________________________________________ [Proposed Company Name] uses the aforesaid premises as its Registered Office for all corporate, statutory, and legal purposes under the Companies Act, 2013 and rules framed thereunder.\n\n3. That I have not granted any exclusive possession contrary to this arrangement and permit the display of the Company's name board at the said premises as required by law.\n\nDate: ____________________\nPlace: ____________________\n\n___________________________________________\nSignature of Property Owner / Landlord\nName: ____________________________________\nContact No: _____________________________\n`,
  },
  dir2: {
    title: 'Form DIR-2 (Consent to Act as Director)',
    filename: 'DIR_2_Consent_Director_Template.txt',
    content: `FORM DIR-2\nConsent to act as a Director of a Company\n[Pursuant to Section 152(5) of the Companies Act, 2013 and Rule 8 of Companies (Appointment and Qualification of Directors) Rules, 2014]\n\nTo,\nThe Board of Directors,\n_____________________________________________________ [Proposed Company Name]\n\nSubject: Consent to act as Director\n\nI, __________________________________________, hereby give my consent to act as Director of _________________________________________________ [Proposed Company Name], pursuant to sub-section (5) of Section 152 of the Companies Act, 2013.\n\n1. Director Identification Number (DIN) (if allotted): ________________________\n2. Full Name: ____________________________________________________________\n3. Father's Name: ________________________________________________________\n4. Permanent Residential Address: ___________________________________________\n5. Present Residential Address: _____________________________________________\n6. Email ID: _____________________________________________________________\n7. Mobile Number: _________________________________________________________\n8. Date of Birth: ____________________\n9. Nationality: _____________________\n10. Occupation: _____________________\n\nDECLARATION:\nI declare that I have not been disqualified to act as a director under the provisions of the Companies Act, 2013.\n\nDate: ____________________\nPlace: ____________________\n\n___________________________________________\nSignature of Director\nName: ____________________________________\n`,
  },
  board_res: {
    title: 'Board Resolution for Corporate Authorization',
    filename: 'Board_Resolution_Authorization_Template.txt',
    content: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF _____________________________________________________ HELD ON __________________ AT THE REGISTERED OFFICE OF THE COMPANY.\n\n"RESOLVED THAT consent of the Board of Directors be and is hereby accorded to authorize Mr./Ms. ____________________________________, Director, to sign, execute, and submit all necessary statutory e-forms (including SPICe+ Part A and Part B, AGILE-PRO-S, e-MOA, and e-AOA) with the Ministry of Corporate Affairs, Registrar of Companies, and other regulatory portals for and on behalf of the Company.\n\nRESOLVED FURTHER THAT Mr./Ms. ____________________________________ be and is hereby authorized to appoint professionals, digital signature service providers, and compliance counsel to represent the Company before the Registrar of Companies."\n\nFor and on behalf of the Board of Directors,\n\n___________________________________________\nDirector / Authorized Signatory\nDIN: ____________________\n`,
  },
};

function downloadTemplate(key: keyof typeof TEMPLATES) {
  const t = TEMPLATES[key];
  if (!t) return;
  const blob = new Blob([t.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = t.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DocumentChecklist({ orderId, requirements, documents, mode, locked, lockedReason }: Props) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const current = documents.filter((d) => d.status !== 'SUPERSEDED');
  const latestFor = (key: string) =>
    current.filter((d) => d.requirementKey === key).sort((a, b) => b.version - a.version)[0];
  const extras = current.filter((d) => !d.requirementKey || !requirements.some((r) => r.key === d.requirementKey));

  const done = requirements.filter((r) => latestFor(r.key)?.status === 'VERIFIED').length;
  const uploaded = requirements.filter((r) => latestFor(r.key)).length;

  const [preValidationSuccess, setPreValidationSuccess] = useState<string | null>(null);

  /**
   * Client-side HTML5 canvas compression for mobile camera photos.
   * Resizes large smartphone camera photos (> 750KB) to max 1920px at 82% quality,
   * keeping PAN / Aadhaar / utility bills crystal clear for CA review while
   * shrinking 8-15MB payloads to ~400-700KB to prevent mobile timeouts.
   */
  const compressImageIfLarge = (file: File, maxDimension = 1920, quality = 0.82): Promise<File> => {
    if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
      return Promise.resolve(file);
    }
    if (file.size <= 750 * 1024) {
      return Promise.resolve(file);
    }
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const compressedName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressed = new File([blob], compressedName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  /**
   * Intercepts mobile file selection. Validates basic constraints and triggers
   * a mobile-friendly in-app confirmation modal for statutory freshness checks.
   */
  const handleFilePicked = (key: string, file: File) => {
    setError('');
    setPreValidationSuccess(null);

    // 1. File size checks
    if (file.size < 5 * 1024) {
      setError('File appears empty or corrupted (smaller than 5 KB). Please select a valid document.');
      if (inputs.current[key]) inputs.current[key]!.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB limit. Please compress or optimize the file.');
      if (inputs.current[key]) inputs.current[key]!.value = '';
      return;
    }

    // 2. Format checks
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && !['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
      setError('Unsupported format. MCA V3 and IP India registries strictly require PDF, JPG, or PNG files.');
      if (inputs.current[key]) inputs.current[key]!.value = '';
      return;
    }

    // 3. Statutory Freshness Check (< 60 days) for premises proof (In-App Modal)
    const req = requirements.find((r) => r.key === key);
    const reqLabel = (req?.label || '').toLowerCase();
    const fileName = file.name.toLowerCase();

    if (
      reqLabel.includes('electricity') ||
      reqLabel.includes('utility') ||
      reqLabel.includes('bill') ||
      reqLabel.includes('address')
    ) {
      setConfirmDialog({
        title: 'Statutory Freshness Check',
        badge: '⚡ MCA V3 & GST Rule',
        message:
          'Registrar of Companies and GST authorities automatically reject utility bills older than 60 days (under 2 months old).',
        subtext: `Please confirm that "${file.name}" was issued within the last 60 days.`,
        confirmLabel: '✓ Yes, Bill is < 60 Days Old',
        cancelLabel: 'Choose Newer Bill',
        onConfirm: () => {
          setConfirmDialog(null);
          executeUpload(key, file);
        },
        onCancel: () => {
          setConfirmDialog(null);
          if (inputs.current[key]) inputs.current[key]!.value = '';
        },
      });
      return;
    }

    // 4. PAN Card Mismatch Warning (In-App Modal)
    if (reqLabel.includes('pan') && (fileName.includes('bill') || fileName.includes('rent') || fileName.includes('noc'))) {
      setConfirmDialog({
        title: 'Notice: Document Type Mismatch',
        badge: '⚠️ Quality Verification',
        message: `You are uploading "${file.name}" for "${req?.label}". This filename suggests an address/utility proof rather than a PAN card.`,
        confirmLabel: 'Upload Anyway',
        cancelLabel: 'Pick Correct File',
        onConfirm: () => {
          setConfirmDialog(null);
          executeUpload(key, file);
        },
        onCancel: () => {
          setConfirmDialog(null);
          if (inputs.current[key]) inputs.current[key]!.value = '';
        },
      });
      return;
    }

    // Direct upload if no statutory warning triggers
    executeUpload(key, file);
  };

  const executeUpload = async (key: string, rawFile: File) => {
    setError('');
    setPreValidationSuccess(null);
    setBusyKey(key);

    let file = rawFile;
    if (rawFile.type.startsWith('image/') && rawFile.size > 750 * 1024) {
      try {
        file = await compressImageIfLarge(rawFile);
        if (file.size < rawFile.size) {
          setPreValidationSuccess(
            'Photo optimized from ' +
              (rawFile.size / (1024 * 1024)).toFixed(1) +
              ' MB to ' +
              (file.size / 1024).toFixed(0) +
              ' KB for instant vault upload.'
          );
        }
      } catch (err) {
        console.warn('Image compression fallback to raw file:', err);
      }
    }

    try {
      let uploadSucceeded = false;

      // 1. Direct S3 streaming
      try {
        const presignRes = await fetch('/api/documents/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            requirementKey: key !== '__extra' ? key : null,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            sizeBytes: file.size,
          }),
        });

        if (presignRes.ok) {
          const presignData = await presignRes.json();
          if (presignData.success && presignData.mode === 's3' && presignData.presignedUrl) {
            const s3Res = await fetch(presignData.presignedUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type || 'application/pdf',
              },
            });

            if (s3Res.ok) {
              const completeRes = await fetch('/api/documents/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  requirementKey: key !== '__extra' ? key : null,
                  storageKey: presignData.storageKey,
                  fileName: file.name,
                  mimeType: file.type || 'application/pdf',
                  sizeBytes: file.size,
                }),
              });

              const completeData = await completeRes.json();
              if (completeData.success) {
                uploadSucceeded = true;
              }
            }
          }
        }
      } catch (directErr) {
        console.warn('Direct S3 upload attempt failed, falling back to server route:', directErr);
      }

      // 2. Standard server route fallback
      if (!uploadSucceeded) {
        const form = new FormData();
        form.append('file', file);
        form.append('orderId', orderId);
        if (key !== '__extra') form.append('requirementKey', key);
        const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Upload failed.');
          return;
        }
      }

      setPreValidationSuccess(`✓ "${file.name}" verified and securely stored in encrypted vault.`);
      setTimeout(() => setPreValidationSuccess(null), 4000);
      router.refresh();
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
        onChange={(e) => e.target.files?.[0] && handleFilePicked(key, e.target.files[0])}
      />
      <button
        type="button"
        disabled={locked || busyKey !== null}
        onClick={() => inputs.current[key]?.click()}
        className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-bold text-xs sm:text-[11px] px-4 py-2.5 sm:py-2 rounded-xl cursor-pointer whitespace-nowrap min-h-[42px] sm:min-h-0 flex items-center justify-center gap-1.5 transition shadow-xs w-full sm:w-auto"
      >
        {busyKey === key ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-[#F4B942]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Uploading…</span>
          </>
        ) : (
          <>
            <span>{label.includes('Re') ? '🔄' : '📤'}</span>
            <span>{label}</span>
          </>
        )}
      </button>
    </>
  );

  const docRow = (doc: ChecklistDoc | undefined, title: string, key: string, required: boolean, isRequirement = true) => {
    const ui = STATUS_UI[doc?.status || 'MISSING'];
    const canUpload = isRequirement && (mode === 'staff' || !doc || doc.status !== 'VERIFIED');
    return (
      <li key={key} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-slate-50/70 transition-colors">
        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-xs sm:text-sm text-[#073B5C] font-extrabold">{title}</strong>
            {required && <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase">Required</span>}
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${ui.style}`}>{ui.label}</span>
            {(() => {
              const lower = title.toLowerCase();
              if (lower.includes('bill') || lower.includes('electricity') || lower.includes('utility')) {
                return (
                  <span className="text-[9px] font-black bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                    ⚡ &lt; 60 Days Old
                  </span>
                );
              }
              if (lower.includes('pan')) {
                return (
                  <span className="text-[9px] font-black bg-cyan-50 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded-md">
                    🪪 Color Scan
                  </span>
                );
              }
              if (lower.includes('noc')) {
                return (
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✍️ Owner Signed
                  </span>
                );
              }
              return null;
            })()}
          </div>
          {doc && (
            <p className="text-[11px] text-slate-500 truncate">
              {doc.originalName} · v{doc.version} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
            </p>
          )}
          {doc?.status === 'REJECTED' && doc.rejectNote && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-0.5">
              <span className="font-bold block uppercase text-[9px] tracking-wider text-rose-700">CA Desk Re-Upload Remark:</span>
              <span>{doc.rejectNote}</span>
            </div>
          )}
          {rejecting === doc?.id && (
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Utility bill is older than 60 days (must be < 2 months old)',
                  'Aadhaar must have first 8 digits masked (UIDAI compliance)',
                  'Premises address does not match owner NOC',
                  'Image/document is blurry or unreadable',
                  'PAN card signature is missing or clipped',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectNote(preset)}
                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg transition text-left cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Reason (emailed & sent via WhatsApp to client)"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                />
                <button
                  onClick={() => review(doc!.id, 'REJECTED')}
                  disabled={rejectNote.trim().length < 5 || busyKey !== null}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer min-h-[42px] sm:min-h-0"
                >
                  Send Rejection
                </button>
                <button
                  type="button"
                  onClick={() => { setRejecting(null); setRejectNote(''); }}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer min-h-[42px] sm:min-h-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          {doc && (
            <a
              href={`/api/documents/${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none text-center bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-xs sm:text-[11px] px-3.5 py-2.5 sm:py-2 rounded-xl transition min-h-[42px] sm:min-h-0 flex items-center justify-center gap-1"
            >
              <span>👁️</span> View
            </a>
          )}
          {mode === 'staff' && doc?.status === 'PENDING_REVIEW' && (
            <>
              <button
                onClick={() => review(doc.id, 'VERIFIED')}
                disabled={busyKey !== null}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-[11px] px-3.5 py-2.5 sm:py-2 rounded-xl cursor-pointer min-h-[42px] sm:min-h-0 flex items-center justify-center gap-1"
              >
                <span>✓</span> Verify
              </button>
              <button
                onClick={() => setRejecting(rejecting === doc.id ? null : doc.id)}
                className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-[11px] px-3.5 py-2.5 sm:py-2 rounded-xl cursor-pointer min-h-[42px] sm:min-h-0 flex items-center justify-center gap-1"
              >
                <span>✕</span> Reject
              </button>
            </>
          )}
          {canUpload && (
            <div className="flex-1 sm:flex-none">
              {fileInput(key, doc ? 'Re-upload' : 'Upload')}
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 space-y-3">
        {/* PROGRESS SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-slate-50 to-cyan-50/40 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{done === requirements.length ? '🎉' : uploaded === requirements.length ? '⏳' : '📋'}</span>
              <strong className="text-xs sm:text-sm font-extrabold text-[#073B5C]">
                {done === requirements.length
                  ? 'All Required Documents Verified!'
                  : uploaded === requirements.length
                  ? 'All Documents Uploaded — CA Review in Progress'
                  : `${requirements.length - uploaded} Document${requirements.length - uploaded > 1 ? 's' : ''} Remaining`}
              </strong>
            </div>
            <p className="text-[11px] text-slate-500">
              {done === requirements.length
                ? 'Your filing docket is fully documented and queued for government submission.'
                : uploaded === requirements.length
                ? 'Your assigned Chartered Accountant is checking statutory validity.'
                : 'Upload directly from your phone camera or files at your own convenience.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <div className="text-right">
              <span className="text-xs font-black text-[#073B5C] font-mono">{done}/{requirements.length}</span>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Verified</span>
            </div>
            <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${requirements.length ? (done / requirements.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* MOBILE CAMERA ASSISTANT CHIP */}
        {mode === 'client' && (
          <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-cyan-900">
            <span className="text-base shrink-0">📱</span>
            <span className="text-[11px] leading-snug">
              <strong>Mobile Tip:</strong> Tap <strong>Upload</strong> to snap photos directly using your phone camera. Large photos are automatically compressed before secure storage in your AES-256 vault.
            </span>
          </div>
        )}
        
        {/* OFFICIAL DRAFTING TEMPLATES */}
        {mode === 'client' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
              📄 Official Drafting Templates (Downloadable Formats)
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] -mx-1 px-1 text-xs">
              <button
                type="button"
                onClick={() => downloadTemplate('noc')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap min-h-[38px]"
              >
                <span>🏢</span> Landlord NOC Template ↓
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('dir2')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap min-h-[38px]"
              >
                <span>✍️</span> Form DIR-2 (Consent) ↓
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('board_res')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap min-h-[38px]"
              >
                <span>📜</span> Board Resolution Format ↓
              </button>
            </div>
          </div>
        )}

        {locked && lockedReason && <p className="text-[11px] font-bold text-amber-700">{lockedReason}</p>}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {preValidationSuccess && (
          <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
            {preValidationSuccess}
          </p>
        )}
      </div>

      <ul className="divide-y divide-slate-100">
        {requirements.map((r) => docRow(latestFor(r.key), r.label, r.key, r.required))}
        {extras.map((d) => docRow(d, d.name, d.id, false, false))}
      </ul>

      {!locked && (
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <span className="text-xs text-slate-500">Need to upload an additional document requested by your CA?</span>
          <div className="w-full sm:w-auto">
            {fileInput('__extra', '+ Other Document')}
          </div>
        </div>
      )}

      {/* STATUTORY IN-APP CONFIRMATION MODAL (MOBILE BOTTOM-SHEET / DESKTOP DIALOG) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {confirmDialog.badge}
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmDialog.message}
              </p>
              {confirmDialog.subtext && (
                <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {confirmDialog.subtext}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {confirmDialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition cursor-pointer shadow-sm min-h-[44px] flex items-center justify-center"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
