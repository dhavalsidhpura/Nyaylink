import { NextResponse } from 'next/server';
import { z } from 'zod';
import { LeadStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler, requireRole, ROLE_GROUPS, publicUserSelect } from '@/lib/authz';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await requireRole(ROLE_GROUPS.staff);
  const leads = await prisma.lead.findMany({
    include: { assignedTo: { select: publicUserSelect } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, leads });
});

const createSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().min(10).max(15),
  source: z.string().trim().max(60).optional(),
  complianceType: z.string().trim().max(120).optional(),
});

// Public: website enquiry form.
export const POST = apiHandler(async (request: Request) => {
  const input = createSchema.parse(await request.json());
  const lead = await prisma.lead.create({
    data: {
      fullName: input.fullName,
      email: input.email || null,
      phone: input.phone,
      source: input.source || 'Website Intake',
      complianceType: input.complianceType || 'General Inquiry',
    },
    select: { id: true },
  });
  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
});

const updateSchema = z.object({
  leadId: z.string().min(1),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.string().nullable().optional(),
});

export const PATCH = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.staff);
  const { leadId, ...data } = updateSchema.parse(await request.json());
  const lead = await prisma.lead.update({ where: { id: leadId }, data });
  return NextResponse.json({ success: true, lead });
});
