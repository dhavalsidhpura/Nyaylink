import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser, orderAccess } from '@/lib/authz';
import { dispatchMilestoneWhatsApp, formatE164Phone } from '@/lib/whatsapp';

const schema = z.object({
  action: z.enum(['send_test', 'update_phone']),
  phone: z.string().trim().min(10).max(15).optional(),
});

export const POST = apiHandler(async (request: Request, context?: { params: { orderNumber: string } }) => {
  const user = await requireUser();
  const orderNumber = context?.params?.orderNumber;
  if (!orderNumber) throw new HttpError(400, 'Order number required.');

  const body = schema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { client: true, service: true },
  });

  if (!order) throw new HttpError(404, 'Order not found.');
  const access = orderAccess(user, order);
  if (!access) throw new HttpError(403, 'Access denied.');

  let targetPhone = body.phone || order.client.phone;
  if (!targetPhone) {
    throw new HttpError(400, 'No phone number associated with this order.');
  }

  if (body.action === 'update_phone' && body.phone) {
    await prisma.user.update({
      where: { id: order.client.id },
      data: { phone: body.phone },
    });
    targetPhone = body.phone;
  }

  const result = await dispatchMilestoneWhatsApp({
    phone: targetPhone,
    clientName: order.client.name,
    orderNumber: order.orderNumber,
    serviceTitle: order.service.title,
    milestone: 'TEST_ALERT',
    srn: order.srn || undefined,
  });

  return NextResponse.json({
    success: result.success,
    phone: formatE164Phone(targetPhone),
    simulated: (result as any).simulated || false,
    message: result.success
      ? `Live milestone alert sent to +${formatE164Phone(targetPhone)}`
      : 'Failed to send WhatsApp message.',
  });
});
