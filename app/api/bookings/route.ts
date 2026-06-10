import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive("Service is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10),
  addOns: z.array(z.string()).optional().default([]),
  scheduledDate: z.string().min(1, "A date is required."),
  scheduledTime: z.string().min(1, "A time is required."),
  address: z.string().min(5, "Address is required."),
  notes: z.string().max(250).optional().or(z.literal("")),
  customerName: z.string().min(2, "Name is required."),
  phone: z.string().min(7, "Phone number is required."),
  email: z.string().email("A valid email is required."),
  totalPrice: z.coerce.number().nonnegative().optional(),
});

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

function toBookingDate(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid booking date/time.");
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid booking data." },
        { status: 400 }
      );
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const scheduledDateTime = toBookingDate(parsed.data.scheduledDate, parsed.data.scheduledTime);

    const conflict = await prisma.booking.findFirst({
      where: {
        serviceId: parsed.data.serviceId,
        scheduledDate: scheduledDateTime,
        scheduledTime: scheduledDateTime,
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "That time slot is already booked for this service." },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: parsed.data.serviceId,
        quantity: parsed.data.quantity,
        addOns: parsed.data.addOns,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        scheduledDate: scheduledDateTime,
        scheduledTime: scheduledDateTime,
        status: "PENDING",
        address: parsed.data.address,
        notes: parsed.data.notes || null,
        totalPrice: parsed.data.totalPrice ?? 0,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;

    const role = getRole();
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;

    const where = role === "ADMIN"
      ? {}
      : {
          OR: [
            { userId },
            { email: userEmail || undefined },
          ],
        };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error("Booking GET error:", error);
    return NextResponse.json({ error: "Unable to fetch bookings." }, { status: 500 });
  }
}
