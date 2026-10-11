import { NextResponse } from 'next/server';
import { getPublicServices } from '@/lib/catalog';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// Public services catalog endpoint with edge/browser caching
export async function GET() {
  const services = await getPublicServices();

  return NextResponse.json(
    {
      success: true,
      services: plain(services),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
