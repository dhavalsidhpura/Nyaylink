'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { openRazorpayCheckout } from '@/lib/checkout-client';
import { formatINR } from '@/lib/pricing';

interface DaySlots {
  date: string;
  slots: { startsAt: string; label: string }[];
}

const MODE_LABEL: Record<string, string> = { VIDEO: '🎥 Video call', PHONE: '📞 Phone call', IN_PERSON: '🏢 In person' };

function dayLabel(date: string) {
  const d = new Date(`${date}T00:00:00+05:30`);
  return {
    weekday: d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }),
    day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }),
  };
}

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const todayIst = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

export default function BookingWidget({ slug, modes, total, minutes }: { slug: string; modes: string[]; total: number; minutes: number }) {
  const router = useRouter();
  const { status } = useSession();
  const [from, setFrom] = useState(todayIst());
  const [days, setDays] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState(modes[0]);
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lawyers/${slug}/slots?from=${from}&days=7`);
      const data = await res.json();
      if (data.success) {
        setDays(data.days);
        setSelectedDate((prev) => (prev && data.days.some((d: DaySlots) => d.date === prev) ? prev : data.days.find((d: DaySlots) => d.slots.length)?.date ?? null));
      }
    } finally {
      setLoading(false);
    }
  }, [slug, from]);

  useEffect(() => {
    load();
  }, [load]);

  const book = async () => {
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/vakil/${slug}`)}`);
      return;
    }
    if (!slot) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawyerSlug: slug, startsAt: slot, mode, notes, consent }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Could not book this slot.');
        if (res.status === 409) {
          setSlot(null);
          load();
        }
        return;
      }
      const result = await openRazorpayCheckout(data.checkout);
      if (result.status === 'paid') {
        setDone(
          result.slotLost
            ? 'Payment received, but the slot was taken while the payment was pending. A full refund has been flagged — our team will contact you.'
            : `Booked! Consultation ${data.consultationNumber} is confirmed. Details have been emailed to you.`
        );
      } else if (result.status === 'dismissed') {
        setError('Payment not completed. The slot is held for 15 minutes — you can pay from your dashboard.');
      } else {
        setError(result.error);
      }
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-300 shadow-sm p-6 space-y-3 text-sm">
        <p className="font-bold text-emerald-800">{done}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-[#073B5C] text-[#F4B942] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
          Go to my consultations →
        </button>
      </div>
    );
  }

  const selectedDay = days.find((d) => d.date === selectedDate);
  const canGoBack = from > todayIst();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-6 space-y-5 text-xs">
      <div>
        <h2 className="text-base font-extrabold text-[#073B5C]">Book a consultation</h2>
        <p className="text-slate-500">
          {minutes} minutes · {formatINR(total)} · times in IST
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#073B5C]">1. Pick a date</span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={!canGoBack || loading}
              onClick={() => setFrom(addDays(from, -7))}
              className="px-2 py-1 rounded-lg bg-slate-100 disabled:opacity-40 font-bold cursor-pointer"
              aria-label="Previous week"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setFrom(addDays(from, 7))}
              className="px-2 py-1 rounded-lg bg-slate-100 font-bold cursor-pointer"
              aria-label="Next week"
            >
              ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const { weekday, day } = dayLabel(d.date);
            const active = d.date === selectedDate;
            return (
              <button
                key={d.date}
                type="button"
                disabled={!d.slots.length}
                onClick={() => {
                  setSelectedDate(d.date);
                  setSlot(null);
                }}
                className={`rounded-xl py-2 text-center border cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  active ? 'bg-[#073B5C] text-[#F4B942] border-[#073B5C]' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="block text-[10px]">{weekday}</span>
                <span className="block font-bold text-[11px]">{day}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="font-bold text-[#073B5C]">2. Pick a time</span>
        {loading ? (
          <p className="text-slate-400">Loading availability…</p>
        ) : !selectedDay || selectedDay.slots.length === 0 ? (
          <p className="text-slate-400">No open slots this week. Try the next week.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {selectedDay.slots.map((s) => (
              <button
                key={s.startsAt}
                type="button"
                onClick={() => setSlot(s.startsAt)}
                className={`py-2 rounded-xl border font-bold cursor-pointer ${
                  slot === s.startsAt ? 'bg-[#0E7490] text-white border-[#0E7490]' : 'bg-white border-slate-300 text-[#073B5C] hover:border-[#0E7490]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <span className="font-bold text-[#073B5C]">3. Your matter</span>
        {modes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-full border font-bold cursor-pointer ${
                  mode === m ? 'bg-[#073B5C] text-[#F4B942] border-[#073B5C]' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Briefly describe your situation and what you need help with. Shared only with this advocate."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
        />
        <label className="flex items-start gap-2 text-[11px] text-slate-600">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#0E7490]" />
          <span>
            I understand the advice is given by the independent advocate, not by NyayaLink, and I agree to share my notes with them.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={book}
        disabled={busy || !slot || notes.trim().length < 10 || !consent}
        className="w-full bg-[#F4B942] hover:bg-amber-500 disabled:bg-slate-300 text-[#073B5C] font-black py-3.5 rounded-xl uppercase tracking-wider shadow cursor-pointer"
      >
        {busy ? 'Reserving slot…' : status === 'authenticated' ? `Pay ${formatINR(total)} & confirm` : 'Sign in to book'}
      </button>
    </div>
  );
}
