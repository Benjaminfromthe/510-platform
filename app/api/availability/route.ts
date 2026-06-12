import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function getMonthBounds(month: string) {
  const [yearValue, monthValue] = month.split("-").map(Number);
  const year = Number.isFinite(yearValue) ? yearValue : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthValue) ? monthValue : new Date().getMonth() + 1;

  const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));

  return { start, end };
}

function getStatus(count: number) {
  if (count >= 5) return "full";
  if (count >= 3) return "limited";
  return "available";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const { start, end } = getMonthBounds(month);

    const bookings = await prisma.booking.findMany({
      where: {
        scheduledDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        scheduledDate: true,
      },
    });

    const counts = new Map<string, number>();
    bookings.forEach((booking) => {
      const dateKey = booking.scheduledDate.toISOString().slice(0, 10);
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    });

    const availability = [] as Array<{ date: string; bookings: number; status: "available" | "limited" | "full" }>;
    const cursor = new Date(start);

    while (cursor < end) {
      const dateKey = cursor.toISOString().slice(0, 10);
      const bookingsCount = counts.get(dateKey) ?? 0;
      availability.push({
        date: dateKey,
        bookings: bookingsCount,
        status: getStatus(bookingsCount),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return NextResponse.json({ month, availability }, { status: 200 });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json({ error: "Unable to fetch availability." }, { status: 500 });
  }
}
