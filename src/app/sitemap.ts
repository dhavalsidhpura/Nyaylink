import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nyaylink.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicPaths = [
    '/',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/tools/company-name-search',
    '/tools/gst-search',
    '/tools/trademark-search',
  ];

  return publicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.5,
  }));
}
