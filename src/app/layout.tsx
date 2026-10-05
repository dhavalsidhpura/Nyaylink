import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import './globals.css';

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
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>{children}</Providers>
        <div className="print:hidden">
          <Footer />
        </div>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
