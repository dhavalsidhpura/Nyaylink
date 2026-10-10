import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyayalink.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/services/',
          '/packages',
          '/vakil',
          '/tools/',
          '/terms',
          '/privacy',
          '/refund-policy',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/orders/',
          '/invoices/',
          '/lawyer/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
