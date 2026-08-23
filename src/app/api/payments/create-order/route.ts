import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateOrderTotals } from '@/lib/pricing';
import { requireUser } from '@/lib/auth-guards';

function createReference(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { success: false, error: 'Payment service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const requestedOrderId = typeof body.orderId === 'string' ? body.orderId : '';
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

    let order = requestedOrderId
      ? await prisma.order.findFirst({
          where: { id: requestedOrderId, clientId: auth.user.id },
          include: { service: true },
        })
      : null;

    if (!order) {
      if (!serviceSlug) {
        return NextResponse.json(
          { success: false, error: 'A service or valid order is required.' },
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

      order = await prisma.order.create({
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
    }

    const amountInPaise = Math.round(order.amount * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'The order amount is invalid.' },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        service: order.service.title,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      orderNumber: order.orderNumber,
      localOrderId: order.id,
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order.' },
      { status: 500 },
    );
  }
}
