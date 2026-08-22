import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderId = formData.get('orderId') as string;
    const rawReqId = formData.get('documentRequirementId') as string | null;
    const documentName = (formData.get('documentName') as string) || 'Document';

    if (!file || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required file or order ID' },
        { status: 400 }
      );
    }

    // 1. Fetch order details
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { id: true, service_id: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 2. Resolve document_requirement_id
    let docReqId: string;
    const isUuid =
      rawReqId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawReqId);

    if (isUuid && rawReqId) {
      docReqId = rawReqId;
    } else {
      let req = await prisma.service_document_requirements.findFirst({
        where: {
          service_id: order.service_id,
          document_name: documentName,
        },
      });

      if (!req) {
        req = await prisma.service_document_requirements.create({
          data: {
            service_id: order.service_id,
            document_name: documentName,
            description: `Required document for ${documentName}`,
          },
        });
      }

      docReqId = req.id;
    }

    // 3. Save physical file to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${sanitizedFileName}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    const fileSizeInt = Math.floor(file.size);

    // 4. Save to PostgreSQL order_documents table with file_size included
    const existingDoc = await prisma.order_documents.findFirst({
      where: {
        order_id: orderId,
        document_requirement_id: docReqId,
      },
    });

    if (existingDoc) {
      await prisma.order_documents.update({
        where: { id: existingDoc.id },
        data: {
          file_url: fileUrl,
          file_name: file.name,
          file_size: fileSizeInt,
        },
      });
    } else {
      await prisma.order_documents.create({
        data: {
          order_id: orderId,
          document_requirement_id: docReqId,
          file_url: fileUrl,
          file_name: file.name,
          file_size: fileSizeInt,
        },
      });
    }

    // 5. Log activity
    await prisma.order_status_logs.create({
      data: {
        order_id: orderId,
        status: 'document_uploaded',
        remarks: `Uploaded document: ${documentName} (${file.name})`,
      },
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process document upload' },
      { status: 500 }
    );
  }
}