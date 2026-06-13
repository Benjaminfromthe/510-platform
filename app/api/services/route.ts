import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";
import { fallbackServices } from "../../../lib/seedData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ services: [] }, { status: 200 });
    }

    const services = await prisma.service.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch services:", error);

    return NextResponse.json({ services: fallbackServices }, { status: 200 });
  }
}
