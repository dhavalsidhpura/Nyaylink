import Link from 'next/link';

export default function MiniHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="bg-[#073B5C] text-white border-b border-[#0E7490]/40 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="bg-[#0E7490] text-white font-extrabold text-lg px-3 py-1 rounded-xl font-mono shrink-0">
          Nyaya<span className="text-[#F4B942]">Link</span>
        </Link>
        <nav className="flex items-center gap-4 text-xs font-bold">
          {backHref && (
            <Link href={backHref} className="text-[#F4B942] hover:underline">
              {backLabel || '← Back'}
            </Link>
          )}
          <Link href="/dashboard" className="text-white/90 hover:text-white">
            My Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
