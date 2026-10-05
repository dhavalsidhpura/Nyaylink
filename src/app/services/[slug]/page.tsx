import { getActiveService } from '@/lib/catalog';
import { num } from '@/lib/serialize';
import ServiceDetailClient from './ServiceDetailClient';

export const dynamic = 'force-dynamic';

// Pricing comes from the Service table — the same source the checkout API charges from —
// so the price a client sees is always the price they pay.
export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getActiveService(params.slug);
  const pricing = service
    ? {
        professionalFee: num(service.professionalFee),
        govtFee: num(service.govtFee),
        govtFeeNote: service.govtFeeNote,
        gstRate: num(service.gstRate),
        sla: service.sla,
        sacCode: service.sacCode,
      }
    : null;

  return <ServiceDetailClient pricing={pricing} />;
}
