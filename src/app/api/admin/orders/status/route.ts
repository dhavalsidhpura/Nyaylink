import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const allowedStatuses = new Set<string>(Object.values(OrderStatus));

export async function PATCH(request: Request) {
  const auth = await requireRole([
    'SUPER_ADMIN',
    'OPS_MANAGER',
    'CA_CS_LEAD',
    'COMPLIANCE_EXEC',
  ]);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const newStatus = typeof body.newStatus === 'string' ? body.newStatus : '';

    if (!orderId || !allowedStatuses.has(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'A valid order ID and status are required.' },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, status: true, service: { select: { title: true } } },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    if (existingOrder.status === newStatus) {
      return NextResponse.json({ success: true, order: existingOrder });
    }

    const statusLabels: Record<OrderStatus, string> = {
      SUBMITTED: 'Request received',
      IN_PROGRESS: 'Professional review',
      QUERY_RAISED: 'Customer action needed',
      APPROVED: 'Service completed',
    };

    const updatedOrder = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as OrderStatus,
          completedAt: newStatus === 'APPROVED' ? new Date() : undefined,
        },
        select: { id: true, orderNumber: true, status: true, updatedAt: true, completedAt: true },
      });

      await transaction.caseEvent.create({
        data: {
          orderId,
          actorId: auth.user.id,
          eventType: 'STATUS_CHANGED',
          title: statusLabels[newStatus as OrderStatus],
          message: newStatus === 'QUERY_RAISED'
            ? `The service desk needs an additional document or clarification for your ${existingOrder.service.title} case.`
            : newStatus === 'APPROVED'
              ? `Your ${existingOrder.service.title} case is marked complete. Check the delivery section for the available output.`
              : `Your ${existingOrder.service.title} case is now in ${statusLabels[newStatus as OrderStatus].toLowerCase()}.`,
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin order status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status.' },
      { status: 500 },
    );
  }
}
