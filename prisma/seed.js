// Development seed. Idempotent (upserts), never deletes data, and refuses to run in production.
//   npx prisma db seed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PRACTICE_AREAS = [
  ['corporate-commercial', 'Corporate & Commercial'],
  ['civil-litigation', 'Civil Litigation'],
  ['criminal', 'Criminal Law'],
  ['family-matrimonial', 'Family & Matrimonial'],
  ['property-real-estate', 'Property & Real Estate'],
  ['tax-gst', 'Tax & GST'],
  ['ip-trademark', 'Intellectual Property & Trademarks'],
  ['labour-employment', 'Labour & Employment'],
  ['consumer', 'Consumer Protection'],
  ['cheque-bounce', 'Cheque Bounce (NI Act s.138)'],
  ['cyber-it', 'Cyber & IT Law'],
  ['insolvency', 'Insolvency & Bankruptcy'],
];

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== '1') {
    throw new Error('Refusing to seed a production database. Set ALLOW_PROD_SEED=1 to override.');
  }
  console.log('🌱 Seeding NyayaLink development data...');

  for (const [slug, name] of PRACTICE_AREAS) {
    await prisma.practiceArea.upsert({ where: { slug }, create: { slug, name }, update: { name } });
  }

  const password = await bcrypt.hash('Password@123', 12);
  const upsertUser = (email, data) =>
    prisma.user.upsert({ where: { email }, create: { email, password, ...data }, update: {} });

  const admin = await upsertUser('admin@nyayalink.local', { name: 'Super Admin', role: 'SUPER_ADMIN' });
  const ca = await upsertUser('ca.lead@nyayalink.local', { name: 'CA Rajiv Sharma', role: 'CA_CS_LEAD' });
  await upsertUser('finance@nyayalink.local', { name: 'Finance Desk', role: 'FINANCE_MANAGER' });
  const client = await upsertUser('client@nyayalink.local', { name: 'Demo Client', role: 'CLIENT', state: 'MH' });
  const lawyerUser = await upsertUser('advocate@nyayalink.local', { name: 'Adv. Priya Deshmukh', role: 'LAWYER' });

  const service = await prisma.service.upsert({
    where: { slug: 'private-limited-company' },
    update: {},
    create: {
      slug: 'private-limited-company',
      title: 'Private Limited Company Registration',
      category: 'company-reg',
      professionalFee: 6999,
      govtFee: 0,
      govtFeeNote: '₹0 MCA fee (capital ≤ ₹15L) + state stamp duty at actuals',
      sla: '7 - 10 Working Days',
      requirements: {
        create: [
          { key: 'director-pan', label: 'PAN card of all directors', sortOrder: 0 },
          { key: 'director-aadhaar', label: 'Aadhaar of all directors', sortOrder: 1 },
          { key: 'address-proof', label: 'Registered office address proof (utility bill < 2 months old)', sortOrder: 2 },
          { key: 'noc', label: 'NOC from property owner', sortOrder: 3 },
        ],
      },
    },
  });

  const existingOrder = await prisma.order.findFirst({ where: { clientId: client.id } });
  if (!existingOrder) {
    await prisma.order.create({
      data: {
        orderNumber: 'NYA-DEMO-0001',
        serviceId: service.id,
        clientId: client.id,
        assignedCAId: ca.id,
        professionalFee: 6999,
        govtFee: 0,
        gstAmount: 1259.82,
        totalAmount: 8258.82,
        amountPaid: 0,
        clientState: 'MH',
        status: 'PENDING_PAYMENT',
        intakeData: { applicantName: 'Demo Client', entityName: 'Acme Ventures Private Limited' },
        statusLogs: { create: { status: 'PENDING_PAYMENT', remarks: 'Seeded demo order.', actorId: admin.id } },
        payments: {
          create: { kind: 'FULL', amount: 8258.82, taxableAmount: 6999, gstAmount: 1259.82, description: 'Private Limited Company Registration (NYA-DEMO-0001)' },
        },
      },
    });
  }

  const profile = await prisma.lawyerProfile.upsert({
    where: { userId: lawyerUser.id },
    update: {},
    create: {
      userId: lawyerUser.id,
      slug: 'priya-deshmukh',
      barCouncil: 'Bar Council of Maharashtra & Goa',
      enrollmentNo: 'MAH/1234/2012',
      enrollmentYear: 2012,
      verification: 'VERIFIED',
      verifiedAt: new Date(),
      bio: 'Practising before the Bombay High Court and NCLT Mumbai since 2012, advising startups and SMEs on shareholder agreements, commercial contracts and corporate disputes.',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Marathi'],
      courts: ['Bombay High Court', 'NCLT Mumbai'],
      consultationFee: 1500,
      consultationMinutes: 30,
      modes: ['VIDEO', 'PHONE'],
      practiceAreas: { connect: [{ slug: 'corporate-commercial' }, { slug: 'ip-trademark' }] },
      availability: {
        create: [1, 2, 3, 4, 5].flatMap((weekday) => [
          { weekday, startMinute: 600, endMinute: 780 },
          { weekday, startMinute: 900, endMinute: 1080 },
        ]),
      },
    },
  });

  console.log('✅ Done. All demo accounts use password Password@123 (or sign in with an email OTP):');
  console.log('   admin@nyayalink.local · ca.lead@nyayalink.local · finance@nyayalink.local');
  console.log('   client@nyayalink.local · advocate@nyayalink.local');
  console.log(`   Public lawyer profile: /vakil/${profile.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
