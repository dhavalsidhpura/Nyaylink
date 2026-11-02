import Link from 'next/link';

const TOOLS = [
  {
    title: 'All-India Incorporation Cost Calculator',
    badge: 'NEW · Pure Agent',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🏛️',
    href: '/tools/incorporation-calculator',
    description:
      'Calculate exact MCA filing fees, state stamp duties on MoA/AoA for all 36 Indian States & UTs, and DSC costs with zero lead gate or drip pricing.',
    highlights: ['All 36 States & UTs', 'Pvt Ltd, LLP, OPC, Sec 8', 'Rule 33 Pure Agent', '₹999 Advance Token'],
  },
  {
    title: 'Startup India DPIIT & 80-IAC Checker',
    badge: 'NEW · Tax Holiday',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: '🇮🇳',
    href: '/tools/startup-india-checker',
    description:
      'Diagnostic tool to verify eligibility for 3 years of 100% Income Tax exemption, 80% patent discounts, and Angel Tax relief under Gazette 127(E).',
    highlights: ['Sec 80-IAC 3-Yr Tax Holiday', '80% Patent Rebate', 'Angel Tax Immunity', 'Instant 60s Score'],
  },
  {
    title: 'MCA Company Name Availability Search',
    badge: 'Rule 8 Compliant',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔍',
    href: '/tools/company-name-search',
    description:
      'Check company and LLP name availability across the MCA V3 portal and Trademark Class 35/42 database with phonetic clash detection.',
    highlights: ['MCA V3 Database', 'Phonetic Conflict Analysis', 'Rule 8 Guideline Check', 'Instant CA Report'],
  },
  {
    title: 'Trademark Class & Similarity Search',
    badge: 'IP India Registry',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '™️',
    href: '/tools/trademark-search',
    description:
      'Search across 45 NICE classification classes for existing brand names, phonetic similarities, and pending oppositions in the Indian Trademark Registry.',
    highlights: ['45 NICE Classes', 'Phonetic Search', 'Vienna Code Filter', 'Objection Risk Score'],
  },
  {
    title: 'GSTIN Verification & Filing Status',
    badge: 'GSTN Live',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: '📊',
    href: '/tools/gst-search',
    description:
      'Verify 15-digit GSTIN authenticity, legal entity name, principal place of business, and active return filing compliance history.',
    highlights: ['GST Portal Verification', 'GSTR-1 & 3B Track', 'HSN/SAC Validation', 'Supplier Risk Score'],
  },
  {
    title: 'Track MCA SRN & IP India Status',
    badge: 'Multi-Registry',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '📡',
    href: '/tools/track-status',
    description:
      'Track live filing status of MCA Service Request Numbers (SRN), Trademark Application Numbers, and GST Application Reference Numbers (ARN).',
    highlights: ['MCA V3 SRN', 'IP India TM Status', 'GST ARN Track', 'Direct Portal Jump'],
  },
  {
    title: 'Automated Legal Agreement Generator',
    badge: 'Draft in 2 Mins',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '📝',
    href: '/tools/agreement-generator',
    description:
      'Generate customized NDAs, Founder Agreements, Employment Contracts, and Service Level Agreements formatted for Indian jurisdiction.',
    highlights: ['Non-Disclosure Agreements', 'Founder Equity Vesting', 'Employment Letters', 'Instant PDF Download'],
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-[#073B5C] text-white pt-12 pb-16 px-4 border-b border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0E7490]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 font-bold px-3.5 py-1 rounded-full text-xs">
            <span>🛡️</span> 100% Free · Zero Mandatory Phone Gates · Rule 33 Pure Agent
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Free Founder &amp; Corporate <span className="text-[#F4B942]">Compliance Tools</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Essential self-diagnostic and statutory calculators designed to give Indian entrepreneurs complete transparency before spending a single rupee on government filings.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${tool.badgeClass}`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#073B5C] group-hover:text-[#0E7490] transition-colors">
                  {tool.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tool.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={tool.href}
                className="w-full bg-slate-100 hover:bg-[#073B5C] text-[#073B5C] hover:text-white font-bold text-center py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <span>Launch Tool →</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Why NyayaLink Tools Section */}
        <section className="mt-16 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider block mb-1">
              Statutory Transparency Standard
            </span>
            <h2 className="text-2xl font-black text-[#073B5C]">
              Why NyayaLink Built These Open Tools
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Commercial portals routinely gate calculations behind phone numbers to fuel aggressive outbound call centers. NyayaLink believes Indian entrepreneurs deserve honest pricing and open statutory insights from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <strong className="block text-sm font-bold text-[#073B5C]">1. Zero Drip Pricing</strong>
              <p className="text-slate-600 leading-relaxed">
                We itemize exact state stamp duties, MCA challans, and DSC hardware costs so you never face a post-payment surprise bill.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <strong className="block text-sm font-bold text-[#073B5C]">2. Rule 33 Pure Agent</strong>
              <p className="text-slate-600 leading-relaxed">
                Official government fees pass through at actual cost without a single rupee of platform markup, backed by government treasury receipts.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <strong className="block text-sm font-bold text-[#073B5C]">3. ₹999 Advance Token</strong>
              <p className="text-slate-600 leading-relaxed">
                Pay only ₹999 upfront to reserve your name, prepare drafts, and begin. Pay the statutory balance only after your files are ready.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
