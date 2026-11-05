import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type {
  NotificationCategory,
  NotificationPriority,
  InAppNotification,
} from "@/domain/notifications/types";

export interface CreateNotificationParams {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string | null;
  priority?: NotificationPriority;
  idempotencyKey?: string;
}

/**
 * Creates a single in-app notification reliably using privileged admin client.
 * Respects user preferences and prevents duplicate notifications.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<InAppNotification | null> {
  try {
    const admin = createAdminClient();

    // 1. Check if in-app notifications are enabled in user preferences
    const { data: pref } = await admin
      .from("notification_preferences")
      .select("in_app_enabled")
      .eq("user_id", params.userId)
      .maybeSingle();

    if (pref && pref.in_app_enabled === false) {
      return null;
    }

    // 2. Map category safely to supported database enum/check values
    const validCategories: Set<string> = new Set([
      "revision_due",
      "revision_overdue",
      "study_session_upcoming",
      "assessment_upcoming",
      "missed_daily_task",
      "daily_study_digest",
      "weekly_progress_report",
      "weekly_plan_reminder",
      "streak_at_risk",
      "goal_deadline",
      "system_announcement",
    ]);

    let safeCategory = params.category as string;
    if (!validCategories.has(safeCategory)) {
      if (safeCategory.startsWith("aptitude")) {
        safeCategory = "assessment_upcoming";
      } else {
        safeCategory = "system_announcement";
      }
    }

    // 3. Deduplication check if idempotencyKey or matching title exists today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const { data: existing } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", params.userId)
      .eq("category", safeCategory)
      .eq("title", params.title)
      .gte("created_at", startOfDay.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return null;
    }

    // 4. Insert notification
    const { data: inserted, error: insertError } = await admin
      .from("notifications")
      .insert({
        user_id: params.userId,
        category: safeCategory,
        title: params.title,
        body: params.body,
        action_url: params.actionUrl ?? null,
        priority: params.priority ?? "medium",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Notifications] Failed to insert notification:", insertError);
      return null;
    }

    return {
      id: inserted.id,
      userId: inserted.user_id,
      eventId: inserted.event_id,
      category: inserted.category as NotificationCategory,
      title: inserted.title,
      body: inserted.body,
      actionUrl: inserted.action_url,
      priority: inserted.priority as NotificationPriority,
      readAt: inserted.read_at,
      dismissedAt: inserted.dismissed_at,
      deletedAt: inserted.deleted_at,
      createdAt: inserted.created_at,
    };
  } catch (err) {
    console.error("[Notifications] Unexpected error in createNotification:", err);
    return null;
  }
}

/**
 * Reconciles and synchronizes active learning and revision events for a user into their notification inbox.
 * Idempotent: Can be called frequently without creating duplicate or spam notifications.
 */
