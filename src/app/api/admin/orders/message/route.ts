import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

export async function POST(request: Request) {
  const auth = await requireRole(STAFF_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';

    if (!orderId || !message) {
      return NextResponse.json(
        { success: false, error: 'A case and message are required.' },
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

    const result = await prisma.$transaction(async (transaction) => {
      const createdMessage = await transaction.caseMessage.create({
        data: { orderId: order.id, senderId: auth.user.id, body: message },
        select: { id: true, body: true, createdAt: true },
      });

      await transaction.caseEvent.create({
        data: {
          orderId: order.id,
          actorId: auth.user.id,
          eventType: 'CUSTOMER_MESSAGE',
          title: 'Message from the service desk',
          message,
        },
      });

      return createdMessage;
    });

    return NextResponse.json({ success: true, message: result }, { status: 201 });
  } catch (error) {
    console.error('Admin order message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send the case message.' },
      { status: 500 },
    );
  }
}
