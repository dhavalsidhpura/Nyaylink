'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getStateIntakeGuidance, INDIAN_STATES } from '@/data/india';
import { MASTER_SERVICES } from '@/data/services';

type Goal = 'start' | 'tax' | 'brand' | 'license' | 'dispute' | 'grow';
type Applicant = 'individual' | 'existing-business' | 'startup' | 'food-export';

const GOALS: { id: Goal; label: string; description: string }[] = [
  { id: 'start', label: 'Start a business', description: 'Choose a structure and begin registration.' },
  { id: 'tax', label: 'Handle tax or returns', description: 'Get help with GST, ITR, TDS, or accounts.' },
  { id: 'brand', label: 'Protect my brand or work', description: 'Explore trademark, copyright, or branding help.' },
  { id: 'license', label: 'Get a licence or code', description: 'Check FSSAI, IEC, or other business permissions.' },
  { id: 'dispute', label: 'Recover money or send a notice', description: 'Start with a cheque-bounce demand notice.' },
  { id: 'grow', label: 'Improve or grow my business', description: 'Explore technology, cloud, or digital support.' },
];

const APPLICANTS: { id: Applicant; label: string }[] = [
  { id: 'individual', label: 'I am an individual or freelancer' },
  { id: 'existing-business', label: 'I already run a business' },
  { id: 'startup', label: 'I am building a startup' },
  { id: 'food-export', label: 'I work in food, import, or export' },
];

const RECOMMENDATION_MAP: Record<Goal, string[]> = {
  start: ['private-limited-company', 'llp-registration', 'one-person-company'],
  tax: ['gst-registration', 'income-tax-return-itr', 'gst-return-filing'],
  brand: ['trademark-registration', 'copyright-registration', 'logo-design'],
  license: ['fssai-food-license', 'import-export-code-iec', 'iso-certification'],
  dispute: ['cheque-bounce-notice-138'],
  grow: ['scale-your-business', 'software-app-development', 'website-ecommerce'],
};

function serviceReason(slug: string, applicant: Applicant | '') {
  if (slug === 'private-limited-company' && applicant === 'startup') return 'A common starting point for a startup that expects formal ownership and investment needs.';
  if (slug === 'one-person-company' && applicant === 'individual') return 'A single-member structure to discuss when you want a formal business entity.';
  if (slug === 'fssai-food-license' && applicant === 'food-export') return 'A starting point for food businesses; the correct licence depends on activity and turnover.';
  if (slug === 'import-export-code-iec' && applicant === 'food-export') return 'A starting point for import/export activity; applicability depends on the transaction and current rules.';
  if (slug === 'trademark-registration') return 'A starting point for protecting a name, logo, or other brand identifier.';
  if (slug === 'gst-registration') return 'A starting point for businesses that may need GST registration after eligibility review.';
  return 'A starting point based on your answers. The team confirms the final service and checklist before filing.';
}

export default function ServiceRecommender() {
  const [goal, setGoal] = useState<Goal | ''>('');
  const [applicant, setApplicant] = useState<Applicant | ''>('');
  const [state, setState] = useState('Maharashtra');

  const recommendations = useMemo(() => {
    if (!goal) return [];
    const serviceMap = new Map(MASTER_SERVICES.map((service) => [service.slug, service]));
    return RECOMMENDATION_MAP[goal]
      .map((slug) => serviceMap.get(slug))
      .filter((service): service is (typeof MASTER_SERVICES)[number] => Boolean(service))
      .slice(0, 3);
  }, [goal]);

  const guidance = getStateIntakeGuidance(state);

  return (
    <section className="border-y border-slate-200 bg-[#F0F4F8] px-4 py-12 sm:px-6" aria-labelledby="service-finder-title">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="max-w-3xl">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0E7490]">Not sure where to start?</span>
          <h2 id="service-finder-title" className="mt-2 text-2xl font-black tracking-tight text-[#073B5C] sm:text-3xl">Tell us what you need. We’ll show you a sensible starting point.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Answer three simple questions. This is an initial guide, not a legal opinion. The final service, fee, documents, and state route are confirmed before you pay.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">1. My main goal</p>
            <div className="mt-3 space-y-2">
              {GOALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={goal === item.id}
                  onClick={() => setGoal(item.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${goal === item.id ? 'border-[#0E7490] bg-cyan-50 text-[#073B5C]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#0E7490]'}`}
                >
                  <span className="block text-xs font-extrabold">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">2. I am a</p>
            <div className="mt-3 space-y-2">
              {APPLICANTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={applicant === item.id}
                  onClick={() => setApplicant(item.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left text-xs font-extrabold transition ${applicant === item.id ? 'border-[#0E7490] bg-cyan-50 text-[#073B5C]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#0E7490]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-[10px] font-black uppercase tracking-wider text-slate-400" htmlFor="recommender-state">3. My state</label>
            <select id="recommender-state" value={state} onChange={(event) => setState(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]">
              {INDIAN_STATES.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
            </select>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">{guidance.note}</p>
          </div>

          <div className="rounded-2xl border border-[#0E7490]/20 bg-[#073B5C] p-5 text-white shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-cyan-200">Your starting options</p>
            {!goal ? (
              <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-200">Choose your main goal to see a short list of possible services.</div>
            ) : (
              <div className="mt-3 space-y-3">
                {recommendations.map((service) => (
                  <div key={service.slug} className="rounded-xl border border-white/15 bg-white/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-extrabold leading-5">{service.title}</h3>
                      <span className="shrink-0 text-xs font-black text-[#F4B942]">₹{service.price.toLocaleString()}+</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-slate-300">{serviceReason(service.slug, applicant)}</p>
                    <Link href={`/services/${service.slug}?state=${encodeURIComponent(state)}`} className="mt-2 inline-flex text-[10px] font-black uppercase tracking-wider text-[#F4B942] hover:underline">Review service →</Link>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[10px] leading-4 text-slate-300">{applicant ? `Showing options for: ${APPLICANTS.find((item) => item.id === applicant)?.label.toLowerCase()}.` : 'You can refine this after opening a service.'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
