import { NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, orderAccess, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { sendNotificationEmail, buildStatusUpdateEmail } from '@/lib/email';

const schema = z.object({
  orderId: z.string().min(1),
  newStatus: z.nativeEnum(OrderStatus),
  remarks: z.string().trim().max(1000).optional(),
  srn: z.string().trim().max(60).optional(),
});

export const PATCH = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.caseworkers);
  const { orderId, newStatus, remarks, srn } = schema.parse(await request.json());

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { client: true } });
  if (!order || orderAccess(user, order) !== 'staff') throw new HttpError(404, 'Order not found.');
  if (order.paymentStatus === 'UNPAID' && !['PENDING_PAYMENT', 'REJECTED'].includes(newStatus)) {
    throw new HttpError(409, 'Work cannot start on an unpaid order.');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus, ...(srn ? { srn } : {}) },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId,
        status: newStatus,
        remarks: [remarks, srn ? `Government SRN/ARN: ${srn}` : null].filter(Boolean).join(' — ') || `Status updated to ${newStatus}.`,
        actorId: user.id,
      },
    });
    return o;
  });

  await sendNotificationEmail({
    to: order.client.email,
    subject: `Status Update [${order.orderNumber}]: ${newStatus.replace(/_/g, ' ')}`,
    html: buildStatusUpdateEmail(order.client.name, order.orderNumber, newStatus, remarks),
  });

  return NextResponse.json({ success: true, status: updated.status, srn: updated.srn });
});
