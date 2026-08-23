'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Professional = { id: string; name: string; email: string; role: string };
type DocumentOption = { id: string; name: string; status: string };

type StaffCaseControlsProps = {
  orderId: string;
  currentAssigneeId: string | null;
  currentProfessionalType: string | null;
  currentAssignmentNote: string | null;
  professionals: Professional[];
  documents: DocumentOption[];
};

export default function StaffCaseControls({
  orderId,
  currentAssigneeId,
  currentProfessionalType,
  currentAssignmentNote,
  professionals,
  documents,
}: StaffCaseControlsProps) {
  const router = useRouter();
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId || '');
  const [professionalType, setProfessionalType] = useState(currentProfessionalType || 'Compliance professional');
  const [assignmentNote, setAssignmentNote] = useState(currentAssignmentNote || '');
  const [message, setMessage] = useState('');
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('READY');
  const [deliveryDocumentId, setDeliveryDocumentId] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function submit(path: string, method: 'POST' | 'PATCH', body: Record<string, unknown>, action: string) {
    setBusy(action);
    setNotice('');
    setError('');
    try {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'The action could not be completed.');
      setNotice('Saved successfully.');
      router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The action could not be completed.');
      return false;
    } finally {
      setBusy('');
    }
  }

  async function handleAssignment(event: React.FormEvent) {
    event.preventDefault();
    await submit('/api/admin/orders/assign', 'PATCH', {
      orderId,
      assignedCAId: assigneeId || null,
      professionalType,
      assignmentNote,
    }, 'assignment');
  }

  async function handleMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    const saved = await submit('/api/admin/orders/message', 'POST', { orderId, message }, 'message');
    if (saved) setMessage('');
  }

  async function handleDelivery(event: React.FormEvent) {
    event.preventDefault();
    if (!deliveryTitle.trim()) return;
    const saved = await submit('/api/admin/orders/delivery', 'PATCH', {
      orderId,
      title: deliveryTitle,
      deliveryType: 'Government or professional output',
      documentId: deliveryDocumentId || null,
      status: deliveryStatus,
    }, 'delivery');
    if (saved) setDeliveryTitle('');
  }

  async function handleReminder(event: React.FormEvent) {
    event.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;
    const saved = await submit('/api/admin/orders/reminder', 'POST', {
      orderId,
      title: reminderTitle,
      reminderType: 'COMPLIANCE',
      dueAt: new Date(`${reminderDate}T09:00:00`).toISOString(),
    }, 'reminder');
    if (saved) {
      setReminderTitle('');
      setReminderDate('');
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-indigo-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Case operations</h2>
          <p className="mt-1 text-xs text-slate-600">Assign the case, send a customer update, publish a verified output, or record a confirmed future reminder.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Staff only</span>
      </div>

      {(notice || error) && <p role={error ? 'alert' : 'status'} className={`mt-4 rounded-xl p-3 text-xs ${error ? 'border border-rose-200 bg-rose-50 text-rose-800' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}</p>}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={handleAssignment} className="space-y-3 rounded-xl border border-white bg-white p-4">
          <h3 className="text-sm font-extrabold text-slate-900">Professional assignment</h3>
          <label className="block text-xs font-semibold text-slate-700">Assign to
            <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs">
              <option value="">Assignment pending</option>
              {professionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.name} · {professional.role}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">Role label
            <input value={professionalType} onChange={(event) => setProfessionalType(event.target.value)} maxLength={100} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" placeholder="Compliance professional" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Customer-facing note
            <textarea value={assignmentNote} onChange={(event) => setAssignmentNote(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" placeholder="What should the customer know?" />
          </label>
          <button disabled={busy === 'assignment'} className="min-h-10 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50">{busy === 'assignment' ? 'Saving…' : 'Save assignment'}</button>
        </form>

        <form onSubmit={handleMessage} className="space-y-3 rounded-xl border border-white bg-white p-4">
          <h3 className="text-sm font-extrabold text-slate-900">Send customer update</h3>
          <p className="text-[11px] leading-5 text-slate-500">This appears in the customer’s case activity and message area.</p>
          <textarea required value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={5} className="w-full rounded-lg border border-slate-300 p-2.5 text-xs" placeholder="Please upload the address proof, or confirm the business activity…" />
          <button disabled={busy === 'message'} className="min-h-10 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50">{busy === 'message' ? 'Sending…' : 'Send update'}</button>
        </form>

        <form onSubmit={handleDelivery} className="space-y-3 rounded-xl border border-white bg-white p-4">
          <h3 className="text-sm font-extrabold text-slate-900">Publish final output</h3>
          <label className="block text-xs font-semibold text-slate-700">Output title
            <input required value={deliveryTitle} onChange={(event) => setDeliveryTitle(event.target.value)} maxLength={200} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" placeholder="Certificate of Incorporation" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Verified vault document
            <select value={deliveryDocumentId} onChange={(event) => setDeliveryDocumentId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs">
              <option value="">No document selected</option>
              {documents.filter((document) => document.status === 'VERIFIED').map((document) => <option key={document.id} value={document.id}>{document.name}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">Delivery status
            <select value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs"><option value="READY">Ready for customer</option><option value="DELIVERED">Delivered / complete</option><option value="PENDING">Pending</option></select>
          </label>
          <p className="text-[10px] leading-4 text-slate-500">A verified vault document is required for “Delivered / complete”.</p>
          <button disabled={busy === 'delivery'} className="min-h-10 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50">{busy === 'delivery' ? 'Saving…' : 'Save delivery'}</button>
        </form>

        <form onSubmit={handleReminder} className="space-y-3 rounded-xl border border-white bg-white p-4">
          <h3 className="text-sm font-extrabold text-slate-900">Add future compliance reminder</h3>
          <label className="block text-xs font-semibold text-slate-700">Reminder title
            <input required value={reminderTitle} onChange={(event) => setReminderTitle(event.target.value)} maxLength={200} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" placeholder="Annual return review" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Confirmed due date
            <input required type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" />
          </label>
          <p className="text-[10px] leading-4 text-slate-500">Only enter a date confirmed by the responsible professional; the portal will not invent statutory deadlines.</p>
          <button disabled={busy === 'reminder'} className="min-h-10 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50">{busy === 'reminder' ? 'Saving…' : 'Add reminder'}</button>
        </form>
      </div>
    </section>
  );
}
