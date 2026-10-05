import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, orderAccess, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { sendNotificationEmail, buildDocumentRejectedEmail } from '@/lib/email';

const schema = z.discriminatedUnion('status', [
  z.object({ documentId: z.string().min(1), status: z.literal('VERIFIED') }),
  z.object({ documentId: z.string().min(1), status: z.literal('REJECTED'), rejectNote: z.string().trim().min(5).max(500) }),
]);

export const PATCH = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.caseworkers);
  const input = schema.parse(await request.json());

  const doc = await prisma.vaultDocument.findUnique({
    where: { id: input.documentId },
    include: { order: true, owner: { select: { name: true, email: true } } },
  });
  if (!doc || !doc.order || orderAccess(user, doc.order) !== 'staff') throw new HttpError(404, 'Document not found.');
  if (doc.status === 'SUPERSEDED') throw new HttpError(409, 'A newer version of this document exists.');

  const rejectNote = input.status === 'REJECTED' ? input.rejectNote : null;

  const document = await prisma.$transaction(async (tx) => {
    const updated = await tx.vaultDocument.update({
      where: { id: doc.id },
      data: { status: input.status, rejectNote, reviewedById: user.id, reviewedAt: new Date() },
    });
    await tx.documentAccessLog.create({ data: { documentId: doc.id, userId: user.id, action: 'REVIEW', ip: clientIp(request) } });
    await tx.orderStatusLog.create({
      data: {
        orderId: doc.order!.id,
        status: input.status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
        remarks: input.status === 'VERIFIED' ? `"${doc.name}" verified.` : `"${doc.name}" rejected: ${rejectNote}`,
        actorId: user.id,
      },
    });
    return updated;
  });

  if (input.status === 'REJECTED') {
    await sendNotificationEmail({
      to: doc.owner.email,
      subject: `Action needed on ${doc.order.orderNumber}: re-upload ${doc.name}`,
      html: buildDocumentRejectedEmail(doc.owner.name, doc.order.orderNumber, doc.name, rejectNote!),
    });
  }

  return NextResponse.json({ success: true, document: { id: document.id, status: document.status } });
});
