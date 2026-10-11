import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError } from '@/lib/authz';
import { getAvailableSlots, istDateString } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: Request, { params }: { params: { slug: string } }) => {
  const lawyer = await prisma.lawyerProfile.findUnique({
    where: { slug: params.slug },
    select: { id: true, verification: true, isListed: true },
  });
  if (!lawyer || lawyer.verification !== 'VERIFIED' || !lawyer.isListed) throw new HttpError(404, 'Lawyer not found.');

  const search = new URL(request.url).searchParams;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(search.get('from') || '') ? search.get('from')! : istDateString(new Date());
  const days = Math.min(Number(search.get('days')) || 7, 14);

  return NextResponse.json({ success: true, days: await getAvailableSlots(lawyer.id, from, days) });
});
