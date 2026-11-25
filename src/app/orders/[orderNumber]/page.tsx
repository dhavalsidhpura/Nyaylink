import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, orderAccess } from '@/lib/authz';
import { plain, num } from '@/lib/serialize';
import { formatINR, splitGst, stateName } from '@/lib/pricing';
import DocumentChecklist from '@/components/DocumentChecklist';
import OrderMessages from '@/components/OrderMessages';
import OrderProgress from '@/components/OrderProgress';
import PayNowButton from '@/components/PayNowButton';
import WhatsAppNotificationCard from '@/components/WhatsAppNotificationCard';
import GovernmentCredentialLocker from '@/components/GovernmentCredentialLocker';
import StagingPaySimulateButton, { StagingOrderResetButton } from './StagingPaySimulateButton';

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

function getOfficialGovernmentTrackingUrl(slug: string): { label: string; url: string } {
  const lower = slug.toLowerCase();
  if (lower.includes('trademark') || lower.includes('copyright')) {
    return {
      label: 'IP India Registry',
      url: 'https://ipindiaservices.gov.in/eregister/eregister.aspx',
    };
  }
  if (lower.includes('gst')) {
    return {
      label: 'GSTN Government Portal',
      url: 'https://services.gst.gov.in/services/arnstatus',
    };
  }
  if (lower.includes('fssai')) {
    return {
      label: 'FoSCoS Food Safety Portal',
      url: 'https://foscos.fssai.gov.in/',
    };
  }
  if (lower.includes('iec') || lower.includes('import-export')) {
    return {
      label: 'DGFT Customs Portal',
      url: 'https://www.dgft.gov.in/CP/',
    };
  }
  return {
    label: 'MCA V3 Official Portal',
    url: 'https://www.mca.gov.in/mcafoportal/trackSRN.do',
  };
}

