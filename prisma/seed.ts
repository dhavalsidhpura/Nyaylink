@'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NyayaLink Database Seeding...');

  try {
    if (prisma.ledgerEntry) await prisma.ledgerEntry.deleteMany({});
    if (prisma.vaultDocument) await prisma.vaultDocument.deleteMany({});
    if (prisma.document) await prisma.document.deleteMany({});
    if (prisma.order) await prisma.order.deleteMany({});
  } catch (e) {
    console.log('Clearing existing tables...');
  }

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'NYA-2026-84920',
      srn: 'MCA-SPICE-2026-9941',
      serviceTitle: 'Private Limited Company Registration',
      serviceSlug: 'private-limited-company',
      clientName: 'Dhaval Sidhpura',
      clientEmail: 'dhaval@mobizspare.com',
      clientPhone: '+919920054785',
      companyName: 'Acme Technologies Pvt Ltd',
      state: 'MH',
      amount: 8258,
      baseFee: 5000,
      govtFee: 2000,
      gstAmount: 1258,
      status: 'QUERY_RAISED',
      paymentStatus: 'PAID',
      assignedTo: 'CA Rajiv Sharma (Mumbai Desk)',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'NYA-2026-11029',
      srn: 'GST-REG-2026-1102',
      serviceTitle: 'Online GST Registration',
      serviceSlug: 'gst-registration',
      clientName: 'Dhaval Sidhpura',
      clientEmail: 'dhaval@mobizspare.com',
      clientPhone: '+919920054785',
      companyName: 'Bluetail Retail LLP',
      state: 'MH',
      amount: 1769,
      baseFee: 1499,
      govtFee: 0,
      gstAmount: 270,
      status: 'APPROVED',
      paymentStatus: 'PAID',
      assignedTo: 'CS Neha Verma',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'NYA-2026-55412',
      srn: 'IP-TM-2026-4412',
      serviceTitle: 'Online Trademark Registration',
      serviceSlug: 'trademark-registration',
      clientName: 'Pushpa Sidhpura',
      clientEmail: 'finance@mobizspare.com',
      clientPhone: '+919920054785',
      companyName: 'Best Time Deals',
      state: 'MH',
      amount: 7669,
      baseFee: 1999,
      govtFee: 4500,
      gstAmount: 1170,
      status: 'DOCS_PENDING',
      paymentStatus: 'PAID',
      assignedTo: 'Advocate Suresh Mehta',
    },
  });

  console.log(`✅ Seeded 3 active orders: ${order1.orderNumber}, ${order2.orderNumber}, ${order3.orderNumber}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@ | Out-File -FilePath prisma/seed.js -Encoding utf8