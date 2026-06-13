export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingConfirmationToCustomer, sendBookingNotificationToAdmin } from "../../../lib/email";
import { prisma } from "../../../lib/prisma";

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
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking data." }, { status: 400 });
    }

    const bookingDate = toBookingDate(parsed.data.scheduledDate, parsed.data.scheduledTime);

    const booking = await prisma.booking.create({
      data: {
        userId: null,
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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;

    const where = {};

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
