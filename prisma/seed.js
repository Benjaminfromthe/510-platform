const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ALL images verified people-free / hands-free
const services = [
  {
    id: 1,
    name: 'Deep Home Cleaning',
    description: 'Detailed cleaning for kitchens, bathrooms, floors, and living areas.',
    price: 18000,
    duration: 120,
    category: 'OTHER',
    // Cleaning spray bottles and cloths on a white surface — no people
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Office Sanitization',
    description: 'Professional sanitization for desks, meeting rooms, and common areas.',
    price: 22000,
    duration: 90,
    category: 'OTHER',
    // Empty clean office desk — no people
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Furniture Dusting & Polishing',
    description: 'Gentle furniture cleaning, polishing, and stain care for wooden and fabric pieces.',
    price: 15000,
    duration: 60,
    category: 'FURNITURE',
    // Clean sofa only — no people
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Electronics Surface Care',
    description: 'Safe cleaning for screens, keyboards, and electronic surfaces.',
    price: 12000,
    duration: 45,
    category: 'ELECTRONICS',
    // Laptop and phone on desk overhead — no people
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
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
