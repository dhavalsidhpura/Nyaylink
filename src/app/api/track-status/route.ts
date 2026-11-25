import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/authz';

const schema = z.object({
  query: z.string().trim().min(3).max(60),
});

export const POST = apiHandler(async (request: Request) => {
  const { query } = schema.parse(await request.json());
  const clean = query.trim().toUpperCase();

  // 1. Check local NyayaLink database for existing order or registered SRN
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: { equals: clean, mode: 'insensitive' } },
        { srn: { equals: clean, mode: 'insensitive' } },
      ],
    },
    include: {
      service: { select: { title: true, sla: true, category: true } },
      statusLogs: { orderBy: { createdAt: 'desc' }, take: 6 },
    },
  });

  if (order) {
    const isApproved = order.status === 'APPROVED';
    return NextResponse.json({
      success: true,
      source: 'NYAYALINK_VAULT',
      type: 'NyayaLink Corporate Docket',
      identifier: order.orderNumber,
      srn: order.srn || 'Pending Issuance',
      title: order.service.title,
      status: order.status,
      sla: order.service.sla,
      lastUpdated: order.updatedAt,
      stageNumber: isApproved ? 5 : order.status === 'QUERY_RAISED' ? 3 : 2,
      recommendation: isApproved
        ? 'Filing successfully certified by Registrar. You can download the stamped Certificate directly from your Vault.'
        : order.status === 'QUERY_RAISED'
        ? 'Action Required: The CA desk or Registrar raised a defect query. Please inspect your order dashboard.'
        : 'Docket under active CA drafting and verification. Government submission in progress.',
      history: order.statusLogs.map((l) => ({
        stage: l.status.replace(/_/g, ' '),
        remarks: l.remarks,
        date: l.createdAt,
      })),
    });
  }

  // 2. External registry format identification (no fabricated status claims)
  const isTrademark = /^\d{6,8}$/.test(clean);
  const isMcaSrn = /^[A-Z]\d{8}$/.test(clean) || clean.startsWith('SRN') || clean.length === 9;
  const isGstArn = clean.startsWith('AA') && clean.length === 15;

  if (isTrademark) {
    return NextResponse.json({
      success: true,
      source: 'IPINDIA_FORMAT_MATCH',
      type: 'Trade Marks Registry (IP India)',
      identifier: clean,
      srn: `TM-${clean}`,
      title: `Trade Marks Application #${clean}`,
      status: 'EXTERNAL_PORTAL_LOOKUP',
      sla: 'Verify on IP India e-Register',
      lastUpdated: new Date().toISOString(),
      stageNumber: 1,
      externalUrl: 'https://ipindiaservices.gov.in/eregister/eregister.aspx',
      recommendation:
        'This trademark application number is not linked to a NyayaLink Vault order. Use the official IP India e-Register portal to view live Examination Report or Journal status.',
      history: [],
    });
  }

  if (isMcaSrn) {
    return NextResponse.json({
      success: true,
      source: 'MCA_FORMAT_MATCH',
      type: 'Ministry of Corporate Affairs (MCA V3)',
      identifier: clean,
      srn: clean,
      title: `MCA Service Request #${clean}`,
      status: 'EXTERNAL_PORTAL_LOOKUP',
      sla: 'Verify on MCA V3 Track SRN',
      lastUpdated: new Date().toISOString(),
      stageNumber: 1,
      externalUrl: 'https://www.mca.gov.in/mcafoportal/trackSRN.do',
      recommendation:
        'This MCA SRN is not in your NyayaLink Vault database. Check real-time CRC/ROC approval status directly on the official MCA V3 Track SRN portal.',
      history: [],
    });
  }

  if (isGstArn) {
    return NextResponse.json({
      success: true,
      source: 'GSTN_FORMAT_MATCH',
      type: 'Goods & Services Tax Network (GSTN)',
      identifier: clean,
      srn: clean,
      title: `GST Application Reference #${clean}`,
      status: 'EXTERNAL_PORTAL_LOOKUP',
      sla: 'Verify on GSTN Portal',
      lastUpdated: new Date().toISOString(),
      stageNumber: 1,
      externalUrl: 'https://services.gst.gov.in/services/arnstatus',
      recommendation:
        'This GST ARN is not linked to an order in our system. Verify live officer review and GSTIN allotment directly on the official GSTN ARN Status page.',
      history: [],
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: `No NyayaLink order found for "${clean}". Enter a valid NyayaLink Order # (e.g. NYL-...) or a standard MCA SRN, 7-digit TM number, or 15-character GST ARN.`,
    },
    { status: 404 }
  );
});
