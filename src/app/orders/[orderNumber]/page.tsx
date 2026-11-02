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
import WhatsAppNotificationCard from '@/components/WhatsAppNotificationCard';
import GovernmentCredentialLocker from '@/components/GovernmentCredentialLocker';

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

function getOfficialGovernmentTrackingUrl(slug: string, srn: string): { label: string; url: string } {
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
              {order.srn && (() => {
                const portal = getOfficialGovernmentTrackingUrl(order.service.slug, order.srn);
                return (
                  <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏛️</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Government Filing Reference</span>
                        <span className="font-mono font-black text-slate-800 text-xs sm:text-sm">{order.srn}</span>
                      </div>
                    </div>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#073B5C] border border-slate-300 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs"
                    >
                      <span>Verify on {portal.label}</span>
                      <span>↗</span>
                    </a>
                  </div>
                );
              })()}
<div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/919920054785?text=${encodeURIComponent(`Hello NyayaLink, I am on Order #${order.orderNumber} (${order.service.title}) and need assistance with my documents.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                >
                  <span>💬</span> WhatsApp Assigned CA Desk
                </a>
                <span className="text-[11px] text-slate-500">Live Mon–Sat 9:30 AM – 7:00 PM</span>
              </div>
            </div>
            <span className="self-start text-[10px] font-extrabold px-3 py-1 rounded-full uppercase bg-slate-100 text-[#073B5C]">
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <OrderProgress status={order.status} />
        </section>

        {/* Official Government Portal Credential Locker */}
        <GovernmentCredentialLocker
          orderId={order.id}
          orderNumber={order.orderNumber}
          serviceTitle={order.service.title}
          clientName={raw.client?.name || 'Valued Client'}
          clientPhone={raw.client?.phone}
          credentials={(order.intakeData as any)?.governmentCredentials || null}
          mode="client"
        />

        {/* WhatsApp Automated Milestone Alert Engine */}
        <WhatsAppNotificationCard
          orderNumber={order.orderNumber}
          clientPhone={raw.client?.phone}
          clientName={raw.client?.name || 'Valued Client'}
          serviceTitle={order.service.title}
          currentStatus={order.status}
          srn={order.srn}
        />

                {order.intakeData && typeof order.intakeData === 'object' && (order.intakeData as any).isPackageBooking === 'true' && (
          <section className="bg-gradient-to-r from-[#073B5C] to-[#0E7490] text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="space-y-0.5">
                <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Multi-Service Bundled Suite
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {(order.intakeData as any).packageTitle || 'All-In-One Business Package'}
                </h3>
                <p className="text-xs text-cyan-100">
                  Single KYC filing executing parallel statutory registrations across multiple government ministries.
                </p>
              </div>
            </div>

            {(order.intakeData as any).bundleIncludedServices && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
                {(order.intakeData as any).bundleIncludedServices.split(' • ').map((svcName: string, idx: number) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 flex items-center gap-2">
                    <span className="text-emerald-400 font-black text-sm">✓</span>
                    <span className="font-bold text-[11px] text-white leading-tight">{svcName}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {order.status === 'APPROVED' && (
          <section className="bg-gradient-to-r from-emerald-600 via-teal-700 to-[#073B5C] text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#F4B942] text-[#073B5C] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Filing Approved &amp; Allotted
                  </span>
                  {order.srn && <span className="text-xs font-mono text-cyan-200">SRN: {order.srn}</span>}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Your Legal Entity is Officially Registered! 🎉</h2>
                <p className="text-xs text-emerald-100 max-w-xl">
                  All official statutory deliverables (Certificate of Incorporation, DINs, PAN, TAN, e-MOA &amp; e-AOA) have been issued by the Ministry of Corporate Affairs / Registry and archived in your encrypted vault.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 space-y-1">
                <span className="text-xl">📜</span>
                <strong className="block text-white font-extrabold text-xs">Certificate of Incorporation</strong>
                <span className="text-[10px] text-cyan-200 block">Official MCA COI with CIN</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 space-y-1">
                <span className="text-xl">💳</span>
                <strong className="block text-white font-extrabold text-xs">Company PAN &amp; TAN Letters</strong>
                <span className="text-[10px] text-cyan-200 block">Direct Tax Allotments</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 space-y-1">
                <span className="text-xl">📑</span>
                <strong className="block text-white font-extrabold text-xs">Approved e-MOA &amp; e-AOA</strong>
                <span className="text-[10px] text-cyan-200 block">Constitution of Company</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 space-y-1">
                <span className="text-xl">🏢</span>
                <strong className="block text-white font-extrabold text-xs">Statutory Labor Numbers</strong>
                <span className="text-[10px] text-cyan-200 block">EPFO &amp; ESIC Registrations</span>
              </div>
            </div>
          </section>
        )}

        {order.paymentStatus === 'PARTIALLY_PAID' && order.status === 'DOCS_PENDING' && (
          <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <h2 className="text-sm sm:text-base font-extrabold text-emerald-900">
                Advance Booking Received! Your Dedicated Compliance Desk Is Ready
              </h2>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We have received your ₹{formatINR(order.amountPaid)} booking advance. A Chartered Accountant / Legal Counsel has been assigned to your case. 
              <strong> Please upload the required documents below</strong> so our team can draft your statutory application and reserve your entity name. The remaining balance will only be billed once your documents are verified.
            </p>
<div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold border-t border-emerald-200/60 mt-2">
              <span className="text-sm">⏰</span>
              <span><strong>No Rush Guarantee:</strong> Your booking token never expires. You can upload documents today, tomorrow, or send them to your CA on WhatsApp whenever ready.</span>
            </div>
          </section>
        )}

        {duePayments.length > 0 && (
          <section className="bg-amber-50 border border-amber-300 rounded-3xl p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">💳</span>
              <div>
                <h2 className="text-sm font-extrabold text-amber-900">Payment Due · Milestone Billing</h2>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Fair Billing Guarantee:</strong> If you initialized this filing with a ₹999 token, your remaining balance covers statutory stamp duty, government disbursements, and certified CA filing fees. This balance is billed only after our compliance desk verifies your documents.
                </p>
              </div>
            </div>
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
