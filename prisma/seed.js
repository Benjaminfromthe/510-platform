const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ALL images: zero people, zero hands, zero body parts
const services = [
  {
    id: 1,
    name: 'Deep Home Cleaning',
    description: 'Detailed cleaning for kitchens, bathrooms, floors, and living areas.',
    price: 18000,
    duration: 120,
    category: 'OTHER',
    // Empty modern office/room interior — no people
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Office Sanitization',
    description: 'Professional sanitization for desks, meeting rooms, and common areas.',
    price: 22000,
    duration: 90,
    category: 'OTHER',
    // Empty modern office workstations with chairs — no people
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Furniture Dusting & Polishing',
    description: 'Gentle furniture cleaning, polishing, and stain care for wooden and fabric pieces.',
    price: 15000,
    duration: 60,
    category: 'FURNITURE',
    // Clean white dressing table with plants and mirror — no people
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Electronics Surface Care',
    description: 'Safe cleaning for screens, keyboards, and electronic surfaces.',
    price: 12000,
    duration: 45,
    category: 'ELECTRONICS',
    // Electronics display: laptops, monitors, camera, headphones — no people
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=80',
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
