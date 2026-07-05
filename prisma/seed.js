const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CAMPUS VERSION — electronics/devices only. No furniture.
const services = [
  {
    id: 1,
    name: 'Laptop & Computer Cleaning',
    description: 'Deep foam cleaning for laptops, keyboards, screens, and desktop computers.',
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
  {
    id: 3,
    name: 'TV & Screen Cleaning',
    description: 'Professional cleaning for TVs, monitors, and display screens of all sizes.',
    price: 500,
    duration: 25,
    category: 'ELECTRONICS',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
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

  // Remove old non-campus services (IDs 4 and above)
  await prisma.service.deleteMany({
    where: { id: { gt: 3 } },
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
