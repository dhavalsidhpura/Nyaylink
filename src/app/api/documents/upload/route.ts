import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, orderAccess, requireUser } from '@/lib/authz';
import { MAX_UPLOAD_BYTES, newStorageKey, putObject, sha256, sniffFileType } from '@/lib/storage';

const CLOSED_STATUSES = ['APPROVED', 'REJECTED'];

export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const form = await request.formData();
  const file = form.get('file');
  const orderId = String(form.get('orderId') || '');
  const requirementKey = String(form.get('requirementKey') || '') || null;

  if (!(file instanceof File) || !orderId) throw new HttpError(400, 'A file and order are required.');
  if (file.size === 0) throw new HttpError(400, 'The file is empty.');
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, 'Files must be 10 MB or smaller.');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: { include: { requirements: true } } },
  });
  const access = order ? orderAccess(user, order) : null;
  if (!order || !access) throw new HttpError(404, 'Order not found.');
  const isCaseworker = access === 'staff';
  if (CLOSED_STATUSES.includes(order.status)) throw new HttpError(409, 'This application is closed for uploads.');

  const requirement = requirementKey ? order.service.requirements.find((r) => r.key === requirementKey) : null;
  if (requirementKey && !requirement) throw new HttpError(400, 'Unknown document requirement.');

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = sniffFileType(buffer);
  if (!type) throw new HttpError(415, 'Only PDF, JPG and PNG files are accepted.');

  // Re-upload: the latest version for this requirement is superseded, keeping full history.
  const previous = requirementKey
    ? await prisma.vaultDocument.findFirst({
        where: { orderId, requirementKey, status: { not: 'SUPERSEDED' } },
        orderBy: { version: 'desc' },
      })
    : null;
  if (previous?.status === 'VERIFIED' && !isCaseworker) {
    throw new HttpError(409, 'This document is already verified. Contact your compliance desk to replace it.');
  }

  const storageKey = newStorageKey(order.clientId, type.ext);
  await putObject(storageKey, buffer, type.mime);

  const name = requirement?.label || String(form.get('documentName') || '').slice(0, 120) || file.name.slice(0, 120);
  const document = await prisma.$transaction(async (tx) => {
    if (previous) await tx.vaultDocument.update({ where: { id: previous.id }, data: { status: 'SUPERSEDED' } });
    const doc = await tx.vaultDocument.create({
      data: {
        name,
        requirementKey,
        storageKey,
        originalName: file.name.slice(0, 200),
        mimeType: type.mime,
        sizeBytes: file.size,
        sha256: sha256(buffer),
        version: (previous?.version ?? 0) + 1,
        supersedesId: previous?.id,
        category: order.service.category,
        ownerId: order.clientId,
        orderId: order.id,
      },
    });
    await tx.documentAccessLog.create({ data: { documentId: doc.id, userId: user.id, action: 'UPLOAD', ip: clientIp(request) } });
    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'DOCUMENT_UPLOADED',
        remarks: `${previous ? 'Re-uploaded' : 'Uploaded'}: ${name}${previous ? ` (v${doc.version})` : ''}`,
        actorId: user.id,
      },
    });
    return doc;
  });

  return NextResponse.json({ success: true, documentId: document.id, version: document.version }, { status: 201 });
});
