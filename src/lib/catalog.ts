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

export const SLUG_ALIASES: Record<string, string> = {
  'proprietorship-setup': 'business-registration-license',
  'director-din-ekyc': 'dir-3-kyc-director-filing',
  'gst-nil-return': 'gst-nil-return-filing',
  'gstr-9-annual-return': 'gstr-9-annual-filing',
  'tds-tcs-return': 'tds-return-filing',
  'income-tax-return': 'income-tax-return-itr',
  'tax-planning': 'virtual-cfo-services',
  'project-report': 'scale-your-business',
  'corporate-compliance-governance': 'mca-inc-20a-commencement-of-business',
  'form-aoc-4-filing': 'mca-inc-20a-commencement-of-business',
  'appointment-removal-director': 'private-limited-company',
  'registered-office-change': 'private-limited-company',
  'change-company-name': 'private-limited-company',
  'company-llp-winding-up': 'private-limited-company',
  'patent-filing': 'copyright-registration',
};

export function resolveSlug(slug: string): string {
  return SLUG_ALIASES[slug] || slug;
}

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
          console.warn('[catalog] Error creating service row:', item.slug, err?.message);
        }
      }
      isCatalogSynced = true;
    } catch (err: any) {
      console.warn('[catalog] syncCatalog encountered error, will use static fallback:', err?.message);
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

  try {
    await prisma.$transaction([
      prisma.serviceDocRequirement.deleteMany({ where: { serviceId } }),
      ...(newReqs.length > 0 ? [prisma.serviceDocRequirement.createMany({ data: newReqs })] : []),
    ]);
  } catch (err: any) {
    console.warn('[catalog] Failed to sync service requirements:', err?.message);
  }
  invalidateServiceCache();
}

export { requirementKey };

export function buildStaticServiceFallback(slug: string) {
  const item = MASTER_SERVICES.find((s) => s.slug === slug);
  if (!item) return null;
  const docs = STRUCTURED_SERVICES[slug]?.specificDocs ?? item.docs.split(',').map((d) => d.trim()).filter(Boolean);
  return {
    id: `static-${item.slug}`,
    slug: item.slug,
    title: item.title,
    category: item.category,
    professionalFee: item.price as any,
    govtFee: 0 as any,
    govtFeeNote: item.govtFee,
    gstRate: 18 as any,
    sla: item.sla,
    sacCode: item.sacCode,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: docs.map((label, i) => ({
      id: `req-${item.slug}-${i}`,
      serviceId: `static-${item.slug}`,
      key: requirementKey(label, i),
      label,
      required: true,
      sortOrder: i,
    })),
  };
}

/** Retrieves cached public services list for ultra-fast API and page rendering */
export async function getPublicServices() {
  const now = Date.now();
  if (publicServicesCache && (now - publicServicesCache.timestamp) < CACHE_TTL_MS) {
    return publicServicesCache.data;
  }

  try {
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

    if (services && services.length > 0) {
      publicServicesCache = { data: services, timestamp: now };
      return services;
    }
  } catch (err: any) {
    console.warn('[catalog] Database query failed in getPublicServices, using static master list:', err?.message);
  }

  // Fallback to static master catalog so UI never throws 500
  const staticServices = MASTER_SERVICES.map((s) => {
    const docs = STRUCTURED_SERVICES[s.slug]?.specificDocs ?? s.docs.split(',').map((d) => d.trim()).filter(Boolean);
    return {
      slug: s.slug,
      title: s.title,
      category: s.category,
      professionalFee: s.price,
      govtFee: 0,
      govtFeeNote: s.govtFee,
      sla: s.sla,
      sacCode: s.sacCode,
      requirements: docs.map((label, i) => ({
        key: requirementKey(label, i),
        label,
        required: true,
      })),
    };
  });
  publicServicesCache = { data: staticServices, timestamp: now };
  return staticServices;
}

export const getActiveService = cache(async (slug: string) => {
  const targetSlug = resolveSlug(slug);
  try {
    let service = await prisma.service.findUnique({ where: { slug: targetSlug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
    if (!service && MASTER_SERVICES.some((s) => s.slug === targetSlug)) {
      await syncCatalog().catch(() => {});
      service = await prisma.service.findUnique({ where: { slug: targetSlug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
    }
    if (service) return service.isActive ? service : null;
  } catch (err: any) {
    console.warn(`[catalog] Failed DB lookup for active service ${targetSlug}:`, err?.message);
  }
  return buildStaticServiceFallback(targetSlug);
});

export const getServiceBySlug = cache(async (slug: string) => {
  const targetSlug = resolveSlug(slug);
  try {
    let service = await prisma.service.findUnique({ where: { slug: targetSlug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
    if (!service && MASTER_SERVICES.some((s) => s.slug === targetSlug)) {
      await syncCatalog().catch(() => {});
      service = await prisma.service.findUnique({ where: { slug: targetSlug }, include: { requirements: { orderBy: { sortOrder: 'asc' } } } });
    }
    if (service) return service;
  } catch (err: any) {
    console.warn(`[catalog] Failed DB lookup for service ${targetSlug}:`, err?.message);
  }
  return buildStaticServiceFallback(targetSlug);
});
