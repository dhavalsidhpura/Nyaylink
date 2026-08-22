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
      include: {
        service: true,
        documents: true,
        ledger: true,
        invoices: true,
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
    const state = typeof body.state === 'string' ? body.state.trim().toUpperCase() : 'MH';

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

    const order = await prisma.order.create({
      data: {
        orderNumber: createReference('NYA'),
        srn: createReference('SRN'),
        serviceId: service.id,
        clientId: auth.user.id,
        amount: service.startingPrice,
        govtFee: 0,
        state,
        status: 'SUBMITTED',
      },
      include: { service: true },
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
