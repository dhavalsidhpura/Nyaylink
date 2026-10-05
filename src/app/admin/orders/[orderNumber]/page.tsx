import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, isStaff, orderAccess, ROLE_GROUPS } from '@/lib/authz';
import { plain } from '@/lib/serialize';
import { formatINR, stateName } from '@/lib/pricing';
import StatusSelector from '@/app/admin/orders/StatusSelector';
import DocumentChecklist from '@/components/DocumentChecklist';
import OrderMessages from '@/components/OrderMessages';
import OrderProgress from '@/components/OrderProgress';
import { AssignSelector, PaymentRequestForm, RefundButton } from './AdminOrderActions';

export const dynamic = 'force-dynamic';

interface AdminOrderPageProps {
  params: { orderNumber: string };
}

export default async function AdminOrderReviewPage({ params }: AdminOrderPageProps) {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) redirect('/login');

  const raw = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      service: { include: { requirements: { orderBy: { sortOrder: 'asc' } } } },
      client: { select: { id: true, name: true, email: true, phone: true, gstin: true } },
      documents: { orderBy: { uploadedAt: 'desc' } },
      statusLogs: { orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true } } } },
      payments: { orderBy: { createdAt: 'asc' } },
      invoices: { select: { invoiceNo: true } },
    },
  });
  if (!raw) notFound();

  const isFinance = ROLE_GROUPS.finance.includes(user.role);
  const caseAccess = orderAccess(user, raw) === 'staff';
  if (!caseAccess && !isFinance) notFound();

  const order = plain(raw);
  const canAssign = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD'].includes(user.role);
  const canRequestPayment = ['SUPER_ADMIN', 'OPS_MANAGER', 'FINANCE_MANAGER', 'CA_CS_LEAD'].includes(user.role);
  const assignable = canAssign
    ? await prisma.user.findMany({
        where: { role: { in: ROLE_GROUPS.assignable } },
        select: { id: true, name: true, role: true, _count: { select: { assignedOrders: { where: { status: { notIn: ['APPROVED', 'REJECTED'] } } } } } },
        orderBy: { name: 'asc' },
      })
    : [];
  const intake = (order.intakeData as Record<string, string> | null) || {};

  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-[#073B5C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/admin/orders" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Operations Console
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-200">{user.role.replace(/_/g, ' ')}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Reference</span>
              <h1 className="text-xl font-extrabold text-[#073B5C] font-mono">{order.orderNumber}</h1>
              <p className="text-sm font-bold text-slate-700">{order.service.title}</p>
              <p className="text-xs text-slate-500">
                {formatINR(order.totalAmount)} · {order.paymentStatus.replace(/_/g, ' ')} · Paid {formatINR(order.amountPaid)} · Place of supply{' '}
                {stateName(order.clientState)}
              </p>
            </div>
            <OrderProgress status={order.status} />
          </div>
          {caseAccess && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status & Government Reference</span>
              <StatusSelector orderId={order.id} currentStatus={order.status} currentSrn={order.srn} />
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {caseAccess && (
              <DocumentChecklist
                orderId={order.id}
                mode="staff"
                requirements={order.service.requirements}
                documents={order.documents}
                locked={order.status === 'APPROVED' || order.status === 'REJECTED'}
              />
            )}
            {caseAccess && <OrderMessages orderNumber={order.orderNumber} mode="staff" />}

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Client Intake</h3>
              {Object.keys(intake).length === 0 ? (
                <p className="text-xs text-slate-400">No intake answers captured.</p>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(intake).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <dt className="text-[10px] uppercase font-bold text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</dt>
                      <dd className="font-bold text-slate-800 break-words">{String(val) || '—'}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-2 text-xs">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Client</h3>
              <p className="font-bold text-slate-800">{order.client.name}</p>
              <a href={`mailto:${order.client.email}`} className="block text-[#0E7490] hover:underline">
                {order.client.email}
              </a>
              {order.client.phone && (
                <a href={`tel:${order.client.phone}`} className="block text-[#0E7490] hover:underline">
                  {order.client.phone}
                </a>
              )}
              {order.client.gstin && <p className="font-mono text-slate-600">GSTIN {order.client.gstin}</p>}
            </section>

            {canAssign && (
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-2">
                <h3 className="font-extrabold text-[#073B5C] text-sm">Assigned Desk</h3>
                <AssignSelector
                  orderId={order.id}
                  currentId={order.assignedCAId}
                  staff={assignable.map((s) => ({ id: s.id, name: s.name, role: s.role, activeCases: s._count.assignedOrders }))}
                />
              </section>
            )}

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Payments</h3>
              <ul className="space-y-2">
                {order.payments.map((p) => (
                  <li key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between gap-2">
                      <strong className="text-slate-800">{formatINR(p.amount)}</strong>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {p.kind} · {p.status}
                      </span>
                    </div>
                    <p className="text-slate-500">{p.description}</p>
                    {p.gatewayPaymentId && <p className="font-mono text-[10px] text-slate-400">{p.gatewayPaymentId}</p>}
                    {isFinance && p.status === 'CAPTURED' && <RefundButton paymentId={p.id} amount={p.amount} />}
                  </li>
                ))}
              </ul>
              {order.invoices.map((inv) => (
                <Link key={inv.invoiceNo} href={`/invoices/${encodeURIComponent(inv.invoiceNo)}`} className="block text-[#0E7490] font-bold hover:underline">
                  🧾 {inv.invoiceNo}
                </Link>
              ))}
              {canRequestPayment && order.paymentStatus !== 'UNPAID' && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Request additional payment</span>
                  <PaymentRequestForm orderId={order.id} />
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="font-extrabold text-[#073B5C] text-sm">Audit Trail</h3>
              <ol className="space-y-3 text-xs">
                {order.statusLogs.map((log) => (
                  <li key={log.id} className="border-l-2 border-[#0E7490] pl-3">
                    <div className="flex justify-between gap-2 text-slate-500">
                      <strong className="text-slate-700">{log.status.replace(/_/g, ' ')}</strong>
                      <span className="shrink-0">{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    {log.remarks && <p className="text-slate-600">{log.remarks}</p>}
                    <p className="text-[10px] text-slate-400">by {log.actor?.name || 'System'}</p>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
