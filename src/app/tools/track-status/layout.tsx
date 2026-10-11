import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track MCA SRN, GST ARN & Trademark Status Online | NyayaLink',
  description:
    'Real-time status tracking for MCA Service Request Numbers (SRN), GST Application Reference Numbers (ARN), Trade Marks Registry application numbers, and NyayaLink dockets.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/track-status',
  },
  openGraph: {
    title: 'Track MCA SRN, GST ARN & Trademark Status Online | NyayaLink',
    description:
      'Check live government filing progress, examination reports, and milestone approvals across MCA, GSTN, and IP India registries.',
    url: 'https://nyayalink.com/tools/track-status',
    type: 'website',
  },
};

export default function TrackStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
