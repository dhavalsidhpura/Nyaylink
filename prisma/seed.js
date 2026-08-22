const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const services = [
  {
    slug: 'private-limited-company',
    title: 'Private Limited Company Registration',
    category: 'company-reg',
    startingPrice: 6999,
    baseFee: 6999,
    govtFeeNote: 'MCA fee may be nil within applicable capital limits; state stamp duty and taxes may apply.',
    sla: '7–10 working days, subject to government processing and document readiness',
    sacCode: '998221',
  },
  {
    slug: 'llp-registration',
    title: 'Limited Liability Partnership Registration',
    category: 'company-reg',
    startingPrice: 4999,
    baseFee: 4999,
    govtFeeNote: 'Government filing, stamp duty, and taxes depend on the state and contribution.',
    sla: '10–14 working days, subject to government processing and document readiness',
    sacCode: '998221',
  },
  {
    slug: 'gst-registration',
    title: 'GST Registration',
    category: 'tax-accounting',
    startingPrice: 1999,
    baseFee: 1999,
    govtFeeNote: 'Government portal fee is generally not charged for normal registration; taxes may apply.',
    sla: '5–10 working days, subject to verification and government processing',
    sacCode: '998221',
  },
  {
    slug: 'trademark-registration',
    title: 'Trademark Registration',
    category: 'trademark-ipr',
    startingPrice: 1999,
    baseFee: 1999,
    govtFeeNote: 'Official trademark fee varies by applicant type and class; taxes may apply.',
    sla: 'Filing preparation in 3–7 working days; registry timelines vary',
    sacCode: '998221',
  },
];

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

  console.log(`Seeded ${services.length} synthetic services.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
