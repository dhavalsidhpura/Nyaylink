import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, orderAccess, requireUser } from '@/lib/authz';

const schema = z.object({
  orderId: z.string().min(1),
  requirementKey: z.string().nullable().optional(),
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(1).max(50),
  sizeBytes: z.number().int().min(1),
  sha256: z.string().optional(),
});

/**
 * Completes direct S3 document streaming by creating the VaultDocument record in DB,
 * logging audit trails, and advancing the order timeline.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const body = schema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: { service: { include: { requirements: true } } },
  });

  const access = order ? orderAccess(user, order) : null;
  if (!order || !access) throw new HttpError(404, 'Order not found.');

  const requirement = body.requirementKey
    ? order.service.requirements.find((r) => r.key === body.requirementKey)
    : null;

  const previous = body.requirementKey
    ? await prisma.vaultDocument.findFirst({
        where: { orderId: order.id, requirementKey: body.requirementKey, status: { not: 'SUPERSEDED' } },
        orderBy: { version: 'desc' },
      })
    : null;

  const name = requirement?.label || body.fileName.slice(0, 120);

  const document = await prisma.$transaction(async (tx) => {
    if (previous) {
      await tx.vaultDocument.update({
        where: { id: previous.id },
        data: { status: 'SUPERSEDED' },
      });
    }

    const doc = await tx.vaultDocument.create({
      data: {
        name,
        requirementKey: body.requirementKey || null,
        storageKey: body.storageKey,
        originalName: body.fileName.slice(0, 200),
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        sha256: body.sha256 || 's3-direct-stream',
        version: (previous?.version ?? 0) + 1,
        supersedesId: previous?.id,
        category: order.service.category,
        ownerId: order.clientId,
        orderId: order.id,
      },
    });

    await tx.documentAccessLog.create({
      data: {
        documentId: doc.id,
        userId: user.id,
        action: 'UPLOAD',
        ip: clientIp(request),
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'DOCUMENT_UPLOADED',
        remarks: `${previous ? 'Re-uploaded (S3 Direct)' : 'Uploaded (S3 Direct)'}: ${name}${previous ? ` (v${doc.version})` : ''}`,
        actorId: user.id,
      },
    });

    return doc;
  });

  return NextResponse.json(
    { success: true, documentId: document.id, version: document.version },
    { status: 201 }
  );
});
