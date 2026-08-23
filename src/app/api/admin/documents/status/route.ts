import { DocStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
] as const;

const allowedStatuses = new Set(Object.values(DocStatus));

export async function PATCH(request: Request) {
  const auth = await requireRole(STAFF_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const documentId = typeof body.documentId === 'string' ? body.documentId : '';
    const status = typeof body.status === 'string' ? body.status : '';
    const rejectNote = typeof body.rejectNote === 'string' ? body.rejectNote.trim().slice(0, 500) : '';

    if (!documentId || !allowedStatuses.has(status as DocStatus)) {
      return NextResponse.json(
        { success: false, error: 'A valid document and review status are required.' },
        { status: 400 },
      );
    }

    if (status === 'REJECTED' && !rejectNote) {
      return NextResponse.json(
        { success: false, error: 'Add a short reason before rejecting a document.' },
        { status: 400 },
      );
    }

    const document = await prisma.vaultDocument.findUnique({
      where: { id: documentId },
      select: { id: true, name: true, orderId: true, status: true, order: { select: { service: { select: { title: true } } } } },
    });

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
    }

    const updatedDocument = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.vaultDocument.update({
        where: { id: document.id },
        data: {
          status: status as DocStatus,
          rejectNote: status === 'REJECTED' ? rejectNote : null,
        },
        select: { id: true, name: true, status: true, rejectNote: true, uploadedAt: true },
      });

      if (document.orderId) {
        await transaction.caseEvent.create({
          data: {
            orderId: document.orderId,
            actorId: auth.user.id,
            eventType: 'DOCUMENT_REVIEWED',
            title: status === 'VERIFIED' ? 'Document verified' : status === 'REJECTED' ? 'Document needs replacement' : 'Document review reopened',
            message: status === 'VERIFIED'
              ? `${document.name} was reviewed and accepted for your ${document.order?.service.title || 'case'}.`
              : status === 'REJECTED'
                ? `${document.name} needs to be replaced. Please check the case message for the reason.`
                : `${document.name} has been returned to review.`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error('Admin document status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document review status.' },
      { status: 500 },
    );
  }
}
