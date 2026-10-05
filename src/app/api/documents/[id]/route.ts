import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, orderAccess, requireUser } from '@/lib/authz';
import { getDownload } from '@/lib/storage';

// Authorised, audited document download. Owners and caseworkers only.
export const GET = apiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const doc = await prisma.vaultDocument.findUnique({
    where: { id: params.id },
    include: { order: { select: { clientId: true, assignedCAId: true } } },
  });
  const allowed = doc && (doc.ownerId === user.id || (doc.order && orderAccess(user, doc.order)));
  if (!doc || !allowed) {
    throw new HttpError(404, 'Document not found.');
  }

  await prisma.documentAccessLog.create({
    data: { documentId: doc.id, userId: user.id, action: 'DOWNLOAD', ip: clientIp(request) },
  });

  const download = await getDownload(doc.storageKey, doc.originalName, doc.mimeType);
  if (download.kind === 'redirect') {
    return NextResponse.redirect(download.url, { headers: { 'Cache-Control': 'no-store' } });
  }
  return new NextResponse(new Uint8Array(download.body), {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `inline; filename="${doc.originalName.replace(/[^\w.\- ]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
