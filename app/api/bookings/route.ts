import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendBookingConfirmationToCustomer, sendBookingNotificationToAdmin } from "../../../lib/email";

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
  quoteDescription: z.string().min(10, "Please describe the cleaning needs in at least 10 characters."),
  propertySize: z.string().min(1, "Property size is required."),
  urgency: z.string().min(1, "Urgency is required."),
  totalPrice: z.coerce.number().nonnegative().optional().nullable(),
  quotedPrice: z.coerce.number().nonnegative().optional().nullable(),
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
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking data." }, { status: 400 });
    }

    const bookingDate = toBookingDate(parsed.data.scheduledDate, parsed.data.scheduledTime);

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: parsed.data.serviceId,
        quantity: parsed.data.quantity,
        addOns: parsed.data.addOns,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        scheduledDate: bookingDate,
        scheduledTime: bookingDate,
        status: "PENDING_QUOTE",
        address: parsed.data.address,
        notes: parsed.data.notes || null,
        quoteDescription: parsed.data.quoteDescription,
        propertySize: parsed.data.propertySize,
        urgency: parsed.data.urgency,
        totalPrice: parsed.data.totalPrice ?? null,
        quotedPrice: parsed.data.quotedPrice ?? null,
      },
    });

    await Promise.all([
      sendBookingNotificationToAdmin(booking),
      sendBookingConfirmationToCustomer(booking, parsed.data.email),
    ]);

    return NextResponse.json({ bookingId: booking.id }, { status: 201 });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
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
