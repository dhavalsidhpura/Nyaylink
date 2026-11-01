import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, isStaff, publicUserSelect, ROLE_GROUPS } from '@/lib/authz';
import { plain, type Plain } from '@/lib/serialize';
import AdminOrdersClient from './AdminOrdersClient';

export const dynamic = 'force-dynamic';

const query = (where: { assignedCAId?: string }) =>
  prisma.order.findMany({
    where,
    include: {
      client: { select: publicUserSelect },
      service: { select: { title: true } },
      assignedCA: { select: publicUserSelect },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

export type AdminOrderRow = Plain<Awaited<ReturnType<typeof query>>[number]>;

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) redirect('/login?callbackUrl=/admin/orders');

  let orders: any[] = [];
  try {
    // Compliance executives work only on cases assigned to them.
    orders = await query(user.role === 'COMPLIANCE_EXEC' ? { assignedCAId: user.id } : {});
  } catch (err: any) {
    console.warn('[admin/orders] Failed to load orders from DB:', err?.message);
  }
  return <AdminOrdersClient orders={plain(orders)} canEdit={ROLE_GROUPS.caseworkers.includes(user.role)} />;
}
