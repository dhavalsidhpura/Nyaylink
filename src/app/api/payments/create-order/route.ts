import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { amount, serviceTitle, clientName, clientEmail, clientPhone } = await request.json();

    if (!amount || !clientEmail) {
      return NextResponse.json(
        { success: false, error: 'Amount and client email are required.' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // Amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        serviceTitle: serviceTitle || 'Compliance Filing',
        clientName: clientName || 'Client',
      },
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Create a pending order entry in your database
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NYA-2026-${randomSuffix}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        srn: `SRN-${randomSuffix}`,
        serviceTitle: serviceTitle || 'Legal Filing',
        serviceSlug: 'filing',
        clientName: clientName || 'Applicant',
        clientEmail: clientEmail.toLowerCase().trim(),
        clientPhone: clientPhone || '',
        companyName: clientName || 'Business Entity',
        state: 'MH',
        amount: Number(amount),
        status: 'PENDING_PAYMENT',
        paymentStatus: 'UNPAID',
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: key_id,
        orderNumber: newOrder.orderNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}