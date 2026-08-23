'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('NyayLink page error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F0F4F8] px-4 py-16 text-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0E7490]">Temporary problem</p>
        <h1 className="mt-3 text-2xl font-black text-[#073B5C]">This page could not load</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Please try again. If the problem continues, contact the NyayLink support team.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-[#073B5C] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#F4B942] focus:ring-offset-2"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
