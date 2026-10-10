import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All-In-One Startup & Business Compliance Packages | NyayaLink',
  description:
    'Curated business bundles combining incorporation, GST, trademark, MSME, bank setup, and annual accounting at up to 48% discount. Zero hidden charges with CA execution.',
  alternates: {
    canonical: 'https://nyayalink.com/packages',
  },
  openGraph: {
    title: 'All-In-One Legal & Corporate Compliance Packages | NyayaLink',
    description:
      'Curated startup suites, retail/restaurant bundles, e-commerce packages, and annual compliance retainers with ₹999 advance token booking.',
    url: 'https://nyayalink.com/packages',
    type: 'website',
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
