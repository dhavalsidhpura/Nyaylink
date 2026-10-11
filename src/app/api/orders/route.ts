import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, requireUser, publicUserSelect } from '@/lib/authz';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// GET: the signed-in client's own orders. Staff use the admin console instead.
export const GET = apiHandler(async () => {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { clientId: user.id },
    include: {
      service: { select: { slug: true, title: true, sla: true } },
      assignedCA: { select: publicUserSelect },
      statusLogs: { orderBy: { createdAt: 'desc' }, select: { status: true, remarks: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, orders: plain(orders) });
});
