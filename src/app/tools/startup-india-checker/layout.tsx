import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Startup India DPIIT & Section 80-IAC Eligibility Diagnostic Checker | NyayaLink',
  description:
    'Free self-diagnostic eligibility tool for DPIIT Recognition, Section 80-IAC 3-year 100% Income Tax Exemption, and Angel Tax relief under Ministry of Commerce and Industry guidelines.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/startup-india-checker',
  },
  openGraph: {
    title: 'Startup India DPIIT & Section 80-IAC Eligibility Checker | NyayaLink',
    description:
      'Check if your startup qualifies for 3 years of 100% tax exemption and DPIIT perks in 60 seconds with our free diagnostic engine.',
    url: 'https://nyayalink.com/tools/startup-india-checker',
    type: 'website',
  },
};

export default function StartupIndiaCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
