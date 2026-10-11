import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUser, ROLE_GROUPS } from '@/lib/authz';
import { plain, num } from '@/lib/serialize';
import { formatINR } from '@/lib/pricing';
import { CreatePayoutButton, MarkPaidButton, VerificationActions } from './LawyerAdminActions';

export const dynamic = 'force-dynamic';

export default async function AdminLawyersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?callbackUrl=/admin/lawyers');
  const canVerify = ROLE_GROUPS.ops.includes(user.role);
  const canPay = ROLE_GROUPS.finance.includes(user.role);
  if (!canVerify && !canPay) redirect('/admin');

  const [lawyers, payable, pendingPayouts] = await Promise.all([
    prisma.lawyerProfile.findMany({
      include: { user: { select: { name: true, email: true, phone: true } }, practiceAreas: { select: { name: true } } },
      orderBy: [{ verification: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.consultation.groupBy({
      by: ['lawyerId'],
      where: { status: 'COMPLETED', payoutId: null, payments: { some: { status: 'CAPTURED' } } },
      _sum: { fee: true },
      _count: true,
    }),
    prisma.payout.findMany({ where: { status: 'PENDING' }, include: { lawyer: { include: { user: { select: { name: true } } } } } }),
  ]);

  const rows = plain(lawyers);
  const nameOf = (id: string) => rows.find((l) => l.id === id)?.user.name || id;
  const queue = rows.filter((l) => l.verification === 'PENDING');
  const others = rows.filter((l) => l.verification !== 'PENDING');

  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-[#073B5C] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link href="/admin" className="text-xs text-[#F4B942] font-bold hover:underline">
            ← Operations Console
          </Link>
          <span className="text-xs font-bold">वकील Search · Advocate Console</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {canVerify && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="px-5 py-3 border-b border-slate-100 text-sm font-extrabold text-[#073B5C]">
              Verification queue ({queue.length})
            </h2>
            <p className="px-5 pt-3 text-[11px] text-slate-500">
              Check each enrolment number against the State Bar Council roll (or the BCI verification portal) before approving.
            </p>
            <ul className="divide-y divide-slate-100">
              {queue.length === 0 && <li className="p-5 text-xs text-slate-400 text-center">No pending applications.</li>}
              {queue.map((l) => (
                <li key={l.id} className="p-5 flex flex-col md:flex-row justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-sm text-[#073B5C]">{l.user.name}</strong>
                    <p className="text-slate-600">
                      <span className="font-mono font-bold">{l.enrollmentNo}</span> · {l.barCouncil} · enrolled {l.enrollmentYear}
                    </p>
                    <p className="text-slate-500">
                      {l.city} · {l.practiceAreas.map((a) => a.name).join(', ')} · {formatINR(l.consultationFee)}/{l.consultationMinutes}m
                    </p>
                    <p className="text-slate-500">
                      {l.user.email}
                      {l.user.phone ? ` · ${l.user.phone}` : ''}
                    </p>
                    {l.verificationNote && <p className="text-amber-700">{l.verificationNote}</p>}
                  </div>
                  <VerificationActions lawyerId={l.id} pending />
                </li>
              ))}
            </ul>
          </section>
        )}

        {canPay && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="px-5 py-3 border-b border-slate-100 text-sm font-extrabold text-[#073B5C]">Payouts</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {payable.length === 0 && pendingPayouts.length === 0 && <p className="p-5 text-slate-400 text-center">Nothing to pay out.</p>}
              {payable.map((p) => (
                <div key={p.lawyerId} className="p-4 flex justify-between items-center gap-3">
                  <span>
                    <strong className="text-[#073B5C]">{nameOf(p.lawyerId)}</strong> · {p._count} completed · {formatINR(num(p._sum.fee))}
                  </span>
                  <CreatePayoutButton lawyerId={p.lawyerId} />
                </div>
              ))}
              {pendingPayouts.map((p) => (
                <div key={p.id} className="p-4 flex justify-between items-center gap-3 bg-amber-50/50">
                  <span>
                    Payout to <strong className="text-[#073B5C]">{p.lawyer.user.name}</strong> · {formatINR(num(p.amount))} · awaiting bank transfer
                  </span>
                  <MarkPaidButton payoutId={p.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="px-5 py-3 border-b border-slate-100 text-sm font-extrabold text-[#073B5C]">All advocates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase text-[#073B5C]">
                  <th className="p-3">Advocate</th>
                  <th className="p-3">Enrolment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {others.map((l) => (
                  <tr key={l.id}>
                    <td className="p-3">
                      <strong className="text-[#073B5C]">{l.user.name}</strong>
                      <span className="block text-slate-500">{l.city}</span>
                    </td>
                    <td className="p-3 font-mono">{l.enrollmentNo}</td>
                    <td className="p-3 font-bold">
                      {l.verification}
                      {!l.isListed && <span className="block text-[10px] text-slate-400">hidden by advocate</span>}
                    </td>
                    <td className="p-3 text-right">{canVerify && <VerificationActions lawyerId={l.id} verified={l.verification === 'VERIFIED'} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
