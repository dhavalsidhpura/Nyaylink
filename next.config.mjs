/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,

  // Canonical redirects for SEO & historical route aliases
  async redirects() {
    return [
      { source: '/services/proprietorship-setup', destination: '/services/business-registration-license', permanent: true },
      { source: '/services/director-din-ekyc', destination: '/services/dir-3-kyc-director-filing', permanent: true },
      { source: '/services/gst-nil-return', destination: '/services/gst-nil-return-filing', permanent: true },
      { source: '/services/gstr-9-annual-return', destination: '/services/gstr-9-annual-filing', permanent: true },
      { source: '/services/tds-tcs-return', destination: '/services/tds-return-filing', permanent: true },
      { source: '/services/income-tax-return', destination: '/services/income-tax-return-itr', permanent: true },
      { source: '/services/tax-planning', destination: '/services/virtual-cfo-services', permanent: true },
      { source: '/services/project-report', destination: '/services/scale-your-business', permanent: true },
      { source: '/services/corporate-compliance-governance', destination: '/services/mca-inc-20a-commencement-of-business', permanent: true },
      { source: '/services/form-aoc-4-filing', destination: '/services/mca-inc-20a-commencement-of-business', permanent: true },
      { source: '/services/patent-filing', destination: '/vakil', permanent: false },
    ];
  },

  // Server external packages and optimization in Next.js 14
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    optimizePackageImports: ['zod', 'lucide-react'],
  },

  // Image optimization with modern WebP and AVIF formats
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Speed and security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Cache static fonts, scripts and public assets aggressively
        source: '/(.*).(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
