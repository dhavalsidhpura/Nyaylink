import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole } from '@/lib/authz';
import { num } from '@/lib/serialize';
import { sendNotificationEmail, buildPaymentRequestEmail } from '@/lib/email';

const schema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive().max(10_000_000),
  description: z.string().trim().min(3).max(200),
  // true: amount is an additional professional fee and 18% GST is added on top.
  // false: pass-through government fee / stamp duty (no GST).
  gstApplicable: z.boolean(),
});

// Milestone / additional payment request on an existing order (e.g. state stamp duty, extra filings).
export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(['SUPER_ADMIN', 'OPS_MANAGER', 'FINANCE_MANAGER', 'CA_CS_LEAD']);
  const input = schema.parse(await request.json());

  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { client: true, service: true } });
  if (!order) throw new HttpError(404, 'Order not found.');
  if (order.paymentStatus === 'UNPAID') throw new HttpError(409, 'The initial payment is still pending.');

  const base = Math.round(input.amount * 100);
  const gst = input.gstApplicable ? Math.round((base * num(order.service.gstRate)) / 100) : 0;
  const total = (base + gst) / 100;

  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        kind: 'MILESTONE',
        amount: total,
        taxableAmount: input.gstApplicable ? base / 100 : 0,
        gstAmount: gst / 100,
        description: `${input.description} (${order.orderNumber})`,
        orderId: order.id,
      },
    });
    await tx.order.update({
      where: { id: order.id },
      data: {
        totalAmount: { increment: total },
        ...(input.gstApplicable
          ? { professionalFee: { increment: base / 100 }, gstAmount: { increment: gst / 100 } }
          : { govtFee: { increment: total } }),
        paymentStatus: 'PARTIALLY_PAID',
      },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'PAYMENT_REQUESTED',
        remarks: `Payment of ₹${total.toLocaleString('en-IN')} requested: ${input.description}`,
        actorId: user.id,
      },
    });
    return p;
  });

  await sendNotificationEmail({
    to: order.client.email,
    subject: `Payment requested [${order.orderNumber}]`,
    html: buildPaymentRequestEmail(order.client.name, order.orderNumber, total, input.description),
  });

  return NextResponse.json({ success: true, paymentId: payment.id }, { status: 201 });
});
