import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaylink.vercel.app';

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
          '/ca/',
          '/dashboard/',
          '/orders/',
          '/invoices/',
          '/lawyer/dashboard/',
          '/unauthorized',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
