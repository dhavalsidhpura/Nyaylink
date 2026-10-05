import { getServiceBySlug } from '@/lib/catalog';
import { num } from '@/lib/serialize';
import ServiceDetailClient from './ServiceDetailClient';

export const dynamic = 'force-dynamic';

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
