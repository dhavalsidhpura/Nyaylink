import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';
import { putPrivateObject, removePrivateObject } from '@/lib/private-storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
]);

function hasExpectedSignature(type: string, bytes: Buffer) {
  if (type === 'application/pdf') {
    return bytes.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  if (type === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === 'image/png') {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  return false;
}

const STAFF_ROLES = new Set([
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
]);

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const orderId = formData.get('orderId');
    const documentName = formData.get('documentName');

    if (!(file instanceof File) || typeof orderId !== 'string' || !orderId) {
      return NextResponse.json(
        { success: false, error: 'A file and order ID are required.' },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Files must be larger than zero and no larger than 10 MB.' },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES.get(file.type);

    if (!extension) {
      return NextResponse.json(
        { success: false, error: 'Only PDF, JPG, and PNG files are accepted.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, clientId: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 },
      );
    }

    const isStaff = STAFF_ROLES.has(auth.user.role);

    if (order.clientId !== auth.user.id && !isStaff) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this order.' },
        { status: 403 },
      );
    }

    const fileBytes = Buffer.from(await file.arrayBuffer());

    if (!hasExpectedSignature(file.type, fileBytes)) {
      return NextResponse.json(
        { success: false, error: 'The file content does not match its declared type.' },
        { status: 400 },
      );
    }

    const safeDocumentName = typeof documentName === 'string' && documentName.trim()
      ? documentName.trim().slice(0, 160)
      : file.name.slice(0, 160);
    const storageKey = `${orderId}/${randomUUID()}${extension}`;
    const storedObject = await putPrivateObject(storageKey, fileBytes);

    try {
      const document = await prisma.vaultDocument.create({
        data: {
          name: safeDocumentName,
          fileUrl: storedObject.uri,
          category: safeDocumentName,
          ownerId: order.clientId,
          orderId: order.id,
          mimeType: file.type,
          fileSize: storedObject.size,
          checksum: storedObject.checksum,
        },
        select: { id: true, name: true, status: true, uploadedAt: true, fileSize: true, checksum: true },
      });

      return NextResponse.json({
        success: true,
        document,
        message: 'Document uploaded to the private vault.',
      });
    } catch (error) {
      await removePrivateObject(storedObject.uri).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error('Private document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process document upload.' },
      { status: 500 },
    );
  }
}
