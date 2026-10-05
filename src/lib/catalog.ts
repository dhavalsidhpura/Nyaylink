import { prisma } from '@/lib/prisma';
import { MASTER_SERVICES } from '@/data/services';
import { STRUCTURED_SERVICES } from '@/data/serviceDetails';

// The `Service` table is the single source of truth for pricing. The static files in src/data
// only provide marketing copy and the initial seed; once a row exists, admin edits win.

function requirementKey(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || `doc-${index + 1}`;
}

/** Inserts any catalog services missing from the DB. Never overwrites admin-edited prices. */
export async function syncCatalog() {
  const existing = new Set((await prisma.service.findMany({ select: { slug: true } })).map((s) => s.slug));

  for (const item of MASTER_SERVICES) {
    if (existing.has(item.slug)) continue;
    const docs = STRUCTURED_SERVICES[item.slug]?.specificDocs ?? item.docs.split(',').map((d) => d.trim()).filter(Boolean);
    const seen = new Set<string>();
    await prisma.service.create({
      data: {
        slug: item.slug,
        title: item.title,
        category: item.category,
        professionalFee: item.price,
        govtFee: 0,
        govtFeeNote: item.govtFee,
        sla: item.sla,
        sacCode: item.sacCode,
        requirements: {
          create: docs.map((label, i) => {
            let key = requirementKey(label, i);
            if (seen.has(key)) key = `${key}-${i + 1}`;
            seen.add(key);
            return { key, label, sortOrder: i };
          }),
        },
      },
    });
  }
}

export async function getActiveService(slug: string) {
  let service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  if (!service && MASTER_SERVICES.some((s) => s.slug === slug)) {
    await syncCatalog();
    service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  }
  return service?.isActive ? service : null;
}
