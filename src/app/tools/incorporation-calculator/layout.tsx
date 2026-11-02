import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All-India Multi-Entity Incorporation Cost Calculator | NyayaLink',
  description:
    'Free, instant, itemized incorporation cost calculator for Private Limited, LLP, OPC, and Section 8 companies across all 36 Indian States & UTs. Zero lead gate, Rule 33 Pure Agent breakdown.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/incorporation-calculator',
  },
  openGraph: {
    title: 'All-India Multi-Entity Incorporation Cost Calculator | NyayaLink',
    description:
      'Calculate exact MCA filing fees, state stamp duties, DSC costs, and professional fees with zero hidden charges. Compare against legacy legal portals.',
    url: 'https://nyayalink.com/tools/incorporation-calculator',
    type: 'website',
  },
};

export default function IncorporationCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
