const STEPS = [
  { key: 'PENDING_PAYMENT', label: 'Payment' },
  { key: 'DOCS_PENDING', label: 'Documents' },
  { key: 'IN_PROGRESS', label: 'Filing with Govt' },
  { key: 'APPROVED', label: 'Completed' },
] as const;

const STEP_INDEX: Record<string, number> = {
  PENDING_PAYMENT: 0,
  DOCS_PENDING: 1,
  IN_PROGRESS: 2,
  QUERY_RAISED: 2,
  APPROVED: 4,
  REJECTED: 2,
};

/** Horizontal tracker for a compliance order. Works on mobile (labels wrap under dots). */
export default function OrderProgress({ status }: { status: string }) {
  const current = STEP_INDEX[status] ?? 0;
  const percent = Math.min(100, (current / STEPS.length) * 100 + (current < STEPS.length ? 100 / STEPS.length / 2 : 0));
  const tone = status === 'REJECTED' ? 'bg-rose-500' : status === 'QUERY_RAISED' ? 'bg-orange-500' : 'bg-[#0E7490]';

  return (
    <div className="space-y-2" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <ol className="grid grid-cols-4 gap-1 text-[10px] sm:text-[11px] font-bold">
        {STEPS.map((step, i) => (
          <li key={step.key} className={`text-center ${i < current ? 'text-emerald-700' : i === current ? 'text-[#073B5C]' : 'text-slate-400'}`}>
            {i < current ? '✓ ' : ''}
            {step.label}
          </li>
        ))}
      </ol>
      {status === 'QUERY_RAISED' && (
        <p className="text-[11px] font-bold text-orange-700">⚠️ Your compliance desk needs a response from you — see Messages below.</p>
      )}
      {status === 'REJECTED' && <p className="text-[11px] font-bold text-rose-700">This application was rejected. See the remarks in the history.</p>}
    </div>
  );
}
