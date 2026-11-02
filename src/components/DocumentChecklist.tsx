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
      let uploadSucceeded = false;

      // 1. Attempt high-speed direct S3 streaming to bypass Vercel 4.5MB request limit
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
            // Direct streaming to AWS S3 (encrypted AES256)
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

      // 2. Standard server route fallback (for local development or if S3 direct fails)
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
                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-lg transition text-left cursor-pointer"
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
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
                <button
                  onClick={() => review(doc!.id, 'REJECTED')}
                  disabled={rejectNote.trim().length < 5 || busyKey !== null}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  Send Rejection
                </button>
                <button
                  type="button"
                  onClick={() => { setRejecting(null); setRejectNote(''); }}
                  className="bg-slate-200 text-slate-700 font-semibold text-[11px] px-3 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
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
        
        {mode === 'client' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-[#0E7490] tracking-wider block">
              📄 Official Drafting Templates (Downloadable Formats)
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => downloadTemplate('noc')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>🏢</span> Landlord NOC Template ↓
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('dir2')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>✍️</span> Form DIR-2 (Consent) ↓
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('board_res')}
                className="bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>📜</span> Board Resolution Format ↓
              </button>
            </div>
          </div>
        )}

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
