export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Webhook } from "svix";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, message: "CLERK_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: true, skipped: true, message: "DATABASE_URL is not configured; webhook received but database sync was skipped." },
      { status: 200 }
    );
  }

  const payload = await req.text();
  const headerList = headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ ok: false, message: "Missing Svix headers." }, { status: 400 });
  }

  try {
    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: { email_addresses?: Array<{ email_address?: string }>; first_name?: string; last_name?: string; username?: string; phone_numbers?: Array<{ phone_number?: string }> } };

    if (evt.type !== "user.created") {
      return NextResponse.json({ ok: true, event: evt.type }, { status: 200 });
    }

    const email = evt.data.email_addresses?.[0]?.email_address ?? "";
    const name = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") || evt.data.username || "Clerk User";
    const phone = evt.data.phone_numbers?.[0]?.phone_number ?? "";

    if (!email) {
      return NextResponse.json({ ok: false, message: "No email address found in Clerk user payload." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name, phone },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          phone,
          role: "CUSTOMER",
        },
      });
    }

    return NextResponse.json({ ok: true, created: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook verification failed.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
