'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DocumentStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export default function DocumentReviewSelector({ documentId, currentStatus }: { documentId: string; currentStatus: DocumentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<DocumentStatus>(currentStatus);
  const [rejectNote, setRejectNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function updateStatus(nextStatus: DocumentStatus) {
    if (nextStatus === 'REJECTED' && !rejectNote.trim()) {
      setError('Add a replacement reason first.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/documents/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, status: nextStatus, rejectNote }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to update document status.');
      setStatus(nextStatus);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update document status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-48 space-y-2">
      <select value={status} disabled={busy} onChange={(event) => void updateStatus(event.target.value as DocumentStatus)} className="w-full rounded-lg border border-slate-300 bg-white p-2 text-[11px] font-bold text-slate-700">
        <option value="PENDING_REVIEW">Pending review</option>
        <option value="VERIFIED">Verified</option>
        <option value="REJECTED">Needs replacement</option>
      </select>
      {status === 'REJECTED' && <input value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} maxLength={500} placeholder="Reason for replacement" className="w-full rounded-lg border border-rose-200 p-2 text-[11px]" />}
      {status === 'REJECTED' && <button type="button" disabled={busy} onClick={() => void updateStatus('REJECTED')} className="rounded-lg bg-rose-700 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Save reason</button>}
      {error && <p role="alert" className="text-[10px] text-rose-700">{error}</p>}
    </div>
  );
}
