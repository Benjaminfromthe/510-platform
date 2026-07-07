export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500),
  serviceName: z.string().optional().default("Cleaning Service"),
  clerkUserId: z.string().optional(),
});

// GET — public, returns approved reviews
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    // Table might not exist yet — return empty instead of crashing
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }
}

// POST — submit a new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    let userId: string | null = parsed.data.clerkUserId ?? null;
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { userId: serverUserId } = auth();
      if (serverUserId) userId = serverUserId;
    } catch {
      // non-fatal
    }

    const review = await prisma.review.create({
      data: {
        userId,
        customerName: parsed.data.customerName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        serviceName: parsed.data.serviceName,
        approved: true,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({
      error: "Unable to submit review. Please try again.",
    }, { status: 500 });
  }
}
