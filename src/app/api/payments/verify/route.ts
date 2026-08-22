import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

    // Verify HMAC-SHA256 signature
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = generated_signature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Update order status in PostgreSQL
    if (orderNumber) {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'PAID',
          status: 'DOCS_PENDING',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully.',
        paymentId: razorpay_payment_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during verification.' },
      { status: 500 }
    );
  }
}