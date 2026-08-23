import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

const DELIVERY_STATUSES = new Set(['PENDING', 'READY', 'DELIVERED']);

function textValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function PATCH(request: Request) {
  const auth = await requireRole(STAFF_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const orderId = textValue(body.orderId, 100);
    const title = textValue(body.title, 200);
    const deliveryType = textValue(body.deliveryType, 80) || 'Government acknowledgement';
    const documentId = body.documentId === null || body.documentId === ''
      ? null
      : textValue(body.documentId, 100);
    const status = textValue(body.status, 20).toUpperCase();

    if (!orderId || !title || !DELIVERY_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, error: 'A case, title, and valid delivery status are required.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, service: { select: { title: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    if (status === 'DELIVERED' && !documentId) {
      return NextResponse.json(
        { success: false, error: 'A verified document is required before marking delivery complete.' },
        { status: 400 },
      );
    }

    if (documentId) {
      const document = await prisma.vaultDocument.findFirst({
        where: { id: documentId, orderId, status: 'VERIFIED' },
        select: { id: true },
      });
      if (!document) {
        return NextResponse.json(
          { success: false, error: 'The selected document is not a verified document for this case.' },
          { status: 400 },
        );
      }
    }

    const result = await prisma.$transaction(async (transaction) => {
      const delivery = await transaction.caseDelivery.upsert({
        where: { orderId: order.id },
        update: {
          deliveryType,
          title,
          documentId,
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : null,
        },
        create: {
          orderId: order.id,
          deliveryType,
          title,
          documentId,
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : null,
        },
        select: { id: true, deliveryType: true, title: true, documentId: true, status: true, deliveredAt: true },
      });

      if (status === 'DELIVERED') {
        await transaction.order.update({
          where: { id: order.id },
          data: { status: 'APPROVED', completedAt: new Date() },
        });
      }

      await transaction.caseEvent.create({
        data: {
          orderId: order.id,
          actorId: auth.user.id,
          eventType: status === 'DELIVERED' ? 'FINAL_DELIVERY' : 'DELIVERY_UPDATED',
          title: status === 'DELIVERED' ? 'Final output delivered' : 'Delivery updated',
          message: status === 'DELIVERED'
            ? `Your ${order.service.title} output is available in the private case workspace.`
            : `The service desk updated the delivery status for your ${order.service.title} case to ${status.toLowerCase()}.`,
        },
      });

      return delivery;
    });

    return NextResponse.json({ success: true, delivery: result });
  } catch (error) {
    console.error('Admin order delivery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update case delivery.' },
      { status: 500 },
    );
  }
}
