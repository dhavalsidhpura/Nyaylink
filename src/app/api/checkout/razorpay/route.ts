import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, serviceTitle, clientName, clientEmail, clientPhone } = body;

    if (!amount || !serviceTitle) {
      return NextResponse.json(
        { success: false, error: 'Amount and service title are required.' },
        { status: 400 }
      );
    }

    const randomRef = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NYA-2026-${randomRef}`;
    const srn = `MCA-SPICE-2026-${randomRef}`;

    return NextResponse.json(
      {
        success: true,
        orderNumber,
        srn,
        razorpayOrderId: `order_rzp_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /api/checkout/razorpay error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate checkout.' },
      { status: 500 }
    );
  }
}