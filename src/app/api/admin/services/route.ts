import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { syncCatalog, syncServiceRequirements, requirementKey } from '@/lib/catalog';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await requireRole(ROLE_GROUPS.staff);
  await syncCatalog();
  const services = await prisma.service.findMany({
    include: {
      requirements: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });
  return NextResponse.json({ success: true, services: plain(services) });
});

const patchSchema = z.object({
  slug: z.string().min(1),
  title: z.string().trim().min(2).max(150).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  professionalFee: z.number().min(0).max(10_000_000).optional(),
  govtFee: z.number().min(0).max(10_000_000).optional(),
  govtFeeNote: z.string().trim().max(200).optional(),
  gstRate: z.number().min(0).max(28).optional(),
  sla: z.string().trim().max(100).optional(),
  sacCode: z.string().trim().max(20).optional(),
  isActive: z.boolean().optional(),
  requirements: z.array(z.string().trim().min(1)).optional(),
});

// Updates apply to new orders only; existing orders keep the rate they were booked with.
export const PATCH = apiHandler(async (req: Request) => {
  await requireRole(ROLE_GROUPS.ops);
  const { slug, requirements, ...data } = patchSchema.parse(await req.json());
  const existing = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Service not found.');

  if (requirements !== undefined) {
    await syncServiceRequirements(existing.id, requirements);
  }

  const service = await prisma.service.update({
    where: { slug },
    data,
    include: { requirements: { orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json({ success: true, service: plain(service) });
});

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must consist only of lowercase letters, numbers, and hyphens'),
  title: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(50).default('business-compliance'),
  professionalFee: z.number().min(0).max(10_000_000).default(4999),
  govtFee: z.number().min(0).max(10_000_000).default(0),
  govtFeeNote: z.string().trim().max(200).default('Direct statutory portal charges at actuals'),
  gstRate: z.number().min(0).max(28).default(18),
  sla: z.string().trim().max(100).default('5–7 working days'),
  sacCode: z.string().trim().max(20).default('998221'),
  isActive: z.boolean().default(true),
  requirements: z.array(z.string().trim().min(1)).optional(),
});

export const POST = apiHandler(async (req: Request) => {
  await requireRole(ROLE_GROUPS.ops);
  const body = createSchema.parse(await req.json());

  const existing = await prisma.service.findUnique({ where: { slug: body.slug } });
  if (existing) throw new HttpError(409, `A service with slug "${body.slug}" already exists.`);

  const seen = new Set<string>();
  const docs = body.requirements && body.requirements.length > 0
    ? body.requirements
    : ['Identity Proof (PAN / Aadhaar)', 'Address & Utility Proof'];

  const reqData = docs.map((label, i) => {
    let key = requirementKey(label, i);
    if (seen.has(key)) key = `${key}-${i + 1}`;
    seen.add(key);
    return { key, label, sortOrder: i, required: true };
  });

  const created = await prisma.service.create({
    data: {
      slug: body.slug,
      title: body.title,
      category: body.category,
      professionalFee: body.professionalFee,
      govtFee: body.govtFee,
      govtFeeNote: body.govtFeeNote,
      gstRate: body.gstRate,
      sla: body.sla,
      sacCode: body.sacCode,
      isActive: body.isActive,
      requirements: {
        create: reqData,
      },
    },
    include: { requirements: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json({ success: true, service: plain(created) }, { status: 201 });
});
