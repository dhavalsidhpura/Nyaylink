import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';

const schema = z.object({
  orderId: z.string().min(1),
});

/**
 * Dedicated endpoint allowing verified CAs, CSs, and compliance executives
 * to self-claim open client dockets from the unassigned pool.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.caseworkers);
  const { orderId } = schema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, assignedCAId: true, paymentStatus: true, status: true },
  });

  if (!order) {
    throw new HttpError(404, 'Filing docket not found.');
  }

  if (order.assignedCAId) {
    throw new HttpError(409, 'This filing docket has already been claimed by another specialist.');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: orderId },
      data: {
        assignedCAId: user.id,
        // If order was in DOCS_PENDING, advance it to IN_PROGRESS upon CA claiming if paid
        status: order.status === 'DOCS_PENDING' ? 'IN_PROGRESS' : order.status,
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        status: o.status,
        remarks: `Docket self-claimed by Partner / Specialist ${user.name} (${user.role.replace(/_/g, ' ')}).`,
        actorId: user.id,
      },
    });

    return o;
  });

  return NextResponse.json({
    success: true,
    orderId: updated.id,
    orderNumber: updated.orderNumber,
    assignedCA: user.name,
  });
});
