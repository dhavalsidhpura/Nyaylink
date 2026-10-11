'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export interface LawyerProfileValues {
  barCouncil: string;
  enrollmentNo: string;
  enrollmentYear: number;
  city: string;
  bio: string;
  languages: string[];
  courts: string[];
  practiceAreaSlugs: string[];
  consultationFee: number;
  consultationMinutes: number;
  modes: string[];
  isListed?: boolean;
}

const BAR_COUNCILS = [
  'Bar Council of Maharashtra & Goa',
  'Bar Council of Delhi',
  'Karnataka State Bar Council',
  'Bar Council of Tamil Nadu & Puducherry',
  'Bar Council of Gujarat',
  'Bar Council of Uttar Pradesh',
  'Bar Council of Telangana',
  'Bar Council of West Bengal',
  'Bar Council of Kerala',
  'Bar Council of Punjab & Haryana',
  'Bar Council of Rajasthan',
  'Bar Council of Madhya Pradesh',
  'Other State Bar Council',
];

const EMPTY: LawyerProfileValues = {
  barCouncil: BAR_COUNCILS[0],
  enrollmentNo: '',
  enrollmentYear: new Date().getFullYear() - 5,
  city: '',
  bio: '',
  languages: ['English', 'Hindi'],
  courts: [],
  practiceAreaSlugs: [],
  consultationFee: 1000,
  consultationMinutes: 30,
  modes: ['VIDEO', 'PHONE'],
};

const input = 'w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]';
const label = 'block font-bold text-[#073B5C] mb-1 text-xs';

export default function LawyerProfileForm({
  mode,
  areas,
  initial,
}: {
  mode: 'apply' | 'edit';
  areas: { slug: string; name: string }[];
  initial?: LawyerProfileValues;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [v, setV] = useState<LawyerProfileValues>(initial || EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof LawyerProfileValues>(k: K, value: LawyerProfileValues[K]) => setV((prev) => ({ ...prev, [k]: value }));
  const toggle = (k: 'practiceAreaSlugs' | 'modes', value: string) =>
    set(k, v[k].includes(value) ? v[k].filter((x) => x !== value) : [...v[k], value]);
  const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(mode === 'apply' ? '/api/lawyer/apply' : '/api/lawyer/profile', {
        method: mode === 'apply' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, isListed: v.isListed ?? true }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg({ ok: false, text: data.error || 'Could not save.' });
        return;
      }
      if (mode === 'apply') {
        await update(); // refresh the session role to LAWYER
        router.push('/lawyer/dashboard');
        router.refresh();
        return;
      }
      setMsg({
        ok: true,
        text: data.reverification ? 'Saved. Your credentials changed, so the profile is hidden until re-verified.' : 'Profile saved.',
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <legend className="text-sm font-extrabold text-[#073B5C] mb-2">Bar Council enrolment</legend>
        <div className="sm:col-span-2">
          <label htmlFor="bc" className={label}>State Bar Council *</label>
          <select id="bc" value={v.barCouncil} onChange={(e) => set('barCouncil', e.target.value)} className={input}>
            {BAR_COUNCILS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="en" className={label}>Enrolment number *</label>
          <input id="en" required value={v.enrollmentNo} onChange={(e) => set('enrollmentNo', e.target.value)} placeholder="MAH/1234/2015" className={`${input} font-mono uppercase`} />
        </div>
        <div>
          <label htmlFor="ey" className={label}>Year of enrolment *</label>
          <input id="ey" type="number" required min={1950} max={new Date().getFullYear()} value={v.enrollmentYear} onChange={(e) => set('enrollmentYear', Number(e.target.value))} className={input} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <legend className="text-sm font-extrabold text-[#073B5C] mb-2">Practice</legend>
        <div>
          <label htmlFor="city" className={label}>City *</label>
          <input id="city" required value={v.city} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai" className={input} />
        </div>
        <div>
          <label htmlFor="lang" className={label}>Languages (comma separated) *</label>
          <input id="lang" required defaultValue={v.languages.join(', ')} onBlur={(e) => set('languages', csv(e.target.value))} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="courts" className={label}>Courts / forums you appear before (comma separated)</label>
          <input id="courts" defaultValue={v.courts.join(', ')} onBlur={(e) => set('courts', csv(e.target.value))} placeholder="Bombay High Court, NCLT Mumbai" className={input} />
        </div>
        <div className="sm:col-span-2">
          <span className={label}>Practice areas * (up to 8)</span>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <button
                type="button"
                key={a.slug}
                onClick={() => toggle('practiceAreaSlugs', a.slug)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border cursor-pointer ${
                  v.practiceAreaSlugs.includes(a.slug) ? 'bg-[#073B5C] text-[#F4B942] border-[#073B5C]' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bio" className={label}>Professional summary * (factual — no claims of success rates or comparisons)</label>
          <textarea id="bio" required minLength={40} maxLength={2000} rows={5} value={v.bio} onChange={(e) => set('bio', e.target.value)} className={input} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <legend className="text-sm font-extrabold text-[#073B5C] mb-2">Consultations</legend>
        <div>
          <label htmlFor="fee" className={label}>Your fee (₹) *</label>
          <input id="fee" type="number" required min={0} max={100000} value={v.consultationFee} onChange={(e) => set('consultationFee', Number(e.target.value))} className={input} />
        </div>
        <div>
          <label htmlFor="dur" className={label}>Duration *</label>
          <select id="dur" value={v.consultationMinutes} onChange={(e) => set('consultationMinutes', Number(e.target.value))} className={input}>
            {[15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={label}>Modes *</span>
          <div className="flex flex-wrap gap-2">
            {(['VIDEO', 'PHONE', 'IN_PERSON'] as const).map((m) => (
              <label key={m} className="flex items-center gap-1 text-[11px] text-slate-700">
                <input type="checkbox" checked={v.modes.includes(m)} onChange={() => toggle('modes', m)} className="accent-[#0E7490]" />
                {m.replace('_', ' ').toLowerCase()}
              </label>
            ))}
          </div>
        </div>
        {mode === 'edit' && (
          <label className="sm:col-span-3 flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={v.isListed ?? true} onChange={(e) => set('isListed', e.target.checked)} className="accent-[#0E7490]" />
            Show my profile in वकील Search (untick to pause new bookings)
          </label>
        )}
      </fieldset>

      {mode === 'apply' && (
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
          We verify every enrolment with the State Bar Council before your profile goes live (usually 1–2 working days). By applying you
          confirm the details are true and that your listing complies with Bar Council of India Rules (Part VI, Chapter II).
        </p>
      )}

      {msg && <p className={`text-xs font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}

      <button
        disabled={busy || v.practiceAreaSlugs.length === 0 || v.modes.length === 0}
        className="w-full sm:w-auto bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider cursor-pointer"
      >
        {busy ? 'Saving…' : mode === 'apply' ? 'Submit for verification →' : 'Save profile'}
      </button>
    </form>
  );
}
