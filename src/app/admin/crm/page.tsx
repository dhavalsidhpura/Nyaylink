import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, isStaff, publicUserSelect, STAFF_ROLES } from '@/lib/authz';
import { plain, type Plain } from '@/lib/serialize';
import CrmWorkspaceClient from './CrmWorkspaceClient';

export const dynamic = 'force-dynamic';

async function loadCrmData() {
  try {
    const [leads, staffMembers, services] = await Promise.all([
      prisma.lead.findMany({
        include: { assignedTo: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: 300,
      }),
      prisma.user.findMany({
        where: { role: { in: STAFF_ROLES } },
        select: publicUserSelect,
        orderBy: { name: 'asc' },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          professionalFee: true,
          govtFee: true,
          sla: true,
        },
        orderBy: [{ category: 'asc' }, { title: 'asc' }],
      }),
    ]);

    return { leads, staffMembers, services };
  } catch (err: any) {
    console.warn('[admin/crm] Failed to load CRM data from DB:', err?.message);
    return { leads: [], staffMembers: [], services: [] };
  }
}

export type CrmData = Plain<Awaited<ReturnType<typeof loadCrmData>>>;

export default async function AdminCrmPage() {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) redirect('/login?callbackUrl=/admin/crm');

  const data = plain(await loadCrmData());
  return <CrmWorkspaceClient currentRole={user.role} currentUserId={user.id} {...data} />;
}
