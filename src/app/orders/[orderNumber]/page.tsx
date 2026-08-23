'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import DocumentUploader from './DocumentUploader';
import PayButton from './PayButton';

type OrderStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'QUERY_RAISED' | 'APPROVED';

type CaseActor = { name: string; role: string } | null;
type CaseEvent = { id: string; eventType: string; title: string; message: string; createdAt: string; actor: CaseActor };
type CaseMessage = { id: string; body: string; readAt?: string | null; createdAt: string; sender: CaseActor };
type CaseReminder = { id: string; reminderType: string; title: string; dueAt: string; status: string };
type CaseDelivery = { id: string; deliveryType: string; title: string; documentId?: string | null; status: string; deliveredAt?: string | null };

type OrderDetail = {
  id: string;
  orderNumber: string;
  srn: string;
  state: string;
  amount: number;
  govtFee: number;
  taxAmount: number;
  paymentStatus: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string | null;
  assignmentNote?: string | null;
  professionalType?: string | null;
  completedAt?: string | null;
  service: { title: string; slug: string; sla: string; govtFeeNote: string };
  assignedCA?: { name: string; email: string } | null;
  documents: {
    id: string;
    name: string;
    category: string;
    status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
    rejectNote?: string | null;
    uploadedAt: string;
  }[];
  invoices: {
    id: string;
    invoiceNo: string;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    createdAt: string;
  }[];
  caseEvents: CaseEvent[];
  messages: CaseMessage[];
  delivery?: CaseDelivery | null;
  reminders: CaseReminder[];
};

