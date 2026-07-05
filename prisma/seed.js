const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CAMPUS VERSION — only what students need: Laptop + Phone
const services = [
  {
    id: 1,
    name: 'Laptop & Computer Cleaning',
    description: 'Deep foam cleaning for laptops, keyboards, and screens. Safe for all brands.',
    price: 500,
    duration: 30,
    category: 'ELECTRONICS',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Phone & Tablet Cleaning',
    description: 'Safe professional cleaning for smartphones, tablets, and accessories.',
    price: 500,
    duration: 20,
    category: 'ELECTRONICS',
    imageUrl: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=800&q=80',
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }

  // Remove all other services — only Laptop and Phone for campus
  await prisma.service.deleteMany({
    where: { id: { gt: 2 } },
  });

  console.log(`Campus services seeded: ${services.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
