export interface ServiceStructure {
  slug: string;
  title: string;
  category: string;
  badge: string;
  whoShouldBuy: string;
  whyShouldBuy: string;
  timeframe: string;
  specificDocs: string[];
  importantConsiderations: string[];
  deliverables: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const STRUCTURED_SERVICES: Record<string, ServiceStructure> = {
  // ==========================================
  // 1. BUSINESS & TECHNOLOGY (9 SERVICES)
  // ==========================================
  'scale-your-business': {
    slug: 'scale-your-business',
    title: 'Scale Your Business (Growth, AI Readiness & Transformation)',
    category: 'business-tech',
    badge: 'Enterprise Transformation',
    whoShouldBuy: 'Traditional businesses, growing SMEs, and enterprise founders looking to modernize operations, eliminate operational bottlenecks, and transition from manual processes to tech-driven systems.',
    whyShouldBuy: 'Establishes a structured digital roadmap, identifies high-ROI automation opportunities, improves team productivity, and prepares legacy infrastructure for scalable AI and cloud integration.',
    timeframe: '2–4 weeks for strategy roadmap & assessment; 2–6 months for phased transformation execution.',
    specificDocs: [
      'Overview of current business workflows, org structure, and standard operating procedures (SOPs)',
      'Existing software inventory, tool stack, and recurring operational pain points',
      'Growth objectives and key performance indicator (KPI) benchmarks',
    ],
    importantConsiderations: [
      'Requires active involvement from department heads for change management and workflow mapping.',
      'Digital transformation is implemented in structured milestones to prevent operational downtime.',
    ],
    deliverables: [
      { title: 'Digital Transformation Roadmap', desc: 'Step-by-step technological modernization blueprint.' },
      { title: 'Workflow Automation Audit & Process Maps', desc: 'Identified efficiency bottlenecks and automation blueprints.' },
      { title: 'Tech Stack & AI Feasibility Architecture', desc: 'Custom tool stack recommendations and ROI projections.' },
    ],
    faqs: [
      { q: 'Will this process disrupt existing daily operations?', a: 'No. Workflows are migrated and modernized in isolated staging milestones with zero impact on live customer operations.' },
    ],
  },

  'ai-solutions': {
    slug: 'ai-solutions',
    title: 'AI Solutions (Agents, Chatbots & Workflow Automation)',
    category: 'business-tech',
    badge: 'Autonomous AI Systems',
    whoShouldBuy: 'Companies seeking 24/7 customer support, automated outbound/inbound calling, automated lead qualification, and hands-free back-office operations.',
    whyShouldBuy: 'Can reduce repetitive support work, capture and qualify leads across channels, and support workflow automation when configured to the agreed scope.',
    timeframe: '1–2 weeks for standard AI chatbots & voice agents; 3–6 weeks for custom multi-agent workflow systems.',
    specificDocs: [
      'Knowledge base documents (FAQs, product catalogs, company policies, training manuals)',
      'API access or webhooks to existing CRM/database systems (e.g., HubSpot, Zoho, Google Sheets)',
      'Telephony provider credentials (for AI Voice Bots) and WhatsApp Business API access',
    ],
    importantConsiderations: [
      'Guardrails and prompt testing are established upfront to eliminate AI hallucinations.',
      'Continuous fine-tuning based on live conversation logs ensures increasing accuracy over time.',
    ],
    deliverables: [
      { title: 'Configured Multi-Channel AI Agent / Chatbot', desc: 'Deployed across WhatsApp, Web, and telephony.' },
      { title: 'CRM & database webhook integration', desc: 'Bidirectional lead sync and ticket creation configured to the agreed scope.' },
      { title: 'Human Escalation & Live Analytics Dashboard', desc: 'Real-time conversation inspection and intervention controls.' },
    ],
    faqs: [
      { q: 'Can the AI voice bot integrate with Indian telephony providers?', a: 'Yes. We support Twilio, Exotel, Tata Tele, and SIP trunking protocols with sub-second latency.' },
    ],
  },

  'software-app-development': {
    slug: 'software-app-development',
    title: 'Software & App Development (Custom CRM, ERP & Apps)',
    category: 'business-tech',
    badge: 'Full-Stack Engineering',
    whoShouldBuy: 'Enterprises and specialized businesses whose unique operational processes outgrow generic off-the-shelf software tools.',
    whyShouldBuy: 'Delivers systems tailored to the agreed business logic, with transparent scope, data-ownership terms, and custom integration planning.',
    timeframe: '4–8 weeks for MVPs / custom CRMs; 8–16 weeks for complex enterprise ERPs and cross-platform mobile apps (iOS & Android).',
    specificDocs: [
      'Detailed Functional Requirement Document (FRD) / Feature List',
      'User role definitions, permission matrix, and reporting hierarchies',
      'UI/UX brand guidelines, wireframe preferences, and third-party API documentation',
    ],
    importantConsiderations: [
      'Development follows Agile sprints with weekly milestone demos and user acceptance testing (UAT).',
      'Includes standard post-launch warranty, code documentation, and IP/source code handover.',
    ],
    deliverables: [
      { title: 'Production-Ready Web / Mobile Application', desc: 'High-performance React/Next.js and Flutter/React Native build.' },
      { title: 'Source Code & IP Handover', desc: 'Direct repository ownership transferred to your GitHub/GitLab account.' },
      { title: 'API Documentation & 60-Day Warranty', desc: 'Complete architectural manuals and post-launch bug support.' },
    ],
    faqs: [
      { q: 'Do we own the intellectual property and source code?', a: 'Yes. Full intellectual property rights, database schemas, and codebase ownership are legally transferred upon final milestone delivery.' },
    ],
  },

  'website-ecommerce': {
    slug: 'website-ecommerce',
    title: 'Website & E-Commerce (Shopify, WooCommerce & Speed)',
    category: 'business-tech',
    badge: 'High-Conversion Architecture',
    whoShouldBuy: 'D2C brands, retailers, B2B companies, and service providers wanting a high-converting, mobile-first web presence or scalable online store.',
    whyShouldBuy: 'Enhances brand authority, maximizes conversion rates, lowers customer bounce rates via sub-2-second load speeds, and provides a seamless checkout experience.',
    timeframe: '5–10 working days for landing pages & business websites; 2–4 weeks for full-scale e-commerce stores.',
    specificDocs: [
      'Brand assets (Logo, brand book, high-resolution product imagery, content copy)',
      'Domain & hosting/cloud server access (or Shopify/WooCommerce store credentials)',
      'Payment gateway (Razorpay, Stripe, Cashfree) and logistics API details',
    ],
    importantConsiderations: [
      'All builds include technical SEO setup, Core Web Vitals optimization, SSL security, and mobile responsiveness.',
      'Regular maintenance retainers are recommended for security patching, plugin updates, and database optimization.',
    ],
    deliverables: [
      { title: 'High-Converting Web / E-Commerce Storefront', desc: 'Mobile-first layout optimized for sub-2-second page loads.' },
      { title: 'Payment Gateway & Shipping Integration', desc: 'Automated COD verification, UPI, and courier API sync.' },
      { title: 'Technical SEO & 90+ PageSpeed Score', desc: 'Structured schema markup and Core Web Vitals optimization.' },
    ],
    faqs: [
      { q: 'Can you migrate our existing store from WooCommerce to Shopify or vice versa?', a: 'Yes. We provide complete zero-downtime catalog, customer, and historic order data migration.' },
    ],
  },

  'cloud-it-infrastructure': {
    slug: 'cloud-it-infrastructure',
    title: 'Cloud & IT Infrastructure (AWS, Azure & M365)',
    category: 'business-tech',
    badge: 'Cloud & Enterprise IT',
    whoShouldBuy: 'Organizations scaling their workforce, migrating from local physical servers to the cloud, or setting up secure enterprise collaboration environments.',
    whyShouldBuy: 'Supports cloud infrastructure planning, remote work, backup design, and operational resilience; availability depends on the selected provider and scope.',
    timeframe: '3–7 working days for Microsoft 365 / Google Workspace migration; 2–4 weeks for full cloud server architecture and database setup.',
    specificDocs: [
      'Domain DNS management access',
      'Current data storage architecture, active user counts, and mailbox migration records',
      'Compliance guidelines and recovery point objective (RPO) / recovery time objective (RTO) targets',
    ],
    importantConsiderations: [
      'Multi-Factor Authentication (MFA) and role-based access control (RBAC) are configured by default.',
      'Data migrations are scheduled during off-peak hours to prevent business disruption.',
    ],
    deliverables: [
      { title: 'Configured Cloud Server Architecture', desc: 'Scalable containerized AWS/Azure/GCP environment with autoscaling.' },
      { title: 'Enterprise Mailbox & Workspace Suite', desc: 'Configured Microsoft 365 / Google Workspace with DKIM/DMARC.' },
      { title: 'Automated Disaster Recovery & Backups', desc: 'Encrypted off-site snapshot schedule with failover triggers.' },
    ],
    faqs: [
      { q: 'How is email deliverability protected during migration?', a: 'We configure verified SPF, DKIM, and DMARC DNS records to ensure zero email delivery downtime and prevent spam flags.' },
    ],
  },

  'cybersecurity-compliance': {
    slug: 'cybersecurity-compliance',
    title: 'Cybersecurity & Compliance (VAPT & Risk Audit)',
    category: 'business-tech',
    badge: 'VAPT & Infosec Audit',
    whoShouldBuy: 'Fintechs, e-commerce platforms, healthcare companies, and businesses handling sensitive customer or financial data.',
    whyShouldBuy: 'Identifies security loopholes before malicious actors exploit them, protects against data breaches and ransomware, and fulfills ISO 27001, SOC 2, and DPDP compliance prerequisites.',
    timeframe: '1–2 weeks for Vulnerability Assessment and Penetration Testing (VAPT); 2–4 weeks for comprehensive compliance auditing.',
    specificDocs: [
      'Target IP addresses, staging URLs, and web/mobile application build access',
      'Written authorization / Letter of Attestation for security testing',
      'Architecture diagrams and existing data security policy manuals',
    ],
    importantConsiderations: [
      'Testing includes both automated vulnerability scans and manual exploit verification.',
      'May include a remediation re-test report after agreed fixes.',
    ],
    deliverables: [
      { title: 'VAPT Security Audit Report', desc: 'Comprehensive OWASP Top 10 penetration findings.' },
      { title: 'Prioritized Vulnerability Patching Matrix', desc: 'Engineering guide with code-level remediation steps.' },
      { title: 'Security assessment summary', desc: 'Assessment summary for stakeholder review; no government clearance is implied.' },
    ],
    faqs: [
      { q: 'Will penetration testing cause our website or API to crash?', a: 'No. Penetration tests are carefully calibrated against staging or production systems with strict rate limiting and non-destructive payloads.' },
    ],
  },

  'data-business-intelligence': {
    slug: 'data-business-intelligence',
    title: 'Data & Business Intelligence (Power BI & KPI Dashboards)',
    category: 'business-tech',
    badge: 'Analytics & Power BI',
    whoShouldBuy: 'Business owners, CFOs, CMOs, and operations managers struggling with fragmented spreadsheets and delayed reporting.',
    whyShouldBuy: 'Consolidates multiple data sources (CRM, ERP, Ads, Accounting) into real-time interactive dashboards, enabling faster, data-driven executive decision-making.',
    timeframe: '1–2 weeks for single-source dashboards; 3–5 weeks for complex multi-source data warehouses and automated ETL pipelines.',
    specificDocs: [
      'Access to raw data sources (SQL databases, Excel sheets, Tally, Zoho, Google Analytics)',
      'Defined business metrics, calculation formulas, and KPI targets',
      'Target user roles and required reporting frequencies',
    ],
    importantConsiderations: [
      'Automated data refresh schedules eliminate manual weekly/monthly report preparation.',
      'Dashboards are built with role-level security to restrict sensitive metrics based on user designations.',
    ],
    deliverables: [
      { title: 'Interactive Power BI / Looker Dashboard', desc: 'Multi-device executive dashboard with dynamic filtering.' },
      { title: 'Automated ETL Data Pipeline', desc: 'Scheduled data ingestion consolidating accounting, CRM, and ad sources.' },
      { title: 'Automated Scheduled PDF Reporting', desc: 'Daily/weekly KPI snapshot digests delivered directly to email/Slack.' },
    ],
    faqs: [
      { q: 'Can Power BI connect directly to Tally Prime or Zoho Books?', a: 'Yes. We build automated data connectors that extract ledger entries, P&L, and balance sheet data directly into interactive BI reports.' },
    ],
  },

  'digital-marketing-growth': {
    slug: 'digital-marketing-growth',
    title: 'Digital Marketing & Growth (SEO, Ads & Funnels)',
    category: 'business-tech',
    badge: 'Performance Marketing',
    whoShouldBuy: 'Businesses looking to generate qualified inbound leads, scale customer acquisition, lower Cost Per Acquisition (CPA), and dominate search engine rankings.',
    whyShouldBuy: 'Drives consistent, measurable organic and paid customer traffic, improves return on ad spend (ROAS), and builds long-term brand equity.',
    timeframe: '3–7 days for paid ad campaign launches; 3–6 months for significant organic SEO ranking improvements.',
    specificDocs: [
      'Ad account access (Google Ads Manager, Meta Business Suite)',
      'Website backend and Google Analytics 4 (GA4) / Google Tag Manager access',
      'Defined monthly advertising budget, target demographics, and product/service USPs',
    ],
    importantConsiderations: [
      'Server-side tracking and Conversion API (CAPI) are configured to ensure accurate attribution against iOS privacy constraints.',
      'Bi-weekly performance optimization cycles are standard to refine keyword bidding and ad creative performance.',
    ],
    deliverables: [
      { title: 'Full-Funnel Paid Advertising Setup', desc: 'Google Search/Performance Max and Meta Conversion campaigns.' },
      { title: 'Server-Side GA4 & Meta CAPI Tracking', desc: 'Event tracking and conversion attribution setup, subject to platform and implementation checks.' },
      { title: 'Technical & Organic SEO Roadmap', desc: 'Keyword cluster strategy, backlink architecture, and on-page optimization.' },
    ],
    faqs: [
      { q: 'What ad spend budget is recommended to start?', a: 'We typically recommend a minimum ad budget of ₹30,000 to ₹1,00,000/month depending on industry CPCs to gather statistically significant conversion data.' },
    ],
  },

  'branding-creative-studio': {
    slug: 'branding-creative-studio',
    title: 'Branding & Creative Studio (Identity, UI/UX & Video)',
    category: 'business-tech',
    badge: 'Creative Direction',
    whoShouldBuy: 'New ventures launching in crowded markets or established companies undergoing rebranding and digital asset overhauls.',
    whyShouldBuy: 'Creates a cohesive visual identity across all customer touchpoints, elevates perceived market value, and improves digital ad click-through rates (CTR) with high-impact visual creative assets.',
    timeframe: '1–2 weeks for brand identity kits and marketing collateral; 2–4 weeks for full UI/UX design systems and product video production.',
    specificDocs: [
      'Brand brief outlining business values, tone of voice, and competitor benchmarks',
      'Product samples, design specifications, or wireframe requirements',
      'Preferred media formats and dimension specifications (for digital, print, or social ad campaigns)',
    ],
    importantConsiderations: [
      'Delivers complete design systems including vector source files, typography guides, and commercial licensing rights.',
      'All digital design deliverables are optimized specifically for web loading speeds and ad platform compliance.',
    ],
    deliverables: [
      { title: 'Comprehensive Brand Identity System', desc: 'Primary & secondary logos, color palette, and typography hierarchy.' },
      { title: 'Vector & Print Ready Master Files', desc: 'Figma master boards, AI, EPS, SVG, and high-res asset packages.' },
      { title: 'High-CTR Performance Ad Creative Pack', desc: 'Static banners, carousel sets, and dynamic video assets.' },
    ],
    faqs: [
      { q: 'Do you provide full design source files in Figma or Illustrator?', a: 'Yes. All raw master design files with full commercial copyright ownership are transferred upon project completion.' },
    ],
  },

  // ==========================================
  // 2. COMPANY & ENTITY REGISTRATION
  // ==========================================
  'private-limited-company': {
    slug: 'private-limited-company',
    title: 'Private Limited Company (Pvt Ltd)',
    category: 'company-reg',
    badge: 'MCA SPICe+ Filing Support',
    whoShouldBuy: 'Startups, tech founders, e-commerce platforms, and growing businesses planning to raise angel or venture capital.',
    whyShouldBuy: 'Offers a strong separate legal identity, limits personal financial liability, makes issuing equity and ESOPs straightforward, and holds high credibility with banks and investors.',
    timeframe: '7–10 working days',
    specificDocs: [
      'PAN card (mandatory for Indian directors/shareholders) or Passport (for foreign nationals)',
      'Identity proof: Aadhaar card, Voter ID, or Driving License',
      'Address proof: Bank statement or utility bill (< 2 months old)',
      'Registered office proof: Electricity/gas bill, rent agreement, and property owner\'s NOC',
      'Passport-size photos and Class-3 DSC for all directors',
    ],
    importantConsiderations: [
      'Minimum 2 directors and 2 shareholders (up to a maximum of 200).',
      'Requires mandatory annual statutory audits regardless of turnover.',
      'Must file Form INC-20A (Commencement of Business) within 180 days of incorporation.',
    ],
    deliverables: [
      { title: 'Certificate of Incorporation (COI)', desc: 'Official MCA registration certificate with 21-digit CIN.' },
      { title: '2x Director Identification Numbers (DIN)', desc: 'Permanent DIN allotment for active founding directors.' },
      { title: '2x Class 3 Digital Signatures (DSC)', desc: '2-year cryptographic signing tokens with USB hardware key.' },
      { title: 'Company PAN & TAN Cards', desc: 'Permanent Account Number & Tax Deduction Account Number letters.' },
      { title: 'Customized e-MOA & e-AOA', desc: 'Legally drafted Memorandum & Articles of Association.' },
      { title: 'EPFO, ESIC & Bank Account', desc: 'Statutory labor welfare numbers and pre-approved current account letter.' },
    ],
    faqs: [
      { q: 'Do I need to visit the ROC office in person?', a: 'Most steps are handled online through the MCA portal and electronic signatures; specific cases may still require additional verification or attendance.' },
      { q: 'Can a residential address be used as the registered office?', a: 'Yes. A residential home or rented apartment can be used with a recent utility bill (< 60 days) and signed Landlord NOC.' },
      { q: 'What is the minimum capital required to start?', a: 'There is no minimum paid-up capital requirement under the Companies Act 2013. You can start with ₹1,00,000 authorized capital.' },
    ],
  },
  'llp-registration': {
    slug: 'llp-registration',
    title: 'Limited Liability Partnership (LLP)',
    category: 'company-reg',
    badge: 'Low Compliance Choice',
    whoShouldBuy: 'Professional services, consultancies, agencies, family-run firms, and trading ventures where outside equity funding is not required.',
    whyShouldBuy: 'Combines the limited liability protection of a corporation with the internal operational flexibility of a partnership. Lower annual compliance burden and fewer statutory filing complexities.',
    timeframe: '10–14 working days',
    specificDocs: [
      'PAN card and ID proof (Aadhaar/Passport/Voter ID) of all designated partners',
      'Address proof of all partners (Bank statement/utility bill < 2 months old)',
      'Registered office proof: Rent agreement, utility bill, and NOC',
      'Class-3 DSC for designated partners',
      'Drafted LLP Agreement detailing profit-sharing ratios and partner rights',
    ],
    importantConsiderations: [
      'Minimum 2 designated partners (at least one must be a resident of India).',
      'No requirement for a statutory audit unless annual turnover exceeds ₹40 Lakhs or capital contribution exceeds ₹25 Lakhs.',
      'LLP Agreement must be filed via Form 3 within 30 days of registration.',
    ],
    deliverables: [
      { title: 'LLP Incorporation Certificate', desc: 'Official MCA certificate with unique LLPIN code.' },
      { title: 'Designated Partner Identification (DPIN)', desc: 'Valid DPIN numbers for all registered partners.' },
      { title: 'Class 3 Digital Signatures', desc: 'Cryptographic digital signature tokens for signing filings.' },
      { title: 'LLP PAN & TAN Allotment', desc: 'Direct entity tax numbers from Income Tax Department.' },
      { title: 'Drafted LLP Agreement & Form 3 Filing', desc: 'Customized partnership covenants legally executed with ROC.' },
    ],
    faqs: [
      { q: 'Can an LLP raise venture capital funding?', a: 'No. Venture capitalists and angel investors rarely invest in LLPs because equity shares and ESOPs cannot be issued.' },
      { q: 'What is Form 3 in LLP?', a: 'Form 3 is the statutory return used to file the signed LLP agreement with the Registrar within 30 days of registration.' },
    ],
  },
  'one-person-company': {
    slug: 'one-person-company',
    title: 'One Person Company (OPC)',
    category: 'company-reg',
    badge: 'Sole Founder Entity',
    whoShouldBuy: 'Solo entrepreneurs, freelance professionals, consultants, and individual business owners wanting a corporate structure without bringing on co-founders.',
    whyShouldBuy: 'Provides single-member ownership with limited liability protection, subject to OPC eligibility and compliance requirements.',
    timeframe: '7–10 working days',
    specificDocs: [
      'PAN card, photo, and ID proof (Aadhaar/Passport/Voter ID) of the sole member',
      'Address proof of the member (Bank statement/utility bill < 2 months old)',
      'Identity and address proof of the Nominee Director',
      'Written consent form (Form INC-3) signed by the Nominee',
      'Registered office proof (Utility bill, rent agreement, and NOC)',
      'Class-3 DSC for the director',
    ],
    importantConsiderations: [
      'Only 1 shareholder allowed, but must designate 1 nominee in case of death or incapacity.',
      'Nominee and director must both be natural persons and Indian citizens.',
      'Can convert voluntarily to a Private Limited Company at any point.',
    ],
    deliverables: [
      { title: 'OPC Certificate of Incorporation', desc: 'Ministry of Corporate Affairs incorporation certificate with CIN.' },
      { title: '1x Director DIN & 1x Class 3 DSC', desc: 'Director identification number and encrypted signing token.' },
      { title: 'Entity PAN & TAN', desc: 'Income tax numbers issued under CBDT integration.' },
      { title: 'e-MOA, e-AOA & INC-3 Nominee Form', desc: 'Complete company bylaws with registered nominee documentation.' },
    ],
    faqs: [
      { q: 'Can a person form more than one OPC?', a: 'No. An individual is eligible to incorporate only one OPC and become a nominee in only one OPC.' },
      { q: 'Does an OPC require board meetings?', a: 'An OPC with a single director is exempt from holding annual general meetings and board meetings.' },
    ],
  },
  'public-limited-company': {
    slug: 'public-limited-company',
    title: 'Public Limited Company',
    category: 'company-reg',
    badge: 'Institutional Scale',
    whoShouldBuy: 'Large-scale commercial enterprises, mature companies planning an Initial Public Offering (IPO), or ventures requiring extensive capital from institutional and public investors.',
    whyShouldBuy: 'Ability to raise substantial capital directly from the public, issue freely transferable shares, and maintain high market prestige.',
    timeframe: '15–20 working days',
    specificDocs: [
      'PAN cards, ID proofs, and photos for at least 3 directors and 7 shareholders',
      'Address proofs for all directors and shareholders (< 2 months old)',
      'Registered office address proof (Utility bill, property tax receipt, NOC, rent agreement)',
      'Class-3 DSC for all proposed directors',
      'Detailed Memorandum of Association (MOA) and Articles of Association (AOA)',
    ],
    importantConsiderations: [
      'Minimum 7 shareholders and minimum 3 directors (no upper limit on shareholders).',
      'Strict regulatory oversight, mandatory board committees, quarterly/annual disclosures, and higher ongoing compliance costs.',
    ],
    deliverables: [
      { title: 'Certificate of Incorporation (Public Ltd)', desc: 'Official MCA certificate designating public limited corporate status.' },
      { title: '3x Director DINs & 3x Class 3 DSCs', desc: 'Director credentials and signing tokens for governance board.' },
      { title: 'Corporate PAN & TAN Letters', desc: 'Statutory tax registration identifiers.' },
      { title: 'Specialized MOA / AOA with Capital Clauses', desc: 'Bylaws drafted to permit public capital raising and share transfers.' },
    ],
    faqs: [
      { q: 'What is the minimum number of members for a Public Limited Company?', a: 'A Public Limited Company requires at least 7 shareholders and 3 directors with no upper limit on the number of members.' },
    ],
  },
  'section-8-company': {
    slug: 'section-8-company',
    title: 'Section 8 Company (NGO / Non-Profit)',
    category: 'company-reg',
    badge: 'Non-Profit Corporate',
    whoShouldBuy: 'Non-governmental organizations (NGOs), charitable foundations, educational/arts initiatives, and non-profit research associations.',
    whyShouldBuy: 'Recognized corporate identity for non-profit work, access to government grants, eligibility for 12A/80G tax exemptions for donors, and no requirement for minimum paid-up capital.',
    timeframe: '15–25 working days',
    specificDocs: [
      'PAN, photo, and ID/address proofs of all proposed directors/promoters',
      'Registered office proof (Utility bill, rent agreement, NOC)',
      'Statement of work/project plan outlining charitable objects for the next 3 years',
      'Projected annual income and expenditure budget',
      'Central Government / ROC approval application (Form SPICe+ with Section 8 license attachment)',
    ],
    importantConsiderations: [
      'Minimum 2 directors and 2 members.',
      'Profits and income must be strictly applied towards promoting charitable objectives; dividend distribution to members is legally prohibited.',
    ],
    deliverables: [
      { title: 'Section 8 Incorporation License', desc: 'Central Government approval license issued under Section 8(1).' },
      { title: 'Certificate of Incorporation', desc: 'Formal non-profit corporate registration certificate.' },
      { title: '2x DINs & 2x Class 3 DSCs', desc: 'Promoter identification and digital authentication keys.' },
      { title: 'Charitable Object MOA / AOA', desc: 'Bylaws structured for non-profit status and 12A/80G eligibility.' },
    ],
    faqs: [
      { q: 'Can promoters take a salary from a Section 8 Company?', a: 'Promoters cannot draw profit dividends, but directors and full-time executives can draw reasonable remuneration for actual professional services rendered.' },
    ],
  },
  'business-registration-license': {
    slug: 'business-registration-license',
    title: 'Business Registration License (Proprietorship)',
    category: 'company-reg',
    badge: 'Proprietorship Setup',
    whoShouldBuy: 'Local retail shops, micro-traders, freelance service providers, and local proprietors operating under a sole proprietorship.',
    whyShouldBuy: 'Provides the minimum legal authority to conduct commercial activity locally, comply with local municipal labor laws, and open a dedicated current bank account quickly.',
    timeframe: '3–7 working days',
    specificDocs: [
      'PAN card and Aadhaar card of the proprietor',
      'Passport-size photograph',
      'Proof of commercial address (Shop rent agreement, electricity bill, municipal tax receipt)',
      'Cancelled cheque or active bank statement of the proprietor',
    ],
    importantConsiderations: [
      'Does not create a separate legal entity; owner retains unlimited personal financial liability.',
      'Licenses are region-specific (e.g., Shop & Establishment Act is governed by respective state/municipal rules).',
    ],
    deliverables: [
      { title: 'Udyam / MSME Registration Certificate', desc: 'Ministry of MSME official certificate with lifetime validity.' },
      { title: 'Shop & Establishment / Gumasta License', desc: 'Municipal labor license enabling physical commercial operation.' },
      { title: 'Bank Current Account Resolution Letter', desc: 'Document pack required by commercial banks for account opening.' },
    ],
    faqs: [
      { q: 'Is a sole proprietorship registered under the Companies Act?', a: 'No. Proprietorships are recognized through tax and municipal licenses (Udyam, GST, Shop Act) rather than central ROC incorporation.' },
    ],
  },
  'nidhi-company-registration': {
    slug: 'nidhi-company-registration',
    title: 'Nidhi Company Registration',
    category: 'company-reg',
    badge: 'Micro-Finance & Thrift',
    whoShouldBuy: 'Community groups, localized financial networks, and organizers running mutual-benefit savings, micro-thrift, and member-lending programs.',
    whyShouldBuy: 'Allows taking deposits and lending money directly to registered members without having to obtain a full Non-Banking Financial Company (NBFC) license from the RBI.',
    timeframe: '15–20 working days',
    specificDocs: [
      'PAN cards, ID proofs, photos, and address proofs of at least 3 directors and 7 promoters',
      'Registered office address proof (Utility bill, rent agreement, NOC)',
      'Class-3 DSC for directors',
      'Drafted MOA/AOA clearly stating mutual benefit and thrift objectives',
    ],
    importantConsiderations: [
      'Minimum 7 members and 3 directors required at incorporation.',
      'Must reach at least 200 members and maintain minimum net owned funds of ₹10 Lakhs within one year of incorporation.',
      'Can only accept deposits from and lend to its own verified members (no business with the general public).',
    ],
    deliverables: [
      { title: 'Nidhi Company Incorporation Certificate', desc: 'ROC approved certificate with mutual-benefit charter.' },
      { title: '3x Director DINs & 3x Class 3 DSCs', desc: 'Board authorization and digital signature credentials.' },
      { title: 'Statutory MOA / AOA (Nidhi Rules 2014)', desc: 'Specialized bylaws governing deposit acceptance and lending limits.' },
      { title: 'Form NDH-4 Compliance Package', desc: 'Application framework for declaring Nidhi status with central government.' },
    ],
    faqs: [
      { q: 'Can a Nidhi company open branches outside its home district?', a: 'A Nidhi company can open up to 3 branches within the district only after earning net profits continuously for the preceding 3 financial years.' },
    ],
  },
  'indian-subsidiary-registration': {
    slug: 'indian-subsidiary-registration',
    title: 'Indian Subsidiary Registration (FDI)',
    category: 'company-reg',
    badge: 'FDI & Foreign Entity',
    whoShouldBuy: 'Foreign enterprises, multinational corporations (MNCs), and overseas startups looking to establish an operational subsidiary or branch in India.',
    whyShouldBuy: 'Supports Indian subsidiary and FDI documentation; ownership, route, and approvals depend on the sector and current rules.',
    timeframe: '15–25 working days',
    specificDocs: [
      'Certificate of Incorporation and charter documents of the foreign parent company',
      'Board Resolution from parent company authorizing investment and appointing authorized representative in India',
      'PAN/Passport and ID/address proofs of all proposed Indian and foreign directors',
      'Apostille/Consular Notarization: All foreign documents and overseas ID proofs must be apostilled or attested by the Indian Embassy in the parent country',
      'Registered office proof in India (Utility bill, rent agreement, NOC)',
    ],
    importantConsiderations: [
      'At least one director must be a resident of India (stayed 182+ days in India during the financial year).',
      'Requires compliance with RBI guidelines and FDI reporting (FC-GPR filing via the FIRMS portal) within 30 days of receiving foreign inward remittance.',
    ],
    deliverables: [
      { title: 'Certificate of Incorporation (FDI Entity)', desc: 'Indian subsidiary registration certificate with CIN.' },
      { title: 'Foreign & Resident Director DINs & DSCs', desc: 'Digital signatures and director identification documents, where required.' },
      { title: 'Company PAN, TAN & Foreign Bank Pack', desc: 'Statutory tax registrations and capital inflow banking documentation.' },
      { title: 'RBI FC-GPR Filing Advisory', desc: 'Step-by-step reporting framework for inward remittance compliance.' },
    ],
    faqs: [
      { q: 'Is 100% foreign ownership allowed in Indian subsidiaries?', a: 'It may be available in some sectors under the automatic route, but ownership limits and approvals must be checked for the specific activity and current rules.' },
      { q: 'What is document apostilling?', a: 'Apostilling is international document legalization under the Hague Convention, verifying that foreign company records are genuine before Indian authorities.' },
    ],
  },

  // ==========================================
  // 3. TAX & ACCOUNTING SERVICES
  // ==========================================
  'gst-registration': {
    slug: 'gst-registration',
    title: 'GST Registration',
    category: 'tax-accounting',
    badge: '15-Digit GSTIN Allotment',
    whoShouldBuy: 'Any business selling goods (turnover > ₹40 Lakhs / ₹20 Lakhs in special states) or providing services (turnover > ₹20 Lakhs / ₹10 Lakhs in special states), e-commerce sellers, inter-state traders, and voluntary applicants.',
    whyShouldBuy: 'Mandatory legal requirement to collect tax, claim Input Tax Credit (ITC), sell on e-commerce marketplaces, and conduct inter-state B2B transactions.',
    timeframe: '3–7 working days (with Aadhaar authentication); 15–30 days if physical verification or site inspection is triggered.',
    specificDocs: [
      'PAN and Aadhaar cards of the proprietor/partners/directors',
      'Passport-size photographs of authorized signatories',
      'Business address proof (Electricity bill, property tax receipt, rent agreement, and owner\'s NOC)',
      'Bank proof (Cancelled cheque, first page of passbook, or bank statement)',
      'Certificate of Incorporation / Partnership Deed / LLP Agreement (for non-proprietorships)',
      'Board resolution / Letter of authorization for authorized signatory',
    ],
    importantConsiderations: [
      'Aadhaar OTP-based authentication speeds up approval significantly without physical inspection.',
      'E-commerce sellers and inter-state suppliers must register regardless of turnover thresholds.',
    ],
    deliverables: [
      { title: '15-Digit Active GSTIN', desc: 'State-specific Goods and Services Tax Identification Number.' },
      { title: 'Form GST REG-06 Certificate', desc: 'Official certificate of registration with verifiable QR code.' },
      { title: 'HSN & SAC Code Configuration', desc: 'Tariff classification mapping for products and services.' },
      { title: 'GST Portal Login Credentials', desc: 'Direct access to file monthly and annual returns.' },
    ],
    faqs: [
      { q: 'Is GST registration mandatory for selling on Amazon or Flipkart?', a: 'Yes. E-commerce marketplace sellers must hold an active GSTIN regardless of their annual revenue.' },
    ],
  },
  'gst-return-filing': {
    slug: 'gst-return-filing',
    title: 'GST Return Filing (GSTR-1 & GSTR-3B / CMP-08)',
    category: 'tax-accounting',
    badge: 'Monthly / Quarterly Compliance',
    whoShouldBuy: 'All regular and composition taxpayers registered under GST with active business transactions.',
    whyShouldBuy: 'Avoids severe daily late fees (up to ₹50/day), 18% annual interest on outstanding tax liabilities, suspension of GSTIN, blocking of E-Way Bills, and allows buyers to claim ITC smoothly via GSTR-2B matching.',
    timeframe: 'Filed monthly/quarterly according to statutory deadlines: GSTR-1 (11th monthly / 13th QRMP), GSTR-3B (20th monthly / 22nd–24th QRMP), CMP-08 (18th quarterly).',
    specificDocs: [
      'Sales invoices and credit/debit notes for the period',
      'Purchase invoices and expenses records (to reconcile ITC with GSTR-2B)',
      'Bank statements and GST portal login credentials',
    ],
    importantConsiderations: [
      'ITC cannot be claimed on GSTR-3B unless invoices reflect in the auto-populated GSTR-2B.',
      'Late filing of GSTR-3B blocks subsequent filings and leads to automatic debiting of late fees in subsequent returns.',
    ],
    deliverables: [
      { title: 'GSTR-1 Outward Supplies Filing ARN', desc: 'Official filing acknowledgment reference number.' },
      { title: 'GSTR-3B Monthly Tax Return Receipt', desc: 'Reconciled summary return with tax payment challans.' },
      { title: 'GSTR-2B vs Purchase ITC Reconciliation Sheet', desc: 'Matched ledger preventing ineligible ITC claims.' },
    ],
    faqs: [
      { q: 'What happens if my vendor does not upload their sales invoice?', a: 'If the supplier fails to file GSTR-1, the invoice will not appear in your GSTR-2B, and ITC cannot be claimed under Section 16(2)(aa).' },
    ],
  },
  'gst-nil-return-filing': {
    slug: 'gst-nil-return-filing',
    title: 'GST Nil Return Filing',
    category: 'tax-accounting',
    badge: 'Zero-Transaction Protection',
    whoShouldBuy: 'GST-registered businesses with zero sales, zero purchases, and zero tax liability during a given tax period.',
    whyShouldBuy: 'GST filings remain legally mandatory even with zero commercial activity. Filing Nil returns prevents automatic cancellation of GST registration and accumulates zero late fees.',
    timeframe: 'Filing support through the GST portal; authority processing time may vary.',
    specificDocs: [
      'GST portal login credentials or registered mobile number for SMS OTP filing',
      'Confirmation of zero outward/inward taxable transactions during the filing period',
    ],
    importantConsiderations: [
      'Can be filed via a simple SMS from the registered mobile number (using the format: NIL <Return Type> <GSTIN> <Tax Period>).',
      'Neglecting Nil returns will incur standard late fees (₹20/day) until filed.',
    ],
    deliverables: [
      { title: 'Nil filing acknowledgment', desc: 'Filing acknowledgment, if issued by the GST portal.' },
      { title: 'Filing status note', desc: 'A filing record does not guarantee that GST registration remains active.' },
    ],
    faqs: [
      { q: 'Can I file Nil GST returns via SMS?', a: 'Yes. If you have no outward supplies, no inward supplies liable to reverse charge, and no tax credit claims, you can file via 14409.' },
    ],
  },
  'gst-modification': {
    slug: 'gst-modification',
    title: 'GST Modification / Amendment',
    category: 'tax-accounting',
    badge: 'Core & Non-Core Updates',
    whoShouldBuy: 'Registered taxpayers changing business details such as business name, principal/additional place of business, authorized signatories, partners/directors, or bank accounts.',
    whyShouldBuy: 'Keeps government records legally compliant and avoids penalties or departmental notices for unauthorized business premise changes.',
    timeframe: '1–2 working days for Non-Core fields; 7–15 working days for Core fields (subject to tax officer approval).',
    specificDocs: [
      'For Address Change: New electricity bill, rent agreement, and NOC',
      'For Director/Partner Change: PAN, Aadhaar, photo, and Board Resolution / Resignation letter',
      'For Bank Account Change: Updated bank passbook/cancelled cheque with account details',
      'Class-3 DSC or authorized signatory OTP',
    ],
    importantConsiderations: [
      'Amendments are categorized into Core fields (Business name, principal place of business, partners/directors) which require officer approval, and Non-Core fields (bank accounts, contact details) which update after system processing and validation.',
    ],
    deliverables: [
      { title: 'Form GST REG-14 Amendment Filing Receipt', desc: 'Statutory submission receipt for modified parameters.' },
      { title: 'Updated Form GST REG-06 Certificate', desc: 'Fresh registration certificate reflecting new business details.' },
    ],
    faqs: [
      { q: 'What is the difference between Core and Non-Core amendment?', a: 'Core amendments (legal name, address, directors) require jurisdictional tax officer verification. Non-Core amendments (email, mobile, bank) are auto-approved.' },
    ],
  },
  'gstr-9-annual-filing': {
    slug: 'gstr-9-annual-filing',
    title: 'GSTR-9 Annual Return & GSTR-9C Reconciliation',
    category: 'tax-accounting',
    badge: 'Financial Year Consolidation',
    whoShouldBuy: 'Regular taxpayers registered under GST. Mandatory for businesses with annual aggregate turnover exceeding ₹2 Crores (GSTR-9) and exceeding ₹5 Crores (GSTR-9C self-certified reconciliation).',
    whyShouldBuy: 'Final legal consolidation of all monthly/quarterly filings for the entire financial year, enabling reconciliation of tax discrepancies and preventing audit scrutiny or departmental demand notices.',
    timeframe: 'Annual filing due by December 31st following the end of the financial year.',
    specificDocs: [
      'Audited annual financial statements (Balance Sheet & Profit & Loss account)',
      'Consolidated GSTR-1, GSTR-3B, and GSTR-2B reports',
      'Input Tax Credit (ITC) reconciliation ledger',
      'Monthly tax payment challans and purchase/sales registers',
    ],
    importantConsiderations: [
      'Standard late fee is ₹200/day (subject to turnover-based statutory caps).',
      'Unclaimed ITC for the preceding financial year cannot be claimed via GSTR-9; it must be claimed in regular returns within the October deadline following the year-end.',
    ],
    deliverables: [
      { title: 'GSTR-9 Official Annual Filing Receipt', desc: 'Consolidated statutory filing record filed on GSTN.' },
      { title: 'GSTR-9C Reconciliation Report', desc: 'Self-certified financial reconciliation statement.' },
      { title: 'DRC-03 Tax Differential Settlement Challan', desc: 'Settlement receipt for any unadjusted tax differences.' },
    ],
    faqs: [
      { q: 'Can GSTR-9 be revised after submission?', a: 'No. GSTR-9 cannot be revised once filed. All reconciliations must be rigorously audited prior to submission.' },
    ],
  },
  'gst-lut-filing': {
    slug: 'gst-lut-filing',
    title: 'GST Letter of Undertaking (LUT) Filing',
    category: 'tax-accounting',
    badge: '0% IGST Export Benefit',
    whoShouldBuy: 'Exporters of goods and services, IT/software service providers billing foreign clients, and suppliers to Special Economic Zone (SEZ) units.',
    whyShouldBuy: 'Allows exporting goods and services at 0% IGST (Zero-Rated Supply) without paying upfront Integrated GST and locking up working capital in long refund cycles.',
    timeframe: '24–48 hours (Form GST RFD-11 online on the GST portal).',
    specificDocs: [
      'Active GSTIN and GST portal credentials',
      'Import Export Code (IEC), if applicable',
      'Details and identification information of 2 independent witnesses',
      'Class-3 DSC or authorized signatory OTP',
    ],
    importantConsiderations: [
      'Validity: Valid for one financial year only (April 1 to March 31) and must be freshly re-filed every year before initiating exports for the new financial year.',
      'Requires realization of export proceeds in foreign convertible currency within the prescribed RBI timeframe (typically within 1 year for services).',
    ],
    deliverables: [
      { title: 'Form GST RFD-11 Official LUT Acknowledgment', desc: 'Annual zero-tax export authorization letter.' },
      { title: 'Zero-Rated Invoicing Format Guidelines', desc: 'Statutory declaration text mandatory on export invoices.' },
    ],
    faqs: [
      { q: 'How long is a GST LUT valid?', a: 'An LUT is valid for one financial year (April 1st to March 31st) and must be renewed annually.' },
    ],
  },
  'gst-eway-bill-generation': {
    slug: 'gst-eway-bill-generation',
    title: 'GST E-Way Bill Generation & Portal Setup',
    category: 'tax-accounting',
    badge: 'Consignment Transit Pass',
    whoShouldBuy: 'Manufacturers, traders, logistics companies, and e-commerce businesses moving physical consignments of goods.',
    whyShouldBuy: 'Mandatory electronic documentation required before transporting goods worth more than ₹50,000 (inter-state or intra-state, subject to state-specific rules). Prevents interception, vehicle seizure, and 200% penalty on tax value.',
    timeframe: 'E-way bill portal generation support after required details are validated.',
    specificDocs: [
      'Tax Invoice, Bill of Supply, or Delivery Challan',
      'Transporter ID, Transporter Name, and Vehicle Number (for road transport)',
      'Railway Receipt (RR) / Airway Bill (AWB) / Bill of Lading (for rail, air, or ship transport)',
      'PIN-to-PIN distance calculation',
    ],
    importantConsiderations: [
      'Validity depends on travel distance (typically 1 day for every 200 km for regular cargo; 1 day for every 20 km for Over Dimensional Cargo).',
      'Generated in two parts: Part-A (consignment details) and Part-B (vehicle/transporter tracking details).',
    ],
    deliverables: [
      { title: '12-Digit E-Way Bill Number (EBN)', desc: 'Official transit QR document for drivers/transporters.' },
      { title: 'E-Way Bill System Multi-User Setup', desc: 'Sub-user allocation for warehouse and logistics dispatch.' },
    ],
    faqs: [
      { q: 'When is an E-Way Bill mandatory?', a: 'Mandatory whenever goods worth over ₹50,000 are moved in a vehicle for supply, job work, or sales return.' },
    ],
  },
  'tds-return-filing': {
    slug: 'tds-return-filing',
    title: 'TDS Return Filing (Form 24Q, 26Q, 27Q, 27EQ)',
    category: 'tax-accounting',
    badge: 'Quarterly Tax Compliance',
    whoShouldBuy: 'Any corporate or individual entity possessing a TAN (Tax Deduction and Collection Account Number) that deducts Tax at Source while making specified payments (salaries, contractor fees, rent, professional fees, commission, overseas remittances).',
    whyShouldBuy: 'Strict compliance requirement under the Income Tax Act. Prevents late filing fees of ₹200/day under Section 234E, interest on late deduction/deposit, disallowance of business expenses under Section 40(a)(ia), and generates Form 16/16A for payees.',
    timeframe: 'Quarterly deadlines: Q1 (Jul 31), Q2 (Oct 31), Q3 (Jan 31), Q4 (May 31).',
    specificDocs: [
      'Active TAN and Income Tax e-filing portal credentials',
      'Monthly TDS payment challans (ITNS 281)',
      'Deductee details: PAN, deductee name, payment amount, TDS deduction rate, section code (e.g., 194C, 194J, 194I, 192)',
    ],
    importantConsiderations: [
      'Quoting invalid or inoperative PANs results in mandatory deduction at the higher penalty rate of 20% under Section 206AA.',
      'Form 16 (for salary) and Form 16A (non-salary) must be downloaded from the TRACES portal and issued within 15 days of return filing.',
    ],
    deliverables: [
      { title: 'Quarterly Form 24Q / 26Q Filing Ack', desc: 'Official NSDL-TIN receipt acknowledging return submission.' },
      { title: 'Form 16 / 16A TDS Certificates Generation', desc: 'Digitally signed TRACES certificates for employees and contractors.' },
    ],
    faqs: [
      { q: 'What is the late fee for delay in filing TDS returns?', a: 'Section 234E levies a late fee of ₹200 per day for every day of delay until the return is filed, capped at the total TDS deducted.' },
    ],
  },
  'income-tax-return-itr': {
    slug: 'income-tax-return-itr',
    title: 'Income Tax Return (ITR) Filing',
    category: 'tax-accounting',
    badge: 'CA Supervised Direct Tax',
    whoShouldBuy: 'Salaried individuals, consultants, freelance professionals, business owners, capital gains traders, and corporate entities looking to claim tax refunds and remain compliant.',
    whyShouldBuy: 'Validates legal income for bank loans and visas, carries forward business and capital losses, avoids penalty under Section 234F, and ensures optimal tax saving under Old vs New regime.',
    timeframe: '24–48 hours upon document compilation.',
    specificDocs: [
      'Form 16 / Form 16A TDS certificates',
      '12-month complete bank account statements',
      'Annual Information Statement (AIS) and Tax Information Summary (TIS)',
      'Capital gains transaction ledgers (stocks, mutual funds, crypto, property)',
    ],
    importantConsiderations: [
      'July 31st is the statutory deadline for individual non-audit returns.',
      'Under the New Tax Regime, total income up to ₹7 Lakhs is eligible for full rebate under Section 87A.',
    ],
    deliverables: [
      { title: 'ITR-V Formal E-Filing Acknowledgment', desc: 'Official Income Tax Department confirmation receipt.' },
      { title: 'Tax Computation Sheet & P&L', desc: 'CA validated tax calculation and deductions breakdown.' },
    ],
    faqs: [
      { q: 'Can I file ITR if my income is below taxable limits?', a: 'Yes. Nil ITR is highly recommended for visa applications, credit cards, and carrying forward losses.' },
    ],
  },
  'pf-esic-registration': {
    slug: 'pf-esic-registration',
    title: 'PF & ESIC Registration',
    category: 'tax-accounting',
    badge: 'Shram Suvidha Labor Code',
    whoShouldBuy: 'EPF: Mandatory for establishments employing 20 or more persons (voluntary registration available for smaller teams). ESIC: Mandatory for non-seasonal factories and establishments employing 10 or more persons (with employees earning monthly gross wages up to ₹21,000).',
    whyShouldBuy: 'Fulfills statutory labor law mandates, provides healthcare and social security safety nets to workers, improves employee retention, and avoids heavy labor department penalties and audits.',
    timeframe: '3–5 working days via the Shram Suvidha portal.',
    specificDocs: [
      'Company PAN, Certificate of Incorporation, Partnership Deed, or Business License',
      'Address proof of the establishment (Rent agreement, electricity bill, NOC)',
      'Identity and address proofs of directors/partners/proprietor',
      'Digital Signature Certificate (DSC) of the authorized signatory',
      'List of all employees with date of joining, identity proof, bank details, and wage breakdown',
      'Cancelled cheque of the business entity',
    ],
    importantConsiderations: [
      'Newly incorporated companies (via SPICe+ MCA forms) automatically receive provisional EPFO and ESIC registrations.',
      'Coverage under EPF/ESIC continues to apply even if employee count subsequently falls below the initial statutory threshold.',
    ],
    deliverables: [
      { title: 'EPFO Establishment Code Allotment Letter', desc: 'Statutory Provident Fund registration credentials.' },
      { title: 'ESIC 17-Digit Employer Code Certificate', desc: 'Employee State Insurance corporate portal access.' },
      { title: 'Digital Signature Registration on Shram Portal', desc: 'Authorization setup for primary employer login.' },
    ],
    faqs: [
      { q: 'Is voluntary PF registration possible for teams with fewer than 20 employees?', a: 'Yes. Employers and employees can voluntarily apply for EPF coverage with mutual consent.' },
    ],
  },
  'pf-esic-return-filing': {
    slug: 'pf-esic-return-filing',
    title: 'PF & ESIC Monthly Return Filing',
    category: 'tax-accounting',
    badge: 'Monthly ECR Payroll Desk',
    whoShouldBuy: 'All employers registered with EPFO and ESIC holding an active establishment code.',
    whyShouldBuy: 'Ensures on-time statutory compliance, credits retirement savings and pension funds to employee UAN accounts, maintains employee medical coverage, and prevents penal damages (up to 25% under Section 14B) and prosecution.',
    timeframe: 'Monthly statutory deadline: 15th of every month for both EPF Electronic Challan-cum-Return (ECR) and ESIC contributions.',
    specificDocs: [
      'Monthly payroll sheet and attendance register',
      'Detailed salary breakup (Basic, DA, Gross salary) per employee',
      'UAN (Universal Account Number) and ESIC IP Numbers for all active staff',
      'Electronic Challan-cum-Return (ECR) credentials and online banking for challan settlement',
    ],
    importantConsiderations: [
      'EPF: 12% employee contribution + 12% employer contribution (split into EPF 3.67% and EPS 8.33%) + 0.5% EDLI + admin charges on basic wage up to ₹15,000.',
      'ESIC: 0.75% employee deduction + 3.25% employer contribution calculated on total gross wages.',
      'Delayed payment attracts compound interest of 12% per annum under Section 7Q of the EPF Act.',
    ],
    deliverables: [
      { title: 'Monthly EPF ECR Electronic Challan Receipt', desc: 'Proof of statutory employee PF contribution deposit.' },
      { title: 'Monthly ESIC Online Contribution Receipt', desc: 'Verified insurance contribution settlement ledger.' },
      { title: 'New Employee UAN & ESIC Number Generation', desc: 'Onboarding registration for newly joined personnel.' },
    ],
    faqs: [
      { q: 'What is the due date for monthly PF and ESIC deposits?', a: 'Both EPF and ESIC payments and returns must be settled on or before the 15th of each month following the payroll period.' },
    ],
  },
  'online-bookkeeping': {
    slug: 'online-bookkeeping',
    title: 'Online Bookkeeping & Accounting Retainer',
    category: 'tax-accounting',
    badge: 'Cloud Accounting Retainer',
    whoShouldBuy: 'Startups, SMEs, retail traders, e-commerce sellers, and service firms needing accurate, audit-ready financial books without maintaining an expensive in-house accounts team.',
    whyShouldBuy: 'Ensures flawless double-entry bookkeeping on Tally/Zoho/QuickBooks, prevents invoice mismatches, generates monthly P&L/Balance Sheets, and supports effortless tax filing.',
    timeframe: 'Monthly continuous retainer with weekly syncs.',
    specificDocs: [
      'Sales and purchase registers with invoice softcopies',
      'Bank and credit card monthly statements',
      'Expense receipts, utility bills, and payment vouchers',
      'Loan agreements and fixed asset purchase invoices',
    ],
    importantConsiderations: [
      'Provides cloud dashboard access for management review of real-time accounts receivable and payable.',
    ],
    deliverables: [
      { title: 'Monthly Audited Profit & Loss Statement', desc: 'Categorized revenue, direct expenses, and EBITDA analysis.' },
      { title: 'Monthly Balance Sheet & Trial Balance', desc: 'Reconciled assets, liabilities, and equity ledgers.' },
      { title: 'Bank Reconciliation Statements (BRS)', desc: 'Reconciled bank statement and accounting book ledger.' },
    ],
    faqs: [
      { q: 'Which accounting software do you support?', a: 'We support Zoho Books, Tally Prime, QuickBooks, Busy, and custom ERP systems.' },
    ],
  },

  // ==========================================
  // 4. TRADEMARK & IPR SERVICES
  // ==========================================
  'trademark-registration': {
    slug: 'trademark-registration',
    title: 'Trademark Registration',
    category: 'trademark-ipr',
    badge: 'IP India Controller General',
    whoShouldBuy: 'Business owners, startups, e-commerce sellers, manufacturers, and service providers wanting exclusive legal rights over their brand name, logo, or slogan.',
    whyShouldBuy: 'Protects against brand imitation and counterfeiting, grants the right to use the ® symbol upon registration (and ™ immediately upon filing), and establishes an intangible asset that increases business valuation.',
    timeframe: 'Application filing and ™ receipt in 24–48 hours; complete registration certificate in 6–12 months (subject to government processing and objections).',
    specificDocs: [
      'Applicant ID & Address Proof (PAN, Aadhaar, Passport)',
      'Brand Name, Logo, or Slogan image (high-resolution PNG/JPEG)',
      'Power of Attorney / Authorization Form (Form TM-48 signed by the applicant)',
      'User Affidavit with proof of prior usage (invoices, website links, or marketing materials), if claiming prior use; otherwise filed on a "proposed to be used" basis',
      'MSME / Udyam Certificate or Startup India Certificate (for 50% discount on official government fees)',
      'Incorporation Certificate (for companies and LLPs)',
    ],
    importantConsiderations: [
      'Trademarks are filed under specific Nice Classification classes (Class 1 to 45) depending on the goods or services.',
      'Registration remains valid for 10 years from the date of application.',
    ],
    deliverables: [
      { title: 'Form TM-A Filing Acknowledgment', desc: 'Government filing acknowledgment with an application number, if issued.' },
      { title: 'Immediate ™ Symbol Rights', desc: 'Legal right to brandish ™ on products, website, and promotional media.' },
      { title: 'Class 1–45 Nice Classification Report', desc: 'Comprehensive phonetic and Vienna code search report.' },
      { title: 'Drafted Form TM-48 (Power of Attorney)', desc: 'Official authorization for advocate representation before the registry.' },
      { title: 'Priority user affidavit compilation', desc: 'Organised, date-stamped documentary evidence dossier for professional review.' },
    ],
    faqs: [
      { q: 'When can I start using the ™ symbol?', a: 'You can legally use the ™ symbol immediately upon receipt of the Form TM-A acknowledgment receipt (within 24–48 hours).' },
      { q: 'What is the difference between ™ and ®?', a: '™ signifies an application has been filed and is pending. The ® mark can only be legally displayed once the Registrar issues the final Registration Certificate.' },
      { q: 'How long does a trademark remain valid?', a: 'A registered trademark is valid for 10 years from the filing date and can be renewed indefinitely every 10 years.' },
    ],
  },
  'trademark-renewal': {
    slug: 'trademark-renewal',
    title: 'Trademark Renewal',
    category: 'trademark-ipr',
    badge: '10-Year Validity Extension',
    whoShouldBuy: 'Existing registered trademark holders whose 10-year validity period is nearing expiration.',
    whyShouldBuy: 'Maintains uninterrupted nationwide legal protection, avoids forfeiture of brand rights, and prevents third parties from claiming your established mark.',
    timeframe: '1–3 working days for filing; official status update within 1–2 months.',
    specificDocs: [
      'Copy of the original Trademark Registration Certificate',
      'Form TM-R (Renewal Application)',
      'Signed Form TM-48 (Power of Attorney)',
      'Applicant ID/Incorporation details if there has been any change in entity details',
    ],
    importantConsiderations: [
      'Renewal can be filed within 6 months before the 10-year expiry date.',
      'Can be filed with a statutory surcharge within a 6-month grace period after expiry. Beyond that, the mark is abandoned and requires a restoration process.',
    ],
    deliverables: [
      { title: 'Form TM-R Filing Receipt', desc: 'Official submission acknowledgment for 10-year validity extension.' },
      { title: 'Trademark Renewal Certificate', desc: 'Updated statutory certificate from the Trade Marks Registry.' },
      { title: 'Journal Entry Validation', desc: 'Confirmation of renewal publication in the Trade Marks Journal.' },
    ],
    faqs: [
      { q: 'What happens if I miss the renewal deadline?', a: 'You have a 6-month grace period after expiry to renew with a statutory penalty. After 6 months, the mark is removed from the register and requires a Form TM-W restoration petition.' },
    ],
  },
  'trademark-objection': {
    slug: 'trademark-objection',
    title: 'Trademark Objection Reply',
    category: 'trademark-ipr',
    badge: 'Section 9 & 11 Legal Defense',
    whoShouldBuy: 'Trademark applicants whose applications have received an adverse Examination Report from the Trademark Registry (under Section 9 for absolute grounds or Section 11 for relative grounds).',
    whyShouldBuy: 'Legally refutes the examiner\'s queries, proves distinctiveness and non-conflicting nature, and keeps the application alive to proceed toward publication in the Trademark Journal.',
    timeframe: '3–5 working days to draft and file the reply; hearing/acceptance review within 2–6 months.',
    specificDocs: [
      'Copy of the Trademark Examination Report',
      'Form TM-48 (Power of Attorney)',
      'Documentary evidence supporting brand distinctiveness (sales invoices, advertisements, website analytics, social media presence, turnover certificates)',
    ],
    importantConsiderations: [
      'The response must be filed strictly within 30 days of receiving the examination report; failure to respond leads to immediate abandonment of the trademark.',
    ],
    deliverables: [
      { title: 'Drafted Legal Objection Reply', desc: 'Comprehensive response citing Supreme Court and High Court precedents.' },
      { title: 'Compilation of Distinctiveness Evidence', desc: 'Dossier of prior-use invoices, CA turnover certificate, and marketing collateral.' },
      { title: 'Official Registry Submission Receipt', desc: 'Proof of timely compliance submitted to the examiner.' },
    ],
    faqs: [
      { q: 'What is the difference between Section 9 and Section 11 objections?', a: 'Section 9 objections relate to absolute grounds (generic or descriptive). Section 11 relates to similarity with an earlier registered or pending mark.' },
    ],
  },
  'trademark-opposition': {
    slug: 'trademark-opposition',
    title: 'Trademark Opposition Proceedings',
    category: 'trademark-ipr',
    badge: 'Registry Trial & Defense',
    whoShouldBuy: 'Applicants defending their published trademark against a third-party claim, OR existing brand owners opposing a newly advertised competing mark in the Trademark Journal that is deceptively similar.',
    whyShouldBuy: 'Stops competitors from registering conflicting trademarks that could confuse customers, dilute brand value, or encroach on market share.',
    timeframe: 'Notice of Opposition / Counter-statement filed within statutory deadlines; overall resolution takes 12–24 months through registry proceedings.',
    specificDocs: [
      'Notice of Opposition (Form TM-O) or Counter-Statement (Form TM-O)',
      'Evidence in support of the opposition or defense (Rule 45/46 evidence affidavits)',
      'Proof of prior brand usage, market recognition, and registered trademark copies',
      'Signed Form TM-48 (Power of Attorney)',
    ],
    importantConsiderations: [
      'A third party can only file an opposition within 4 months from the date the trademark is published in the Trademark Journal.',
      'The applicant must file a Counter-Statement within 2 months of receiving the opposition notice, or the application is deemed abandoned.',
    ],
    deliverables: [
      { title: 'Form TM-O Pleadings Drafting', desc: 'Legally structured Notice of Opposition or Counter-Statement.' },
      { title: 'Rule 45 / 46 Evidence by Affidavit', desc: 'Sworn affidavit compilation proving prior commercial usage and goodwill.' },
      { title: 'Representation in Registry Hearings', desc: 'Advocate arguments before the Hearing Officer of the Trade Marks Registry.' },
    ],
    faqs: [
      { q: 'Can the 4-month opposition window be extended?', a: 'No. The 4-month statutory deadline from journal publication cannot be extended under any circumstances.' },
    ],
  },
  'trademark-assignment': {
    slug: 'trademark-assignment',
    title: 'Trademark Assignment & Ownership Transfer',
    category: 'trademark-ipr',
    badge: 'Proprietary IP Transfer',
    whoShouldBuy: 'Business owners buying, selling, merging, or transferring intellectual property rights from one individual/entity to another (with or without business goodwill).',
    whyShouldBuy: 'Legally transfers proprietary ownership of the brand asset, enables monetization via IP sale, and updates government records to reflect the new owner.',
    timeframe: '3–7 working days to draft and file (Form TM-P); registry record update takes 3–6 months.',
    specificDocs: [
      'Duly stamped and notarized Trademark Assignment Deed / Agreement',
      'Original Trademark Registration Certificate',
      'NOC / Consent from the assignor (seller)',
      'ID and address proofs of both assignor and assignee',
      'Form TM-P accompanied by Form TM-48',
    ],
    importantConsiderations: [
      'The assignment deed must clearly state whether the transfer includes "goodwill of the business" or is "without goodwill."',
      'Stamp duty must be paid according to state-specific Stamp Acts where the deed is executed.',
    ],
    deliverables: [
      { title: 'Customized Trademark Assignment Deed', desc: 'Legally binding transfer deed with IP valuation and indemnity covenants.' },
      { title: 'Form TM-P Submission Receipt', desc: 'Statutory application to record subsequent proprietor on the Trade Marks Register.' },
      { title: 'Updated Title Certificate', desc: 'Official certificate showing transferee as the registered proprietor.' },
    ],
    faqs: [
      { q: 'What is the difference between assignment with goodwill vs without goodwill?', a: '"With goodwill" transfers the right to use the mark for all historic reputation. "Without goodwill" restricts the buyer to specific product lines.' },
    ],
  },
  'logo-design': {
    slug: 'logo-design',
    title: 'Professional Logo & Brand Identity Design',
    category: 'trademark-ipr',
    badge: 'TM-Ready Vector Assets',
    whoShouldBuy: 'New startups, re-branding companies, and business owners who need a distinctive, legally defensible, and aesthetically strong visual identity.',
    whyShouldBuy: 'Professional, original logo designs reduce the risk of infringing existing trademarks, ensure clear brand recall, and meet the high-resolution vector criteria needed for trademark filing.',
    timeframe: '3–7 working days (depending on revision cycles).',
    specificDocs: [
      'Business profile, brand philosophy, color palette preferences, and target audience details',
      'Delivery of high-resolution source vector files (AI, EPS, SVG, PDF, transparent PNG)',
      'Full commercial usage rights and copyright transfer documentation',
    ],
    importantConsiderations: [
      'Avoid generic clipart or stock vectors, as they cannot be protected or registered under trademark and copyright laws.',
    ],
    deliverables: [
      { title: '3 Unique Concept Designs', desc: 'Custom crafted distinctive logo concepts by senior brand designers.' },
      { title: 'Vector & Print Ready Master Files', desc: 'Source files in AI, EPS, SVG, PDF, and high-res transparent PNG.' },
      { title: 'Brand Style Guide', desc: 'Typography hierarchy, color codes (HEX, RGB, CMYK), and clear-space guidelines.' },
      { title: 'Copyright Assignment Certificate', desc: 'Complete transfer of intellectual property and commercial exploitation rights.' },
    ],
    faqs: [
      { q: 'Can I trademark the logo designed by NyayaLink?', a: 'We prepare original logo concepts to the agreed brief; trademark distinctiveness and registration remain subject to registry review.' },
    ],
  },
  'series-trademark': {
    slug: 'series-trademark',
    title: 'Series Trademark Registration',
    category: 'trademark-ipr',
    badge: 'Brand Family Protection',
    whoShouldBuy: 'Companies and conglomerates launching multiple product variations or service lines under a unified brand family (e.g., Brand X Pro, Brand X Lite, Brand X Max).',
    whyShouldBuy: 'Protects a cluster of marks that resemble each other in material particulars in a single consolidated application, reducing filing costs and administrative effort.',
    timeframe: 'Filing in 24–48 hours; registration certificate in 6–12 months.',
    specificDocs: [
      'Details and visual representations of all mark variants in the series',
      'Form TM-48 (Power of Attorney)',
      'Identity, address, and entity incorporation proofs',
      'MSME/Startup India certificate (if eligible for reduced fee)',
    ],
    importantConsiderations: [
      'All marks in the series must share the exact same core distinctive element, differing only in non-distinctive features (such as color, size, quality, or place names).',
    ],
    deliverables: [
      { title: 'Consolidated Series TM-A Filing', desc: 'Official single application covering all variants in the brand family.' },
      { title: 'Series Trademark Search Clearance', desc: 'Cross-comparison report across all suffix and prefix variations.' },
      { title: 'Single Unified Registration Certificate', desc: 'Comprehensive statutory protection under Section 15 of Trade Marks Act.' },
    ],
    faqs: [
      { q: 'What is a Series Trademark under Indian Law?', a: 'Under Section 15 of the Trade Marks Act 1999, marks resembling each other in material particulars but differing in non-distinctive matters can be registered as a single series.' },
    ],
  },

  // ==========================================
  // 5. COPYRIGHT SERVICES
  // ==========================================
  'copyright-registration': {
    slug: 'copyright-registration',
    title: 'Copyright Registration',
    category: 'copyright',
    badge: 'Copyright Term Guidance',
    whoShouldBuy: 'Software developers, UI/UX designers, authors, musicians, filmmakers, content creators, and businesses looking to protect proprietary code, artistic works, or written content.',
    whyShouldBuy: 'Confers exclusive legal ownership over original creations, provides concrete legal standing in court against plagiarism or software piracy, and lasts for the author\'s lifetime plus 60 years.',
    timeframe: 'Diary number issuance in 24–48 hours; mandatory 30-day objection waiting period; final registration in 4–8 months.',
    specificDocs: [
      '2 complete copies of the work (e.g., source code, manuscript, design art, audio track)',
      'Applicant and author ID & address proofs',
      'NOC from the author/creator (if the applicant is a company or different individual)',
      'Form XIV and Statement of Particulars (SoP)',
      'NOC from the Trademark Registry (Search Certificate TM-C) if registering copyright for a commercial logo/label',
    ],
    importantConsiderations: [
      'Software source code and object code can be registered without disclosing entire proprietary algorithms (filing first and last 10–20 pages is standard practice).',
      'A mandatory 30-day statutory notice period is required by law to allow for public objections after filing.',
    ],
    deliverables: [
      { title: 'Form XIV Statutory Filing Receipt', desc: 'Official filing diary number issued by the Copyright Office.' },
      { title: 'Mandatory 30-Day Objection Clearance', desc: 'Monitoring and management of public notice clearance window.' },
      { title: 'Extract of Register of Copyrights (ROC)', desc: 'Official registration certificate with sealed government stamp.' },
    ],
    faqs: [
      { q: 'How long does copyright protection last?', a: 'For literary, dramatic, musical, and artistic works, copyright lasts for the author\'s lifetime plus 60 years after their demise.' },
    ],
  },

  // ==========================================
  // 6. LICENSES & PERMITS
  // ==========================================
  'fssai-food-license': {
    slug: 'fssai-food-license',
    title: 'FSSAI Food Safety Registration & License',
    category: 'licenses-permits',
    badge: 'FoSCoS Support Desk',
    whoShouldBuy: 'Basic Registration: Small food business operators (FBOs), hawkers, cloud kitchens, bakeries, or dairy units with annual turnover up to ₹12 Lakhs. State License: Medium manufacturers, restaurants, distributors, catering services with annual turnover between ₹12 Lakhs and ₹20 Crores. Central License: Large food manufacturers, 100% export-oriented units (EOUs), importers, multi-state chains, and businesses with turnover exceeding ₹20 Crores.',
    whyShouldBuy: 'Legally required to handle, package, cook, store, or sell food items; essential for listing on food delivery platforms (Zomato, Swiggy, Blinkit, Zepto, Amazon); builds consumer trust and avoids hefty fines (up to ₹5 Lakhs and imprisonment).',
    timeframe: 'Basic Registration: 3–7 working days; State/Central License: 15–30 working days (subject to departmental review/inspection).',
    specificDocs: [
      'Photo and ID/Address proof (PAN, Aadhaar/Passport/Voter ID) of the applicant/authorized person',
      'Proof of premises: Electricity bill/property tax receipt + Rent agreement + Owner NOC',
      'Food safety management plan & list of food categories/products',
      'Blueprint/layout plan of processing unit and machinery list (for State/Central manufacturers)',
      'Water testing report from an accredited NABL lab (for manufacturing/beverages)',
      'Partnership Deed / Certificate of Incorporation / MOA-AOA (for companies/LLPs)',
    ],
    importantConsiderations: [
      'Licenses can be applied for a validity ranging from 1 to 5 years.',
      '14-digit FSSAI number must be displayed on product packaging and at business premises.',
    ],
    deliverables: [
      { title: 'FoSCoS application output', desc: 'Registration or licence certificate, if approved by the authority.' },
      { title: 'Food product category mapping', desc: 'Category mapping prepared for the application, subject to authority approval.' },
      { title: 'Food Safety Management System (FSMS) Plan', desc: 'Standardized hygiene and sanitation operating manual.' },
    ],
    faqs: [
      { q: 'Is FSSAI mandatory for home kitchens and cloud kitchens?', a: 'Yes. Every entity manufacturing, preparing, or selling food items from home or commercial kitchens must hold at least a Basic FSSAI Registration.' },
    ],
  },
  'fssai-renewal': {
    slug: 'fssai-renewal',
    title: 'FSSAI License / Registration Renewal',
    category: 'licenses-permits',
    badge: '1 to 5 Years Validity Extension',
    whoShouldBuy: 'Any existing food business operator (Basic, State, or Central) whose FSSAI license/registration validity is nearing expiration.',
    whyShouldBuy: 'Ensures uninterrupted business operations, keeps online aggregator listings active, and avoids statutory late penalties and license cancellation.',
    timeframe: '2–5 working days for filing; final approval in 7–15 working days.',
    specificDocs: [
      'Current FSSAI license/registration certificate copy',
      'Form A (for Basic Registration) or Form B (for State/Central License)',
      'Updated identity/address proofs or premise documents (only if any changes occurred)',
      'Self-declaration of Food Safety Management System (FSMS)',
    ],
    importantConsiderations: [
      'Renewal must be applied at least 30 days before the expiry date to avoid a late fee of ₹100 per day.',
      'If not renewed before the expiration date, the license lapses, requiring a completely fresh application.',
    ],
    deliverables: [
      { title: 'Renewed FSSAI License Certificate', desc: 'Updated statutory validity certificate (1 to 5 years).' },
      { title: 'FoSCoS Renewal Filing ARN Receipt', desc: 'Proof of timely compliance submission to food authorities.' },
    ],
    faqs: [
      { q: 'What is the late fee for delayed FSSAI renewal?', a: 'Applying within 30 days prior to expiry attracts a statutory late fee of ₹100 for each day of delay until the expiry date.' },
    ],
  },
  'fssai-modification': {
    slug: 'fssai-modification',
    title: 'FSSAI License Modification & Expansion',
    category: 'licenses-permits',
    badge: 'FoSCoS Category / Premise Update',
    whoShouldBuy: 'Licensed food businesses changing operational details such as adding new food product categories, increasing production capacity, changing business name, updating kitchen address, or changing authorized signatories.',
    whyShouldBuy: 'Operates legally without risk of license suspension or penalties during surprise food safety inspections due to unauthorized menu/product expansion or address changes.',
    timeframe: '7–15 working days (Non-form / minor updates take 2–5 days).',
    specificDocs: [
      'Existing FSSAI License copy',
      'For Address Change: New utility bill, rent agreement, NOC, updated layout plan',
      'For Product Expansion: Form B with an updated product list and FSMS plan',
      'For Capacity Expansion: Revised list of machinery, horsepower, and production charts',
      'Board Resolution / Authorization letter',
    ],
    importantConsiderations: [
      'Categorized into Form Modification (changes to products, capacity, or premises) and Non-Form Modification (contact info, email, mobile).',
    ],
    deliverables: [
      { title: 'Endorsed Modified FSSAI License', desc: 'Updated certificate reflecting new categories, premises, or capacity.' },
      { title: 'FoSCoS Modification Approval Dossier', desc: 'Statutory compliance validation record.' },
    ],
    faqs: [
      { q: 'Can I add new food categories to my existing license?', a: 'Yes. Form modification allows adding new food categories without changing your 14-digit FSSAI number.' },
    ],
  },
  'import-export-code-iec': {
    slug: 'import-export-code-iec',
    title: 'Import Export Code (IEC) Registration',
    category: 'licenses-permits',
    badge: 'DGFT IEC Support',
    whoShouldBuy: 'Any individual, partnership, LLP, or company planning to import physical goods/raw materials into India or export goods and services globally.',
    whyShouldBuy: 'Support for DGFT IEC application; the requirement, exemptions, and available trade benefits depend on the activity and current rules.',
    timeframe: '24–48 hours for document preparation; DGFT processing time may vary.',
    specificDocs: [
      'PAN card of the entity/proprietor',
      'Aadhaar card / Voter ID / Passport of the applicant/directors/partners',
      'Proof of establishment/office: Electricity bill, rent agreement, or property tax receipt',
      'Bank proof: Cancelled cheque or active bank certificate displaying the firm\'s name and account number',
      'Class-3 Digital Signature Certificate (DSC) or Aadhaar OTP authentication',
    ],
    importantConsiderations: [
      'IEC has lifetime validity; however, annual electronic re-validation (updating details on DGFT between April and June each year) is mandatory, even if there are no changes, to prevent deactivation.',
    ],
    deliverables: [
      { title: 'IEC application output', desc: 'DGFT-issued IEC, if the application is approved.' },
      { title: 'DGFT Portal User Profile Setup', desc: 'Online portal registration for ICEGATE and duty drawback access.' },
    ],
    faqs: [
      { q: 'Is IEC required for software/IT service exports?', a: 'Yes. While service exporters with turnover under certain thresholds are sometimes exempt from customs, an IEC is required to claim foreign trade benefits and smooth remittance processing.' },
    ],
  },
  'iec-modification': {
    slug: 'iec-modification',
    title: 'IEC Modification & Annual Re-Validation',
    category: 'licenses-permits',
    badge: 'DGFT Profile Update',
    whoShouldBuy: 'Exporters/importers updating DGFT records due to changes in bank accounts, branch offices, business address, contact details, or changes in directors/partners.',
    whyShouldBuy: 'Prevents consignment hold-ups at customs ports and ensures foreign remittances are credited to authorized business bank accounts without bank compliance flags.',
    timeframe: '24–48 hours.',
    specificDocs: [
      'Active DGFT login credentials',
      'Existing IEC certificate copy',
      'For Bank Details Update: Cancelled cheque / bank certificate of the new account',
      'For Address Change: New electricity bill / rent agreement',
      'For Director/Partner Changes: Updated PAN, Aadhaar, and Board Resolution / Partnership Deed',
    ],
    importantConsiderations: [
      'Updates must be completed online directly via the DGFT portal using DSC or Aadhaar OTP verification.',
    ],
    deliverables: [
      { title: 'Modified IEC record', desc: 'Updated DGFT record, if the amendment is approved.' },
      { title: 'DGFT Annual Re-Validation Acknowledgment', desc: 'Active status confirmation preventing port de-linking.' },
    ],
    faqs: [
      { q: 'When is annual IEC re-validation required?', a: 'Every IEC holder must confirm or update their details on the DGFT portal annually between April 1st and June 30th.' },
    ],
  },
  'fssai-annual-return': {
    slug: 'fssai-annual-return',
    title: 'FSSAI Annual Return Filing (Form D-1 / D-2)',
    category: 'licenses-permits',
    badge: 'Form D-1 / D-2 Desk',
    whoShouldBuy: 'FSSAI State and Central licensed food manufacturers, processors, repackers, labellers, and importers (excluding simple restaurants, fast-food joints, grocery stores, and Basic registration holders).',
    whyShouldBuy: 'Annual return support for eligible FSSAI licence holders; due dates and penalties depend on licence category and current rules.',
    timeframe: 'Annual filing due by May 31st for the preceding financial year.',
    specificDocs: [
      'Active FSSAI license credentials (FoSCoS portal)',
      'Food product category details manufactured/imported',
      'Quantity in Metric Tonnes (MT) produced, imported, exported, or sold during the year',
      'Handling and storage volume data',
      'Purchase/sales value and selling price per unit',
    ],
    importantConsiderations: [
      'Returns must be filed online through the FoSCoS portal using Form D-1 (for general manufacturers/importers) or Form D-2 (for milk and dairy units filed half-yearly).',
    ],
    deliverables: [
      { title: 'Form D-1 / D-2 Annual Return ARN', desc: 'Official FoSCoS statutory submission acknowledgment.' },
      { title: 'Annual Production & Quantity Summary Record', desc: 'Reconciled volume ledger for regulatory audits.' },
    ],
    faqs: [
      { q: 'What is the penalty for not filing the FSSAI Annual Return?', a: 'Delay beyond May 31st attracts a late fee of ₹100 per day, up to a maximum equal to 5 times the annual license fee.' },
    ],
  },
  'iso-certification': {
    slug: 'iso-certification',
    title: 'ISO Certification (ISO 9001, 14001, 27001, 22000)',
    category: 'licenses-permits',
    badge: 'ISO Certification Pathway',
    whoShouldBuy: 'Startups, manufacturing units, IT/software firms, healthcare organizations, and B2B service providers bidding for government tenders, international contracts, or enterprise vendor empanelment.',
    whyShouldBuy: 'Supports preparation for an ISO certification process; acceptance for tenders and vendor programmes depends on the buyer and certification body.',
    timeframe: '3–7 working days (for standard non-audit IAF/Non-IAF certifications); 2–4 weeks if comprehensive multi-stage external audits are involved.',
    specificDocs: [
      'Business Registration Proof (GST certificate, Udyam MSME, or Incorporation Certificate)',
      'Business PAN card',
      'Scope of business activities and brief company profile',
      'Copy of standard invoices / work orders',
      'Quality policy manual and organogram (if existing)',
    ],
    importantConsiderations: [
      'Certificates are typically valid for 3 years, subject to annual surveillance audits.',
      'IAF vs. Non-IAF: IAF (International Accreditation Forum) certificates are globally accepted and mandatory for government tenders; Non-IAF is suitable for branding and marketing.',
    ],
    deliverables: [
      { title: 'ISO certification documentation', desc: 'Certificate documentation, if issued by the selected certification body after its review.' },
      { title: 'Quality Management Manual & SOPs', desc: 'Standardized operational procedures tailored to ISO standards.' },
      { title: 'Marketing artwork guidance', desc: 'Use of ISO names or marks remains subject to the certification body rules.' },
    ],
    faqs: [
      { q: 'What is the difference between IAF and Non-IAF certification?', a: 'IAF certificates are issued by globally accredited bodies and are mandatory for government/GeM tenders. Non-IAF is faster and cost-effective for general branding.' },
    ],
  },

  // ==========================================
  // 7. LEGAL DISPUTES (ODR)
  // ==========================================
  'cheque-bounce-notice-138': {
    slug: 'cheque-bounce-notice-138',
    title: 'Section 138 Cheque Bounce Demand Notice',
    category: 'legal-dispute',
    badge: 'Demand Notice Drafting',
    whoShouldBuy: 'Individuals, businesses, traders, and lenders who have received a dishonored cheque with bank return memo stating funds insufficient or stop payment.',
    whyShouldBuy: 'Mandatory statutory prerequisite before filing a criminal complaint under Section 138 of the Negotiable Instruments Act; establishes rigorous legal ground for speedy recovery.',
    timeframe: '24–48 hours for drafting and speed post dispatch.',
    specificDocs: [
      'Copy of the dishonored cheque (front & back)',
      'Original bank return memo with official dishonour reason',
      'Underlying invoices, promissory note, or loan/transaction agreement',
      'Full legal postal address and contact details of the defaulting drawer',
    ],
    importantConsiderations: [
      'Notice must be served strictly within 30 days of receiving the bank dishonour memo.',
      'The defaulter is given a mandatory 15-day statutory window from receipt to settle the amount before criminal prosecution begins.',
    ],
    deliverables: [
      { title: 'Statutory demand notice draft', desc: 'Notice drafting and review by an appropriately engaged legal professional, subject to scope.' },
      { title: 'Speed Post Consignment Booking Receipt', desc: 'Proof of dispatch with tracking number.' },
      { title: 'Proof of Delivery (POD) Dossier', desc: 'Court-admissible delivery acknowledgement summary.' },
    ],
    faqs: [
      { q: 'Can I file a case after 30 days of cheque bounce?', a: 'If the statutory 30-day notice window is missed, the criminal remedy under Section 138 cannot be filed, though a civil recovery suit may still be pursued.' },
    ],
  },
};

export function getServiceStructure(slug: string): ServiceStructure {
  if (STRUCTURED_SERVICES[slug]) {
    return STRUCTURED_SERVICES[slug];
  }

  return {
    slug,
    title: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: 'general',
    badge: 'Service overview',
    whoShouldBuy: 'Businesses, professionals, and entities looking for structured statutory compliance assistance and filing support.',
    whyShouldBuy: 'Supports compliance work with relevant government departments; outcomes, deadlines, and any professional review depend on the facts and authority response.',
    timeframe: '3–7 working days',
    specificDocs: [
      'Identity and PAN proof of applicant or director',
      'Address proof of business premises (utility bill under 2 months old)',
      'Entity registration proofs (GST, Incorporation certificate, or Partnership Deed)',
    ],
    importantConsiderations: [
      'All uploaded documents must be clear and legible to prevent portal re-scrutiny.',
    ],
    deliverables: [
      { title: 'Filing acknowledgment', desc: 'Government acknowledgment or tracking reference, if issued after submission.' },
    ],
    faqs: [
      { q: 'How do I track filing status?', a: 'Live updates are displayed in real-time inside your Vault Dashboard.' },
    ],
  };
}