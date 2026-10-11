import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { notifyStatusUpdateWhatsApp } from '@/lib/whatsapp';

/**
 * SLA Escalation Engine: Automatically identifies "orphan" filing dockets
 * that have remained unclaimed by empanelled partners for >4 hours, and
 * auto-assigns them to the central Operations Desk with priority audit logging.
 */
export const POST = apiHandler(async () => {
  const adminUser = await requireRole(ROLE_GROUPS.caseworkers);

  // 4 Hours SLA Threshold
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  // Find all active orders without an assigned specialist older than 4 hours
  const orphanOrders = await prisma.order.findMany({
    where: {
      assignedCAId: null,
      createdAt: { lt: fourHoursAgo },
      status: { in: ['DOCS_PENDING', 'IN_PROGRESS', 'QUERY_RAISED', 'PENDING_PAYMENT'] },
    },
    include: {
      service: { select: { title: true } },
      client: { select: { name: true, phone: true } },
    },
    take: 20,
  });

  if (orphanOrders.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'Zero orphan dockets detected. All orders are active within 4-hour SLA.',
      escalatedCount: 0,
      orders: [],
    });
  }

  // Find fallback Operations Manager or Super Admin
  const fallbackDesk =
    (await prisma.user.findFirst({
      where: { role: { in: ['OPS_MANAGER', 'SUPER_ADMIN'] } },
      orderBy: { createdAt: 'asc' },
    })) || adminUser;

  const escalatedOrders: any[] = [];

  for (const order of orphanOrders) {
    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: {
          assignedCAId: fallbackDesk.id,
          // Promote to IN_PROGRESS if stalled
          status: order.status === 'DOCS_PENDING' ? 'IN_PROGRESS' : order.status,
        },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: o.status,
          remarks: `⚠️ SLA AUTO-ESCALATION: Docket unclaimed for >4 hours. Transferred to Central Operations Desk (${fallbackDesk.name}).`,
          actorId: adminUser.id,
        },
      });

      return o;
    });

    // Notify client via automated WhatsApp dispatcher
    if (order.client.phone) {
      await notifyStatusUpdateWhatsApp({
        phone: order.client.phone,
        clientName: order.client.name,
        orderNumber: order.orderNumber,
        serviceTitle: order.service.title,
        status: updated.status,
        remarks: 'Your docket has been prioritized and assigned to our Central Operations Desk.',
      }).catch(() => {});
    }

    escalatedOrders.push({
      orderNumber: order.orderNumber,
      serviceTitle: order.service.title,
      assignedTo: fallbackDesk.name,
      createdAt: order.createdAt,
    });
  }

  return NextResponse.json({
    success: true,
    message: `Successfully escalated ${escalatedOrders.length} orphan docket(s) to Central Operations.`,
    escalatedCount: escalatedOrders.length,
    orders: escalatedOrders,
  });
});
