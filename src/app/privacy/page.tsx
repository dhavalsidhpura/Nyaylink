import Link from 'next/link';

const sections = [
  ['What we collect', 'We collect the information needed to answer your enquiry, prepare a quotation, process a selected service, communicate with you, and complete the requested filing or professional work. This may include your name, mobile number, email, business details, state, city, identity documents, address proof, and payment references.'],
  ['Why we use it', 'We use your information to provide the service you requested, create and manage your account, verify documents where the service requires it, communicate case updates, issue invoices, prevent fraud, and meet accounting or legal obligations. We do not use identity documents for unrelated marketing.'],
  ['Who may receive it', 'Information is shared only where needed to provide the selected service, such as with an assigned service professional, a payment provider, an email or messaging provider, or the relevant government or statutory portal. We do not sell customer identity documents or contact lists.'],
  ['Document access', 'Documents should be uploaded only through the private customer workspace. Access is limited by account and case permissions. We do not promise that a document can be recovered forever, so customers should keep their own original records.'],
  ['Retention and deletion', 'We keep information for as long as it is needed for the service, accounting, dispute handling, fraud prevention, or a legal requirement. The final retention period, deletion process, and any statutory record-keeping exceptions will be published after owner and professional review.'],
  ['Your choices', 'You may ask us to correct inaccurate account information, explain how your information is being used, or raise a privacy concern. Some information may need to be retained when it is required for an active filing, invoice, dispute, or legal obligation.'],
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-40 bg-[#073B5C] px-4 py-4 text-white shadow sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="rounded-xl bg-[#0E7490] px-3 py-1 font-mono text-xl font-black shadow">Nyaya<span className="text-[#F4B942]">Link</span></Link>
          <Link href="/" className="min-h-11 inline-flex items-center text-xs font-bold text-[#F4B942] hover:underline">← Back to home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
        <div className="border-b border-slate-200 pb-5"><p className="text-xs font-bold uppercase tracking-wide text-[#0E7490]">NyayLink policies</p><h1 className="mt-2 text-2xl font-extrabold text-[#073B5C] sm:text-3xl">Privacy and data protection</h1><p className="mt-2 text-xs text-slate-500">Last reviewed: August 2026 · Please review the final version with your legal and privacy professional before launch.</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-relaxed text-cyan-950"><strong>In simple language:</strong> we collect only what is needed for your chosen service, use it for that service and related support, and do not sell your identity documents.</div>
        <div className="space-y-5">{sections.map(([title, body], index) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-extrabold text-[#073B5C]">{index + 1}. {title}</h2><p className="mt-2 text-sm leading-7 text-slate-700">{body}</p></section>)}</div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-extrabold text-[#073B5C]">Contact and grievance support</h2><p className="mt-2 text-sm leading-7 text-slate-700">For privacy questions or a complaint, email <a className="font-bold text-[#0E7490] underline" href="mailto:complain@nyayalink.com">complain@nyayalink.com</a>. For general service support, email <a className="font-bold text-[#0E7490] underline" href="mailto:info@nyayalink.com">info@nyayalink.com</a> or call <a className="font-bold text-[#0E7490] underline" href="tel:+919920054785">+91 9920054785</a>.</p></section>
      </main>
    </div>
  );
}
