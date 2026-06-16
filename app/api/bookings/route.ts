export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingConfirmationToCustomer, sendBookingNotificationToAdmin } from "../../../lib/email";
import { prisma } from "../../../lib/prisma";

const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive("Service is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10).optional().default(1),
  addOns: z.array(z.string()).optional().default([]),
  scheduledDate: z.string().min(1, "A date is required.").optional(),
  date: z.string().min(1, "A date is required.").optional(),
  scheduledTime: z.string().min(1, "A time is required.").optional(),
  time: z.string().min(1, "A time is required.").optional(),
  address: z.string().min(5, "Address is required.").optional(),
  notes: z.string().max(250).optional().or(z.literal("")).optional().default(""),
  customerName: z.string().min(2, "Name is required.").optional(),
  name: z.string().min(2, "Name is required.").optional(),
  phone: z.string().min(7, "Phone number is required.").optional(),
  email: z.string().email("A valid email is required.").optional(),
  quoteDescription: z.string().min(10, "Please describe the cleaning needs in at least 10 characters.").optional(),
  description: z.string().min(10, "Please describe the cleaning needs in at least 10 characters.").optional(),
  propertySize: z.string().optional().or(z.literal("")).nullable().optional(),
  totalPrice: z.coerce.number().nonnegative().optional().nullable(),
  quotedPrice: z.coerce.number().nonnegative().optional().nullable(),
});

function toBookingDate(date: string, time: string) {
  const normalizedTime = time.trim().toUpperCase();
  const match = normalizedTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (!match) {
    throw new Error("Invalid booking time format. Use 10:00 or 10AM.");
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;

  const value = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid booking date/time.");
  }

  return value;
}

export async function POST(request: Request) {
  try {
    let userId: string | null = null;
    try {
      const { auth } = await import("@clerk/nextjs/server");
      ({ userId } = await auth());
    } catch {
      userId = null;
    }

    const body = await request.json();

    console.log("Booking POST body:", body);

    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking data." }, { status: 400 });
    }

    const scheduledDate = parsed.data.scheduledDate || parsed.data.date;
    const scheduledTime = parsed.data.scheduledTime || parsed.data.time;
    const customerName = parsed.data.customerName || parsed.data.name;
    const quoteDescription = parsed.data.quoteDescription || parsed.data.description;

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: "A valid date and time are required." }, { status: 400 });
    }

    if (!customerName || !parsed.data.phone || !parsed.data.email || !parsed.data.address) {
      return NextResponse.json({ error: "Name, phone, email, and address are required." }, { status: 400 });
    }

    const bookingDate = toBookingDate(scheduledDate, scheduledTime);

    const booking = await prisma.booking.create({
      data: {
        userId: userId ?? null,
        serviceId: parsed.data.serviceId,
        quantity: parsed.data.quantity ?? 1,
        addOns: parsed.data.addOns,
        customerName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        scheduledDate: bookingDate,
        scheduledTime: bookingDate,
        status: "PENDING_QUOTE",
        address: parsed.data.address,
        notes: parsed.data.notes || null,
        quoteDescription: quoteDescription || "No description provided.",
        propertySize: parsed.data.propertySize || "",
        urgency: "",
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
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to create booking.",
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    let userId: string | null = null;
    try {
      const { auth } = await import("@clerk/nextjs/server");
      ({ userId } = await auth());
    } catch {
      userId = null;
    }
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;

    const where = { userId };

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
