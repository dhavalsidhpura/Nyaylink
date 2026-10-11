import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, orderAccess, requireUser } from '@/lib/authz';
import { sendNotificationEmail, buildNewMessageEmail } from '@/lib/email';

type Ctx = { params: { orderNumber: string } };

async function loadOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { client: { select: { name: true, email: true } }, assignedCA: { select: { name: true, email: true } } },
  });
}

export const GET = apiHandler(async (_request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const order = await loadOrder(params.orderNumber);
  const access = order && orderAccess(user, order);
  if (!order || !access) throw new HttpError(404, 'Order not found.');

  const messages = await prisma.orderMessage.findMany({
    where: { orderId: order.id, ...(access === 'client' ? { isInternal: false } : {}) },
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ success: true, messages });
});

const schema = z.object({
  body: z.string().trim().min(1).max(4000),
  isInternal: z.boolean().optional(),
  isQuery: z.boolean().optional(),
});

export const POST = apiHandler(async (request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const order = await loadOrder(params.orderNumber);
  const access = order && orderAccess(user, order);
  if (!order || !access) throw new HttpError(404, 'Order not found.');

  const input = schema.parse(await request.json());
  const isStaffMsg = access === 'staff';
  const isInternal = isStaffMsg && Boolean(input.isInternal);
  const isQuery = isStaffMsg && !isInternal && Boolean(input.isQuery);

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.orderMessage.create({
      data: { orderId: order.id, authorId: user.id, body: input.body, isInternal, isQuery },
      include: { author: { select: { name: true, role: true } } },
    });

    if (isQuery && order.status !== 'QUERY_RAISED') {
      await tx.order.update({ where: { id: order.id }, data: { status: 'QUERY_RAISED' } });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'QUERY_RAISED', remarks: 'Compliance desk raised a query.', actorId: user.id },
      });
    }
    // A client reply to an open query sends the case back to the desk.
    if (!isStaffMsg && order.status === 'QUERY_RAISED') {
      await tx.order.update({ where: { id: order.id }, data: { status: 'IN_PROGRESS' } });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'IN_PROGRESS', remarks: 'Client responded to the query.', actorId: user.id },
      });
    }
    return msg;
  });

  if (!isInternal) {
    const recipient = isStaffMsg ? order.client : order.assignedCA ?? (process.env.OPS_EMAIL ? { name: 'Ops team', email: process.env.OPS_EMAIL } : null);
    if (recipient) {
      await sendNotificationEmail({
        to: recipient.email,
        subject: `${isQuery ? 'Query' : 'New message'} on ${order.orderNumber}`,
        html: buildNewMessageEmail(recipient.name, order.orderNumber, isQuery),
      });
    }
  }

  return NextResponse.json({ success: true, message }, { status: 201 });
});
