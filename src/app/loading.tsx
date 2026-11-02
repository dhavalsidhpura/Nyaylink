export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-1 bg-gradient-to-r from-[#073B5C] via-[#0E7490] to-[#F4B942] animate-pulse w-full shadow-xs" />
    </div>
  );
}
