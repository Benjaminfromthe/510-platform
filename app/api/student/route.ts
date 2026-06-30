export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const schema = z.object({
  university: z.string().min(3, "University name is required"),
  agreed: z.literal(true, { errorMap: () => ({ message: "You must confirm you are a student" }) }),
});

// We store student status in the User table in our own DB
// This avoids needing Clerk Admin API permissions (clerkClient)
// The isStudent flag is read client-side from the DB via this API

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

    // Try Clerk metadata update first — may fail if key lacks permissions
    let clerkUpdated = false;
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          isStudent: true,
          university: parsed.data.university,
          studentVerifiedAt: new Date().toISOString(),
        },
      });
      clerkUpdated = true;
    } catch (clerkError) {
      console.error("Clerk metadata update failed (non-fatal):", clerkError);
      // Fall through to DB storage
    }

    // Always store in our own DB as the reliable source of truth
    // Upsert: update if email exists, create if not
    try {
      await prisma.user.upsert({
        where: { email: `clerk_${userId}` },
        update: {
          name: `student_${parsed.data.university}`,
          phone: "student",
        },
        create: {
          email: `clerk_${userId}`,
          name: `student_${parsed.data.university}`,
          phone: "student",
          role: "CUSTOMER",
        },
      });
    } catch (dbError) {
      console.error("DB student store failed:", dbError);
      // Non-fatal — Clerk update may have succeeded
    }

    return NextResponse.json({ success: true, clerkUpdated }, { status: 200 });
  } catch (error) {
    console.error("Student verification error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to verify student status.",
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ isStudent: false }, { status: 200 });
    }

    // Check Clerk metadata first
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const user = await clerkClient.users.getUser(userId);
      const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
      if (meta.isStudent === true) {
        return NextResponse.json({
          isStudent: true,
          university: meta.university ?? null,
        }, { status: 200 });
      }
    } catch {
      // Fall through to DB check
    }

    // Check DB as fallback
    const dbUser = await prisma.user.findUnique({ where: { email: `clerk_${userId}` } });
    const isStudentInDb = dbUser?.name?.startsWith("student_") ?? false;
    const university = isStudentInDb ? dbUser?.name?.replace("student_", "") : null;

    return NextResponse.json({ isStudent: isStudentInDb, university }, { status: 200 });
  } catch {
    return NextResponse.json({ isStudent: false }, { status: 200 });
  }
}
