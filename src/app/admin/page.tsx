import { redirect } from 'next/navigation';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUser, isStaff, publicUserSelect, ROLE_GROUPS, STAFF_ROLES } from '@/lib/authz';
import { plain, num, type Plain } from '@/lib/serialize';
import AdminWorkspaceClient from './AdminWorkspaceClient';

export const dynamic = 'force-dynamic';

async function loadAdminData(role: Role) {
  const finance = ROLE_GROUPS.finance.includes(role);
  const caseworker = ROLE_GROUPS.caseworkers.includes(role);

  const [team, leads, orders, pendingDocuments, invoices, ledger, totals] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      select: { ...publicUserSelect, assignedOrders: { select: { id: true, status: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.lead.findMany({
      include: { assignedTo: { select: publicUserSelect } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.order.findMany({
      include: {
        client: { select: publicUserSelect },
        service: { select: { title: true } },
        assignedCA: { select: publicUserSelect },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    caseworker
      ? prisma.vaultDocument.findMany({
          where: { status: 'PENDING_REVIEW' },
          include: {
            owner: { select: publicUserSelect },
            order: { select: { orderNumber: true, service: { select: { title: true } } } },
          },
          orderBy: { uploadedAt: 'asc' },
          take: 100,
        })
      : Promise.resolve([]),
    finance ? prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }) : Promise.resolve([]),
    finance ? prisma.ledgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }) : Promise.resolve([]),
    finance ? prisma.ledgerEntry.aggregate({ _sum: { credit: true, debit: true } }) : Promise.resolve(null),
  ]);

  const balance = totals ? num(totals._sum.credit) - num(totals._sum.debit) : 0;
  return { team, leads, orders, pendingDocuments, invoices, ledger, balance };
}

export type AdminData = Plain<Awaited<ReturnType<typeof loadAdminData>>>;

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) redirect('/login?callbackUrl=/admin');

  const data = plain(await loadAdminData(user.role));
  return <AdminWorkspaceClient role={user.role} {...data} />;
}
