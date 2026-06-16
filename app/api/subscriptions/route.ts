export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json();
    const plan = String(body.plan || "WEEKLY").toUpperCase();

    const totalCleanings = plan === "WEEKLY" ? 4 : plan === "MONTHLY" ? 4 : 8;
    const nextCleaningDate = new Date();
    nextCleaningDate.setDate(nextCleaningDate.getDate() + 7);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: plan as any,
        status: "ACTIVE",
        startDate: new Date(),
        nextCleaningDate,
        totalCleanings,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Subscription POST error:", error);
    return NextResponse.json({ error: "Unable to create subscription." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error("Subscription GET error:", error);
    return NextResponse.json({ error: "Unable to fetch subscription." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json();
    const status = String(body.status || "PAUSED").toUpperCase();

    const subscription = await prisma.subscription.findFirst({ where: { userId, status: { in: ["ACTIVE", "PAUSED"] } }, orderBy: { createdAt: "desc" } });
    if (!subscription) return NextResponse.json({ error: "No active subscription found." }, { status: 404 });

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: status as any },
    });

    return NextResponse.json({ subscription: updated }, { status: 200 });
  } catch (error) {
    console.error("Subscription PATCH error:", error);
    return NextResponse.json({ error: "Unable to update subscription." }, { status: 500 });
  }
}
