import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS, clientIp } from '@/lib/authz';
import { createApprovalRequest } from '@/lib/approvals';
import { plain } from '@/lib/serialize';
import type { ApprovalType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.staff);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') as any;

  const where = status ? { status } : {};

  const requests = await prisma.approvalRequest.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, email: true, role: true } },
      reviewer: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, approvals: plain(requests) });
});

const createSchema = z.object({
  type: z.enum(['REFUND', 'CATALOG_PRICE_CHANGE', 'MANUAL_LEDGER_ADJUSTMENT', 'PAYOUT_DISBURSEMENT', 'RULE_OVERRIDE']),
  title: z.string().min(5).max(150),
  reason: z.string().min(10).max(1000),
  payload: z.record(z.any()),
});

export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.staff);
  const body = createSchema.parse(await request.json());

  const ip = clientIp(request);

  const approval = await createApprovalRequest({
    type: body.type as ApprovalType,
    title: body.title,
    reason: body.reason,
    payload: body.payload,
    requesterId: user.id,
    requesterRole: user.role,
    ipAddress: ip,
  });

  return NextResponse.json({ success: true, approval: plain(approval) }, { status: 201 });
});
