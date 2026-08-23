import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } },
) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';

    if (!message) {
      return NextResponse.json({ success: false, error: 'A message is required.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: params.orderNumber, clientId: auth.user.id },
      select: { id: true, orderNumber: true, service: { select: { title: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Case not found.' }, { status: 404 });
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
          eventType: 'CUSTOMER_QUESTION',
          title: 'Question sent to the service desk',
          message: 'The customer sent a question or clarification through the private workspace.',
        },
      });

      return createdMessage;
    });

    return NextResponse.json({ success: true, message: result }, { status: 201 });
  } catch (error) {
    console.error('Customer case message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send your question.' },
      { status: 500 },
    );
  }
}
