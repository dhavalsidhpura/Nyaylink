import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateOrderTotals, DEFAULT_GST_RATE } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const slug = typeof params.slug === 'string' ? params.slug.trim() : '';

  if (!slug) {
    return NextResponse.json({ success: false, error: 'A service is required.' }, { status: 400 });
  }

  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { slug: true, title: true, startingPrice: true, govtFeeNote: true, isActive: true },
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ success: false, error: 'The selected service is not available.' }, { status: 404 });
    }

    const totals = calculateOrderTotals(service.startingPrice);

    return NextResponse.json({
      success: true,
      quote: {
        serviceSlug: service.slug,
        serviceTitle: service.title,
        ...totals,
        taxRate: DEFAULT_GST_RATE,
        governmentFeeNote: service.govtFeeNote,
        validity: 'Subject to approved service pricing and any stated authority fee changes before payment.',
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Service quote error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load the server quote.' },
      { status: 503 },
    );
  }
}
