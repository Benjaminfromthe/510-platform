import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ services: [] }, { status: 200 });
    }

    const services = await prisma.service.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch services:", error);

    return NextResponse.json({ services: [] }, { status: 200 });
  }
}
