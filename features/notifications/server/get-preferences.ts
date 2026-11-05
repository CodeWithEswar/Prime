import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/domain/notifications/types";

export const DEFAULT_PREFERENCES_PAYLOAD = {
  timezone: "Asia/Kolkata",
  in_app_enabled: true,
  email_enabled: true,
  revision_email_enabled: true,
  session_email_enabled: true,
  assessment_email_enabled: true,
  missed_task_email_enabled: true,
  aptitude_reminder_enabled: true,
  daily_digest_enabled: true,
  weekly_report_enabled: true,
  session_lead_time_minutes: 15,
  daily_digest_local_time: "07:00:00",
  weekly_report_day: 0, // Sunday
  weekly_report_local_time: "19:00:00",
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00:00",
  quiet_hours_end: "07:00:00",
};

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const supabase: SupabaseClient = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // 1. Fetch existing preferences
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Notification preferences could not be loaded. Please try again.");
  }

  if (data) {
    return {
      id: data.id,
      userId: data.user_id,
      timezone: data.timezone,
      inAppEnabled: data.in_app_enabled,
      emailEnabled: data.email_enabled,
      revisionEmailEnabled: data.revision_email_enabled,
      sessionEmailEnabled: data.session_email_enabled,
      assessmentEmailEnabled: data.assessment_email_enabled,
      missedTaskEmailEnabled: data.missed_task_email_enabled,
      aptitudeReminderEnabled: data.aptitude_reminder_enabled ?? true,
      dailyDigestEnabled: data.daily_digest_enabled,
      weeklyReportEnabled: data.weekly_report_enabled,
      sessionLeadTimeMinutes: data.session_lead_time_minutes,
      dailyDigestLocalTime: data.daily_digest_local_time,
      weeklyReportDay: data.weekly_report_day,
      weeklyReportLocalTime: data.weekly_report_local_time,
      quietHoursEnabled: data.quiet_hours_enabled,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      unsubscribeToken: data.unsubscribe_token,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // 2. If no preferences row, seed default
  const { data: inserted, error: insertError } = await supabase
    .from("notification_preferences")
    .insert({
      user_id: user.id,
      ...DEFAULT_PREFERENCES_PAYLOAD,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error("Notification preferences could not be created. Please try again.");
  }

  return {
    id: inserted.id,
    userId: inserted.user_id,
    timezone: inserted.timezone,
    inAppEnabled: inserted.in_app_enabled,
    emailEnabled: inserted.email_enabled,
    revisionEmailEnabled: inserted.revision_email_enabled,
    sessionEmailEnabled: inserted.session_email_enabled,
    assessmentEmailEnabled: inserted.assessment_email_enabled,
    missedTaskEmailEnabled: inserted.missed_task_email_enabled,
    aptitudeReminderEnabled: inserted.aptitude_reminder_enabled ?? true,
    dailyDigestEnabled: inserted.daily_digest_enabled,
    weeklyReportEnabled: inserted.weekly_report_enabled,
    sessionLeadTimeMinutes: inserted.session_lead_time_minutes,
    dailyDigestLocalTime: inserted.daily_digest_local_time,
    weeklyReportDay: inserted.weekly_report_day,
    weeklyReportLocalTime: inserted.weekly_report_local_time,
    quietHoursEnabled: inserted.quiet_hours_enabled,
    quietHoursStart: inserted.quiet_hours_start,
    quietHoursEnd: inserted.quiet_hours_end,
    unsubscribeToken: inserted.unsubscribe_token,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };
}
