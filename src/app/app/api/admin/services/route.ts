import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MASTER_SERVICES } from '@/data/services';

const prisma = new PrismaClient();

// GET: Return all services from DB, or seed from MASTER_SERVICES if empty
export async function GET() {
  try {
    let services = await prisma.servicePricing.findMany({
      orderBy: { category: 'asc' },
    });

    if (services.length === 0) {
      // Auto-populate from MASTER_SERVICES default configuration
      await prisma.servicePricing.createMany({
        data: MASTER_SERVICES.map((s) => ({
          slug: s.slug,
          title: s.title,
          category: s.category,
          baseFee: s.price,
          govtFeeNote: s.govtFee,
          isActive: true,
        })),
      });

      services = await prisma.servicePricing.findMany({
        orderBy: { category: 'asc' },
      });
    }

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update Professional Fee or Govt Fee Note for a service
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { slug, baseFee, govtFeeNote, isActive } = body;

    const updated = await prisma.servicePricing.update({
      where: { slug },
      data: {
        ...(baseFee !== undefined && { baseFee: Number(baseFee) }),
        ...(govtFeeNote !== undefined && { govtFeeNote }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}