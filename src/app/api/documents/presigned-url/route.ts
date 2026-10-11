import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, orderAccess, requireUser } from '@/lib/authz';
import {
  MAX_UPLOAD_BYTES,
  newStorageKey,
  isCloudStorageConfigured,
  getUploadPresignedUrl,
} from '@/lib/storage';

const CLOSED_STATUSES = ['APPROVED', 'REJECTED'];

const schema = z.object({
  orderId: z.string().min(1),
  requirementKey: z.string().nullable().optional(),
  fileName: z.string().min(1).max(200),
  mimeType: z.enum(['application/pdf', 'image/png', 'image/jpeg']),
  sizeBytes: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

/**
 * Generates an ephemeral S3 presigned PUT URL allowing clients to stream
 * large legal documents (up to 10 MB) directly to AWS S3, bypassing Vercel's 4.5 MB request body limit.
 * Falls back to 'local' mode if S3 is not configured in the current environment.
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
  const isCaseworker = access === 'staff';

  if (CLOSED_STATUSES.includes(order.status)) {
    throw new HttpError(409, 'This application is closed for document uploads.');
  }

  if (body.requirementKey) {
    const req = order.service.requirements.find((r) => r.key === body.requirementKey);
    if (!req) throw new HttpError(400, 'Unknown document requirement key.');

    const previous = await prisma.vaultDocument.findFirst({
      where: { orderId: order.id, requirementKey: body.requirementKey, status: { not: 'SUPERSEDED' } },
      orderBy: { version: 'desc' },
    });

    if (previous?.status === 'VERIFIED' && !isCaseworker) {
      throw new HttpError(409, 'This document is already verified. Contact your compliance desk to replace it.');
    }
  }

  const ext = EXTENSIONS[body.mimeType] || 'pdf';
  const storageKey = newStorageKey(order.clientId, ext);

  if (!isCloudStorageConfigured()) {
    // In local development or environments without S3, client will use traditional POST /api/documents/upload
    return NextResponse.json({
      success: true,
      mode: 'local',
      storageKey: null,
      presignedUrl: null,
    });
  }

  const presignedUrl = await getUploadPresignedUrl(storageKey, body.mimeType, 300);
  if (!presignedUrl) {
    return NextResponse.json({
      success: true,
      mode: 'local',
      storageKey: null,
      presignedUrl: null,
    });
  }

  return NextResponse.json({
    success: true,
    mode: 's3',
    storageKey,
    presignedUrl,
    expiresInSeconds: 300,
  });
});
