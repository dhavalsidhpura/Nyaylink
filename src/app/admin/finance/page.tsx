import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, ROLE_GROUPS, publicUserSelect } from '@/lib/authz';
import { plain, num, type Plain } from '@/lib/serialize';
import FinanceWorkspaceClient from './FinanceWorkspaceClient';

export const dynamic = 'force-dynamic';

async function loadFinanceData() {
  try {
    const [invoices, ledger, totals, orders, payableConsultations, pendingPayouts] = await Promise.all([
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
        include: {
          order: {
            select: {
              orderNumber: true,
              clientState: true,
              service: { select: { title: true } },
            },
          },
        },
      }),
      prisma.ledgerEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          order: {
            select: {
              orderNumber: true,
              service: { select: { title: true } },
            },
          },
        },
      }),
      prisma.ledgerEntry.aggregate({
        _sum: { credit: true, debit: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: { in: ['PAID', 'PARTIALLY_PAID'] } },
        select: {
          id: true,
          orderNumber: true,
          professionalFee: true,
          govtFee: true,
          gstAmount: true,
          totalAmount: true,
          amountPaid: true,
          clientState: true,
          status: true,
          createdAt: true,
          service: { select: { title: true } },
          client: { select: publicUserSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.consultation.groupBy({
        by: ['lawyerId'],
        where: {
          status: 'COMPLETED',
          payoutId: null,
          payments: { some: { status: 'CAPTURED' } },
        },
        _sum: { fee: true },
        _count: true,
      }),
      prisma.payout.findMany({
        where: { status: 'PENDING' },
        include: {
          lawyer: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
      }),
    ]);

    const balance = totals ? num(totals._sum.credit) - num(totals._sum.debit) : 0;

    return {
      invoices,
      ledger,
      balance,
      orders,
      payableConsultations,
      pendingPayouts,
    };
  } catch (err: any) {
    console.warn('[admin/finance] Failed to load finance data from DB:', err?.message);
    return {
      invoices: [],
      ledger: [],
      balance: 0,
      orders: [],
      payableConsultations: [],
      pendingPayouts: [],
    };
  }
}

export type FinanceData = Plain<Awaited<ReturnType<typeof loadFinanceData>>>;

export default async function AdminFinancePage() {
  const user = await getSessionUser();
  if (!user || !ROLE_GROUPS.finance.includes(user.role)) {
    redirect('/login?callbackUrl=/admin/finance');
  }

  const data = plain(await loadFinanceData());
  return <FinanceWorkspaceClient role={user.role} {...data} />;
}
