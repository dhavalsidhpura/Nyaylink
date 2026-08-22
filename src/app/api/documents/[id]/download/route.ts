import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';

const STAFF_ROLES = new Set([
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
]);

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const document = await prisma.vaultDocument.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        ownerId: true,
        order: { select: { assignedCAId: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
    }

    const isOwner = document.ownerId === auth.user.id;
    const isAssignedStaff = document.order?.assignedCAId === auth.user.id;
    const isStaff = STAFF_ROLES.has(auth.user.role);

    if (!isOwner && !isAssignedStaff && !isStaff) {
      return NextResponse.json({ success: false, error: 'You do not have access to this document.' }, { status: 403 });
    }

    if (!document.fileUrl.startsWith('private://')) {
      return NextResponse.json({ success: false, error: 'Document storage reference is invalid.' }, { status: 500 });
    }

    const storageKey = document.fileUrl.slice('private://'.length);
    const privateRoot = path.resolve(
      process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), '.private-data', 'uploads'),
    );
    const filePath = path.resolve(privateRoot, storageKey);

    if (!filePath.startsWith(`${privateRoot}${path.sep}`)) {
      return NextResponse.json({ success: false, error: 'Document path is invalid.' }, { status: 400 });
    }

    const file = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const safeName = document.name.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 120) || 'document';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Private document download error:', error);
    return NextResponse.json({ success: false, error: 'Unable to download document.' }, { status: 404 });
  }
}
