import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { orderId, newStatus, remarks } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'Order ID and Status are required' },
        { status: 400 }
      );
    }

    // 1. Update status on order record
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // 2. Append entry to order status history log
    await prisma.order_status_logs.create({
      data: {
        order_id: orderId,
        status: newStatus,
        remarks: remarks || `Status updated to ${newStatus} by CA team operator.`,
      },
    });

    return NextResponse.json({
      success: true,
      status: updatedOrder.status,
    });
  } catch (error: any) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}