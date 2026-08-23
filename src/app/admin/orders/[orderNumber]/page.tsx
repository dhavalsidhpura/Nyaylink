import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StatusSelector from '@/app/admin/orders/StatusSelector';
import StaffCaseControls from '@/app/admin/orders/StaffCaseControls';
import DocumentReviewSelector from '@/app/admin/orders/DocumentReviewSelector';

interface AdminOrderPageProps {
  params: {
    orderNumber: string;
  };
}

export default async function AdminOrderReviewPage({ params }: AdminOrderPageProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      service: { select: { title: true } },
      client: { select: { id: true, name: true, email: true, phone: true } },
      documents: {
        select: { id: true, name: true, status: true, uploadedAt: true },
        orderBy: { uploadedAt: 'desc' },
      },
      invoices: { orderBy: { createdAt: 'desc' } },
      caseEvents: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const professionals = await prisma.user.findMany({
    where: { role: { in: ['OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC'] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/orders" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            ← Back to Operations Console
          </Link>
          <span className="text-xs font-mono text-slate-400">CA/CS Internal Desk</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application Reference</span>
            <h1 className="text-2xl font-bold font-mono text-slate-900">{order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Service: <strong className="text-slate-800">{order.service.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Amount</span>
              <span className="text-lg font-bold text-slate-900">₹{Number(order.amount).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Lifecycle Status</span>
              <StatusSelector orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Uploaded KYC & Supporting Documents</h2>
              <p className="text-xs text-slate-500">Documents are stored in the private vault and must be served through an authorized download handler.</p>

              {order.documents.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">No documents uploaded by client yet.</div>
              ) : (
                <div className="space-y-3 pt-2">
                  {order.documents.map((document) => (
                    <div key={document.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-slate-800 block">{document.name}</span>
                        <span className="text-xs text-slate-400 block">
                          {document.status.replace('_', ' ')} · {new Date(document.uploadedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <DocumentReviewSelector documentId={document.id} currentStatus={document.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Filing Timeline</h2>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Order created</span>
                  <span>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated</span>
                  <span>{new Date(order.updatedAt).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4">{order.caseEvents.length === 0 ? <p className="text-xs text-slate-400">No case events recorded yet.</p> : order.caseEvents.map((event) => <div key={event.id} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between gap-3 text-xs"><strong className="text-slate-800">{event.title}</strong><span className="text-slate-400">{new Date(event.createdAt).toLocaleString('en-IN')}</span></div><p className="mt-1 text-xs leading-relaxed text-slate-600">{event.message}</p>{event.actor && <p className="mt-1 text-[10px] text-slate-400">By {event.actor.name}</p>}</div>)}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Client Details</h3>
              <div className="text-xs space-y-2 text-slate-600">
                <p><span className="text-slate-400 block">Full Name</span><strong className="text-slate-800">{order.client.name}</strong></p>
                <p><span className="text-slate-400 block">Email Address</span><a href={`mailto:${order.client.email}`} className="text-orange-600 underline">{order.client.email}</a></p>
                <p><span className="text-slate-400 block">Mobile Number</span><strong className="text-slate-800">{order.client.phone || 'Not provided'}</strong></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Payment</h3>
              <div className="text-xs space-y-2 text-slate-600">
                <p><span className="text-slate-400 block">Status</span><strong className="text-slate-800">{order.paymentStatus}</strong></p>
                <p><span className="text-slate-400 block">Amount</span><strong className="text-slate-800">₹{Number(order.amount).toLocaleString('en-IN')}</strong></p>
                {order.paidAt && <p><span className="text-slate-400 block">Paid at</span><strong className="text-slate-800">{new Date(order.paidAt).toLocaleString('en-IN')}</strong></p>}
              </div>
            </div>
          </div>
        </div>

        <StaffCaseControls
          orderId={order.id}
          currentAssigneeId={order.assignedCAId}
          currentProfessionalType={order.professionalType}
          currentAssignmentNote={order.assignmentNote}
          professionals={professionals}
          documents={order.documents.map((document) => ({ id: document.id, name: document.name, status: document.status }))}
        />
      </div>
    </main>
  );
}
