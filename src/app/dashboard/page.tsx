'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type OrderStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'QUERY_RAISED' | 'APPROVED';
type DocumentStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

type Order = {
  id: string;
  orderNumber: string;
  srn: string;
  state: string;
  amount: number;
  govtFee: number;
  paymentStatus: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  service: { title: string; slug: string; sla: string };
  assignedCA?: { name: string; email: string } | null;
  documents: Document[];
  invoices: Invoice[];
};

type Document = {
  id: string;
  name: string;
  category: string;
  status: DocumentStatus;
  uploadedAt: string;
};

type Invoice = {
  id: string;
  invoiceNo: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  createdAt: string;
};

type View = 'overview' | 'orders' | 'documents' | 'billing';

const statusCopy: Record<OrderStatus, { label: string; tone: string }> = {
  SUBMITTED: { label: 'Submitted', tone: 'bg-blue-50 text-blue-800 border-blue-200' },
  IN_PROGRESS: { label: 'In progress', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  QUERY_RAISED: { label: 'Action needed', tone: 'bg-rose-50 text-rose-800 border-rose-200' },
  APPROVED: { label: 'Completed', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

const documentCopy: Record<DocumentStatus, { label: string; tone: string }> = {
  PENDING_REVIEW: { label: 'Under review', tone: 'bg-amber-50 text-amber-800' },
  VERIFIED: { label: 'Verified', tone: 'bg-emerald-50 text-emerald-800' },
  REJECTED: { label: 'Needs replacement', tone: 'bg-rose-50 text-rose-800' },
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function CustomerDashboard() {
  const [view, setView] = useState<View>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadOrderId, setUploadOrderId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Identity or address proof');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', { credentials: 'include' });
      const payload = await response.json();

      if (response.status === 401) {
        window.location.assign('/login?callbackUrl=/dashboard');
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to load your cases.');
      }

      setOrders(payload.orders ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your cases.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const documents = useMemo(
    () => orders.flatMap((order) => order.documents.map((document) => ({ ...document, order }))),
    [orders],
  );
  const invoices = useMemo(() => orders.flatMap((order) => order.invoices), [orders]);
  const attentionOrder = orders.find((order) => order.status === 'QUERY_RAISED');
  const paidTotal = orders
    .filter((order) => order.paymentStatus === 'PAID')
    .reduce((total, order) => total + order.amount, 0);

  function openUpload(orderId = orders[0]?.id ?? '') {
    setUploadOrderId(orderId);
    setUploadFile(null);
    setUploadMessage('');
    setShowUpload(true);
  }

  async function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadMessage('');

    if (!uploadOrderId || !uploadFile) {
      setUploadMessage('Choose a case and a document first.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('orderId', uploadOrderId);
    formData.append('documentName', uploadCategory);
    formData.append('file', uploadFile);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Upload failed.');
      }

      setShowUpload(false);
      await loadOrders();
    } catch (cause) {
      setUploadMessage(cause instanceof Error ? cause.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-[#0E7490]/40 bg-[#073B5C] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0 rounded-xl bg-[#0E7490] px-3 py-1 font-mono text-xl font-extrabold shadow">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href="tel:+919920054785" className="hidden min-h-11 items-center rounded-xl border border-white/20 px-3 text-xs font-bold text-[#F4B942] sm:inline-flex">
              Call support
            </a>
            <Link href="/" className="min-h-11 inline-flex items-center rounded-xl bg-[#F4B942] px-3 text-xs font-extrabold text-[#073B5C]">
              Exit dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_1fr] lg:py-8">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Customer workspace</p>
            <h1 className="mt-1 text-lg font-extrabold text-[#073B5C]">My NyayLink cases</h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Track services, documents, payments, and the next step in one place.
            </p>
          </div>

          <nav aria-label="Customer dashboard" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-4 lg:grid-cols-1">
            {([
              ['overview', 'Overview'],
              ['orders', 'My cases'],
              ['documents', 'Documents'],
              ['billing', 'Payments'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`min-h-11 rounded-xl px-3 py-2 text-left text-xs font-extrabold transition ${
                  view === key ? 'bg-[#073B5C] text-[#F4B942]' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden rounded-2xl bg-gradient-to-br from-[#073B5C] to-[#0E7490] p-5 text-white shadow-sm lg:block">
            <p className="text-xs font-extrabold text-[#F4B942]">Need help?</p>
            <p className="mt-2 text-xs leading-relaxed text-cyan-50">Call the Mumbai support desk or email us with your case number.</p>
            <a href="mailto:info@nyayalink.com" className="mt-3 inline-block text-xs font-bold text-white underline">info@nyayalink.com</a>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#0E7490]">Customer dashboard</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#073B5C]">Your work in progress</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void loadOrders()} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Refresh
              </button>
              <Link href="/#catalog-section" className="inline-flex min-h-11 items-center rounded-xl bg-[#0E7490] px-4 text-xs font-extrabold text-white shadow-sm hover:bg-cyan-800">
                Start a service
              </Link>
            </div>
          </div>

          {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-bold text-[#073B5C]">Loading your cases…</p>
              <p className="mt-1 text-xs text-slate-500">We are checking your latest service updates.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">📋</div>
              <h3 className="mt-4 text-lg font-extrabold text-[#073B5C]">No cases yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Choose a service to start. After you sign in and place an order, your case timeline will appear here.</p>
              <Link href="/#catalog-section" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#073B5C] px-5 text-xs font-extrabold text-[#F4B942]">Explore services</Link>
            </div>
          ) : (
            <>
              {attentionOrder && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-amber-900">Action needed</p>
                    <p className="mt-1 text-sm text-amber-900">Your {attentionOrder.service.title} case needs a response or document.</p>
                  </div>
                  <button type="button" onClick={() => { setView('documents'); openUpload(attentionOrder.id); }} className="min-h-11 rounded-xl bg-amber-600 px-4 text-xs font-extrabold text-white hover:bg-amber-700">Add document</button>
                </div>
              )}

              {view === 'overview' && (
                <div className="space-y-5">
                  <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['Active cases', String(orders.filter((order) => order.status !== 'APPROVED').length)],
                      ['Completed', String(orders.filter((order) => order.status === 'APPROVED').length)],
                      ['Documents', String(documents.length)],
                      ['Paid total', formatMoney(paidTotal)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-bold text-slate-400">{label}</p>
                        <p className="mt-2 truncate text-lg font-extrabold text-[#073B5C]">{value}</p>
                      </div>
                    ))}
                  </section>

                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#073B5C]">Latest cases</h3>
                        <p className="text-xs text-slate-500">Your newest applications and their current status.</p>
                      </div>
                      <button type="button" onClick={() => setView('orders')} className="text-xs font-bold text-[#0E7490] underline">View all</button>
                    </div>
                    <div className="grid gap-3">
                      {orders.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} onUpload={() => openUpload(order.id)} />)}
                    </div>
                  </section>
                </div>
              )}

              {view === 'orders' && (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#073B5C]">My cases</h3>
                    <p className="text-xs text-slate-500">Keep your order number ready when contacting support.</p>
                  </div>
                  <div className="grid gap-3">{orders.map((order) => <OrderCard key={order.id} order={order} onUpload={() => openUpload(order.id)} />)}</div>
                </section>
              )}

              {view === 'documents' && (
                <section className="space-y-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#073B5C]">Private documents</h3>
                      <p className="text-xs text-slate-500">Only upload documents requested for one of your cases.</p>
                    </div>
                    <button type="button" onClick={() => openUpload()} className="min-h-11 rounded-xl bg-[#073B5C] px-4 text-xs font-extrabold text-[#F4B942]">Upload document</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {documents.length === 0 ? <EmptyCard text="No documents have been uploaded yet." /> : documents.map(({ order, ...document }) => <DocumentCard key={document.id} document={document} orderNumber={order.orderNumber} />)}
                  </div>
                </section>
              )}

              {view === 'billing' && (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#073B5C]">Payments and invoices</h3>
                    <p className="text-xs text-slate-500">Your order amount and issued invoices from NyayLink.</p>
                  </div>
                  {invoices.length === 0 ? <EmptyCard text="Invoices will appear here after payment and issuance." /> : (
                    <div className="grid gap-3">{invoices.map((invoice) => <div key={invoice.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-xs font-extrabold text-[#073B5C]">{invoice.invoiceNo}</p><p className="mt-1 text-xs text-slate-500">Issued {formatDate(invoice.createdAt)}</p></div><p className="text-lg font-extrabold text-[#073B5C]">{formatMoney(invoice.totalAmount)}</p></div><p className="mt-3 text-xs text-slate-500">Taxable amount {formatMoney(invoice.taxableAmount)} · GST included in total</p></div>)}</div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="upload-title" className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><h3 id="upload-title" className="text-base font-extrabold text-[#073B5C]">Upload a case document</h3><button type="button" onClick={() => setShowUpload(false)} aria-label="Close upload dialog" className="min-h-11 min-w-11 rounded-xl text-xl text-slate-400 hover:bg-slate-100">×</button></div>
            <form onSubmit={submitUpload} className="mt-5 space-y-4">
              <label className="block text-xs font-bold text-[#073B5C]">Case<select required value={uploadOrderId} onChange={(event) => setUploadOrderId(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm"><option value="">Select a case</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.service.title} · {order.orderNumber}</option>)}</select></label>
              <label className="block text-xs font-bold text-[#073B5C]">Document type<select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm"><option>Identity or address proof</option><option>Business registration document</option><option>Premises or utility proof</option><option>GST or tax document</option><option>Other requested document</option></select></label>
              <label className="block text-xs font-bold text-[#073B5C]">File<span className="mt-1.5 block rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-medium text-slate-500">Choose PDF, JPG, or PNG up to 10 MB<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-xs" /></span></label>
              {uploadMessage && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{uploadMessage}</p>}
              <button type="submit" disabled={uploading} className="min-h-11 w-full rounded-xl bg-[#073B5C] px-4 text-xs font-extrabold text-[#F4B942] disabled:opacity-60">{uploading ? 'Uploading…' : 'Upload securely'}</button>
              <p className="text-center text-[11px] leading-relaxed text-slate-400">Do not upload passwords or documents that are not requested for this case.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpload }: { order: Order; onUpload: () => void }) {
  const status = statusCopy[order.status];
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${status.tone}`}>{status.label}</span><span className="text-[11px] font-bold text-slate-400">{order.orderNumber}</span></div><h4 className="mt-2 text-base font-extrabold text-[#073B5C]">{order.service.title}</h4><p className="mt-1 text-xs text-slate-500">State: {order.state} · Started {formatDate(order.createdAt)}</p></div><p className="text-lg font-extrabold text-[#073B5C]">{formatMoney(order.amount)}</p></div><div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center"><p className="text-xs text-slate-500">{order.assignedCA ? `Assigned desk: ${order.assignedCA.name}` : 'A service professional will be assigned after review.'}</p><div className="flex flex-wrap gap-2"><Link href={`/orders/${order.orderNumber}`} className="min-h-11 inline-flex items-center rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">Open case</Link><button type="button" onClick={onUpload} className="min-h-11 rounded-xl bg-[#0E7490] px-3 text-xs font-extrabold text-white hover:bg-cyan-800">Add document</button></div></div></article>;
}

function DocumentCard({ document, orderNumber }: { document: Document; orderNumber: string }) {
  const status = documentCopy[document.status];
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="rounded-xl bg-cyan-50 p-2 text-xl">📄</span><div className="min-w-0"><h4 className="truncate text-sm font-extrabold text-[#073B5C]">{document.name}</h4><p className="mt-1 text-[11px] text-slate-500">{document.category} · Case {orderNumber}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${status.tone}`}>{status.label}</span></div><div className="mt-3 flex flex-col justify-between gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center"><p className="text-[11px] text-slate-400">Uploaded {formatDate(document.uploadedAt)} · Private access only.</p><a href={`/api/documents/${document.id}/download`} className="text-xs font-extrabold text-[#0E7490] underline">Download securely</a></div></article>;
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">{text}</div>;
}
