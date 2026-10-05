import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole } from '@/lib/authz';

const rule = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1440).multipleOf(15),
    endMinute: z.number().int().min(0).max(1440).multipleOf(15),
  })
  .refine((r) => r.endMinute > r.startMinute, 'end must be after start');

const schema = z.object({
  rules: z.array(rule).max(50),
  timeOff: z
    .array(z.object({ startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().max(200).optional() }))
    .max(50),
});

async function profileFor(userId: string) {
  const profile = await prisma.lawyerProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw new HttpError(404, 'Profile not found.');
  return profile;
}

// Replaces the weekly schedule and upcoming time-off. Existing bookings are never affected.
export const PUT = apiHandler(async (request: Request) => {
  const user = await requireRole(['LAWYER']);
  const { rules, timeOff } = schema.parse(await request.json());
  const profile = await profileFor(user.id);

  for (let d = 0; d < 7; d++) {
    const day = rules.filter((r) => r.weekday === d).sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < day.length; i++) {
      if (day[i].startMinute < day[i - 1].endMinute) throw new HttpError(400, 'Availability windows on the same day overlap.');
    }
  }
  for (const t of timeOff) {
    if (new Date(t.endsAt) <= new Date(t.startsAt)) throw new HttpError(400, 'Time-off must end after it starts.');
  }

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({ where: { lawyerId: profile.id } }),
    prisma.availabilityRule.createMany({ data: rules.map((r) => ({ ...r, lawyerId: profile.id })) }),
    prisma.lawyerTimeOff.deleteMany({ where: { lawyerId: profile.id, endsAt: { gt: new Date() } } }),
    prisma.lawyerTimeOff.createMany({
      data: timeOff.map((t) => ({ lawyerId: profile.id, startsAt: new Date(t.startsAt), endsAt: new Date(t.endsAt), reason: t.reason })),
    }),
  ]);

  return NextResponse.json({ success: true });
});
