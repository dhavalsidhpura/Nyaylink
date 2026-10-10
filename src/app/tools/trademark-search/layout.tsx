import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trademark Search India (Class 1-45 NICE) & Brand Check | NyayaLink',
  description:
    'Free public trademark search engine across 45 NICE classes. Check brand phonetic similarity, existing registered marks, and avoid Section 9/11 examination objections.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/trademark-search',
  },
  openGraph: {
    title: 'Free Trademark & NICE Class Search India | NyayaLink',
    description:
      'Search 45 NICE classifications, check phonetic brand conflicts, and claim 50% MSME government fee subsidy with NyayaLink.',
    url: 'https://nyayalink.com/tools/trademark-search',
    type: 'website',
  },
};

export default function TrademarkSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
