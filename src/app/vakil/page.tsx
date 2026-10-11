import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { searchLawyers } from '@/lib/lawyers';
import { plain } from '@/lib/serialize';
import { formatINR } from '@/lib/pricing';
import MiniHeader from '@/components/MiniHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'वकील Search — Find Bar Council verified advocates | NyayaLink',
  description: 'Search Bar Council verified advocates by practice area, city and language, and book a paid consultation online.',
};

interface Props {
  searchParams: { q?: string; area?: string; city?: string; language?: string };
}

const MODE_LABEL: Record<string, string> = { VIDEO: '🎥 Video', PHONE: '📞 Phone', IN_PERSON: '🏢 In person' };

export default async function VakilSearchPage({ searchParams }: Props) {
  const filters = {
    q: searchParams.q?.slice(0, 80) || undefined,
    area: searchParams.area || undefined,
    city: searchParams.city || undefined,
    language: searchParams.language || undefined,
  };

  const [areas, cities, lawyers] = await Promise.all([
    prisma.practiceArea.findMany({ orderBy: { name: 'asc' } }),
    prisma.lawyerProfile.findMany({
      where: { verification: 'VERIFIED', isListed: true },
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    }),
    searchLawyers(filters).then(plain),
  ]);

  const select = 'w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]';

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      <MiniHeader />

      <section className="bg-[#073B5C] text-white px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-3">
          <span className="bg-[#0E7490] text-[#F4B942] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
            ⚖️ Bar Council verified advocates
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">वकील Search</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Find an advocate by practice area, city and language, see their published consultation fee, and book a time that suits you.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <form method="get" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="lg:col-span-2">
            <span className="sr-only">Search</span>
            <input name="q" defaultValue={filters.q} placeholder="Name, court or keyword" className={select} />
          </label>
          <label>
            <span className="sr-only">Practice area</span>
            <select name="area" defaultValue={filters.area || ''} className={select}>
              <option value="">All practice areas</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">City</span>
            <select name="city" defaultValue={filters.city || ''} className={select}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>
          </label>
          <button className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs rounded-xl py-3 uppercase tracking-wider cursor-pointer">
            Search
          </button>
        </form>

        <p className="text-xs text-slate-500">
          {lawyers.length} advocate{lawyers.length === 1 ? '' : 's'} found · listed alphabetically
        </p>

        {lawyers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            No advocates match these filters yet.{' '}
            <Link href="/vakil" className="text-[#0E7490] font-bold underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lawyers.map((l) => (
              <li key={l.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[#073B5C]">{l.user.name}</h2>
                    <p className="text-[11px] text-slate-500">
                      {l.city} · Enrolled {l.enrollmentYear} · {l.barCouncil}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full shrink-0">✓ Verified</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {l.practiceAreas.map((a) => (
                    <span key={a.slug} className="text-[10px] bg-cyan-50 text-[#0E7490] border border-cyan-200 font-bold px-2 py-0.5 rounded-full">
                      {a.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 line-clamp-3">{l.bio}</p>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                  <span>🗣️ {l.languages.join(', ')}</span>
                  <span>{l.modes.map((m) => MODE_LABEL[m]).join(' · ')}</span>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-600">
                    <strong className="text-[#073B5C] text-sm">{formatINR(l.consultationFee)}</strong> / {l.consultationMinutes} min
                  </span>
                  <Link
                    href={`/vakil/${l.slug}`}
                    className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl"
                  >
                    View & book →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Lawyer Consultation FAQs */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#073B5C]">Frequently Asked Questions on Advocate Consultations</h3>
            <p className="text-xs text-slate-500">How verified lawyer consultations, booking fees, privacy, and chamber representation work.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                q: 'How does NyayaLink verify advocates listed on the platform?',
                a: 'Every advocate is vetted by validating their State Bar Council enrolment number, years of active practice, and strict compliance with the Bar Council of India (BCI) Rules. Only advocates in verified good standing are listed.',
              },
              {
                q: 'Are legal consultations confidential and protected by privilege?',
                a: 'Yes. All consultations and documents shared are strictly confidential and governed by Section 126 of the Indian Evidence Act, 1872, ensuring complete attorney-client privilege.',
              },
              {
                q: 'What consultation modes are supported (Video, Phone, Chamber)?',
                a: 'Advocates offer consultations via encrypted 1-on-1 video calls, direct phone calls, or scheduled in-person meetings at their registered chamber/office, as indicated on their verified profile.',
              },
              {
                q: 'What happens if an advocate is unable to join the scheduled consultation?',
                a: 'If a scheduled consultation cannot take place due to an advocate scheduling conflict, you are entitled to a 100% immediate refund or free rescheduling to a convenient alternative time slot.',
              },
              {
                q: 'Can an advocate represent me in court or draft legal notices after the call?',
                a: 'Yes. The initial consultation provides strategic legal counsel. If ongoing court representation (via Vakalatnama), legal notice drafting, or contract negotiation is required, you and the advocate may mutually formalize an extended engagement.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <summary className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer list-none select-none">
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-sm text-[#0E7490] font-mono shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <aside className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded-2xl p-4 leading-relaxed">
          <strong className="text-[#073B5C]">Disclaimer:</strong> In line with Bar Council of India rules, advocates on वकील Search do not
          advertise or solicit work. Profiles contain only factual information supplied by the advocate and verified against their State Bar
          Council enrolment; listings are not ranked or endorsed. NyayaLink is a technology platform and does not provide legal advice. Are
          you an advocate?{' '}
          <Link href="/lawyer/join" className="text-[#0E7490] font-bold underline">
            List your practice
          </Link>
          .
        </aside>
      </main>
    </div>
  );
}
