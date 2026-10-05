import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';

const schema = z.object({
  orderId: z.string().min(1),
  assigneeId: z.string().min(1).nullable(),
});

// Assign (or unassign) a case to an internal CA/CS or compliance executive.
export const PATCH = apiHandler(async (request: Request) => {
  const user = await requireRole(['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD']);
  const { orderId, assigneeId } = schema.parse(await request.json());

  const assignee = assigneeId
    ? await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true, name: true, role: true } })
    : null;
  if (assigneeId && (!assignee || !ROLE_GROUPS.assignable.includes(assignee.role))) {
    throw new HttpError(400, 'Cases can only be assigned to CA/CS leads or compliance executives.');
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
  if (!order) throw new HttpError(404, 'Order not found.');

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { assignedCAId: assigneeId } }),
    prisma.orderStatusLog.create({
      data: {
        orderId,
        status: 'ASSIGNED',
        remarks: assignee ? `Case assigned to ${assignee.name}.` : 'Case unassigned.',
        actorId: user.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
});
