export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-[#F0F4F8] px-4 py-16 text-center text-[#073B5C]" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#0E7490]/25" />
        <p className="text-sm font-semibold">Loading NyayLink…</p>
        <p className="text-xs text-slate-500">Please wait while we prepare this page.</p>
      </div>
    </main>
  );
}
