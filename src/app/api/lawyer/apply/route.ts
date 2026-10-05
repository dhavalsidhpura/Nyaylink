import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireUser } from '@/lib/authz';
import { slugifyName } from '@/lib/lawyers';
import { lawyerProfileSchema } from '../profile-schema';

// A signed-in client applies to list on वकील Search. The profile stays hidden until ops verifies
// the enrolment with the State Bar Council.
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  if (user.role !== 'CLIENT') throw new HttpError(409, 'This account cannot register as an advocate.');
  const input = lawyerProfileSchema.parse(await request.json());

  if (await prisma.lawyerProfile.findUnique({ where: { enrollmentNo: input.enrollmentNo } })) {
    throw new HttpError(409, 'This enrolment number is already registered.');
  }

  const base = slugifyName(user.name) || 'advocate';
  let slug = base;
  for (let i = 2; await prisma.lawyerProfile.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;

  const { practiceAreaSlugs, ...profile } = input;
  await prisma.$transaction([
    prisma.lawyerProfile.create({
      data: {
        ...profile,
        slug,
        userId: user.id,
        practiceAreas: { connect: practiceAreaSlugs.map((s) => ({ slug: s })) },
        // Sensible default: weekdays 10:00–13:00 and 15:00–18:00 IST. Editable from the dashboard.
        availability: {
          create: [1, 2, 3, 4, 5].flatMap((weekday) => [
            { weekday, startMinute: 600, endMinute: 780 },
            { weekday, startMinute: 900, endMinute: 1080 },
          ]),
        },
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { role: 'LAWYER' } }),
  ]);

  return NextResponse.json({ success: true, slug }, { status: 201 });
});