const steps: { status: OrderStatus; title: string; description: string }[] = [
  { status: 'SUBMITTED', title: 'Request received', description: 'Your case has been created and is waiting for the service desk review.' },
  { status: 'IN_PROGRESS', title: 'Professional review', description: 'The assigned desk is checking your details and documents.' },
  { status: 'QUERY_RAISED', title: 'Customer action', description: 'We need a correction or additional document before the case can move forward.' },
  { status: 'APPROVED', title: 'Service completed', description: 'The available acknowledgement or approved output is ready in your workspace.' },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = String(params?.orderNumber || '');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [questionStatus, setQuestionStatus] = useState('');
  const [sendingQuestion, setSendingQuestion] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, { credentials: 'include' });
        const payload = await response.json();
        if (response.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderNumber}`)}`);
          return;
        }
        if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to load this case.');
        setOrder(payload.order);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to load this case.');
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [orderNumber, router]);

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || sendingQuestion) return;
    setSendingQuestion(true);
    setQuestionStatus('');
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: question }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to send your question.');
      setQuestion('');
      setQuestionStatus('Your question was sent to the service desk.');
    } catch (cause) {
      setQuestionStatus(cause instanceof Error ? cause.message : 'Unable to send your question.');
    } finally {
      setSendingQuestion(false);
    }
  }

  const currentIndex = useMemo(() => {
    if (!order) return -1;
    if (order.status === 'APPROVED') return 3;
    if (order.status === 'QUERY_RAISED') return 2;
    if (order.status === 'IN_PROGRESS') return 1;
    return 0;
  }, [order]);

  if (loading) return <PageState title="Loading your case…" description="We are checking the latest status and documents." />;
  if (error || !order) return <PageState title="Case unavailable" description={error || 'This case could not be found.'} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-[#0E7490]/40 bg-[#073B5C] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="inline-flex min-h-11 items-center text-xs font-bold text-white hover:text-[#F4B942]">← Back to dashboard</Link>
          <Link href="/" className="rounded-xl bg-[#0E7490] px-3 py-1 font-mono text-lg font-extrabold">Nyaya<span className="text-[#F4B942]">Link</span></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-3xl bg-gradient-to-br from-[#073B5C] to-[#0E7490] p-5 text-white shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100">Case {order.orderNumber}</p>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{order.service.title}</h1>
              <p className="mt-2 text-sm text-cyan-50">State: {order.state} · Started {formatDate(order.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:min-w-44"><p className="text-[11px] text-cyan-100">Current status</p><p className="mt-1 text-lg font-extrabold text-[#F4B942]">{order.status === 'QUERY_RAISED' ? 'Action needed' : order.status === 'APPROVED' ? 'Completed' : order.status === 'IN_PROGRESS' ? 'In progress' : 'Submitted'}</p></div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h2 className="text-lg font-extrabold text-[#073B5C]">Your case timeline</h2><p className="mt-1 text-xs text-slate-500">We will update this timeline when the case moves forward.</p></div><span className="text-xs font-bold text-slate-400">Reference: {order.srn}</span></div>
              <div className="mt-5 space-y-4">
                {steps.map((step, index) => {
                  const complete = index < currentIndex;
                  const active = index === currentIndex;
                  return <div key={step.status} className="flex gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${complete ? 'bg-emerald-100 text-emerald-800' : active ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-slate-100 text-slate-400'}`}>{complete ? '✓' : index + 1}</div><div className={`min-w-0 flex-1 rounded-2xl border p-3 ${active ? 'border-[#0E7490] bg-cyan-50/60' : 'border-slate-200 bg-slate-50'}`}><div className="flex flex-col justify-between gap-1 sm:flex-row"><h3 className="text-sm font-extrabold text-[#073B5C]">{step.title}</h3><span className="text-[11px] font-bold text-slate-400">{complete ? 'Done' : active ? 'Current step' : 'Next'}</span></div><p className="mt-1 text-xs leading-relaxed text-slate-600">{step.description}</p></div></div>;
                })}
              </div>
            </section>

            {order.status === 'QUERY_RAISED' && <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-amber-900">Action needed</p><p className="mt-1 text-sm text-amber-900">Please upload the document or clarification requested by the service desk.</p></section>}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-slate-100 pb-4"><h2 className="text-lg font-extrabold text-[#073B5C]">Latest case activity</h2><p className="mt-1 text-xs text-slate-500">Updates from the NyayLink team will appear here.</p></div>
              <div className="mt-4 space-y-3">
                {order.caseEvents.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-500">No additional case updates yet.</p> : order.caseEvents.map((event) => <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-sm font-extrabold text-[#073B5C]">{event.title}</p><span className="text-[11px] text-slate-400">{formatDate(event.createdAt)}</span></div><p className="mt-1 text-xs leading-relaxed text-slate-600">{event.message}</p>{event.actor?.name && <p className="mt-2 text-[10px] font-semibold text-slate-400">Updated by {event.actor.name}</p>}</div>)}
              </div>
              {order.messages.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-extrabold text-[#073B5C]">Messages</h3><div className="mt-3 space-y-2">{order.messages.map((message) => <div key={message.id} className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3"><p className="text-xs leading-relaxed text-slate-700">{message.body}</p><p className="mt-1 text-[10px] text-slate-400">{message.sender?.name || 'NyayLink team'} · {formatDate(message.createdAt)}</p></div>)}</div></div>}
            </section>

            <section className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-extrabold text-[#073B5C]">Ask the service desk</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Ask a question about your checklist, payment, status, or next step. Do not include passwords or unrelated sensitive information.</p>
              <form onSubmit={submitQuestion} className="mt-4 space-y-3">
                <textarea required value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={2000} rows={3} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]" placeholder="How do I provide the premises proof?" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><button type="submit" disabled={sendingQuestion || !question.trim()} className="min-h-11 rounded-xl bg-[#073B5C] px-4 text-xs font-extrabold text-[#F4B942] disabled:opacity-50">{sendingQuestion ? 'Sending…' : 'Send question'}</button>{questionStatus && <p role="status" className="text-xs text-slate-600">{questionStatus}</p>}</div>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-extrabold text-[#073B5C]">Documents for this case</h2><p className="mt-1 text-xs text-slate-500">Only upload documents requested for this service.</p></div><DocumentUploader orderId={order.id} documentName="Additional case document" /></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{order.documents.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 sm:col-span-2">No documents uploaded yet.</p> : order.documents.map((document) => <div key={document.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold text-[#073B5C]">{document.name}</p><p className="mt-1 text-[11px] text-slate-500">{document.category} · {formatDate(document.uploadedAt)}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{document.status === 'PENDING_REVIEW' ? 'Under review' : document.status === 'VERIFIED' ? 'Verified' : 'Replace'}</span></div>{document.status === 'REJECTED' && document.rejectNote && <p className="mt-2 text-[11px] text-rose-700">{document.rejectNote}</p>}<div className="mt-2"><DocumentUploader orderId={order.id} documentId={document.id} existingFileName={document.name} documentName={document.category} /></div></div>)}</div></section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold text-[#073B5C]">Payment summary</h2><div className="mt-4 space-y-2 text-xs"><div className="flex justify-between gap-3"><span className="text-slate-500">Professional fee</span><strong>{formatMoney(order.amount - order.govtFee - order.taxAmount)}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">GST</span><strong>{formatMoney(order.taxAmount)}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">Known government fee</span><strong>{formatMoney(order.govtFee)}</strong></div><div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-sm"><span className="font-extrabold text-[#073B5C]">Total payable</span><strong className="text-[#073B5C]">{formatMoney(order.amount)}</strong></div><div className="flex justify-between gap-3"><span className="font-extrabold text-[#073B5C]">Payment status</span><strong className={order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}>{order.paymentStatus}</strong></div></div>{order.paymentStatus !== 'PAID' && <div className="mt-4"><PayButton orderId={order.id} orderNumber={order.orderNumber} amount={order.amount} serviceTitle={order.service.title} clientName="" clientEmail="" clientPhone="" currentStatus={order.paymentStatus} /></div>}<p className="mt-3 text-[11px] leading-relaxed text-slate-400">Government charges, taxes, and authority-driven costs are shown separately where applicable.</p></section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold text-[#073B5C]">Assigned desk</h2><p className="mt-2 text-sm font-bold text-slate-800">{order.assignedCA?.name || 'Service desk assignment pending'}</p><p className="mt-1 text-xs text-slate-500">{order.assignedCA?.email || `Expected service time: ${order.service.sla}`}</p>{order.professionalType && <p className="mt-2 text-[11px] font-semibold text-slate-500">Role: {order.professionalType}</p>}{order.assignmentNote && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">{order.assignmentNote}</p>}<a href="mailto:info@nyayalink.com" className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-[#0E7490] underline">Contact support</a></section>

            {order.delivery && <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><h2 className="text-base font-extrabold text-emerald-900">Final delivery</h2><p className="mt-2 text-sm font-bold text-emerald-900">{order.delivery.title}</p><p className="mt-1 text-xs text-emerald-800">Status: {order.delivery.status}</p>{order.delivery.deliveredAt && <p className="mt-1 text-[11px] text-emerald-700">Delivered {formatDate(order.delivery.deliveredAt)}</p>}{order.delivery.documentId && <Link href={`/api/documents/${order.delivery.documentId}/download`} className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-emerald-800 underline">Download delivered document</Link>}</section>}

            {order.reminders.length > 0 && <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><h2 className="text-base font-extrabold text-amber-900">Upcoming compliance</h2><div className="mt-3 space-y-2">{order.reminders.map((reminder) => <div key={reminder.id} className="rounded-xl bg-white/70 p-3"><p className="text-xs font-extrabold text-amber-900">{reminder.title}</p><p className="mt-1 text-[11px] text-amber-800">Due {formatDate(reminder.dueAt)}</p></div>)}</div></section>}

            {order.invoices.length > 0 && <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold text-[#073B5C]">Latest invoice</h2><p className="mt-2 text-sm font-bold text-slate-800">{order.invoices[0].invoiceNo}</p><p className="mt-1 text-xs text-slate-500">{formatMoney(order.invoices[0].totalAmount)} · {formatDate(order.invoices[0].createdAt)}</p></section>}
          </aside>
        </div>
      </main>
    </div>
  );
}

function PageState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm"><h1 className="text-lg font-extrabold text-[#073B5C]">{title}</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p><Link href="/dashboard" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#073B5C] px-4 text-xs font-extrabold text-[#F4B942]">Back to dashboard</Link></div></div>;
}
