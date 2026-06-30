export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const schema = z.object({
  university: z.string().min(3, "University name is required"),
  agreed: z.literal(true, { errorMap: () => ({ message: "You must confirm you are a student" }) }),
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    // Use dynamic import to avoid build-time issues with clerkClient
    const { clerkClient } = await import("@clerk/nextjs/server");

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        isStudent: true,
        university: parsed.data.university,
        studentVerifiedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Student verification error:", error);
    return NextResponse.json({ error: "Unable to verify student status." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ isStudent: false }, { status: 200 });
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const user = await clerkClient.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;

    return NextResponse.json({
      isStudent: meta.isStudent === true,
      university: meta.university ?? null,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ isStudent: false }, { status: 200 });
  }
}
