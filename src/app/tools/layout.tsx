import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Legal & Corporate Compliance Tools for Indian Founders | NyayaLink',
  description:
    'Free online legal tools: Incorporation Cost Calculator, Startup India 80-IAC Checker, MCA Company Name Search, Trademark Search, GSTIN Verification, and Contract Generator.',
  alternates: {
    canonical: 'https://nyayalink.com/tools',
  },
  openGraph: {
    title: 'Free Legal & Corporate Compliance Tools | NyayaLink',
    description:
      'Zero lead gate legal-tech tools designed for Indian entrepreneurs and startup founders.',
    url: 'https://nyayalink.com/tools',
    type: 'website',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
