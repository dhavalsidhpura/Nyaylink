import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface LawyerSearch {
  q?: string;
  area?: string;
  city?: string;
  language?: string;
}

// Only Bar-Council-verified, listed profiles are public. Results are sorted alphabetically —
// no ratings, rankings or paid boosts (BCI Rule 36 prohibits advocates soliciting work).
export function searchLawyers(params: LawyerSearch, take = 50) {
  const where: Prisma.LawyerProfileWhereInput = {
    verification: 'VERIFIED',
    isListed: true,
    ...(params.area ? { practiceAreas: { some: { slug: params.area } } } : {}),
    ...(params.city ? { city: { equals: params.city, mode: 'insensitive' } } : {}),
    ...(params.language ? { languages: { has: params.language } } : {}),
    ...(params.q
      ? {
          OR: [
            { user: { name: { contains: params.q, mode: 'insensitive' } } },
            { bio: { contains: params.q, mode: 'insensitive' } },
            { courts: { has: params.q } },
          ],
        }
      : {}),
  };

  return prisma.lawyerProfile.findMany({
    where,
    take,
    orderBy: { user: { name: 'asc' } },
    select: {
      id: true,
      slug: true,
      city: true,
      barCouncil: true,
      enrollmentYear: true,
      languages: true,
      courts: true,
      consultationFee: true,
      consultationMinutes: true,
      modes: true,
      bio: true,
      user: { select: { name: true } },
      practiceAreas: { select: { slug: true, name: true } },
    },
  });
}

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/^(adv\.?|advocate)\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}
