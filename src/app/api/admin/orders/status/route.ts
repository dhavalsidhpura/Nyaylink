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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus },
      select: { id: true, orderNumber: true, status: true, updatedAt: true },
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
