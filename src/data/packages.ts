export interface PackageIncludedService {
  slug: string;
  name: string;
  standalonePrice: number;
  icon: string;
}

export interface PackageItem {
  id: string;
  slug: string;
  category: 'startup' | 'industry' | 'ecommerce' | 'compliance' | 'retail';
  categoryLabel: string;
  title: string;
  tagline: string;
  badge: string;
  icon: string;
  popular?: boolean;
  targetAudience: string;
  description: string;
  standaloneTotal: number;
  packagePrice: number;
  advanceToken: number;
  savingsPercent: number;
  sla: string;
  includedServices: PackageIncludedService[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
}

export const MASTER_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-startup-launchpad',
    slug: 'startup-launchpad-bundle',
    category: 'startup',
    categoryLabel: 'Startup & Formation',
    title: 'The India Startup Launchpad',
    tagline: 'Everything a new founder needs to incorporate, open bank accounts, and invoice legally in India.',
    badge: 'Most Popular',
    icon: '🚀',
    popular: true,
    targetAudience: 'Early-stage founders, tech startups, and entrepreneurs launching a new scalable business.',
    description: 'A unified onboarding bundle combining Private Limited incorporation, director digital signatures, MSME priority subsidies, corporate bank account setup, and 15-digit GST registration.',
    standaloneTotal: 15497,
    packagePrice: 8999,
    advanceToken: 999,
    savingsPercent: 42,
    sla: '7 - 10 Working Days',
    includedServices: [
      { slug: 'private-limited-company', name: 'Private Limited Company Incorporation (SPICe+)', standalonePrice: 6999, icon: '🏢' },
      { slug: 'gst-registration', name: 'GST Registration & 15-Digit GSTIN Allotment', standalonePrice: 1499, icon: '🧾' },
      { slug: 'msme-udyam-registration', name: 'MSME Udyam Government Recognition Certificate', standalonePrice: 999, icon: '🎖️' },
      { slug: 'mca-inc-20a-commencement-of-business', name: 'MCA Form INC-20A Commencement of Business Filing', standalonePrice: 1499, icon: '📋' },
    ],
    deliverables: [
      'Official Certificate of Incorporation (CoI) with CIN',
      'PAN, TAN & 2 Class-3 Digital Signature Certificates (DSC)',
      'Custom MoA & AoA with authorized capital up to ₹15 Lakhs',
      '15-Digit GSTIN with REG-06 Registration Certificate',
      'Green MSME Udyam Certificate unlocking 50% Trademark fee waiver',
      'Instant Corporate Current Account assistance with partner banks',
      'MCA Form INC-20A certified e-Challan filed with the ROC',
    ],
    faqs: [
      {
        q: 'Why is this bundle cheaper than buying services separately?',
        a: 'Because our CA and CS desk collects your KYC documentation once and executes your company incorporation, GST, and MSME filings in parallel without duplicated overhead.',
      },
      {
        q: 'How does the ₹999 Advance Token work?',
        a: 'You only pay ₹999 today to initiate name reservation and Digital Signatures. The remaining package balance is billed only after your entity draft is approved.',
      },
    ],
  },

  {
    id: 'pkg-tech-founder',
    slug: 'tech-founder-venture-suite',
    category: 'startup',
    categoryLabel: 'Tech & Venture Scale',
    title: 'Tech Founder Venture Suite',
    tagline: 'Entity formation, statutory brand trademarking, and foundational legal agreements for funded ventures.',
    badge: 'Founder Protection',
    icon: '💻',
    targetAudience: 'Software engineers, AI startups, D2C ventures, and tech founders planning to raise angel or venture capital.',
    description: 'Designed specifically for tech founders requiring solid cap-table legal protections, trademark brand monopoly, and Startup India tax exemption dockets.',
    standaloneTotal: 22496,
    packagePrice: 14999,
    advanceToken: 999,
    savingsPercent: 33,
    sla: '10 - 14 Working Days',
    includedServices: [
      { slug: 'private-limited-company', name: 'Private Limited Company Incorporation', standalonePrice: 6999, icon: '🏢' },
      { slug: 'trademark-registration', name: 'Trademark Registration (™) in Relevant Class', standalonePrice: 1999, icon: '™️' },
      { slug: 'startup-india-dpiit-recognition', name: 'Startup India DPIIT Recognition & 80-IAC Docket', standalonePrice: 3499, icon: '🚀' },
      { slug: 'gst-lut-filing', name: 'GST Letter of Undertaking (LUT) for 0% SaaS Export', standalonePrice: 1499, icon: '✈️' },
    ],
    deliverables: [
      'Private Limited Company Registration + 2 Class-3 DSCs + PAN/TAN',
      'Trademark Application Number & Form TM-48 (Permits using ™ symbol in 24 hrs)',
      'Official DPIIT Startup India Recognition Certificate',
      'Section 80-IAC 3-Year Income Tax Holiday filing preparation dossier',
      'GST LUT Approval enabling 0% IGST export of software & cross-border services',
      'Founder Restricted Stock & 4-Year Equity Vesting Agreement Template',
      'Employee NDA & Intellectual Property (IP) Assignment Agreement',
    ],
    faqs: [
      {
        q: 'Does this cover foreign clients and SaaS exports?',
        a: 'Yes. The included GST Letter of Undertaking (LUT) ensures you can bill US and international clients at 0% IGST without locking up working capital in tax refunds.',
      },
      {
        q: 'Can we add a Co-Founder later?',
        a: 'Yes, the entity structure and custom Articles of Association are drafted to facilitate future director additions and ESOP allocations.',
      },
    ],
  },

  {
    id: 'pkg-restaurant-kitchen',
    slug: 'restaurant-kitchen-compliance-kit',
    category: 'industry',
    categoryLabel: 'Food & Dining',
    title: 'Restaurant & Cloud Kitchen Compliance Kit',
    tagline: '100% regulatory compliance for restaurants, cafes, cloud kitchens, and Swiggy/Zomato onboarding.',
    badge: 'FSSAI + Municipal',
    icon: '🍲',
    popular: true,
    targetAudience: 'Cloud kitchens, dine-in restaurants, cafes, bakeries, food trucks, and culinary brands.',
    description: 'Covers mandatory 14-digit FoSCoS food licenses, GST under the restaurant scheme, local municipal Shop Act registration, and food aggregator compliance.',
    standaloneTotal: 12496,
    packagePrice: 6499,
    advanceToken: 999,
    savingsPercent: 48,
    sla: '5 - 10 Working Days',
    includedServices: [
      { slug: 'fssai-food-license', name: 'FSSAI Food Safety License / FoSCoS Registration', standalonePrice: 1999, icon: '🍲' },
      { slug: 'gst-registration', name: 'GST Registration (5% Restaurant Composition / Regular)', standalonePrice: 1499, icon: '🧾' },
      { slug: 'shop-and-establishment-license', name: 'Shop & Establishment (Gumasta Labor License)', standalonePrice: 1999, icon: '🏬' },
      { slug: 'msme-udyam-registration', name: 'MSME Udyam Registration Certificate', standalonePrice: 999, icon: '🎖️' },
    ],
    deliverables: [
      'Official 14-Digit FSSAI License with FoSCoS QR verification',
      '15-Digit GSTIN with Restaurant Scheme Tax Classification',
      'Municipal Shop & Establishment License (State Labor Department)',
      'MSME Udyam Certificate for priority commercial loans',
      'Swiggy & Zomato Partner Onboarding Document Clearance Dossier',
      'Food Safety Management System (FSMS) Standard Operating Procedures',
    ],
    faqs: [
      {
        q: 'Will this satisfy Swiggy and Zomato onboarding requirements?',
        a: 'Yes. Swiggy and Zomato require an active FSSAI FoSCoS license, GSTIN, and municipal premises registration. All three are delivered in this kit.',
      },
      {
        q: 'Is government food license fee included?',
        a: 'The NyayaLink package covers complete CA drafting, kitchen layout review, and liaison. State portal fees (₹100 for basic registration or ₹2,000 for state license) are billed at actuals.',
      },
    ],
  },

  {
    id: 'pkg-ecommerce-seller',
    slug: 'ecommerce-seller-suite',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce & D2C',
    title: 'E-Commerce & Amazon/Flipkart Seller Suite',
    tagline: 'Complete launchpad for D2C brands, marketplace sellers, and cross-border exporters.',
    badge: 'Amazon & Flipkart Ready',
    icon: '🛒',
    targetAudience: 'Amazon, Flipkart, Meesho, Shopify, and Etsy sellers, dropshippers, and direct-to-consumer brands.',
    description: 'Combines multi-state GST registration for marketplace fulfillment centers (FBA/Flipkart nodes), Import Export Code (IEC), MSME perks, and zero-IGST export declarations.',
    standaloneTotal: 11496,
    packagePrice: 5999,
    advanceToken: 999,
    savingsPercent: 47,
    sla: '3 - 7 Working Days',
    includedServices: [
      { slug: 'gst-registration', name: 'GST Registration with HSN / E-Commerce Mapping', standalonePrice: 1499, icon: '🧾' },
      { slug: 'import-export-code-iec', name: 'Import Export Code (IEC) from DGFT Customs Portal', standalonePrice: 1499, icon: '🚢' },
      { slug: 'msme-udyam-registration', name: 'MSME Udyam Certificate', standalonePrice: 999, icon: '🎖️' },
      { slug: 'gst-lut-filing', name: 'GST LUT Filing for 0% Global Export Remittance', standalonePrice: 1499, icon: '✈️' },
    ],
    deliverables: [
      '15-Digit GSTIN configured for online marketplace selling',
      'Lifetime 10-Digit Import Export Code (IEC) integrated with ICEGATE customs',
      'MSME Udyam Certificate enabling ₹4,500 trademark fee waiver',
      'Approved Form GST RFD-11 (Letter of Undertaking) for tax-free global sales',
      'Amazon Seller Central & Flipkart Marketplace Brand Authorization Document',
    ],
    faqs: [
      {
        q: 'Can I sell across India with this GST registration?',
        a: 'Yes. E-commerce sellers registered with a GSTIN can sell to customers nationwide through Amazon, Flipkart, or your own Shopify store.',
      },
      {
        q: 'Do I need the IEC code if I only sell in India initially?',
        a: 'The IEC code is lifetime with no annual renewal cost. Having it pre-configured allows you to source products from overseas suppliers or sell to international buyers anytime without delay.',
      },
    ],
  },

  {
    id: 'pkg-retail-storefront',
    slug: 'retailer-physical-storefront-pack',
    category: 'retail',
    categoryLabel: 'Retail & Storefront',
    title: 'Retailer & Physical Storefront Pack',
    tagline: 'Essential municipal and tax licensing for retail shops, showrooms, and local commercial offices.',
    badge: 'Local Compliance',
    icon: '🏪',
    targetAudience: 'Retail shops, consumer electronics, fashion boutiques, distributors, and physical commercial showrooms.',
    description: 'Establishes full local municipal and state tax legitimacy, preventing municipal labor inspection fines and enabling immediate business current account opening.',
    standaloneTotal: 8496,
    packagePrice: 4499,
    advanceToken: 999,
    savingsPercent: 47,
    sla: '3 - 7 Working Days',
    includedServices: [
      { slug: 'shop-and-establishment-license', name: 'Shop & Establishment (Gumasta License)', standalonePrice: 1999, icon: '🏬' },
      { slug: 'gst-registration', name: 'GST Registration & State Place of Business Filing', standalonePrice: 1499, icon: '🧾' },
      { slug: 'msme-udyam-registration', name: 'MSME Udyam Registration', standalonePrice: 999, icon: '🎖️' },
      { slug: 'business-registration-license', name: 'Sole Proprietorship Documentation Dossier', standalonePrice: 1999, icon: '🏪' },
    ],
    deliverables: [
      'Municipal Shop & Establishment License (State Labor Board)',
      'Official 15-Digit GSTIN Certificate',
      'MSME Udyam Certificate for priority business credit lines',
      'Bank Current Account Opening Resolution Docket',
      'Commercial Premises Signboard / Notice Board Mandatory Compliance Guide',
    ],
    faqs: [
      {
        q: 'How quickly can I open my current bank account?',
        a: 'Once your Shop Act and GSTIN certificates are issued (typically 3–5 working days), banks immediately accept the documents for current account activation.',
      },
    ],
  },

  {
    id: 'pkg-annual-retainer',
    slug: 'annual-corporate-compliance-retainer',
    category: 'compliance',
    categoryLabel: 'Recurring Retainer',
    title: 'Annual 360° Corporate Compliance Retainer',
    tagline: 'Year-round end-to-end statutory defense: GST returns, annual ROC filings, DIR-3 KYC, and cloud bookkeeping.',
    badge: 'Zero Penalty Guarantee',
    icon: '📊',
    targetAudience: 'Private Limited companies, LLPs, and growing enterprises looking to outsource complete secretarial and tax duties.',
    description: 'Eliminates late penalties and departmental scrutiny by assigning a dedicated Chartered Accountant desk to handle every recurring statutory obligation.',
    standaloneTotal: 34988,
    packagePrice: 19999,
    advanceToken: 999,
    savingsPercent: 43,
    sla: 'Year-Round Dedicated CA',
    includedServices: [
      { slug: 'gst-return-filing', name: '12 Months of GST Returns (Monthly GSTR-1 & 3B)', standalonePrice: 11988, icon: '📈' },
      { slug: 'dir-3-kyc-annual', name: 'Annual Director DIR-3 KYC Filings (up to 2 Directors)', standalonePrice: 1998, icon: '🪪' },
      { slug: 'gstr-9-annual-filing', name: 'Annual GSTR-9 Reconciliation Ledger', standalonePrice: 4999, icon: '📅' },
      { slug: 'online-bookkeeping', name: 'Monthly Cloud Bookkeeping & Bank Reconciliation', standalonePrice: 15999, icon: '💻' },
    ],
    deliverables: [
      '12 Months of error-free GSTR-1 and GSTR-3B filings with 2B ITC reconciliation',
      'MCA Annual Return Filings (Form AOC-4 Financial Statements & MGT-7 Annual Return)',
      'Annual DIR-3 KYC electronic renewals for up to 2 active DIN holders',
      'Monthly P&L, balance sheet, and bank reconciliation statements',
      'Quarterly TDS review and Advance Tax liability projection memos',
      'Dedicated CA desk access via WhatsApp and priority phone direct line',
    ],
    faqs: [
      {
        q: 'Can this be paid monthly or annually?',
        a: 'The annual plan of ₹19,999 offers the deepest discount (effective ₹1,666/month). Alternatively, you can book with the ₹999 advance and opt for quarterly installments.',
      },
      {
        q: 'What if we receive a notice from the Income Tax or GST department?',
        a: 'Routine scrutiny notices regarding filings prepared by our team are drafted and answered at zero additional consultation fee under this retainer.',
      },
    ],
  },
];
