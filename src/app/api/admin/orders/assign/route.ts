import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

const ASSIGNABLE_ROLES = [
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

function optionalText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function PATCH(request: Request) {
  const auth = await requireRole(STAFF_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const assignedCAId = body.assignedCAId === null || body.assignedCAId === ''
      ? null
      : typeof body.assignedCAId === 'string'
        ? body.assignedCAId
        : undefined;
    const professionalType = optionalText(body.professionalType, 100);
    const assignmentNote = optionalText(body.assignmentNote, 500);

    if (!orderId || assignedCAId === undefined) {
      return NextResponse.json(
        { success: false, error: 'A valid order and assignee are required.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, assignedCAId: true, service: { select: { title: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    let assignee: { id: string; name: string; email: string; role: string } | null = null;
    if (assignedCAId) {
      assignee = await prisma.user.findFirst({
        where: { id: assignedCAId, role: { in: [...ASSIGNABLE_ROLES] } },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!assignee) {
        return NextResponse.json(
          { success: false, error: 'The selected user is not an assignable professional.' },
          { status: 400 },
        );
      }
    }

    const updatedOrder = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.order.update({
        where: { id: order.id },
        data: {
          assignedCAId,
          assignedAt: assignedCAId ? new Date() : null,
          professionalType: assignedCAId ? professionalType || 'Compliance professional' : null,
          assignmentNote: assignedCAId ? assignmentNote || null : null,
          status: assignedCAId ? 'IN_PROGRESS' : undefined,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          assignedAt: true,
          assignmentNote: true,
          professionalType: true,
          assignedCA: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      await transaction.caseEvent.create({
        data: {
          orderId: order.id,
          actorId: auth.user.id,
          eventType: assignedCAId ? 'PROFESSIONAL_ASSIGNED' : 'PROFESSIONAL_UNASSIGNED',
          title: assignedCAId ? 'Professional assigned' : 'Professional assignment changed',
          message: assignedCAId
            ? `${assignee?.name || 'A service professional'} is assigned to review your ${order.service.title} case.`
            : 'The service desk is updating the professional assignment for your case.',
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin order assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update professional assignment.' },
      { status: 500 },
    );
  }
}
