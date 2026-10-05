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
  const [tab, setTab] = useState<'schedule' | 'earnings' | 'profile' | 'availability'>('schedule');
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
        <div>
          <h1 className="text-xl font-extrabold text-[#073B5C]">{profile.user.name}</h1>
          <p className="text-xs text-slate-500">Advocate dashboard · {profile.enrollmentNo}</p>
        </div>

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
