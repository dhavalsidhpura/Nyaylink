import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';

const STAFF_ROLES = new Set([
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
  'FINANCE_MANAGER',
]);

export async function GET(
  _request: Request,
  { params }: { params: { orderNumber: string } },
) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const isStaff = STAFF_ROLES.has(auth.user.role);
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: params.orderNumber,
        ...(isStaff ? {} : { clientId: auth.user.id }),
      },
      select: {
        id: true,
        orderNumber: true,
        srn: true,
        state: true,
        amount: true,
        govtFee: true,
        taxAmount: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        assignedAt: true,
        assignmentNote: true,
        professionalType: true,
        completedAt: true,
        service: {
          select: { title: true, slug: true, sla: true, govtFeeNote: true },
        },
        assignedCA: { select: { name: true, email: true } },
        documents: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            rejectNote: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            invoiceNo: true,
            taxableAmount: true,
            cgst: true,
            sgst: true,
            igst: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        caseEvents: {
          select: {
            id: true,
            eventType: true,
            title: true,
            message: true,
            createdAt: true,
            actor: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          select: {
            id: true,
            body: true,
            readAt: true,
            createdAt: true,
            sender: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        delivery: {
          select: { id: true, deliveryType: true, title: true, documentId: true, status: true, deliveredAt: true },
        },
        reminders: {
          where: { status: 'PENDING' },
          select: { id: true, reminderType: true, title: true, dueAt: true, status: true },
          orderBy: { dueAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Case not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API /api/orders/[orderNumber] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch case.' }, { status: 500 });
  }
}
