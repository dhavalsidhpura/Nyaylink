'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import LawyerProfileForm from '@/components/LawyerProfileForm';
import { formatINR } from '@/lib/pricing';
import type { LawyerDashboardData } from './page';

type Consultation = LawyerDashboardData['consultations'][number];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VERIFICATION_UI: Record<string, { text: string; style: string }> = {
  PENDING: { text: 'Verification pending — your profile is not public yet.', style: 'bg-amber-50 border-amber-300 text-amber-900' },
  VERIFIED: { text: 'Verified — your profile is live in वकील Search.', style: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
  REJECTED: { text: 'Verification was not successful.', style: 'bg-rose-50 border-rose-300 text-rose-900' },
  SUSPENDED: { text: 'Your listing is suspended.', style: 'bg-rose-50 border-rose-300 text-rose-900' },
};

const fmtTime = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const istDate = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10);
const fromHHMM = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

export default function LawyerDashboardClient({ profile, consultations, payouts, areas, pendingEarnings }: LawyerDashboardData) {
  const [tab, setTab] = useState<'schedule' | 'earnings' | 'availability' | 'notices' | 'profile'>('schedule');
  const [courtEmergency, setCourtEmergency] = useState(false);
  const [selectedNoticeType, setSelectedNoticeType] = useState<'cheque' | 'trademark' | 'contract'>('cheque');
  const now = Date.now();
  const upcoming = consultations.filter((c) => c.status === 'CONFIRMED' && new Date(c.endsAt).getTime() > now);
  const toClose = consultations.filter((c) => c.status === 'CONFIRMED' && new Date(c.endsAt).getTime() <= now);
  const past = consultations.filter((c) => c.status !== 'CONFIRMED').reverse();
  const v = VERIFICATION_UI[profile.verification];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-[#073B5C] text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="bg-[#0E7490] text-white font-extrabold text-lg px-3 py-1 rounded-xl font-mono">
            Nyaya<span className="text-[#F4B942]">Link</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-bold">
            {profile.verification === 'VERIFIED' && (
              <Link href={`/vakil/${profile.slug}`} className="text-[#F4B942] hover:underline">
                View public profile
              </Link>
            )}
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-slate-300 hover:text-white underline cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#073B5C]">{profile.user.name}</h1>
              <span className="bg-slate-200 text-[#073B5C] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                Advocate Hub
              </span>
            </div>
            <p className="text-xs text-slate-500">Enrolment: {profile.enrollmentNo} &bull; {profile.barCouncil}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCourtEmergency(!courtEmergency)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                courtEmergency
                  ? 'bg-rose-600 text-white shadow-md animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
              }`}
            >
              <span>{courtEmergency ? '🚨' : '🏛️'}</span>
              <span>{courtEmergency ? 'Court Emergency ACTIVE' : 'Toggle Court Hearing Mode'}</span>
            </button>
          </div>
        </div>

        {/* BCI Rule 36 Ethics Shield */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="bg-[#F4B942] text-[#073B5C] font-black text-[9px] uppercase px-2 py-0.5 rounded">
              BCI Rule 36 Compliant
            </span>
            <span className="text-[11px] text-slate-300">
              Direct client-advocate engagement. Zero fee-splitting or commissions. Platform facilitation fee is billed separately.
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold whitespace-nowrap">
            &bull; Section 194J TDS Compliant
          </span>
        </div>

        {courtEmergency && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl p-4 text-xs font-medium space-y-1">
            <strong className="font-extrabold block text-rose-800">
              🚨 In Court / Hearing Out-of-Office Active
            </strong>
            <p>
              Your profile currently indicates that you are in High Court / District Court arguments.
              Clients with consultations booked for today will be automatically notified with priority reschedule slots.
            </p>
          </div>
        )}

        <div className={`border rounded-2xl p-4 text-xs font-semibold ${v.style}`}>
          {v.text}
          {profile.verificationNote && <span className="block font-normal mt-1">{profile.verificationNote}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Upcoming" value={String(upcoming.length)} />
          <Stat label="To close" value={String(toClose.length)} />
          <Stat label="Pending payout" value={formatINR(pendingEarnings.amount)} />
          <Stat label="Fee / session" value={formatINR(profile.consultationFee)} />
        </div>

        <nav className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist">
          {([
            ['schedule', '🗓️ Schedule'],
            ['earnings', '💰 Earnings'],
            ['availability', '⏰ Availability'],
            ['notices', '📜 Legal Notice Drafting'],
            ['profile', '👤 Profile'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer ${
                tab === key ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'schedule' && (
          <div className="space-y-6">
            {toClose.length > 0 && (
              <Section title="Mark as completed">
                {toClose.map((c) => (
                  <ConsultationRow key={c.id} c={c} closable />
                ))}
              </Section>
            )}
            <Section title="Upcoming consultations">
              {upcoming.length === 0 ? <Empty text="No upcoming consultations." /> : upcoming.map((c) => <ConsultationRow key={c.id} c={c} />)}
            </Section>
            <Section title="History">
              {past.length === 0 ? <Empty text="No past consultations yet." /> : past.slice(0, 30).map((c) => <ConsultationRow key={c.id} c={c} />)}
            </Section>
          </div>
        )}

        {tab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 text-xs text-slate-600 space-y-1">
              <p>
                <strong className="text-[#073B5C]">{formatINR(pendingEarnings.amount)}</strong> from {pendingEarnings.count} completed
                consultation{pendingEarnings.count === 1 ? '' : 's'} will be included in your next payout.
              </p>
              <p>You receive your full consultation fee. The client pays the platform fee and GST separately.</p>
            </div>
            <Section title="Payouts">
              {payouts.length === 0 ? (
                <Empty text="No payouts yet." />
              ) : (
                payouts.map((p) => (
                  <div key={p.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-[#073B5C]">{formatINR(p.amount)}</strong>
                      <span className="block text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                        {p.reference ? ` · UTR ${p.reference}` : ''}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </Section>
          </div>
        )}

        {tab === 'availability' && <AvailabilityEditor rules={profile.availability} timeOff={profile.timeOff} />}

        
        {tab === 'notices' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
                  Statutory Advocate Drafting Suite
                </span>
                <h3 className="font-extrabold text-base text-[#073B5C]">
                  Pre-Formatted Statutory Legal Notice Generator
                </h3>
              </div>
              <div className="flex gap-2">
                {[
                  ['cheque', 'Section 138 Cheque Bounce'],
                  ['trademark', 'Trademark Cease & Desist'],
                  ['contract', 'Breach of Agreement & Dues'],
                ].map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => setSelectedNoticeType(k as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedNoticeType === k ? 'bg-[#073B5C] text-[#F4B942]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {selectedNoticeType === 'cheque' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-extrabold text-[#073B5C]">
                      Statutory Notice u/s 138 of Negotiable Instruments Act, 1881
                    </strong>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                      15-Day Demand Ceiling
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-mono text-[11px] whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200">
{`LEGAL DEMAND NOTICE
(Under Section 138 of the Negotiable Instruments Act, 1881)

To,
[Name of Drawer / Accused],
[Full Postal Address]

Under instructions and on behalf of my client, [Client Name], residing at [Client Address], I hereby serve upon you the following legal notice:

1. That you issued Cheque No. [Cheque Number] dated [Cheque Date] drawn on [Bank Name] for an amount of Rs. [Amount in Figures] (Rupees [Amount in Words]) towards the discharge of your legally enforceable debt.

2. That the said cheque was presented by my client through their banker, but the same was returned unpaid with the bank memo dated [Memo Date] endorsing the reason: "FUNDS INSUFFICIENT" / "EXCEEDS ARRANGEMENT".

3. You are hereby called upon to pay the said amount of Rs. [Amount in Figures] within FIFTEEN (15) DAYS from the receipt of this notice, failing which my client shall initiate criminal prosecution against you under Section 138 read with Section 142 of the Negotiable Instruments Act, 1881, without further notice, holding you liable for all costs and consequences.

Advocate [Name]
Enrolment No: ${profile.enrollmentNo}
Bar Council: ${profile.barCouncil}`}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`LEGAL DEMAND NOTICE u/s 138 NI Act... (Generated from NyayaLink Advocate Hub by ${profile.user.name})`);
                      alert('Section 138 Notice template copied to clipboard!');
                    }}
                    className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Copy Notice Template
                  </button>
                </div>
              </div>
            )}

            {selectedNoticeType === 'trademark' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-extrabold text-[#073B5C]">
                      Cease and Desist Notice &bull; Trade Marks Act, 1999
                    </strong>
                    <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black px-2 py-0.5 rounded">
                      Section 29 Infringement
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-mono text-[11px] whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200">
{`CEASE AND DESIST NOTICE
(Pursuant to Section 29 & 134 of the Trade Marks Act, 1999)

To,
[Infringing Entity Name],
[Registered Address / Domain URL]

Under instructions from my client, [Client Brand Name / Proprietor], I state as under:

1. My client is the lawful registered proprietor of the trade mark "[Trademark Name]" registered under Class [Class Number] bearing Application No. [Application Number] in the Register of Trade Marks.

2. It has recently come to my client's notice that you have been unauthorizedly using an identical/deceptively similar mark "[Infringing Mark]" in connection with competing goods/services, causing public deception and passing off.

3. You are hereby called upon to immediately:
   a. Cease and desist from using the mark "[Infringing Mark]" or any deceptive variant.
   b. Remove all signage, online listings, social media handles, and domains bearing the said mark.
   c. Furnish an unconditional written undertaking of compliance within SEVEN (7) DAYS.

Advocate [Name]
Enrolment No: ${profile.enrollmentNo}`}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`CEASE AND DESIST NOTICE... (Generated from NyayaLink Advocate Hub)`);
                      alert('Cease and Desist template copied to clipboard!');
                    }}
                    className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Copy Notice Template
                  </button>
                </div>
              </div>
            )}

            {selectedNoticeType === 'contract' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-extrabold text-[#073B5C]">
                      Legal Notice for Breach of Contract &amp; Recovery of Outstanding Dues
                    </strong>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded">
                      Indian Contract Act, 1872
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-mono text-[11px] whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200">
{`LEGAL DEMAND NOTICE FOR RECOVERY OF COMMERCIAL DUES
(Under the Indian Contract Act, 1872)

To,
[Debtor / Contracting Party],
[Address]

Under instructions from my client, [Creditor Entity Name], I state as under:

1. That pursuant to Agreement/Work Order dated [Date], my client satisfactorily delivered professional goods/services and raised Invoices [Invoice Nos] aggregating to Rs. [Outstanding Amount].

2. That despite having acknowledged receipt and quality, you have failed to clear the lawful outstanding balance of Rs. [Amount] despite repeated reminders.

3. Take notice that you are hereby required to pay the outstanding sum of Rs. [Amount] along with interest @ 18% p.a. within FIFTEEN (15) DAYS, failing which my client shall institute civil suit for recovery and summary proceedings under Order XXXVII of the CPC.

Advocate [Name]
Enrolment No: ${profile.enrollmentNo}`}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`DEMAND NOTICE FOR DUES... (Generated from NyayaLink Advocate Hub)`);
                      alert('Contract Breach template copied to clipboard!');
                    }}
                    className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Copy Notice Template
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
            <LawyerProfileForm
              mode="edit"
              areas={areas}
              initial={{
                barCouncil: profile.barCouncil,
                enrollmentNo: profile.enrollmentNo,
                enrollmentYear: profile.enrollmentYear,
                city: profile.city,
                bio: profile.bio,
                languages: profile.languages,
                courts: profile.courts,
                practiceAreaSlugs: profile.practiceAreas.map((a) => a.slug),
                consultationFee: profile.consultationFee,
                consultationMinutes: profile.consultationMinutes,
                modes: profile.modes,
                isListed: profile.isListed,
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <span className="text-[10px] font-bold uppercase text-slate-400 block">{label}</span>
      <strong className="text-lg font-extrabold text-[#073B5C]">{value}</strong>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <h2 className="px-5 py-3 border-b border-slate-100 text-sm font-extrabold text-[#073B5C]">{title}</h2>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

const Empty = ({ text }: { text: string }) => <p className="p-5 text-xs text-slate-400 text-center">{text}</p>;

function ConsultationRow({ c, closable }: { c: Consultation; closable?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(c.lawyerNotes || '');
  const [meetingUrl, setMeetingUrl] = useState(c.meetingUrl || '');
  const [busy, setBusy] = useState(false);

  const patch = async (body: Record<string, unknown>, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    const res = await fetch(`/api/consultations/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.success) alert(data.error || 'Update failed.');
    else router.refresh();
  };

  return (
    <div className="p-4 space-y-2 text-xs">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <strong className="text-[#073B5C]">{fmtTime(c.startsAt)}</strong>
          <span className="text-slate-500">
            {' '}
            · {c.client.name} · {c.mode.replace('_', ' ').toLowerCase()} · {c.number}
          </span>
          {c.status !== 'CONFIRMED' && <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">{c.status.replace('_', ' ')}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOpen(!open)} className="text-[#0E7490] font-bold hover:underline cursor-pointer">
            {open ? 'Hide' : 'Intake & notes'}
          </button>
          {closable && (
            <>
              <button disabled={busy} onClick={() => patch({ action: 'complete' })} className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg cursor-pointer">
                Completed
              </button>
              <button disabled={busy} onClick={() => patch({ action: 'no_show' }, 'Mark the client as a no-show?')} className="bg-slate-200 font-bold px-3 py-1 rounded-lg cursor-pointer">
                No-show
              </button>
            </>
          )}
          {!closable && c.status === 'CONFIRMED' && (
            <button
              disabled={busy}
              onClick={() => patch({ action: 'cancel' }, 'Cancel this consultation? The client will be refunded in full.')}
              className="text-rose-700 font-bold hover:underline cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Client intake</span>
            <p className="whitespace-pre-wrap text-slate-700">{c.clientNotes || '—'}</p>
            <p className="text-slate-500 mt-1">
              {c.client.email}
              {c.client.phone ? ` · ${c.client.phone}` : ''}
            </p>
          </div>
          {c.status === 'CONFIRMED' && c.mode === 'VIDEO' && (
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-slate-400">Meeting link (shared with client)</span>
              <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/…" className="w-full bg-white border border-slate-300 rounded-xl p-2 mt-1" />
            </label>
          )}
          <label className="block">
            <span className="text-[10px] font-bold uppercase text-slate-400">Private notes (only you can see these)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-white border border-slate-300 rounded-xl p-2 mt-1" />
          </label>
          <button
            disabled={busy}
            onClick={() => patch({ action: 'update', lawyerNotes: notes, ...(c.mode === 'VIDEO' ? { meetingUrl } : {}) })}
            className="bg-[#073B5C] text-[#F4B942] font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function AvailabilityEditor({
  rules: initialRules,
  timeOff: initialTimeOff,
}: {
  rules: LawyerDashboardData['profile']['availability'];
  timeOff: LawyerDashboardData['profile']['timeOff'];
}) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules.map((r) => ({ weekday: r.weekday, start: toHHMM(r.startMinute), end: toHHMM(r.endMinute) })));
  const [timeOff, setTimeOff] = useState(
    initialTimeOff.map((t) => ({
      start: istDate(new Date(t.startsAt).getTime()),
      end: istDate(new Date(t.endsAt).getTime() - 1), // stored end is exclusive (next day 00:00)
      reason: t.reason || '',
    }))
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setBusy(true);
    setMsg('');
    const res = await fetch('/api/lawyer/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules: rules.map((r) => ({ weekday: r.weekday, startMinute: fromHHMM(r.start), endMinute: fromHHMM(r.end) })),
        // Whole IST days: from 00:00 on the start date to 24:00 on the end date.
        timeOff: timeOff.map((t) => ({
          startsAt: new Date(`${t.start}T00:00:00+05:30`).toISOString(),
          endsAt: new Date(new Date(`${t.end}T00:00:00+05:30`).getTime() + 86_400_000).toISOString(),
          reason: t.reason || undefined,
        })),
      }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(data.success ? 'Availability saved.' : data.error || 'Could not save.');
    if (data.success) router.refresh();
  };

  const input = 'bg-white border border-slate-300 rounded-lg p-1.5 text-xs';

  return (
    <div className="space-y-6">
      <Section title="Weekly hours (IST)">
        <div className="p-4 space-y-2">
          {WEEKDAYS.map((name, day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-2 text-xs border-b border-slate-100 pb-2">
              <span className="w-24 font-bold text-[#073B5C] pt-1.5">{name}</span>
              <div className="flex-1 space-y-1.5">
                {rules.map((r, i) =>
                  r.weekday === day ? (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" step={900} value={r.start} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className={input} />
                      <span>–</span>
                      <input type="time" step={900} value={r.end} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className={input} />
                      <button onClick={() => setRules(rules.filter((_, j) => j !== i))} className="text-rose-600 font-bold cursor-pointer" aria-label="Remove window">
                        ✕
                      </button>
                    </div>
                  ) : null
                )}
                <button onClick={() => setRules([...rules, { weekday: day, start: '10:00', end: '13:00' }])} className="text-[#0E7490] font-bold text-[11px] cursor-pointer">
                  + Add hours
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Time off">
        <div className="p-4 space-y-2 text-xs">
          {timeOff.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input type="date" value={t.start} onChange={(e) => setTimeOff(timeOff.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className={input} />
              <span>to</span>
              <input type="date" value={t.end} onChange={(e) => setTimeOff(timeOff.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className={input} />
              <input value={t.reason} placeholder="Reason (optional)" onChange={(e) => setTimeOff(timeOff.map((x, j) => (j === i ? { ...x, reason: e.target.value } : x)))} className={`${input} flex-1 min-w-[8rem]`} />
              <button onClick={() => setTimeOff(timeOff.filter((_, j) => j !== i))} className="text-rose-600 font-bold cursor-pointer" aria-label="Remove time off">
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const d = istDate(Date.now());
              setTimeOff([...timeOff, { start: d, end: d, reason: '' }]);
            }}
            className="text-[#0E7490] font-bold text-[11px] cursor-pointer"
          >
            + Add time off
          </button>
          <p className="text-[11px] text-slate-400">Existing confirmed bookings are not affected — cancel them individually if needed.</p>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button disabled={busy} onClick={save} className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs px-6 py-3 rounded-xl uppercase cursor-pointer">
          {busy ? 'Saving…' : 'Save availability'}
        </button>
        {msg && <span className="text-xs font-semibold text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
