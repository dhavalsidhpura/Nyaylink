'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
    >
      Download / Print PDF
    </button>
  );
}
