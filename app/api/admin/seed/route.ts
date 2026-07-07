export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Campus: Laptop + Phone only
const campusServices = [
  {
    id: 1,
    name: 'Laptop & Computer Cleaning',
    description: 'Deep foam cleaning for laptops, keyboards, and screens. Safe for all brands.',
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
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.SEED_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "SEED_SECRET not configured." }, { status: 500 });
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // Create Review table if it doesn't exist (safe to run multiple times)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" SERIAL NOT NULL,
        "userId" TEXT,
        "customerName" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT NOT NULL,
        "serviceName" TEXT NOT NULL DEFAULT 'Cleaning Service',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approved" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
      )
    `);

    const results = [];
    for (const service of campusServices) {
      const upserted = await prisma.service.upsert({
        where: { id: service.id },
        update: service,
        create: service,
      });
      results.push(upserted.name);
    }

    // Remove everything except Laptop (1) and Phone (2)
    await prisma.service.deleteMany({
      where: { id: { gt: 2 } },
    });

    return NextResponse.json({
      success: true,
      message: 'Campus services seeded + Review table created.',
      services: results,
    }, { status: 200 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Seed failed.",
    }, { status: 500 });
  }
}
