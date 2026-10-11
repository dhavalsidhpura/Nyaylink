import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#073B5C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyayalink.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'NyayaLink — India’s Premier Legal & Corporate Compliance Platform',
    template: '%s | NyayaLink',
  },
  description:
    'Digital company incorporation, GST filings, trademark protection, and corporate compliance supervised directly by certified CAs and Advocates in Mumbai.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NyayaLink — India’s Premier Legal & Corporate Compliance Platform',
    description:
      'Digital company incorporation, GST filings, trademark protection, and corporate compliance supervised directly by certified CAs and Advocates in Mumbai.',
    url: baseUrl,
    siteName: 'NyayaLink',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyayaLink — India’s Premier Legal & Corporate Compliance Platform',
    description:
      'Digital company incorporation, GST filings, trademark protection, and corporate compliance supervised directly by certified CAs and Advocates in Mumbai.',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'NyayaLink',
  url: baseUrl,
  logo: `${baseUrl}/icon.png`,
  description: 'Digital incorporation, licensing, and corporate compliance platform in Mumbai, India.',
  telephone: '+919920054785',
  email: 'info@nyayalink.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Charkop, Kandivali West',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400067',
    addressCountry: 'IN',
  },
  priceRange: '₹₹',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-[#F0F4F8] antialiased`}>
        <Providers>{children}</Providers>
        <div className="print:hidden">
          <Footer />
        </div>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
