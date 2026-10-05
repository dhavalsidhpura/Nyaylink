import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/authz';
import { searchLawyers } from '@/lib/lawyers';
import { plain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const lawyers = await searchLawyers({
    q: params.get('q')?.slice(0, 80) || undefined,
    area: params.get('area') || undefined,
    city: params.get('city') || undefined,
    language: params.get('language') || undefined,
  });
  return NextResponse.json({ success: true, lawyers: plain(lawyers) });
});
