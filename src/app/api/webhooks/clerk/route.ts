import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address || "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ");

    const role = (public_metadata && typeof public_metadata === "object" && "role" in public_metadata && 
                  (public_metadata.role === "admin" || public_metadata.role === "customer"))
                  ? (public_metadata.role as "admin" | "customer")
                  : "customer";

    await supabase.from("users").upsert(
      {
        clerk_id: id,
        email,
        full_name: fullName || null,
        avatar_url: image_url || null,
        role,
      },
      { onConflict: "clerk_id" }
    );
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address || "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ");

    const updateData: any = {
      email,
      full_name: fullName || null,
      avatar_url: image_url || null,
    };

    if (
      public_metadata &&
      typeof public_metadata === "object" &&
      "role" in public_metadata &&
      (public_metadata.role === "admin" || public_metadata.role === "customer")
    ) {
      updateData.role = public_metadata.role;
    }

    await supabase
      .from("users")
      .update(updateData)
      .eq("clerk_id", id);
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await supabase.from("users").delete().eq("clerk_id", id);
    }
  }

  return NextResponse.json({ success: true });
}
