import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCA Company Name Search & Availability Check (Rule 8) | NyayaLink',
  description:
    'Free MCA V3 company name search and availability checker. Verify phonetic trademark clashes, restricted keywords, and Rule 8 naming guidelines before incorporation.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/company-name-search',
  },
  openGraph: {
    title: 'MCA Company Name Search & Availability Check | NyayaLink',
    description:
      'Check company & LLP name availability across MCA V3 and IP India Trademark registry instantly with CA verification.',
    url: 'https://nyayalink.com/tools/company-name-search',
    type: 'website',
  },
};

export default function CompanyNameSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
