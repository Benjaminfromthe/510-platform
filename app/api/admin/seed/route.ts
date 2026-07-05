export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Campus services — triggered once to update the DB
const campusServices = [
  {
    id: 1,
    name: 'Laptop & Computer Cleaning',
    description: 'Deep foam cleaning for laptops, keyboards, screens, and desktop computers.',
    price: 500,
    duration: 30,
    category: 'ELECTRONICS' as const,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Phone & Tablet Cleaning',
    description: 'Safe professional cleaning for smartphones, tablets, and accessories.',
    price: 500,
    duration: 20,
    category: 'ELECTRONICS' as const,
    imageUrl: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'TV & Screen Cleaning',
    description: 'Professional cleaning for TVs, monitors, and display screens of all sizes.',
    price: 500,
    duration: 25,
    category: 'ELECTRONICS' as const,
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Campus Desk & Table Cleaning',
    description: 'Foam cleaning for study desks, tables, and workstations on campus.',
    price: 500,
    duration: 30,
    category: 'FURNITURE' as const,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: 'Campus Chair Cleaning',
    description: 'Thorough cleaning for lecture hall chairs, office chairs, and study seats.',
    price: 500,
    duration: 25,
    category: 'FURNITURE' as const,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
];

export async function GET(request: Request) {
  // Protect with a secret key — set SEED_SECRET in Vercel environment variables
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.SEED_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "SEED_SECRET environment variable not configured." }, { status: 500 });
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const results = [];

    for (const service of campusServices) {
      const upserted = await prisma.service.upsert({
        where: { id: service.id },
        update: service,
        create: service,
      });
      results.push(upserted.name);
    }

    // Delete any old services with IDs higher than 5 (non-campus services)
    await prisma.service.deleteMany({
      where: { id: { gt: 5 } },
    });

    return NextResponse.json({
      success: true,
      message: `Campus services seeded successfully.`,
      services: results,
    }, { status: 200 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Seed failed.",
    }, { status: 500 });
  }
}
