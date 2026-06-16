import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

function getRole() {
  const authResult = auth() as { sessionClaims?: any };
  const sessionClaims = authResult.sessionClaims || {};

  return String(
    sessionClaims?.metadata?.role ||
      sessionClaims?.role ||
      sessionClaims?.publicMetadata?.role ||
      "CUSTOMER"
  ).toUpperCase();
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (getRole() !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const staff = await prisma.staff.findMany({
      orderBy: { id: "asc" },
      select: { id: true, userId: true },
    });

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Unable to fetch staff." }, { status: 500 });
  }
}
