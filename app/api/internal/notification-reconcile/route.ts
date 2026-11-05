import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const expectedSecret =
    process.env.CRON_SECRET || process.env.EMAIL_DELIVERY_INTERNAL_SECRET;
  const providedAuth =
    request.headers.get("x-internal-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Notification reconciliation is not configured" },
      { status: 503 }
    );
  }
  if (providedAuth !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient: SupabaseClient = createAdminClient();
  const now = new Date().toISOString();

  // 1. Release expired leases on notification_schedules
  const { data: expiredSchedules, error: schedError } = await adminClient
    .from("notification_schedules")
    .update({
      status: "PENDING",
      lease_owner: null,
      lease_expires_at: null,
      updated_at: now,
    })
    .eq("status", "CLAIMED")
    .lt("lease_expires_at", now)
    .select("id");

  if (schedError) {
    console.error("Failed to release expired schedule leases:", schedError);
  }

  // 2. Identify deferred deliveries ready for retry
  const { data: retryDeliveries } = await adminClient
    .from("notification_deliveries")
    .select("id, user_id, channel, idempotency_key, attempt_count")
    .eq("status", "DEFERRED")
    .lte("next_attempt_at", now)
    .limit(25);

  return NextResponse.json({
    success: true,
    releasedSchedulesCount: expiredSchedules?.length ?? 0,
    retriableDeliveriesCount: retryDeliveries?.length ?? 0,
    timestamp: now,
  });
}