export default async function OrderTrackingPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=/orders/${encodeURIComponent(params.orderNumber)}`);

  let raw = null;
  try {
    raw = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        client: { select: { name: true, phone: true, email: true } },
        service: { include: { requirements: { orderBy: { sortOrder: 'asc' } } } },
        assignedCA: { select: { name: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        statusLogs: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'asc' } },
        invoices: { select: { invoiceNo: true, totalAmount: true, createdAt: true } },
      },
    });
  } catch (err: any) {
    console.warn(`[orders] Failed DB lookup for order ${params.orderNumber}:`, err?.message);
    notFound();
  }

  const access = raw ? orderAccess(user, raw) : null;
  if (!raw || !access) notFound();
  if (access === 'staff') redirect(`/admin/orders/${raw.orderNumber}`);

  const order = plain(raw);
  const gst = splitGst(order.gstAmount, order.clientState);
  const duePayments = order.payments.filter((p) => p.status === 'CREATED' || p.status === 'FAILED');
  const closed = order.status === 'APPROVED' || order.status === 'REJECTED';
  const isEntityIncorporation =
    order.service.slug === 'private-limited-company' ||
    order.service.slug === 'one-person-company' ||
    order.service.slug === 'llp-registration' ||
    order.service.slug === 'public-limited-company';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-20 md:pb-8">
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
        {/* 1. ORDER SUMMARY & PROGRESS */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md uppercase inline-block">
                Order #{order.orderNumber}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#073B5C]">{order.service.title}</h1>
              <p className="text-xs text-slate-500">
                Timeline: {order.service.sla} · Assigned Desk: <strong>{order.assignedCA?.name || 'Being assigned'}</strong>
              </p>

              {order.srn && (() => {
                const portal = getOfficialGovernmentTrackingUrl(order.service.slug);
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏛️</span>
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-500 block">Government Filing Reference</span>
                        <span className="font-mono font-black text-slate-800 text-xs sm:text-sm">{order.srn}</span>
                      </div>
                    </div>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      <span>Verify on {portal.label} ↗</span>
                    </a>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`https://wa.me/919920054785?text=${encodeURIComponent(`Hello NyayaLink, I am on Order #${order.orderNumber} (${order.service.title}) and need assistance with my documents.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  <span>💬</span> WhatsApp Assigned CA Desk
                </a>
                <span className="text-xs text-slate-500">Mon–Sat 9:30 AM – 7:00 PM IST</span>
              </div>
            </div>

            <span className="self-start text-xs font-extrabold px-3 py-1 rounded-full uppercase bg-slate-100 text-[#073B5C]">
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <OrderProgress status={order.status} />
        </section>

        {/* 2. PACKAGE BUNDLE BANNER (IF APPLICABLE) */}
        {order.intakeData && typeof order.intakeData === 'object' && (order.intakeData as any).isPackageBooking === 'true' && (
          <section className="bg-gradient-to-r from-[#073B5C] to-[#0E7490] text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-3">
            <div className="space-y-0.5">
              <span className="bg-[#F4B942] text-[#073B5C] font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                Bundled Suite
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                {(order.intakeData as any).packageTitle || 'All-In-One Business Package'}
              </h2>
            </div>

            {(order.intakeData as any).bundleIncludedServices && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
                {(order.intakeData as any).bundleIncludedServices.split(' • ').map((svcName: string, idx: number) => (
                  <div key={idx} className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center gap-2">
                    <span className="text-emerald-400 font-black text-sm">✓</span>
                    <span className="font-bold text-xs text-white leading-tight">{svcName}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. APPROVED COMPLETION BANNER */}
        {order.status === 'APPROVED' && (
          <section className="bg-gradient-to-r from-emerald-600 via-teal-700 to-[#073B5C] text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#F4B942] text-[#073B5C] font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Filing Approved
                </span>
                {order.srn && <span className="text-xs font-mono text-cyan-200">Ref: {order.srn}</span>}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEntityIncorporation ? 'Your Legal Entity is Officially Registered! 🎉' : `${order.service.title} Completed! 🎉`}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
                {isEntityIncorporation
                  ? 'All official incorporation certificates (COI, PAN, TAN, e-MOA & e-AOA) have been filed and archived in your encrypted Vault.'
                  : 'Your application has been approved and official deliverables/acknowledgments are stored below in your encrypted Vault.'}
              </p>
            </div>

            {isEntityIncorporation && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 space-y-1">
                  <span className="text-xl">📜</span>
                  <strong className="block text-white font-extrabold text-xs">Certificate of Incorporation</strong>
                  <span className="text-xs text-cyan-200 block">Official MCA COI with CIN</span>
                </div>
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 space-y-1">
                  <span className="text-xl">💳</span>
                  <strong className="block text-white font-extrabold text-xs">Company PAN &amp; TAN</strong>
                  <span className="text-xs text-cyan-200 block">Direct Tax Allotments</span>
                </div>
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 space-y-1">
                  <span className="text-xl">📑</span>
                  <strong className="block text-white font-extrabold text-xs">Approved e-MOA &amp; e-AOA</strong>
                  <span className="text-xs text-cyan-200 block">Company Charter</span>
                </div>
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 space-y-1">
                  <span className="text-xl">🏢</span>
                  <strong className="block text-white font-extrabold text-xs">Statutory Labor Numbers</strong>
                  <span className="text-xs text-cyan-200 block">EPFO &amp; ESIC Registrations</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 4. ADVANCE TOKEN RECEIVED CONFIRMATION */}
        {order.paymentStatus === 'PARTIALLY_PAID' && order.status === 'DOCS_PENDING' && (
          <section className="bg-emerald-50 border border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-2">
            <h2 className="text-sm sm:text-base font-extrabold text-emerald-900">
              🎉 Advance Token Received ({formatINR(order.amountPaid)})
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              Your compliance desk is assigned. <strong>Upload the required documents below</strong> so we can draft and verify your filing before billing the remaining balance.
            </p>
          </section>
        )}

        {/* 5. PRIMARY ACTION WORKSPACE (LEFT) + BILLING & HISTORY (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Single Clean Due Payments Card */}
            {duePayments.length > 0 && (
              <section className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-amber-200 pb-3">
                  <div>
                    <span className="bg-[#F4B942] text-[#073B5C] font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                      Payment Due
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-[#073B5C] mt-1">
                      {order.paymentStatus === 'PARTIALLY_PAID' ? 'Milestone Balance Payment Due' : 'Pending Order Payment'}
                    </h2>
                  </div>
                  <span className="text-sm font-mono font-black text-amber-900">
                    {formatINR(duePayments.reduce((s, p) => s + num(p.amount), 0))} Due
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {order.paymentStatus === 'PARTIALLY_PAID'
                    ? 'Your remaining balance covers statutory pass-through disbursements and CA filing fees after preliminary verification.'
                    : 'Complete payment below to start CA verification and statutory filing.'}
                </p>
                {duePayments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-amber-200">
                    <div className="text-xs">
                      <strong className="text-[#073B5C] block">{p.description}</strong>
                      <span className="text-slate-500">
                        {formatINR(p.amount)}
                        {p.gstAmount > 0 ? ` incl. ${formatINR(p.gstAmount)} GST` : ' (government fee, no GST)'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <PayNowButton paymentId={p.id} amount={num(p.amount)} />
                      {user.email?.endsWith('.local') && (
                        <StagingPaySimulateButton paymentId={p.id} orderNumber={order.orderNumber} />
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            <DocumentChecklist
              orderId={order.id}
              mode="client"
              requirements={order.service.requirements}
              documents={order.documents}
              locked={closed}
              lockedReason={closed ? 'This application is closed.' : undefined}
            />

            <OrderMessages orderNumber={order.orderNumber} mode="client" />

            {/* Portal Credentials Locker (renders only once staff vaults credentials) */}
            <GovernmentCredentialLocker
              orderId={order.id}
              orderNumber={order.orderNumber}
              serviceTitle={order.service.title}
              clientName={raw.client?.name || 'Valued Client'}
              clientPhone={raw.client?.phone}
              credentials={(order.intakeData as any)?.governmentCredentials || null}
              mode="client"
            />

            <WhatsAppNotificationCard
              orderNumber={order.orderNumber}
              clientPhone={raw.client?.phone}
              clientName={raw.client?.name || 'Valued Client'}
              serviceTitle={order.service.title}
              currentStatus={order.status}
              srn={order.srn}
            />
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
              <p className="text-xs text-slate-400">Place of supply: {stateName(order.clientState)}</p>
              {order.invoices.length > 0 && (
                <div className="pt-2 space-y-1">
                  {order.invoices.map((inv) => (
                    <Link key={inv.invoiceNo} href={`/invoices/${encodeURIComponent(inv.invoiceNo)}`} className="block text-[#0E7490] font-bold hover:underline">
                      🧾 Tax invoice {inv.invoiceNo}
                    </Link>
                  ))}
                </div>
              )}
              {user.email?.endsWith('.local') && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-600 mb-1.5 flex items-center gap-1">
                    <span>🧪</span> Sandbox QA Controls
                  </div>
                  <StagingOrderResetButton orderNumber={order.orderNumber} />
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
