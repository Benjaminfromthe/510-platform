const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const services = [
  {
    id: 1,
    name: 'Deep Home Cleaning',
    description: 'Detailed cleaning for kitchens, bathrooms, floors, and living areas.',
    price: 18000,
    duration: 120,
    category: 'OTHER',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Office Sanitization',
    description: 'Professional sanitization for desks, meeting rooms, and common areas.',
    price: 22000,
    duration: 90,
    category: 'OTHER',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Furniture Dusting & Polishing',
    description: 'Gentle furniture cleaning, polishing, and stain care for wooden and fabric pieces.',
    price: 15000,
    duration: 60,
    category: 'FURNITURE',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Electronics Surface Care',
    description: 'Safe cleaning for screens, keyboards, and electronic surfaces.',
    price: 12000,
    duration: 45,
    category: 'ELECTRONICS',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
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

  console.log(`Seeded ${services.length} services.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
