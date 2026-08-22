import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusSelector from '@/app/admin/orders/StatusSelector';

interface AdminOrderPageProps {
  params: {
    orderNumber: string;
  };
}

export default async function AdminOrderReviewPage({ params }: AdminOrderPageProps) {
  const order = await prisma.orders.findUnique({
    where: { order_number: params.orderNumber },
    include: {
      services: {
        include: {
          service_document_requirements: true,
        },
      },
      users_orders_client_idTousers: true,
      order_intake_responses: true,
      order_documents: true,
      order_status_logs: {
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const client = order.users_orders_client_idTousers;
  const service = order.services;
  const intakeResponse = order.order_intake_responses[0]?.form_data as Record<string, any> | undefined;

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Operations Console
          </Link>
          <span className="text-xs font-mono text-slate-400">CA/CS Internal Desk</span>
        </div>

        {/* Order Overview Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Application Reference
            </span>
            <h1 className="text-2xl font-bold font-mono text-slate-900">{order.order_number}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Service: <strong className="text-slate-800">{service.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Amount</span>
              <span className="text-lg font-bold text-slate-900">
                ₹{Number(order.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Lifecycle Status</span>
              <StatusSelector orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Uploaded Documents Inspection Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Uploaded KYC & Supporting Documents</h2>
              <p className="text-xs text-slate-500">
                Click on any document to open and review the submitted file.
              </p>

              {order.order_documents.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  No documents uploaded by client yet.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {order.order_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/50"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-slate-800 block">
                          {doc.file_name}
                        </span>
                        {doc.file_size && (
                          <span className="text-xs text-slate-400 block">
                            Size: {(doc.file_size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>

                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        📥 Review File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Intake Form Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Client Submitted Form Details</h2>
              {intakeResponse && Object.keys(intakeResponse).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {Object.entries(intakeResponse).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 capitalize block">{key}</span>
                      <strong className="text-sm text-slate-800">{String(val) || 'N/A'}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No additional intake parameters provided.</p>
              )}
            </div>

            {/* Audit Logs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Filing History Log</h2>
              <div className="space-y-4">
                {order.order_status_logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-orange-500 pl-4 py-1 space-y-1">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="font-semibold text-slate-700 capitalize">
                        {log.status.replace('_', ' ')}
                      </span>
                      <span>{new Date(log.created_at || '').toLocaleDateString('en-IN')}</span>
                    </div>
                    {log.remarks && <p className="text-xs text-slate-600">{log.remarks}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Client Details</h3>
              <div className="text-xs space-y-2 text-slate-600">
                <p>
                  <span className="text-slate-400 block">Full Name</span>
                  <strong className="text-slate-800">{client.full_name}</strong>
                </p>
                <p>
                  <span className="text-slate-400 block">Email Address</span>
                  <a href={`mailto:${client.email}`} className="text-orange-600 underline">
                    {client.email}
                  </a>
                </p>
                <p>
                  <span className="text-slate-400 block">Mobile Number</span>
                  <strong className="text-slate-800">{client.phone}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}