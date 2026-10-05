import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncCatalog } from '@/lib/catalog';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// Public services catalog endpoint
export async function GET() {
  await syncCatalog();
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      title: true,
      category: true,
      professionalFee: true,
      govtFee: true,
      govtFeeNote: true,
      sla: true,
      sacCode: true,
      requirements: {
        select: { key: true, label: true, required: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });

  return NextResponse.json({
    success: true,
    services: plain(services),
  });
}
