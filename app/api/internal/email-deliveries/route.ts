import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { internalEmailDeliverySchema } from "@/domain/notifications/schemas";
import { sendNotificationEmail } from "@/server/email/send-email";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // 1. Verify internal secret authentication
  const expectedSecret =
    process.env.EMAIL_DELIVERY_INTERNAL_SECRET || process.env.CRON_SECRET;
  const providedAuth =
    request.headers.get("x-internal-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Internal delivery is not configured" },
      { status: 503 }
    );
  }
  if (providedAuth !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized internal delivery request" },
      { status: 401 }
    );
  }

  // 2. Validate payload
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = internalEmailDeliverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const {
    deliveryId,
    recipientEmail,
    recipientName,
    category,
    subject,
    payload,
    unsubscribeToken,
  } = parsed.data;

  const adminClient: SupabaseClient = createAdminClient();
  const startTime = new Date().toISOString();

  // 3. Perform email delivery via Nodemailer
  const sendResult = await sendNotificationEmail({
    to: recipientEmail,
    recipientName,
    category,
    subject,
    payload,
    unsubscribeToken,
  });

  const completedTime = new Date().toISOString();

  // 4. Record delivery attempt in database
  await adminClient.from("notification_delivery_attempts").insert({
    delivery_id: deliveryId,
    attempt_number: 1, // Will be incremented if retried
    started_at: startTime,
    completed_at: completedTime,
    outcome: sendResult.outcome,
    error_category: sendResult.errorCode || null,
    provider_response_code: sendResult.providerResponse || null,
    provider_message_id: sendResult.providerMessageId || null,
    error_message: sendResult.errorMessage || null,
  });

  // 5. Update delivery record status
  if (sendResult.success) {
    await adminClient
      .from("notification_deliveries")
      .update({
        status: "SENT",
        provider_message_id: sendResult.providerMessageId || null,
        sent_at: completedTime,
        last_attempt_at: completedTime,
        updated_at: completedTime,
      })
      .eq("id", deliveryId);

    return NextResponse.json({
      success: true,
      deliveryId,
      messageId: sendResult.providerMessageId,
      outcome: "success",
    });
  } else {
    const isPermanent = sendResult.outcome === "permanent_failure";
    const nextAttempt = isPermanent
      ? null
      : new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins backoff

    await adminClient
      .from("notification_deliveries")
      .update({
        status: isPermanent ? "FAILED" : "DEFERRED",
        next_attempt_at: nextAttempt,
        last_attempt_at: completedTime,
        failure_code: sendResult.errorCode || null,
        error_message: sendResult.errorMessage || null,
        attempt_count: 1,
        updated_at: completedTime,
      })
      .eq("id", deliveryId);

    return NextResponse.json(
      {
        success: false,
        deliveryId,
        outcome: sendResult.outcome,
        errorCode: sendResult.errorCode,
        errorMessage: sendResult.errorMessage,
      },
      { status: isPermanent ? 422 : 503 }
    );
  }
}
