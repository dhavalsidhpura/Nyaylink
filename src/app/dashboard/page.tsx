import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/authz';
import { plain, type Plain } from '@/lib/serialize';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

async function fetchDashboard(userId: string) {
  return Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, role: true } }),
    prisma.order.findMany({
      where: { clientId: userId },
      include: {
        service: { select: { title: true, sla: true } },
        assignedCA: { select: { name: true } },
        statusLogs: { orderBy: { createdAt: 'desc' }, take: 4 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vaultDocument.findMany({
      where: { ownerId: userId, status: { not: 'SUPERSEDED' } },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { OR: [{ order: { clientId: userId } }, { payment: { consultation: { clientId: userId } } }] },
      include: { order: { select: { service: { select: { title: true } } } }, payment: { select: { description: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.consultation.findMany({
      where: { clientId: userId, OR: [{ status: { not: 'PENDING_PAYMENT' } }, { holdExpiresAt: { gt: new Date() } }] },
      include: {
        lawyer: { select: { slug: true, user: { select: { name: true } } } },
        payments: { where: { status: { in: ['CREATED', 'FAILED'] } }, select: { id: true } },
      },
      orderBy: { startsAt: 'desc' },
    }),
  ]);
}

type RawDashboardResult = Awaited<ReturnType<typeof fetchDashboard>>;

async function loadDashboard(userId: string) {
  try {
    const [user, orders, documents, invoices, consultations] = await fetchDashboard(userId);
    return { user, orders, documents, invoices, consultations };
  } catch (err: any) {
    console.warn('[dashboard] Failed to load dashboard data from DB:', err?.message);
    const emptyResult: RawDashboardResult = [
      { id: userId, name: 'Client Account', email: '', phone: null, role: 'CLIENT' },
      [],
      [],
      [],
      [],
    ];
    return {
      user: emptyResult[0],
      orders: emptyResult[1],
      documents: emptyResult[2],
      invoices: emptyResult[3],
      consultations: emptyResult[4],
    };
  }
}

export type DashboardData = Plain<Awaited<ReturnType<typeof loadDashboard>>>;

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login?callbackUrl=/dashboard');

  return <DashboardClient {...plain(await loadDashboard(session.id))} />;
}
