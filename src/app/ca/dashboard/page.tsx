import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, ROLE_GROUPS } from '@/lib/authz';
import { plain, num, type Plain } from '@/lib/serialize';
import CADashboardClient from './CADashboardClient';

export const dynamic = 'force-dynamic';

async function loadCAData(userId: string) {
  const [user, myOrders, unclaimedOrders, pendingDocs] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    }),

    prisma.order.findMany({
      where: { assignedCAId: userId },
      include: {
        service: { select: { title: true, sla: true, category: true } },
        client: { select: { id: true, name: true, email: true, phone: true, state: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          take: 4,
          include: { actor: { select: { name: true } } },
        },
        invoices: { select: { invoiceNo: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),

    prisma.order.findMany({
      where: { assignedCAId: null, paymentStatus: 'PAID', status: { notIn: ['APPROVED', 'REJECTED'] } },
      include: {
        service: { select: { title: true, sla: true, category: true } },
        client: { select: { name: true, email: true, state: true } },
        documents: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),

    prisma.vaultDocument.findMany({
      where: {
        status: 'PENDING_REVIEW',
        order: {
          OR: [{ assignedCAId: userId }, { assignedCAId: null }],
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            assignedCAId: true,
            service: { select: { title: true } },
          },
        },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { uploadedAt: 'asc' },
      take: 100,
    }),
  ]);

  // Partner Retainer Metrics (Standard 70% CA/CS fee payout per completed filing)
  const approvedOrders = myOrders.filter((o) => o.status === 'APPROVED');
  const earnedRetainer = approvedOrders.reduce((sum, o) => sum + Math.round(num(o.professionalFee) * 0.7), 0);
  const pendingRetainer = myOrders
    .filter((o) => o.status === 'IN_PROGRESS' || o.status === 'DOCS_PENDING' || o.status === 'QUERY_RAISED')
    .reduce((sum, o) => sum + Math.round(num(o.professionalFee) * 0.7), 0);

  return {
    user,
    myOrders,
    unclaimedOrders,
    pendingDocs,
    metrics: {
      activeDocketsCount: myOrders.filter((o) => o.status !== 'APPROVED' && o.status !== 'REJECTED').length,
      unclaimedCount: unclaimedOrders.length,
      pendingDocsCount: pendingDocs.length,
      approvedCount: approvedOrders.length,
      earnedRetainer,
      pendingRetainer,
    },
  };
}

export type CADashboardData = Plain<Awaited<ReturnType<typeof loadCAData>>>;

export default async function CADashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login?callbackUrl=/ca/dashboard');
  }

  // Restrict to authorized CA/CS and caseworker roles
  if (!ROLE_GROUPS.caseworkers.includes(user.role)) {
    redirect('/dashboard');
  }

  const data = plain(await loadCAData(user.id));
  return <CADashboardClient {...data} />;
}