export async function syncUserNotifications(userId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // 1. Fetch user preferences
    const { data: pref } = await admin
      .from("notification_preferences")
      .select("in_app_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (pref && pref.in_app_enabled === false) {
      return 0;
    }

    // 2. Fetch existing notifications created today and any announcements ever
    const [{ data: existingToday }, { data: existingAnnouncements }] = await Promise.all([
      admin
        .from("notifications")
        .select("id, category, title, created_at")
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString()),
      admin
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("category", "system_announcement")
        .limit(1),
    ]);

    const existingTitles = new Set((existingToday ?? []).map((n) => n.title));
    const existingCategories = new Set((existingToday ?? []).map((n) => n.category));
    const pendingInserts: Array<{
      user_id: string;
      category: string;
      title: string;
      body: string;
      action_url: string;
      priority: "low" | "medium" | "high" | "urgent";
    }> = [];

    // A. Welcome Announcement (Once per candidate account)
    if (!existingAnnouncements || existingAnnouncements.length === 0) {
      pendingInserts.push({
        user_id: userId,
        category: "system_announcement",
        title: "Welcome to PRIME Command Center",
        body: "Your personalized interview preparation runway is active. Plan daily, practice deliberately, and conquer your technical assessments.",
        action_url: "/roadmap",
        priority: "high",
      });
      existingCategories.add("system_announcement");
    }

    // B. Revisions Due & Overdue
    const { data: revisionItems } = await admin
      .from("revision_items")
      .select("id, entity_id, interval_days, next_review_at, status")
      .eq("user_id", userId)
      .eq("status", "active");

    if (revisionItems && revisionItems.length > 0) {
      const dueItems = revisionItems.filter((item) => {
        if (!item.next_review_at) return false;
        const reviewDate = new Date(item.next_review_at);
        // Due if review date is within 12 hours from now or in the past
        return reviewDate.getTime() <= now.getTime() + 12 * 3600 * 1000;
      });

      if (dueItems.length > 0) {
        const problemIds = dueItems.map((d) => d.entity_id);
        const { data: problems } = await admin
          .from("problems")
          .select("id, title, difficulty")
          .in("id", problemIds);

        const problemMap = new Map((problems ?? []).map((p) => [p.id, p]));

        for (const item of dueItems) {
          const prob = problemMap.get(item.entity_id);
          const probTitle = prob?.title ?? "Algorithm Problem";
          const reviewDate = new Date(item.next_review_at);
          const isOverdue = reviewDate.getTime() < now.getTime() - 24 * 3600 * 1000;

          const title = isOverdue
            ? `Revision Overdue: ${probTitle}`
            : `Revision Ready: ${probTitle}`;

          if (!existingTitles.has(title)) {
            pendingInserts.push({
              user_id: userId,
              category: isOverdue ? "revision_overdue" : "revision_due",
              title,
              body: isOverdue
                ? `Stage ${item.interval_days}-day review is overdue. Strengthen your neural pathways before retention decays.`
                : `Stage ${item.interval_days}-day spaced recall test is ready for this problem today.`,
              action_url: "/revision",
              priority: isOverdue ? "urgent" : "high",
            });
            existingTitles.add(title);
          }
        }
      }
    }

    // C. Active Curriculum / Fundamentals Course in Progress
    const { data: enrollments } = await admin
      .from("learning_enrollments")
      .select("id, course_id, current_day, status")
      .eq("user_id", userId)
      .eq("status", "in_progress");

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map((e) => e.course_id);
      const { data: courses } = await admin
        .from("learning_courses")
        .select("id, title, slug")
        .in("id", courseIds);

      const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

      for (const enroll of enrollments) {
        const course = courseMap.get(enroll.course_id);
        if (course) {
          const cleanSlug = course.slug
            .replace("-12-day", "")
            .replace("-14-day", "");
          const title = `Continue ${course.title} — Day ${enroll.current_day}`;

          if (!existingTitles.has(title)) {
            pendingInserts.push({
              user_id: userId,
              category: "study_session_upcoming",
              title,
              body: `Day ${enroll.current_day} curriculum modules and interactive laboratories are ready for your study session today.`,
              action_url: `/fundamentals/${cleanSlug}`,
              priority: "medium",
            });
            existingTitles.add(title);
          }
        }
      }
    }

    // D. Daily Study Digest
    if (!existingCategories.has("daily_study_digest")) {
      pendingInserts.push({
        user_id: userId,
        category: "daily_study_digest",
        title: "Daily Study Runway Ready",
        body: "Your daily schedule and targets are calibrated. Review your roadmap and start your deliberate practice blocks.",
        action_url: "/today",
        priority: "medium",
      });
      existingCategories.add("daily_study_digest");
    }

    // E. Aptitude & Reasoning Practice
    if (!existingCategories.has("assessment_upcoming")) {
      pendingInserts.push({
        user_id: userId,
        category: "assessment_upcoming",
        title: "Daily Aptitude & Reasoning Set",
        body: "Sharpen your quantitative and logical reasoning speed with today's timed practice drill.",
        action_url: "/practice/aptitude",
        priority: "medium",
      });
      existingCategories.add("assessment_upcoming");
    }

    // Insert pending notifications
    if (pendingInserts.length > 0) {
      const { error: insertError } = await admin
        .from("notifications")
        .insert(pendingInserts);

      if (insertError) {
        console.error("[Notifications] Error inserting reconciled notifications:", insertError);
        return 0;
      }
    }

    return pendingInserts.length;
  } catch (err) {
    console.error("[Notifications] Unexpected error during syncUserNotifications:", err);
    return 0;
  }
}
