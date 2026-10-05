import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, orderAccess } from '@/lib/authz';
import { plain } from '@/lib/serialize';
import { formatINR, splitGst, stateName } from '@/lib/pricing';
import DocumentChecklist from '@/components/DocumentChecklist';
import OrderMessages from '@/components/OrderMessages';
import OrderProgress from '@/components/OrderProgress';
import PayNowButton from '@/components/PayNowButton';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  DOCS_PENDING: 'Awaiting Documents',
  IN_PROGRESS: 'In Progress',
  QUERY_RAISED: 'Query Raised',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

interface Props {
  params: { orderNumber: string };
}

export default async function OrderTrackingPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=/orders/${encodeURIComponent(params.orderNumber)}`);

  const raw = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      service: { include: { requirements: { orderBy: { sortOrder: 'asc' } } } },
      assignedCA: { select: { name: true } },
      documents: { orderBy: { uploadedAt: 'desc' } },
      statusLogs: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      invoices: { select: { invoiceNo: true, totalAmount: true, createdAt: true } },
    },
  });

  // Same 404 for "doesn't exist" and "not yours" so order numbers can't be probed.
  const access = raw ? orderAccess(user, raw) : null;
  if (!raw || !access) notFound();
  if (access === 'staff') redirect(`/admin/orders/${raw.orderNumber}`);

  const order = plain(raw);
  const gst = splitGst(order.gstAmount, order.clientState);
  const duePayments = order.payments.filter((p) => p.status === 'CREATED' || p.status === 'FAILED');
  const closed = order.status === 'APPROVED' || order.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-[#073B5C] text-white border-b border-[#0E7490]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="bg-[#0E7490] text-white font-extrabold text-lg px-3 py-1 rounded-xl font-mono">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← My Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md uppercase">
                Order #{order.orderNumber}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#073B5C]">{order.service.title}</h1>
              <p className="text-xs text-slate-500">
                Expected timeline: {order.service.sla} · Desk: <strong>{order.assignedCA?.name || 'Being assigned'}</strong>
              </p>
              {order.srn && (
                <p className="text-xs text-slate-600">
                  Government SRN/ARN: <strong className="font-mono">{order.srn}</strong>
                </p>
              )}
            </div>
            <span className="self-start text-[10px] font-extrabold px-3 py-1 rounded-full uppercase bg-slate-100 text-[#073B5C]">
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <OrderProgress status={order.status} />
        </section>

        {duePayments.length > 0 && (
          <section className="bg-amber-50 border border-amber-300 rounded-3xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-amber-900">Payment due</h2>
            {duePayments.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-amber-200">
                <div className="text-xs">
                  <strong className="text-[#073B5C] block">{p.description}</strong>
                  <span className="text-slate-500">
                    {formatINR(p.amount)}
                    {p.gstAmount > 0 ? ` incl. ${formatINR(p.gstAmount)} GST` : ' (government fee, no GST)'}
                  </span>
                </div>
                <PayNowButton paymentId={p.id} amount={p.amount} />
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DocumentChecklist
              orderId={order.id}
              mode="client"
              requirements={order.service.requirements}
              documents={order.documents}
              locked={closed || order.paymentStatus === 'UNPAID'}
              lockedReason={
                order.paymentStatus === 'UNPAID' ? 'Complete payment to start uploading documents.' : closed ? 'This application is closed.' : undefined
              }
            />
            <OrderMessages orderNumber={order.orderNumber} mode="client" />
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-2 text-xs">
              <h3 className="font-extrabold text-[#073B5C] text-sm mb-2">Price breakdown</h3>
              <Row label="Professional fee" value={formatINR(order.professionalFee)} />
              {gst.intraState ? (
                <>
                  <Row label="CGST (9%)" value={formatINR(gst.cgst)} />
                  <Row label="SGST (9%)" value={formatINR(gst.sgst)} />
                </>
              ) : (
                <Row label="IGST (18%)" value={formatINR(gst.igst)} />
              )}
              {order.govtFee > 0 && <Row label="Government fees (at actuals)" value={formatINR(order.govtFee)} />}
              <div className="border-t border-slate-100 pt-2">
                <Row label="Total" value={formatINR(order.totalAmount)} bold />
                <Row label="Paid" value={formatINR(order.amountPaid)} />
              </div>
              <p className="text-[10px] text-slate-400">Place of supply: {stateName(order.clientState)}</p>
              {order.invoices.length > 0 && (
                <div className="pt-2 space-y-1">
                  {order.invoices.map((inv) => (
                    <Link key={inv.invoiceNo} href={`/invoices/${encodeURIComponent(inv.invoiceNo)}`} className="block text-[#0E7490] font-bold hover:underline">
                      🧾 Tax invoice {inv.invoiceNo}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="font-extrabold text-[#073B5C] text-sm">History</h3>
              <ol className="space-y-3">
                {order.statusLogs.map((log) => (
                  <li key={log.id} className="border-l-2 border-cyan-500 pl-3 text-xs">
                    <div className="flex justify-between gap-2 text-slate-500">
                      <strong className="text-slate-700">{STATUS_LABEL[log.status] || log.status.replace(/_/g, ' ').toLowerCase()}</strong>
                      <span className="shrink-0">{new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {log.remarks && <p className="text-slate-600 mt-0.5">{log.remarks}</p>}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-extrabold text-[#073B5C]' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
