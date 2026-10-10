export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center font-sans antialiased">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center space-y-4 max-w-xs w-full text-center">
        <div className="w-12 h-12 border-4 border-[#073B5C]/20 border-t-[#073B5C] rounded-full animate-spin"></div>
        <div className="space-y-1">
          <strong className="block text-sm font-black text-[#073B5C]">Loading NyayaLink...</strong>
          <span className="text-xs text-slate-400">Verifying statutory registries</span>
        </div>
      </div>
    </div>
  );
}
