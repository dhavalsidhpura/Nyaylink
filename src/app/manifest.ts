import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NyayaLink — Legal, Tax & Corporate Compliance Platform',
    short_name: 'NyayaLink',
    description: 'Digital company incorporation, GST filings, trademark protection, and corporate compliance supervised by certified CAs and Advocates in Mumbai.',
    start_url: '/',
    display: 'standalone',
    background_color: '#073B5C',
    theme_color: '#073B5C',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
