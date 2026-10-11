import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GSTIN Search, Checksum Verification & Status Lookup | NyayaLink',
  description:
    'Free GSTIN decoder and Luhn checksum verification tool. Check registered state, embedded PAN, entity type, and ensure vendor Input Tax Credit (ITC) compliance.',
  alternates: {
    canonical: 'https://nyayalink.com/tools/gst-search',
  },
  openGraph: {
    title: 'Free GSTIN Format & Check-Digit Verification | NyayaLink',
    description:
      'Instantly decode 15-digit GSTIN syntax, check entity registration standing, and prevent invalid Input Tax Credit rejections.',
    url: 'https://nyayalink.com/tools/gst-search',
    type: 'website',
  },
};

export default function GSTSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
