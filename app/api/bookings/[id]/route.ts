import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const statusSchema = z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const updateBookingSchema = z.object({
  status: statusSchema.optional(),
  staffId: z.coerce.number().int().positive().optional().nullable(),
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: Number(params.id) } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const role = getRole();
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;

    const isOwner = booking.userId === userId || booking.email === userEmail;
    if (role !== "ADMIN" && !isOwner) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error("Booking detail GET error:", error);
    return NextResponse.json({ error: "Unable to fetch booking details." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update data." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: Number(params.id) } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const role = getRole();
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;
    const isOwner = booking.userId === userId || booking.email === userEmail;

    const canCancel = role === "ADMIN" || (isOwner && parsed.data.status === "CANCELLED" && booking.status === "PENDING");
    if (!canCancel) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id: Number(params.id) },
      data: {
        status: parsed.data.status ?? booking.status,
        staffId: parsed.data.staffId ?? booking.staffId,
      },
    });

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Unable to update booking status." }, { status: 500 });
  }
}
