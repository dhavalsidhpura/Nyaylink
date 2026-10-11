import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/authz';
import MiniHeader from '@/components/MiniHeader';
import LawyerProfileForm from '@/components/LawyerProfileForm';

export const dynamic = 'force-dynamic';

export default async function LawyerJoinPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?callbackUrl=/lawyer/join');
  if (user.role === 'LAWYER') redirect('/lawyer/dashboard');

  const areas = await prisma.practiceArea.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } });

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <MiniHeader backHref="/vakil" backLabel="← वकील Search" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#073B5C]">List your practice on वकील Search</h1>
          <p className="text-xs text-slate-500">Receive paid consultation bookings from clients, with scheduling and payouts handled for you.</p>
        </div>
        {user.role === 'CLIENT' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
            <LawyerProfileForm mode="apply" areas={areas} />
          </div>
        ) : (
          <p className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-600">
            Staff accounts can&apos;t be listed as advocates. Please sign in with a separate personal account.
          </p>
        )}
      </main>
    </div>
  );
}
