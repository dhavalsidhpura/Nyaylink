import type { Metadata } from 'next';
import { getServiceBySlug } from '@/lib/catalog';
import { num } from '@/lib/serialize';
import { formatINR } from '@/lib/pricing';
import { getServiceStructure } from '@/data/serviceDetails';
import ServiceDetailClient from './ServiceDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyayalink.com';
  const canonicalUrl = `${baseUrl}/services/${params.slug}`;

  if (!service) {
    return {
      title: 'Legal & Compliance Filing | NyayaLink',
      description: 'Professional legal and compliance filing portal supervised directly by Chartered Accountants.',
    };
  }

  const title = `${service.title} in India | NyayaLink`;
  const description = `Fast-track ${service.title} with dedicated CA/CS supervision. Transparent professional fee at ${formatINR(num(service.professionalFee))}, statutory government fee transparency, and ₹999 booking advance.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'NyayaLink',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// Pricing and requirements come directly from the Service table (the same source the checkout API charges from),
// so changes made in the Admin Console reflect instantly.
export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyayalink.com';
  const structure = getServiceStructure(params.slug);

  const serviceData = service
    ? {
        slug: service.slug,
        title: service.title,
        category: service.category,
        professionalFee: num(service.professionalFee),
        govtFee: num(service.govtFee),
        govtFeeNote: service.govtFeeNote,
        gstRate: num(service.gstRate),
        sla: service.sla,
        sacCode: service.sacCode,
        isActive: service.isActive,
        requirements: service.requirements?.map((r) => ({
          id: r.id,
          key: r.key,
          label: r.label,
          required: r.required,
        })) ?? [],
      }
    : null;

  // Schema.org Structured Data (Service + FAQPage + BreadcrumbList)
  const jsonLdService = service
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: structure.whyShouldBuy || `${service.title} with dedicated CA/CS supervision`,
        serviceType: service.category,
        provider: {
          '@type': 'LegalService',
          name: 'NyayaLink',
          url: baseUrl,
          telephone: '+919920054785',
          priceRange: '₹₹',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Mumbai',
            addressRegion: 'Maharashtra',
            postalCode: '400067',
            addressCountry: 'IN',
          },
        },
        offers: {
          '@type': 'Offer',
          price: num(service.professionalFee),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/services/${service.slug}`,
        },
      }
    : null;

  const jsonLdFaq = structure?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: structure.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }
    : null;

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${baseUrl}/#catalog-section`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service?.title || 'Service Detail',
        item: `${baseUrl}/services/${params.slug}`,
      },
    ],
  };

  return (
    <>
      {jsonLdService && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }}
        />
      )}
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ServiceDetailClient serviceData={serviceData} />
    </>
  );
}
