import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { plain } from '@/lib/serialize';
import { computeConsultationQuote, formatINR } from '@/lib/pricing';
import MiniHeader from '@/components/MiniHeader';
import BookingWidget from './BookingWidget';

export const dynamic = 'force-dynamic';

async function getLawyer(slug: string) {
  const lawyer = await prisma.lawyerProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true } }, practiceAreas: { select: { slug: true, name: true } } },
  });
  return lawyer && lawyer.verification === 'VERIFIED' && lawyer.isListed ? plain(lawyer) : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const lawyer = await getLawyer(params.slug);
  return lawyer
    ? { title: `${lawyer.user.name} — Advocate, ${lawyer.city} | वकील Search`, description: lawyer.bio.slice(0, 155) }
    : { title: 'Advocate not found | वकील Search' };
}

export default async function LawyerProfilePage({ params }: { params: { slug: string } }) {
  const lawyer = await getLawyer(params.slug);
  if (!lawyer) notFound();

  const quote = computeConsultationQuote(lawyer.consultationFee);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <MiniHeader backHref="/vakil" backLabel="← वकील Search" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <article className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-[#073B5C]">{lawyer.user.name}</h1>
                <p className="text-xs text-slate-500">Advocate · {lawyer.city}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full shrink-0">
                ✓ Bar Council verified
              </span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Fact label="Bar Council" value={lawyer.barCouncil} />
              <Fact label="Enrolment No." value={lawyer.enrollmentNo} mono />
              <Fact label="Enrolled since" value={String(lawyer.enrollmentYear)} />
              <Fact label="Languages" value={lawyer.languages.join(', ')} />
              {lawyer.courts.length > 0 && <Fact label="Courts" value={lawyer.courts.join(', ')} />}
            </dl>
            <div className="flex flex-wrap gap-1.5">
              {lawyer.practiceAreas.map((a) => (
                <span key={a.slug} className="text-[10px] bg-cyan-50 text-[#0E7490] border border-cyan-200 font-bold px-2 py-0.5 rounded-full">
                  {a.name}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-2">
            <h2 className="text-sm font-extrabold text-[#073B5C]">About</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{lawyer.bio}</p>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-2 text-xs">
            <h2 className="text-sm font-extrabold text-[#073B5C]">Consultation fee</h2>
            <div className="flex justify-between text-slate-600">
              <span>Advocate&apos;s fee ({lawyer.consultationMinutes} min)</span>
              <span>{formatINR(quote.lawyerFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform fee</span>
              <span>{formatINR(quote.platformFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST on platform fee</span>
              <span>{formatINR(quote.gstAmount)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[#073B5C] border-t border-slate-100 pt-2">
              <span>Total</span>
              <span>{formatINR(quote.total)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Free cancellation with full refund up to 24 hours before the consultation.</p>
          </section>
        </article>

        <aside className="lg:col-span-5 lg:sticky lg:top-20">
          <BookingWidget slug={lawyer.slug} modes={lawyer.modes} total={quote.total} minutes={lawyer.consultationMinutes} />
        </aside>
      </main>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <dt className="text-[10px] uppercase font-bold text-slate-400">{label}</dt>
      <dd className={`font-bold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
