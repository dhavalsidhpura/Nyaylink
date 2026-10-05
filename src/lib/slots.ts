import { prisma } from '@/lib/prisma';

// India has no DST, so IST is a fixed UTC+05:30 offset.
const IST_OFFSET_MIN = 330;
const MIN_LEAD_TIME_MS = 2 * 60 * 60 * 1000; // can't book a slot starting within 2 hours
export const MAX_BOOKING_DAYS = 30;
export const HOLD_MINUTES = 15;

export interface Slot {
  startsAt: string; // ISO (UTC)
  label: string; // "10:30" IST
}

export interface DaySlots {
  date: string; // YYYY-MM-DD (IST)
  weekday: number;
  slots: Slot[];
}

/** YYYY-MM-DD of `date` in IST. */
export function istDateString(date: Date) {
  return new Date(date.getTime() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

function istMidnightUtcMs(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d) - IST_OFFSET_MIN * 60_000;
}

/** 0 = Sunday … 6 = Saturday for an IST calendar date. */
function istWeekday(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const pad = (n: number) => String(n).padStart(2, '0');
export const minutesToLabel = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** Returns open slots for a lawyer from `fromDate` (IST) for `days` days. */
export async function getAvailableSlots(lawyerId: string, fromDate: string, days: number): Promise<DaySlots[]> {
  const lawyer = await prisma.lawyerProfile.findUnique({
    where: { id: lawyerId },
    include: { availability: true },
  });
  if (!lawyer) return [];

  const span = Math.min(Math.max(days, 1), MAX_BOOKING_DAYS);
  const rangeStart = new Date(istMidnightUtcMs(fromDate));
  const rangeEnd = new Date(rangeStart.getTime() + span * 24 * 60 * 60_000);
  const now = new Date();

  const [booked, timeOff] = await Promise.all([
    prisma.consultation.findMany({
      where: {
        lawyerId,
        startsAt: { lt: rangeEnd },
        endsAt: { gt: rangeStart },
        OR: [{ status: 'CONFIRMED' }, { status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } }],
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.lawyerTimeOff.findMany({
      where: { lawyerId, startsAt: { lt: rangeEnd }, endsAt: { gt: rangeStart } },
      select: { startsAt: true, endsAt: true },
    }),
  ]);
  const blocked = [...booked, ...timeOff].map((b) => [b.startsAt.getTime(), b.endsAt.getTime()] as const);

  const duration = lawyer.consultationMinutes;
  const bookingHorizon = now.getTime() + MAX_BOOKING_DAYS * 24 * 60 * 60_000;
  const result: DaySlots[] = [];

  for (let i = 0; i < span; i++) {
    const dayStartMs = rangeStart.getTime() + i * 24 * 60 * 60_000;
    const date = istDateString(new Date(dayStartMs));
    const weekday = istWeekday(date);
    const slots: Slot[] = [];

    for (const rule of lawyer.availability.filter((r) => r.weekday === weekday).sort((a, b) => a.startMinute - b.startMinute)) {
      for (let m = rule.startMinute; m + duration <= rule.endMinute; m += duration) {
        const start = dayStartMs + m * 60_000;
        const end = start + duration * 60_000;
        if (start < now.getTime() + MIN_LEAD_TIME_MS || start > bookingHorizon) continue;
        if (blocked.some(([bs, be]) => start < be && end > bs)) continue;
        slots.push({ startsAt: new Date(start).toISOString(), label: minutesToLabel(m) });
      }
    }
    result.push({ date, weekday, slots });
  }
  return result;
}

/** True when `startsAt` is exactly one of the lawyer's currently open slots. */
export async function isSlotAvailable(lawyerId: string, startsAt: Date) {
  const days = await getAvailableSlots(lawyerId, istDateString(startsAt), 1);
  const iso = startsAt.toISOString();
  return days.some((d) => d.slots.some((s) => s.startsAt === iso));
}
