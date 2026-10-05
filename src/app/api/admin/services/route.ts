import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { syncCatalog } from '@/lib/catalog';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await requireRole(ROLE_GROUPS.staff);
  await syncCatalog();
  const services = await prisma.service.findMany({ orderBy: [{ category: 'asc' }, { title: 'asc' }] });
  return NextResponse.json({ success: true, services: plain(services) });
});

const schema = z.object({
  slug: z.string().min(1),
  professionalFee: z.number().min(0).max(10_000_000).optional(),
  govtFee: z.number().min(0).max(10_000_000).optional(),
  govtFeeNote: z.string().trim().max(200).optional(),
  gstRate: z.number().min(0).max(28).optional(),
  sla: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
});

// Price changes apply to new orders only; existing orders keep the price they were created with.
export const PATCH = apiHandler(async (req: Request) => {
  await requireRole(ROLE_GROUPS.ops);
  const { slug, ...data } = schema.parse(await req.json());
  const existing = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Service not found.');
  const service = await prisma.service.update({ where: { slug }, data });
  return NextResponse.json({ success: true, service: plain(service) });
});
