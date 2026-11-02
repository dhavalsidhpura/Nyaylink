import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, orderAccess, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { sendNotificationEmail } from '@/lib/email';
import { dispatchMilestoneWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

const schema = z.object({
  orderId: z.string().min(1),
  portalName: z.string().trim().min(2).max(100),
  portalUrl: z.string().trim().url(),
  username: z.string().trim().min(2).max(100),
  password: z.string().trim().min(1).max(200),
  arnOrCin: z.string().trim().max(100).optional(),
  remarks: z.string().trim().max(500).optional(),
});

export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.caseworkers);
  const input = schema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { client: true, service: true },
  });
  if (!order || orderAccess(user, order) !== 'staff') {
    throw new HttpError(404, 'Order not found.');
  }

  const existingIntake = (order.intakeData as Record<string, any>) || {};
  const governmentCredentials = {
    portalName: input.portalName,
    portalUrl: input.portalUrl,
    username: input.username,
    password: input.password,
    arnOrCin: input.arnOrCin || order.srn || '',
    remarks: input.remarks || '',
    vaultedAt: new Date().toISOString(),
    vaultedBy: user.name,
  };

  const updatedIntake = {
    ...existingIntake,
    governmentCredentials,
  };

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: {
        intakeData: updatedIntake,
        ...(!order.srn && input.arnOrCin ? { srn: input.arnOrCin } : {}),
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'CREDENTIALS_VAULTED',
        remarks: `Official credentials for ${input.portalName} (${input.username}) securely vaulted and published to Client Vault.`,
        actorId: user.id,
      },
    });

    return o;
  });

  // Notify client via WhatsApp milestone bot
  if (order.client.phone) {
    try {
      await dispatchMilestoneWhatsApp({
        phone: order.client.phone,
        clientName: order.client.name,
        orderNumber: order.orderNumber,
        serviceTitle: order.service.title,
        milestone: 'APPROVED_COMPLETED',
        srn: input.arnOrCin || order.srn || undefined,
        remarks: `Your official ${input.portalName} credentials have been deposited into your private NyayaLink Vault. Login ID: ${input.username}. Check your dashboard to view your credentials and original government certificates.`,
      });
    } catch (err: any) {
      console.warn('[credentials] Failed to send milestone WhatsApp:', err?.message);
    }
  }

  return NextResponse.json({
    success: true,
    credentials: governmentCredentials,
    srn: updated.srn,
  });
});
