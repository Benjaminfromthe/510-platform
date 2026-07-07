export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "PENDING_QUOTE"]);
const updateBookingSchema = z.object({
  status: statusSchema.optional(),
  staffId: z.coerce.number().int().positive().optional().nullable(),
  quotedPrice: z.coerce.number().nonnegative().optional().nullable(),
  beforePhotoUrl: z.string().url().optional().nullable(),
  afterPhotoUrl: z.string().url().optional().nullable(),
  reportNote: z.string().max(600).optional().nullable(),
});

function getRole(sessionClaims: Record<string, unknown>): string {
  const meta = (sessionClaims?.metadata ?? sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  return String(meta?.role ?? sessionClaims?.role ?? "CUSTOMER").toUpperCase();
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, sessionClaims } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: Number(params.id) } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const role = getRole((sessionClaims ?? {}) as Record<string, unknown>);
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
    const { userId, sessionClaims } = auth();
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

    const role = getRole((sessionClaims ?? {}) as Record<string, unknown>);
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;
    const isOwner = booking.userId === userId || booking.email === userEmail;

    // Admins can do anything; customers can only cancel their own PENDING bookings
    const isAdmin = role === "ADMIN";
    const canCustomerCancel = isOwner && parsed.data.status === "CANCELLED" && booking.status === "PENDING";

    if (!isAdmin && !canCustomerCancel) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id: Number(params.id) },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.staffId !== undefined ? { staffId: parsed.data.staffId } : {}),
        // Admin-only fields
        ...(isAdmin && parsed.data.quotedPrice !== undefined ? { quotedPrice: parsed.data.quotedPrice } : {}),
        ...(isAdmin && parsed.data.beforePhotoUrl !== undefined ? { beforePhotoUrl: parsed.data.beforePhotoUrl } : {}),
        ...(isAdmin && parsed.data.afterPhotoUrl !== undefined ? { afterPhotoUrl: parsed.data.afterPhotoUrl } : {}),
        ...(isAdmin && parsed.data.reportNote !== undefined ? { reportNote: parsed.data.reportNote } : {}),
      },
    });

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Unable to update booking status." }, { status: 500 });
  }
}
