import type { WorkerEnv } from "../../shared/types";
import { workerLog } from "../../shared/logger";
import { createWorkerSupabaseClient } from "../../shared/supabase";

export interface ExtendedWorkerEnv extends WorkerEnv {
  APP_URL?: string;
  CRON_SECRET?: string;
  EMAIL_DELIVERY_INTERNAL_SECRET?: string;
}

/**
 * Evaluates whether current time in timezone falls inside quiet hours.
 */
function isQuietHours(now: Date, timezone: string, startStr: string, endStr: string): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    const currentMins = hour * 60 + minute;

    const [sh = 22, sm = 0] = startStr.split(":").map((v) => parseInt(v, 10));
    const [eh = 7, em = 0] = endStr.split(":").map((v) => parseInt(v, 10));
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (startMins < endMins) {
      return currentMins >= startMins && currentMins < endMins;
    }
    if (startMins > endMins) {
      return currentMins >= startMins || currentMins < endMins;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Keeps Supabase PostgreSQL and PostgREST active by issuing a lightweight ping query.
 * Supabase free-tier projects pause after 7 days of inactivity; this heartbeat guarantees
 * the project stays active indefinitely by generating ongoing database activity.
 */
export async function pingSupabaseKeepAlive(supabase: any): Promise<{
  alive: boolean;
  timestamp: string;
  latencyMs: number;
  source: string;
  error?: string;
}> {
  const start = Date.now();
  try {
    if (!supabase || typeof supabase.from !== "function") {
      return { alive: false, timestamp: new Date().toISOString(), latencyMs: 0, source: "mock", error: "No client" };
    }

    // Perform an active SELECT query through PostgREST into Postgres.
    // This generates real HTTP + DB activity that Supabase monitors to reset the 7-day inactivity timer.
    const { error } = await supabase
      .from("notifications")
      .select("id")
      .limit(1);

    const latencyMs = Date.now() - start;

    if (error) {
      // Secondary fallback ping on another core table
      const { error: fallbackError } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .limit(1);

      if (fallbackError) {
        return {
          alive: false,
          timestamp: new Date().toISOString(),
          latencyMs,
          source: "supabase-fallback",
          error: error.message || fallbackError.message,
        };
      }
    }

    return {
      alive: true,
      timestamp: new Date().toISOString(),
      latencyMs,
      source: "supabase-postgrest",
    };
  } catch (err: any) {
    return {
      alive: false,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      source: "exception",
      error: err?.message ?? String(err),
    };
  }
}

/**
 * Core processor for due notification schedules
 */
async function processDueSchedules(env: ExtendedWorkerEnv): Promise<{
  processed: number;
  delivered: number;
  suppressed: number;
  failed: number;
}> {
  const supabase = createWorkerSupabaseClient(env);
  const leaseOwner = `worker-reminders-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date();

  // 1. Claim due schedules atomically
  const { data: claimedSchedules, error: claimError } = await supabase.rpc(
    "claim_due_notification_schedules",
    {
      p_lease_owner: leaseOwner,
      p_batch_size: 50,
      p_lease_duration_seconds: 300,
    }
  );

  if (claimError || !claimedSchedules || !Array.isArray(claimedSchedules) || claimedSchedules.length === 0) {
    if (claimError) {
      workerLog("reminders", "error", "Error claiming due notification schedules", {
        error: claimError.message,
      });
    }
    return { processed: 0, delivered: 0, suppressed: 0, failed: 0 };
  }

  workerLog("reminders", "info", `Claimed ${claimedSchedules.length} due notification schedules`, {
    leaseOwner,
  });

  let deliveredCount = 0;
  let suppressedCount = 0;
  let failedCount = 0;

  for (const schedule of claimedSchedules) {
    try {
      // 2. Fetch user notification preferences
      const { data: pref } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", schedule.user_id)
        .maybeSingle();

      const userTimezone = pref?.timezone || schedule.timezone || "Asia/Kolkata";
      const quietEnabled = pref?.quiet_hours_enabled ?? false;
      const quietStart = pref?.quiet_hours_start ?? "22:00:00";
      const quietEnd = pref?.quiet_hours_end ?? "07:00:00";

      // 3. Check quiet hours
      if (quietEnabled && isQuietHours(now, userTimezone, quietStart, quietEnd)) {
        await supabase
          .from("notification_schedules")
          .update({
            status: "SUPPRESSED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", schedule.id);

        suppressedCount++;
        continue;
      }

      const meta = (schedule.metadata || {}) as Record<string, any>;
      const category = schedule.event_type;
      const title = meta.title || "PRIME Preparation Update";
      const body = meta.body || "You have an update in your preparation roadmap.";
      const actionUrl = meta.actionUrl || "/today";
      const priority = meta.priority || "medium";

      // 4. In-App Notification Delivery
      let inAppNotificationId: string | null = null;
      if (pref?.in_app_enabled ?? true) {
        const { data: createdNotif } = await supabase
          .from("notifications")
          .insert({
            user_id: schedule.user_id,
            category,
            title,
            body,
            action_url: actionUrl,
            priority,
          })
          .select("id")
          .single();

        inAppNotificationId = createdNotif?.id ?? null;
      }

      // 5. Email Delivery (if enabled for category)
      let emailAllowed = pref?.email_enabled ?? true;
      if (emailAllowed) {
        if (category === "revision_due" && pref?.revision_email_enabled === false) emailAllowed = false;
        if (category === "study_session_upcoming" && pref?.session_email_enabled === false) emailAllowed = false;
        if (category === "assessment_upcoming" && pref?.assessment_email_enabled === false) emailAllowed = false;
        if (category === "missed_daily_task" && pref?.missed_task_email_enabled === false) emailAllowed = false;
        if (category === "daily_study_digest" && pref?.daily_digest_enabled === false) emailAllowed = false;
        if (category === "weekly_progress_report" && pref?.weekly_report_enabled === false) emailAllowed = false;
      }

      if (emailAllowed) {
        // Fetch user email from auth
        const { data: userRecord } = await supabase.auth.admin.getUserById(schedule.user_id);
        const recipientEmail = userRecord?.user?.email;

        if (recipientEmail) {
          const deliveryId = crypto.randomUUID();
          const deliveryIdempotencyKey = `${schedule.idempotency_key}:EMAIL`;

          // Record delivery intent
          await supabase.from("notification_deliveries").insert({
            id: deliveryId,
            notification_id: inAppNotificationId,
            user_id: schedule.user_id,
            channel: "EMAIL",
            status: "PROCESSING",
            idempotency_key: deliveryIdempotencyKey,
            provider: "nodemailer_smtp",
          });

          // Dispatch to Node.js email delivery service endpoint
          const appUrl = env.APP_URL || "https://primeprep.app";
          const emailEndpoint = `${appUrl}/api/internal/email-deliveries`;
          const secret = env.EMAIL_DELIVERY_INTERNAL_SECRET || env.CRON_SECRET || "";

          const emailRes = await fetch(emailEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": secret,
            },
            body: JSON.stringify({
              deliveryId,
              userId: schedule.user_id,
              recipientEmail,
              recipientName: userRecord?.user?.user_metadata?.full_name || "Candidate",
              category,
              subject: title,
              idempotencyKey: deliveryIdempotencyKey,
              payload: meta.payload || meta,
              unsubscribeToken: pref?.unsubscribe_token,
            }),
          });

          if (!emailRes.ok) {
            workerLog("reminders", "warn", "Email delivery endpoint returned non-200", {
              status: emailRes.status,
              scheduleId: schedule.id,
            });
          }
        }
      }

      // 6. Mark schedule completed
      await supabase
        .from("notification_schedules")
        .update({
          status: "COMPLETED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", schedule.id);

      deliveredCount++;
    } catch (schedErr: any) {
      workerLog("reminders", "error", `Failed processing schedule ${schedule.id}`, {
        error: schedErr.message,
      });
      failedCount++;
    }
  }

  return {
    processed: claimedSchedules.length,
    delivered: deliveredCount,
    suppressed: suppressedCount,
    failed: failedCount,
  };
}

const worker = {
  /**
   * Health & Manual Trigger Entrypoints
   */
  async fetch(request: Request, env: ExtendedWorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          worker: "reminders",
          environment: env.ENVIRONMENT || "development",
          timestamp: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/keep-alive" || url.pathname === "/ping") {
      const supabase = createWorkerSupabaseClient(env);
      const keepAlive = await pingSupabaseKeepAlive(supabase);
      return new Response(
        JSON.stringify({
          status: keepAlive.alive ? "active" : "degraded",
          service: "Supabase PostgreSQL Keep-Alive",
          target: env.SUPABASE_URL,
          keepAlive,
        }),
        {
          status: keepAlive.alive ? 200 : 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (url.pathname === "/dispatch-due") {
      const stats = await processDueSchedules(env);
      return new Response(JSON.stringify({ success: true, stats }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/reconcile") {
      const appUrl = env.APP_URL || "https://primeprep.app";
      const secret = env.CRON_SECRET || env.EMAIL_DELIVERY_INTERNAL_SECRET || "";
      const res = await fetch(`${appUrl}/api/internal/notification-reconcile`, {
        method: "POST",
        headers: { "x-internal-secret": secret },
      });
      const data = await res.text();
      return new Response(data, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("PRIME Reminders Worker Foundation — Notifications & Reminders Engine Active", { status: 200 });
  },

  /**
   * Scheduled Cron Entrypoint (Runs every 15 minutes)
   */
  async scheduled(
    event: { cron: string; scheduledTime: number },
    env: ExtendedWorkerEnv
  ): Promise<void> {
    workerLog("reminders", "info", "Scheduled notification engine pulse triggered", {
      cron: event.cron,
      scheduledTime: event.scheduledTime,
    });

    try {
      const supabase = createWorkerSupabaseClient(env);

      // 1. Guaranteed Keep-Alive Heartbeat for Supabase (prevents 7-day free-tier auto-pause)
      const keepAlive = await pingSupabaseKeepAlive(supabase);
      workerLog("reminders", "info", "Supabase keep-alive heartbeat pulse dispatched", keepAlive);

      const appUrl = env.APP_URL || "https://primeprep.app";
      const secret = env.CRON_SECRET || env.EMAIL_DELIVERY_INTERNAL_SECRET || "";

      // Ping dispatch endpoint if configured
      if (env.APP_URL && env.CRON_SECRET) {
        await fetch(`${env.APP_URL}/api/reminders/dispatch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
        }).catch(() => {});
      }

      const stats = await processDueSchedules(env);
      workerLog("reminders", "info", "Notification dispatch pulse completed", stats);

      // Reconcile stuck leases
      await fetch(`${appUrl}/api/internal/notification-reconcile`, {
        method: "POST",
        headers: { "x-internal-secret": secret },
      }).catch((e) => {
        workerLog("reminders", "warn", "Reconcile ping warning", { error: e.message });
      });
    } catch (err: any) {
      workerLog("reminders", "error", "Cron notification dispatch failed", {
        error: err.message,
      });
    }
  },
};

export default worker;
