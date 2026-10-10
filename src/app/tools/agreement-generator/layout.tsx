import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Legal Agreement Generator & Drafter (NDA, Founders, MSA) | NyayaLink',
  description:
    'Generate customized, legally vetted Indian commercial agreements online. Create Mutual NDAs, Founders Restricted Stock Agreements, and Freelancer Master Service Agreements with instant download.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/agreement-generator',
  },
  openGraph: {
    title: 'Free Legal Agreement Generator & Drafter | NyayaLink',
    description:
      'Generate enforceable Indian commercial contracts: Non-Disclosure Agreements, Founders Agreements & MSAs formatted for Indian jurisdiction.',
    url: 'https://nyayalink.com/tools/agreement-generator',
    type: 'website',
  },
};

export default function AgreementGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
