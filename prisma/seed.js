const { PrismaClient } = require('@prisma/client');
const catalog = require('./service-catalog.json');

const prisma = new PrismaClient();

const services = catalog.map((service) => ({
  slug: service.slug,
  title: service.title,
  category: service.category,
  startingPrice: service.price,
  baseFee: service.price,
  govtFeeNote: service.govtFee,
  sla: service.sla,
  sacCode: service.sacCode,
  description: service.desc,
  documentChecklist: service.docs
    .split(',')
    .map((document) => document.trim())
    .filter(Boolean),
  recommendationTags: [service.category, service.slug],
  intakeSchema: {
    fields: ['businessName', 'location', 'entityType', 'employeeCount', 'businessActivity'],
    stateAware: true,
  },
}));

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        category: service.category,
        startingPrice: service.startingPrice,
        govtFeeNote: service.govtFeeNote,
        sla: service.sla,
        sacCode: service.sacCode,
        description: service.description,
        intakeSchema: service.intakeSchema,
        documentChecklist: service.documentChecklist,
        recommendationTags: service.recommendationTags,
        isActive: true,
      },
      create: {
        slug: service.slug,
        title: service.title,
        category: service.category,
        startingPrice: service.startingPrice,
        govtFeeNote: service.govtFeeNote,
        sla: service.sla,
        sacCode: service.sacCode,
        description: service.description,
        intakeSchema: service.intakeSchema,
        documentChecklist: service.documentChecklist,
        recommendationTags: service.recommendationTags,
        isActive: true,
      },
    });

    await prisma.servicePricing.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        category: service.category,
        baseFee: service.baseFee,
        govtFeeNote: service.govtFeeNote,
        isActive: true,
      },
      create: {
        slug: service.slug,
        title: service.title,
        category: service.category,
        baseFee: service.baseFee,
        govtFeeNote: service.govtFeeNote,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${services.length} synthetic services and pricing entries.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
