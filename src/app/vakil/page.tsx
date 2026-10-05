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
