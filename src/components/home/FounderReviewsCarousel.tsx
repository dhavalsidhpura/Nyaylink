'use client';

import { useState, useEffect } from 'react';

const FOUNDER_REVIEWS = [
  {
    stars: '★★★★★',
    quote: '“Incorporated our SaaS entity in just 4 days. The ₹999 advance model gave us complete peace of mind, and the state stamp duty was passed through at exact govt challan with zero markup.”',
    name: 'Rohit K.',
    role: 'CTO @ NexaCloud Labs (Bengaluru)',
    service: '🏢 Pvt Ltd Company',
  },
  {
    stars: '★★★★★',
    quote: '“Our trademark faced an objection from a conglomerate. NyayaLink assigned a High Court Advocate who drafted a flawless reply and cleared our hearing in one attempt. Certificate granted!”',
    name: 'Priya S.',
    role: 'Founder @ Aara Naturals (Mumbai)',
    service: '™️ TM Hearing & Class 3',
  },
  {
    stars: '★★★★★',
    quote: '“GST registration and MSME Udyam certificate approved in under 72 hours. The encrypted document vault keeps all our PAN, TAN, and GST certificates securely archived with zero clutter.”',
    name: 'Vikram M.',
    role: 'Director @ Apex Precision (Delhi NCR)',
    service: '🧾 GST & MSME Udyam',
  },
  {
    stars: '★★★★★',
    quote: '“Secured our multi-state FSSAI food license in under a week. Communication with our assigned CA over direct WhatsApp was fast and professional. No endless sales rep spam.”',
    name: 'Dr. Ananya R.',
    role: 'Co-Founder @ NutriBites (Hyderabad)',
    service: '📜 Central FSSAI License',
  },
  {
    stars: '★★★★★',
    quote: '“Drafted our multi-founder LLP agreement and filed Form 3 with the ROC seamlessly. Transparent pass-through fee ledger without the usual hidden markups or aggressive sales calls.”',
    name: 'Karan Mehra',
    role: 'Managing Partner @ StackZero (Pune)',
    service: '🤝 LLP Agreement & ROC',
  },
];

export default function FounderReviewsCarousel() {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Auto-slide founder reviews every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % FOUNDER_REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header & Overall Rating Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold text-[#0E7490] uppercase tracking-wider block">
              Direct CA &amp; Advocate Verified Reviews
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
              Loved by 10,000+ Founders Across India
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Real feedback from Indian entrepreneurs, tech founders, restaurants, and D2C brands who trust NyayaLink for their statutory filings.
            </p>
          </div>

          {/* Overall Rating Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-xs self-start md:self-auto shrink-0">
            <span className="text-2xl font-black text-[#073B5C]">4.9</span>
            <div>
              <div className="text-amber-500 text-xs font-black">★★★★★</div>
              <span className="text-[10px] text-slate-500 font-bold block">1,240+ Verified Reviews</span>
            </div>
          </div>
        </div>

        {/* Mobile Auto-Sliding Single Review Card (sm:hidden) */}
        <div className="sm:hidden space-y-3">
          <div className="p-5 rounded-3xl border-2 border-[#0E7490]/30 bg-gradient-to-b from-white to-cyan-50/20 shadow-sm space-y-3 min-h-[175px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-500 text-xs font-black tracking-widest">
                  {FOUNDER_REVIEWS[activeReviewIndex].stars}
                </span>
                <span className="text-[9px] font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                  {FOUNDER_REVIEWS[activeReviewIndex].service}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                {FOUNDER_REVIEWS[activeReviewIndex].quote}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
              <div>
                <strong className="block text-xs font-extrabold text-[#073B5C]">
                  {FOUNDER_REVIEWS[activeReviewIndex].name}
                </strong>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  {FOUNDER_REVIEWS[activeReviewIndex].role}
                </span>
              </div>
              <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ Verified Docket
              </span>
            </div>
          </div>

          {/* Mobile Carousel Navigation & Dot Indicators */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-1.5">
              {FOUNDER_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveReviewIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeReviewIndex === idx ? 'w-5 bg-[#0E7490]' : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveReviewIndex((prev) => (prev === 0 ? FOUNDER_REVIEWS.length - 1 : prev - 1))
                }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-xs flex items-center justify-center transition cursor-pointer"
                aria-label="Previous review"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveReviewIndex((prev) => (prev + 1) % FOUNDER_REVIEWS.length)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#073B5C] font-bold text-xs flex items-center justify-center transition cursor-pointer"
                aria-label="Next review"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Grid (Hidden on Mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FOUNDER_REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-slate-200 hover:border-[#0E7490] bg-white hover:bg-slate-50/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-xs font-black tracking-widest">{review.stars}</span>
                  <span className="text-[10px] font-extrabold text-[#0E7490] bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                    {review.service}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic font-medium leading-relaxed">{review.quote}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div>
                  <strong className="block text-xs font-black text-[#073B5C]">{review.name}</strong>
                  <span className="text-[10px] text-slate-500 block">{review.role}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✓ Verified Docket
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
