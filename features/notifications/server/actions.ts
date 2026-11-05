"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { inboxUpdateSchema, type InboxOperation } from "../inbox";
import { createClient } from "@/lib/supabase/server";
import { notificationPreferencesSchema } from "@/domain/notifications/schemas";
import {
  generateNotificationIdempotencyKey,
  getNotificationCategoryMeta,
} from "@/domain/notifications/eligibility";
import type {
  NotificationCategory,
  NotificationPriority,
} from "@/domain/notifications/types";
import { createNotification } from "./sync-notifications";

async function executeAuthAction<T>(
  run: (userId: string, client: SupabaseClient) => Promise<T>
) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return { ok: false as const, error: "Authentication required" };
    }

    const data = await run(user.id, client);
    revalidatePath("/notifications");
    revalidatePath("/settings/notifications");
    return { ok: true as const, data };
  } catch (error) {
    console.error("[Notifications] Server action error:", error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Mark a single in-app notification as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  return updateInboxNotificationsAction([notificationId], "read");
}

export async function updateInboxNotificationsAction(
  ids: string[],
  operation: InboxOperation
) {
  return executeAuthAction(async (userId, client) => {
    const parsed = inboxUpdateSchema.parse({ ids, operation });
    const now = new Date().toISOString();
    const payload =
      parsed.operation === "delete"
        ? { deleted_at: now }
        : { read_at: parsed.operation === "read" ? now : null };
    const { data, error } = await client
      .from("notifications")
      .update(payload)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .in("id", parsed.ids)
      .select("id");
    if (error) throw new Error("Could not update notifications. Please try again.");
    return { ids: (data ?? []).map((row) => String(row.id)) };
  });
}

/**
 * Mark all notifications as read for current user.
 */
export async function markAllNotificationsReadAction() {
  return executeAuthAction(async (userId, client) => {
    const { error: updateError } = await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null)
      .is("deleted_at", null);

    if (updateError)
      throw new Error("Could not mark notifications as read. Please try again.");

    return { success: true };
  });
}

/**
 * Soft delete an in-app notification from the user's inbox.
 */
export async function deleteNotificationAction(notificationId: string) {
  return updateInboxNotificationsAction([notificationId], "delete");
}

/**
 * Update user notification preferences (channels, lead times, quiet hours, timezones).
 */
export async function updateNotificationPreferencesAction(rawInput: unknown) {
  return executeAuthAction(async (userId, client) => {
    const parsed = notificationPreferencesSchema.partial().parse(rawInput);

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.timezone !== undefined) updatePayload.timezone = parsed.timezone;
    if (parsed.inAppEnabled !== undefined)
      updatePayload.in_app_enabled = parsed.inAppEnabled;
    if (parsed.emailEnabled !== undefined)
      updatePayload.email_enabled = parsed.emailEnabled;
    if (parsed.revisionEmailEnabled !== undefined)
      updatePayload.revision_email_enabled = parsed.revisionEmailEnabled;
    if (parsed.sessionEmailEnabled !== undefined)
      updatePayload.session_email_enabled = parsed.sessionEmailEnabled;
    if (parsed.assessmentEmailEnabled !== undefined)
      updatePayload.assessment_email_enabled = parsed.assessmentEmailEnabled;
    if (parsed.missedTaskEmailEnabled !== undefined)
      updatePayload.missed_task_email_enabled = parsed.missedTaskEmailEnabled;
    if (parsed.aptitudeReminderEnabled !== undefined)
      updatePayload.aptitude_reminder_enabled = parsed.aptitudeReminderEnabled;
    if (parsed.dailyDigestEnabled !== undefined)
      updatePayload.daily_digest_enabled = parsed.dailyDigestEnabled;
    if (parsed.weeklyReportEnabled !== undefined)
      updatePayload.weekly_report_enabled = parsed.weeklyReportEnabled;
    if (parsed.sessionLeadTimeMinutes !== undefined)
      updatePayload.session_lead_time_minutes = parsed.sessionLeadTimeMinutes;
    if (parsed.dailyDigestLocalTime !== undefined)
      updatePayload.daily_digest_local_time = parsed.dailyDigestLocalTime;
    if (parsed.weeklyReportDay !== undefined)
      updatePayload.weekly_report_day = parsed.weeklyReportDay;
    if (parsed.weeklyReportLocalTime !== undefined)
      updatePayload.weekly_report_local_time = parsed.weeklyReportLocalTime;
    if (parsed.quietHoursEnabled !== undefined)
      updatePayload.quiet_hours_enabled = parsed.quietHoursEnabled;
    if (parsed.quietHoursStart !== undefined)
      updatePayload.quiet_hours_start = parsed.quietHoursStart;
    if (parsed.quietHoursEnd !== undefined)
      updatePayload.quiet_hours_end = parsed.quietHoursEnd;

    const { data, error } = await client
      .from("notification_preferences")
      .upsert(
        {
          user_id: userId,
          ...updatePayload,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

/**
 * Helper to schedule a notification event from other domain modules (revision, planner, assessment).
 */
export async function scheduleNotificationAction(params: {
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string;
  sourceType: string;
  sourceId: string;
  scheduledFor?: string; // ISO date string. If omitted, triggers immediately
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}) {
  return executeAuthAction(async (userId, client) => {
    const meta = getNotificationCategoryMeta(params.category);
    const scheduledTime = params.scheduledFor ?? new Date().toISOString();
    const priority = params.priority ?? meta.defaultPriority;
    const dateKey = scheduledTime.split("T")[0];

    const idempotencyKey = generateNotificationIdempotencyKey({
      userId,
      category: params.category,
      sourceId: params.sourceId,
      dateKey,
    });

    // 1. Insert into notification_schedules
    const { data: schedule, error: schedError } = await client
      .from("notification_schedules")
      .insert({
        user_id: userId,
        event_type: params.category,
        source_type: params.sourceType,
        source_id: params.sourceId,
        scheduled_for: scheduledTime,
        status: "PENDING",
        idempotency_key: idempotencyKey,
        metadata: {
          title: params.title,
          body: params.body,
          actionUrl: params.actionUrl,
          priority,
          ...(params.metadata ?? {}),
        },
      })
      .select()
      .maybeSingle();

    if (schedError && schedError.code !== "23505") {
      // Ignore 23505 unique constraint duplicate
      throw schedError;
    }

    // 2. If scheduled time is in the past or right now, create in-app notification immediately
    if (new Date(scheduledTime).getTime() <= Date.now() + 60000) {
      await createNotification({
        userId,
        category: params.category,
        title: params.title,
        body: params.body,
        actionUrl: params.actionUrl,
        priority,
      });
    }

    return { scheduleId: schedule?.id, idempotencyKey };
  });
}
