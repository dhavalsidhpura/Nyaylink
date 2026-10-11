import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/authz';
import { plain, num, type Plain } from '@/lib/serialize';
import LawyerDashboardClient from './LawyerDashboardClient';

export const dynamic = 'force-dynamic';

async function loadLawyerDashboard(userId: string) {
  const profile = await prisma.lawyerProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      user: { select: { name: true, email: true } },
      practiceAreas: { select: { slug: true } },
      availability: { orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }] },
      timeOff: { where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' } },
    },
  });

  const [consultations, payouts, areas, unpaid] = await Promise.all([
    prisma.consultation.findMany({
      where: { lawyerId: profile.id, status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] } },
      include: { client: { select: { name: true, email: true, phone: true } } },
      orderBy: { startsAt: 'asc' },
      take: 200,
    }),
    prisma.payout.findMany({ where: { lawyerId: profile.id }, orderBy: { createdAt: 'desc' } }),
    prisma.practiceArea.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } }),
    prisma.consultation.aggregate({
      where: { lawyerId: profile.id, status: 'COMPLETED', payoutId: null, payments: { some: { status: 'CAPTURED' } } },
      _sum: { fee: true },
      _count: true,
    }),
  ]);

  return {
    profile,
    consultations,
    payouts,
    areas,
    pendingEarnings: { amount: num(unpaid._sum.fee), count: unpaid._count },
  };
}

export type LawyerDashboardData = Plain<Awaited<ReturnType<typeof loadLawyerDashboard>>>;

export default async function LawyerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?callbackUrl=/lawyer/dashboard');
  if (user.role !== 'LAWYER') redirect('/lawyer/join');

  return <LawyerDashboardClient {...plain(await loadLawyerDashboard(user.id))} />;
}
