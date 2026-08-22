import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MASTER_SERVICES } from '@/data/services';
import { requireRole } from '@/lib/auth-guards';

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'CA_CS_LEAD',
  'COMPLIANCE_EXEC',
  'FINANCE_MANAGER',
];

export async function GET() {
  const auth = await requireRole(ADMIN_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    let services = await prisma.servicePricing.findMany({ orderBy: { category: 'asc' } });

    if (services.length === 0) {
      await prisma.servicePricing.createMany({
        data: MASTER_SERVICES.map((service) => ({
          slug: service.slug,
          title: service.title,
          category: service.category,
          baseFee: service.price,
          govtFeeNote: service.govtFee,
          isActive: true,
        })),
        skipDuplicates: true,
      });

      services = await prisma.servicePricing.findMany({ orderBy: { category: 'asc' } });
    }

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Admin service pricing GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load service pricing.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireRole(ADMIN_ROLES);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const baseFee = body.baseFee === undefined ? undefined : Number(body.baseFee);
    const govtFeeNote = body.govtFeeNote === undefined ? undefined : String(body.govtFeeNote);
    const isActive = body.isActive === undefined ? undefined : Boolean(body.isActive);

    if (!slug || (baseFee !== undefined && (!Number.isFinite(baseFee) || baseFee < 0))) {
      return NextResponse.json(
        { success: false, error: 'A valid service slug and fee are required.' },
        { status: 400 },
      );
    }

    const service = await prisma.servicePricing.update({
      where: { slug },
      data: {
        ...(baseFee !== undefined ? { baseFee } : {}),
        ...(govtFeeNote !== undefined ? { govtFeeNote } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Admin service pricing PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service pricing.' },
      { status: 500 },
    );
  }
}
