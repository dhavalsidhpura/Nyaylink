import type { Metadata } from 'next';
import { getServiceBySlug } from '@/lib/catalog';
import { num } from '@/lib/serialize';
import { formatINR } from '@/lib/pricing';
import ServiceDetailClient from './ServiceDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
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
    openGraph: {
      title,
      description,
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

  return <ServiceDetailClient serviceData={serviceData} />;
}
