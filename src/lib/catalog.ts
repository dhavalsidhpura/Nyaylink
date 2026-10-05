import { cache } from 'react';
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

let syncPromise: Promise<void> | null = null;
let isCatalogSynced = false;

// High-speed in-memory cache for public catalog queries (60s TTL)
let publicServicesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export function invalidateServiceCache() {
  publicServicesCache = null;
}

/** Inserts any catalog services missing from the DB. Never overwrites admin-edited prices. */
export async function syncCatalog() {
  if (isCatalogSynced) return;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const count = await prisma.service.count();
      if (count >= MASTER_SERVICES.length) {
        isCatalogSynced = true;
        return;
      }

      const existing = new Set((await prisma.service.findMany({ select: { slug: true } })).map((s) => s.slug));

      for (const item of MASTER_SERVICES) {
        if (existing.has(item.slug)) continue;
        const docs = STRUCTURED_SERVICES[item.slug]?.specificDocs ?? item.docs.split(',').map((d) => d.trim()).filter(Boolean);
        const seen = new Set<string>();
        try {
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
          existing.add(item.slug);
        } catch (err: any) {
          // P2002 is Prisma's unique constraint violation code (e.g. created concurrently)
          if (err?.code === 'P2002') {
            existing.add(item.slug);
            continue;
          }
          throw err;
        }
      }
      isCatalogSynced = true;
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

export async function syncServiceRequirements(serviceId: string, docLabels: string[]) {
  const seen = new Set<string>();
  const newReqs = docLabels.map((label, i) => {
    let key = requirementKey(label, i);
    if (seen.has(key)) key = `${key}-${i + 1}`;
    seen.add(key);
    return { serviceId, key, label, sortOrder: i, required: true };
  });

  await prisma.$transaction([
    prisma.serviceDocRequirement.deleteMany({ where: { serviceId } }),
    ...(newReqs.length > 0 ? [prisma.serviceDocRequirement.createMany({ data: newReqs })] : []),
  ]);
  invalidateServiceCache();
}

export { requirementKey };

/** Retrieves cached public services list for ultra-fast API and page rendering */
export async function getPublicServices() {
  const now = Date.now();
  if (publicServicesCache && (now - publicServicesCache.timestamp) < CACHE_TTL_MS) {
    return publicServicesCache.data;
  }

  await syncCatalog();
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      title: true,
      category: true,
      professionalFee: true,
      govtFee: true,
      govtFeeNote: true,
      sla: true,
      sacCode: true,
      requirements: {
        select: { key: true, label: true, required: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });

  publicServicesCache = { data: services, timestamp: now };
  return services;
}

export const getActiveService = cache(async (slug: string) => {
  let service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  if (!service && MASTER_SERVICES.some((s) => s.slug === slug)) {
    await syncCatalog();
    service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  }
  return service?.isActive ? service : null;
});

export const getServiceBySlug = cache(async (slug: string) => {
  let service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  if (!service && MASTER_SERVICES.some((s) => s.slug === slug)) {
    await syncCatalog();
    service = await prisma.service.findUnique({ where: { slug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
  }
  return service;
});
