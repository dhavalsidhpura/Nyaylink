'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#052A42] text-slate-300 text-xs border-t border-[#0E7490]/30 font-sans mt-auto">
      
      {/* 1. MASTER SERVICES LINK GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 border-b border-slate-700/60">
        
        {/* Column 1: Business Registration */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            Business Registration
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/services/private-limited-company" className="hover:text-[#F4B942] transition-colors">Private Limited Company</Link></li>
            <li><Link href="/services/llp-registration" className="hover:text-[#F4B942] transition-colors">Limited Liability Partnership</Link></li>
            <li><Link href="/services/one-person-company" className="hover:text-[#F4B942] transition-colors">One Person Company (OPC)</Link></li>
            <li><Link href="/services/public-limited-company" className="hover:text-[#F4B942] transition-colors">Public Limited Company</Link></li>
            <li><Link href="/services/section-8-company" className="hover:text-[#F4B942] transition-colors">Section 8 Company (NGO)</Link></li>
            <li><Link href="/services/nidhi-company-registration" className="hover:text-[#F4B942] transition-colors">Nidhi Company Setup</Link></li>
            <li><Link href="/services/indian-subsidiary-registration" className="hover:text-[#F4B942] transition-colors">Indian Subsidiary</Link></li>
            <li><Link href="/services/partnership-proprietorship" className="hover:text-[#F4B942] transition-colors">Proprietorship / Partnership</Link></li>
          </ul>
        </div>

        {/* Column 2: Licenses & Permits */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            Licenses & Permits
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/services/fssai-license" className="hover:text-[#F4B942] transition-colors">FSSAI Food License</Link></li>
            <li><Link href="/services/fssai-maintenance" className="hover:text-[#F4B942] transition-colors">FSSAI Renewal & Return</Link></li>
            <li><Link href="/services/import-export-code" className="hover:text-[#F4B942] transition-colors">IEC [Import/Export Code]</Link></li>
            <li><Link href="/services/iso-certification" className="hover:text-[#F4B942] transition-colors">ISO Certification</Link></li>
            <li><Link href="/services/udyam-registration" className="hover:text-[#F4B942] transition-colors">MSME / Udyam Registration</Link></li>
            <li><Link href="/services/shop-and-establishment" className="hover:text-[#F4B942] transition-colors">Shop & Establishment Act</Link></li>
            <li><Link href="/services/gs1-barcode-bis" className="hover:text-[#F4B942] transition-colors">GS1 Barcode & BIS License</Link></li>
          </ul>
        </div>

        {/* Column 3: Trademark & IPR */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            Trademark & IPR
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/services/trademark-registration" className="hover:text-[#F4B942] transition-colors">TM Registration (™ / ®)</Link></li>
            <li><Link href="/services/trademark-objection-reply" className="hover:text-[#F4B942] transition-colors">TM Objection Reply</Link></li>
            <li><Link href="/services/trademark-renewal" className="hover:text-[#F4B942] transition-colors">Trademark Renewal</Link></li>
            <li><Link href="/services/trademark-opposition" className="hover:text-[#F4B942] transition-colors">Trademark Opposition</Link></li>
            <li><Link href="/services/trademark-assignment" className="hover:text-[#F4B942] transition-colors">Trademark Assignment</Link></li>
            <li><Link href="/services/copyright-registration" className="hover:text-[#F4B942] transition-colors">Copyright Registration</Link></li>
            <li><Link href="/services/logo-design" className="hover:text-[#F4B942] transition-colors">Logo & Brand Identity</Link></li>
          </ul>
        </div>

        {/* Column 4: GST & Taxation */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            GST & Taxation
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/services/gst-registration" className="hover:text-[#F4B942] transition-colors">GST Registration</Link></li>
            <li><Link href="/services/gst-return-filing" className="hover:text-[#F4B942] transition-colors">Monthly GST Return (3B/1)</Link></li>
            <li><Link href="/services/gst-nil-return" className="hover:text-[#F4B942] transition-colors">GST Nil Return Filing</Link></li>
            <li><Link href="/services/gstr-9-annual-return" className="hover:text-[#F4B942] transition-colors">GSTR-9 Annual Return</Link></li>
            <li><Link href="/services/gst-lut-filing" className="hover:text-[#F4B942] transition-colors">GST LUT Export Filing</Link></li>
            <li><Link href="/services/gst-amendment" className="hover:text-[#F4B942] transition-colors">GST Amendment / Modification</Link></li>
          </ul>
        </div>

        {/* Column 5: Accounting & HR */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            Accounting & Payroll
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/services/online-bookkeeping" className="hover:text-[#F4B942] transition-colors">Online Bookkeeping</Link></li>
            <li><Link href="/services/tax-planning" className="hover:text-[#F4B942] transition-colors">Tax Planning & Advisory</Link></li>
            <li><Link href="/services/income-tax-return" className="hover:text-[#F4B942] transition-colors">Income Tax Return (ITR)</Link></li>
            <li><Link href="/services/tds-tcs-return" className="hover:text-[#F4B942] transition-colors">TDS / TCS Quarterly Return</Link></li>
            <li><Link href="/services/pf-esic-registration-returns" className="hover:text-[#F4B942] transition-colors">PF & ESIC Returns</Link></li>
            <li><Link href="/services/professional-tax" className="hover:text-[#F4B942] transition-colors">Professional Tax (PTEC/PTRC)</Link></li>
            <li><Link href="/services/hr-payroll-posh" className="hover:text-[#F4B942] transition-colors">HRMS & POSH Compliance</Link></li>
          </ul>
        </div>

        {/* Column 6: Account & Legal Tech */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F4B942] uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5">
            Client Portal & Account
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><Link href="/login" className="hover:text-[#F4B942] transition-colors font-bold text-white">→ Client Login</Link></li>
            <li><Link href="/register" className="hover:text-[#F4B942] transition-colors font-bold text-[#F4B942]">→ Register / Sign Up</Link></li>
            <li><Link href="/dashboard" className="hover:text-[#F4B942] transition-colors">My Documents Vault</Link></li>
            <li><Link href="/services/gem-registration" className="hover:text-[#F4B942] transition-colors">GeM Vendor Portal</Link></li>
            <li><Link href="/services/virtual-cxo-services" className="hover:text-[#F4B942] transition-colors">Virtual CXO Solutions</Link></li>
            <li><Link href="/services/digital-signature-certificate" className="hover:text-[#F4B942] transition-colors">Class 3 DSC Token</Link></li>
            <li><Link href="/services/online-dispute-resolution" className="hover:text-[#F4B942] transition-colors">Online Dispute Resolution</Link></li>
          </ul>
        </div>

      </div>

      {/* 2. CORPORATE LOCATION, CONTACT & DISCLAIMER */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Contact & Address Details */}
        <div className="space-y-2 bg-[#073B5C] p-4 rounded-xl border border-slate-700">
          <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">Corporate Head Office</h5>
          <p className="text-slate-300 font-medium">
            📍 <strong>Address:</strong> Charkop, Kandivali West, Mumbai - 400067, Maharashtra, India
          </p>
          <p className="text-slate-300 font-medium">
            📞 <strong>Phone:</strong> <a href="tel:+919920054785" className="text-[#F4B942] hover:underline font-bold">+91 9920054785</a>
          </p>
          <p className="text-slate-300 font-medium">
            ✉️ <strong>Support Email:</strong> <a href="mailto:info@nyayalink.com" className="text-[#F4B942] hover:underline">info@nyayalink.com</a>
          </p>
        </div>

        {/* Grievance Mechanism */}
        <div className="space-y-2 bg-[#073B5C] p-4 rounded-xl border border-slate-700">
          <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">Grievance Redressal Cell</h5>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            For any statutory compliance issues, escalation, or service feedback, mail directly to our legal grievance desk:
          </p>
          <p className="pt-1">
            <strong>Grievance Mail:</strong> <a href="mailto:complain@nyayalink.com" className="text-[#F4B942] font-bold hover:underline text-xs">complain@nyayalink.com</a>
          </p>
        </div>

        {/* Quick Portal Account Links */}
        <div className="space-y-2 bg-[#073B5C] p-4 rounded-xl border border-slate-700">
          <h5 className="font-extrabold text-[#F4B942] text-xs uppercase tracking-wider">Portal Access</h5>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Create an account or log in to access your case dashboard and document status.
          </p>
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="bg-[#0E7490] hover:bg-cyan-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
              Client Login
            </Link>
            <Link href="/register" className="bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-extrabold px-3 py-1.5 rounded-lg text-xs transition-colors">
              Register / Sign Up
            </Link>
          </div>
        </div>

      </div>

      {/* 3. LEGAL DISCLAIMER */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-700/60 text-slate-400 text-[11px] leading-relaxed space-y-2">
        <strong className="text-[#F4B942] block uppercase tracking-wider">Website Disclaimer:</strong>
        <p>
          This website is privately operated by NyayaLink and is not directly affiliated with, endorsed by, or connected to any government body, ministry, or statutory authority. The intake forms on this portal are designed to collect client information for statutory business filings. Assistance is rendered based on customer requests, and fees charged represent platform advisory and document preparation charges. Where applicable, filings are reviewed or processed by appropriately engaged professionals; credentials and assignments must be confirmed for each service.
        </p>
      </div>

      {/* 4. COPYRIGHT BAR */}
      <div className="bg-[#031c2d] py-4 text-center text-slate-500 text-[11px] border-t border-slate-800">
        <p>© 2026 NyayaLink — Your Link to Justice. All Rights Reserved. Charkop, Kandivali West, Mumbai 400067.</p>
      </div>

    </footer>
  );
}