import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, isStaff } from '@/lib/authz';
import { plain } from '@/lib/serialize';
import { formatINR, INDIAN_STATES, SUPPLIER_STATE } from '@/lib/pricing';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

const SUPPLIER = {
  name: process.env.SUPPLIER_LEGAL_NAME || 'NyayaLink Legal Services',
  gstin: process.env.SUPPLIER_GSTIN || 'GSTIN not configured',
  address: process.env.SUPPLIER_ADDRESS || 'Mumbai, Maharashtra',
};

const stateLabel = (code: string) => {
  const s = INDIAN_STATES.find((st) => st.code === code);
  return s ? `${s.name} (${s.gstCode})` : code;
};

export default async function InvoicePage({ params }: { params: { invoiceNo: string } }) {
  const user = await getSessionUser();
  const invoiceNo = decodeURIComponent(params.invoiceNo);
  if (!user) redirect(`/login?callbackUrl=/invoices/${encodeURIComponent(invoiceNo)}`);

  const raw = await prisma.invoice.findUnique({
    where: { invoiceNo },
    include: {
      order: { select: { clientId: true, orderNumber: true, service: { select: { title: true } } } },
      payment: { select: { description: true, gatewayPaymentId: true, consultation: { select: { clientId: true } } } },
    },
  });
  const ownerId = raw?.order?.clientId ?? raw?.payment?.consultation?.clientId;
  if (!raw || (ownerId !== user.id && !isStaff(user.role))) notFound();

  const inv = plain(raw);
  const description = inv.order?.service.title || inv.payment?.description || 'Legal services';
  const totalTax = inv.cgst + inv.sgst + inv.igst;

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-xs text-slate-700 print:shadow-none print:border-none print:rounded-none">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-lg font-extrabold text-[#073B5C]">{SUPPLIER.name}</h1>
            <p>{SUPPLIER.address}</p>
            <p className="font-mono">GSTIN: {SUPPLIER.gstin}</p>
            <p>State: {stateLabel(SUPPLIER_STATE)}</p>
          </div>
          <div className="sm:text-right">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#073B5C]">Tax Invoice</h2>
            <p>
              Invoice No: <strong className="font-mono">{inv.invoiceNo}</strong>
            </p>
            <p>Date: {new Date(inv.createdAt).toLocaleDateString('en-IN')}</p>
            {inv.order && <p>Order: {inv.order.orderNumber}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Billed to</span>
            <p className="font-bold text-slate-900">{inv.billedToName}</p>
            {inv.billedToGstin && <p className="font-mono">GSTIN: {inv.billedToGstin}</p>}
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">Place of supply</span>
            <p className="font-bold text-slate-900">{stateLabel(inv.placeOfSupply)}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#073B5C] text-[10px] uppercase text-[#073B5C]">
              <th className="py-2">Description</th>
              <th className="py-2">SAC</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2">{description} — professional fee</td>
              <td className="py-2 font-mono">{inv.sacCode}</td>
              <td className="py-2 text-right">{formatINR(inv.taxableAmount)}</td>
            </tr>
            {inv.cgst > 0 && (
              <tr>
                <td className="py-2">CGST @ 9%</td>
                <td />
                <td className="py-2 text-right">{formatINR(inv.cgst)}</td>
              </tr>
            )}
            {inv.sgst > 0 && (
              <tr>
                <td className="py-2">SGST @ 9%</td>
                <td />
                <td className="py-2 text-right">{formatINR(inv.sgst)}</td>
              </tr>
            )}
            {inv.igst > 0 && (
              <tr>
                <td className="py-2">IGST @ 18%</td>
                <td />
                <td className="py-2 text-right">{formatINR(inv.igst)}</td>
              </tr>
            )}
            {inv.reimbursements > 0 && (
              <tr>
                <td className="py-2">
                  Reimbursement of expenses incurred as pure agent (government fees / advocate fee collected on their behalf) — not part of
                  taxable value
                </td>
                <td />
                <td className="py-2 text-right">{formatINR(inv.reimbursements)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#073B5C] font-extrabold text-[#073B5C]">
              <td className="py-2">Total (taxable {formatINR(inv.taxableAmount)} + tax {formatINR(totalTax)})</td>
              <td />
              <td className="py-2 text-right">{formatINR(inv.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        {inv.payment?.gatewayPaymentId && <p className="text-[11px] text-slate-500">Paid online · Ref {inv.payment.gatewayPaymentId}</p>}
        <p className="text-[10px] text-slate-400">This is a computer-generated invoice and does not require a signature.</p>
        <div className="print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
