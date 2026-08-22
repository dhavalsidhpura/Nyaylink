import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guards';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
]);

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

    const storageKey = `${orderId}/${randomUUID()}${extension}`;
    const privateRoot = process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), '.private-data', 'uploads');
    const filePath = path.join(privateRoot, storageKey);

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: 'wx' });

    const document = await prisma.vaultDocument.create({
      data: {
        name: typeof documentName === 'string' && documentName.trim() ? documentName.trim() : file.name,
        fileUrl: `private://${storageKey}`,
        category: typeof documentName === 'string' && documentName.trim() ? documentName.trim() : 'General',
        ownerId: order.clientId,
        orderId: order.id,
      },
      select: { id: true, name: true, status: true, uploadedAt: true },
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded to the private vault.',
    });
  } catch (error) {
    console.error('Private document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process document upload.' },
      { status: 500 },
    );
  }
}
