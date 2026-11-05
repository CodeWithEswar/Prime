import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { InAppNotification } from "@/domain/notifications/types";
import type { NotificationsListResponse } from "../types";
import { inboxQuerySchema } from "../inbox";
import { syncUserNotifications } from "./sync-notifications";

export type GetNotificationsOptions = z.input<typeof inboxQuerySchema>;
const cursorSchema = z.object({
  createdAt: z.iso.datetime({ offset: true }),
  id: z.uuid(),
});

// Cache sync timestamps in memory to prevent repeated Supabase queries on every request/poll
const userSyncTimestamps = new Map<string, number>();
const USER_SYNC_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

export async function getNotifications(
  options: GetNotificationsOptions = {}
): Promise<NotificationsListResponse> {
  const parsed = inboxQuerySchema.parse(options);
  let cursor: z.infer<typeof cursorSchema> | undefined;
  if (parsed.cursor) {
    try {
      cursor = cursorSchema.parse(
        JSON.parse(Buffer.from(parsed.cursor, "base64url").toString("utf8"))
      );
    } catch {
      throw new Error("Invalid notification cursor");
    }
  }
  const supabase: SupabaseClient = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Non-blocking notification sync: runs asynchronously in the background at most once every 5 minutes
  const lastSync = userSyncTimestamps.get(user.id) ?? 0;
  if (Date.now() - lastSync > USER_SYNC_DEBOUNCE_MS) {
    userSyncTimestamps.set(user.id, Date.now());
    syncUserNotifications(user.id).catch((syncErr) => {
      console.warn("[Notifications] Non-blocking background sync warning:", syncErr);
    });
  }

  let query = supabase
    .from("notifications")
    .select(
      "id,user_id,event_id,category,title,body,action_url,priority,read_at,dismissed_at,deleted_at,created_at"
    )
    .eq("user_id", user.id)
    .is("deleted_at", null);
  if (parsed.unreadOnly || parsed.tab === "unread") query = query.is("read_at", null);
  if (parsed.category) query = query.eq("category", parsed.category);
  if (parsed.tab === "reminders")
    query = query.in("category", [
      "revision_due",
      "revision_overdue",
      "study_session_upcoming",
      "assessment_upcoming",
      "missed_daily_task",
      "weekly_plan_reminder",
      "streak_at_risk",
      "goal_deadline",
      "aptitude_daily_practice",
      "aptitude_assessment_upcoming",
    ]);
  // Keep PostgREST filter syntax out of user-provided search terms.
  const search = parsed.search.replace(/[^\p{L}\p{N}\s'-]/gu, " ").trim();
  if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  if (cursor)
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`
    );
  const [list, count] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(parsed.limit + 1),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .is("read_at", null),
  ]);
  if (list.error || count.error)
    throw new Error("Notifications could not be loaded. Please try again.");
  const rows = list.data ?? [];
  const items = rows.slice(0, parsed.limit);
  const last = items.at(-1);
  const notifications: InAppNotification[] = items.map((row) => ({
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    category: row.category,
    title: row.title,
    body: row.body,
    actionUrl: row.action_url,
    priority: row.priority,
    readAt: row.read_at,
    dismissedAt: row.dismissed_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
  }));
  return {
    notifications,
    unreadCount: count.count ?? 0,
    nextCursor:
      rows.length > parsed.limit && last
        ? Buffer.from(
            JSON.stringify({ createdAt: last.created_at, id: last.id })
          ).toString("base64url")
        : null,
  };
}
