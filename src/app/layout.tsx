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

export const metadata: Metadata = {
  title: 'NyayaLink — India’s Premier Legal & Corporate Compliance Platform',
  description: 'Digital incorporation, licensing, and compliance platform supported by certified CAs and Advocates in Mumbai.',
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
