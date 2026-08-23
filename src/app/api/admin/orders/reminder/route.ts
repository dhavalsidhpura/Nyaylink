import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

function textValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  const auth = await requireRole(STAFF_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const orderId = textValue(body.orderId, 100);
    const title = textValue(body.title, 200);
    const reminderType = textValue(body.reminderType, 80) || 'COMPLIANCE';
    const dueAt = typeof body.dueAt === 'string' ? new Date(body.dueAt) : null;

    if (!orderId || !title || !dueAt || Number.isNaN(dueAt.getTime()) || dueAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: 'A case, future due date, and reminder title are required.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, clientId: true, service: { select: { title: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const reminder = await transaction.complianceReminder.create({
        data: {
          userId: order.clientId,
          orderId: order.id,
          reminderType,
          title,
          dueAt,
        },
        select: { id: true, reminderType: true, title: true, dueAt: true, status: true },
      });

      await transaction.caseEvent.create({
        data: {
          orderId: order.id,
          actorId: auth.user.id,
          eventType: 'COMPLIANCE_REMINDER_ADDED',
          title: 'Future compliance reminder added',
          message: `A future reminder for your ${order.service.title} case has been added to your workspace.`,
        },
      });

      return reminder;
    });

    return NextResponse.json({ success: true, reminder: result }, { status: 201 });
  } catch (error) {
    console.error('Admin compliance reminder error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create the compliance reminder.' },
      { status: 500 },
    );
  }
}
