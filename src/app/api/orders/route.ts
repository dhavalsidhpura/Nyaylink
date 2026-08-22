import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all active orders (or filtered by user email query)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    const orders = await prisma.order.findMany({
      where: email ? { clientEmail: email } : undefined,
      include: {
        documents: true,
        ledgerEntries: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('API /api/orders GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

// POST: Create a new statutory filing order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceTitle,
      serviceSlug,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      state,
      amount,
      baseFee,
      govtFee,
      gstAmount,
    } = body;

    if (!serviceTitle || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { success: false, error: 'Required applicant fields missing.' },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NYA-2026-${randomSuffix}`;
    const srn = `SRN-MCA-${randomSuffix}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        srn,
        serviceTitle,
        serviceSlug: serviceSlug || 'general-filing',
        clientName,
        clientEmail: clientEmail.toLowerCase().trim(),
        clientPhone,
        companyName: companyName || clientName,
        state: state || 'MH',
        amount: Number(amount) || 6999,
        baseFee: Number(baseFee) || 5000,
        govtFee: Number(govtFee) || 1000,
        gstAmount: Number(gstAmount) || 999,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'UNPAID',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully.',
        order: newOrder,
        orderNumber: newOrder.orderNumber,
        srn: newOrder.srn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /api/orders POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record order in database.' },
      { status: 500 }
    );
  }
}