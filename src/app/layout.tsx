import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nyayalink.in'),
  title: {
    default: 'NyayLink | Legal & Compliance Services for Indian Businesses',
    template: '%s | NyayLink',
  },
  description:
    'Business registration, GST, trademark, licences, and compliance assistance for Indian founders, startups, MSMEs, and professionals.',
  keywords: [
    'company registration India',
    'GST registration',
    'trademark registration India',
    'MSME Udyam registration',
    'business compliance India',
    'Maharashtra business registration',
    'Gujarat business registration',
  ],
  applicationName: 'NyayLink',
  authors: [{ name: 'NyayLink' }],
  creator: 'NyayLink',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'NyayLink',
    title: 'NyayLink | Legal & Compliance Services for Indian Businesses',
    description:
      'Clear, guided assistance for business registration, GST, trademark, licences, and ongoing compliance in India.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#073B5C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="flex flex-col min-h-screen">
        {children}
        <Footer />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
