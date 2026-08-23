import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateOrderTotals } from '@/lib/pricing';
import { requireUser } from '@/lib/auth-guards';

const STAFF_ROLES = new Set([
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
  'FINANCE_MANAGER',
]);

function createReference(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET() {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const isStaff = STAFF_ROLES.has(auth.user.role);
    const orders = await prisma.order.findMany({
      where: isStaff ? undefined : { clientId: auth.user.id },
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
        service: { select: { title: true, slug: true, sla: true } },
        assignedCA: { select: { name: true, email: true } },
        documents: {
          select: { id: true, name: true, category: true, status: true, uploadedAt: true },
          orderBy: { uploadedAt: 'desc' },
        },
        invoices: {
          select: { id: true, invoiceNo: true, taxableAmount: true, cgst: true, sgst: true, igst: true, totalAmount: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        caseEvents: {
          select: { id: true, title: true, message: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        reminders: {
          where: { status: 'PENDING' },
          select: { id: true, title: true, dueAt: true, status: true },
          orderBy: { dueAt: 'asc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('API /api/orders GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const serviceSlug = typeof body.serviceSlug === 'string' ? body.serviceSlug.trim() : '';
    const state = typeof body.state === 'string' && body.state.trim() ? body.state.trim().slice(0, 80) : 'Maharashtra';
    const rawIntake = body.intakeData && typeof body.intakeData === 'object' ? body.intakeData : {};
    const intakeData = {
      businessName: typeof rawIntake.businessName === 'string' ? rawIntake.businessName.trim().slice(0, 160) : '',
      location: typeof rawIntake.location === 'string' ? rawIntake.location.trim().slice(0, 120) : '',
      entityType: typeof rawIntake.entityType === 'string' ? rawIntake.entityType.trim().slice(0, 80) : '',
      employeeCount: typeof rawIntake.employeeCount === 'string' ? rawIntake.employeeCount.trim().slice(0, 40) : '',
      businessActivity: typeof rawIntake.businessActivity === 'string' ? rawIntake.businessActivity.trim().slice(0, 160) : '',
    };

    if (!serviceSlug) {
      return NextResponse.json(
        { success: false, error: 'A service is required.' },
        { status: 400 },
      );
    }

    const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: 'The selected service is not available.' },
        { status: 404 },
      );
    }

    const { govtFee, taxAmount, amount } = calculateOrderTotals(service.startingPrice);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: createReference('NYA'),
          srn: createReference('SRN'),
          serviceId: service.id,
          clientId: auth.user.id,
          amount,
          govtFee,
          taxAmount,
          state,
          intakeData,
          status: 'SUBMITTED',
        },
        include: { service: true },
      });

      await tx.caseEvent.create({
        data: {
          orderId: createdOrder.id,
          eventType: 'CASE_CREATED',
          title: 'Request received',
          message: 'Your intake has been received. The service desk will review the details and confirm the next step.',
        },
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order,
        orderNumber: order.orderNumber,
        srn: order.srn,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('API /api/orders POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order.' },
      { status: 500 },
    );
  }
}
