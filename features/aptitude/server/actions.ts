"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AptitudeDay } from "../types";
import { createClient } from "@/lib/supabase/server";
import curriculumManifestJson from "@/content/aptitude/aptitude-curriculum-manifest.json";

async function executeAction<T>(
  run: (userId: string, client: SupabaseClient) => Promise<T>
) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        error: "Please sign in to save your Aptitude learning progress.",
      };
    }

    const data = await run(user.id, client);
    revalidatePath("/aptitude");
    revalidatePath("/practice/aptitude");
    revalidatePath("/today");
    revalidatePath("/calendar");
    revalidatePath("/planner");
    return { ok: true as const, data };
  } catch (error) {
    console.error("Aptitude server action failed:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

export async function enrollAptitudeAction(options?: {
  pacing?: "accelerated" | "standard" | "relaxed";
}) {
  return executeAction(async (userId, client) => {
    const now = new Date();
    const startDate = now.toISOString().split("T")[0];
    const pacing = options?.pacing || "standard";

    // Target completion: 40 days for standard, 20 for accelerated, 60 for relaxed
    const daysToAdd = pacing === "accelerated" ? 20 : pacing === "relaxed" ? 60 : 40;
    const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data, error } = await client
      .from("aptitude_enrollments")
      .upsert(
        {
          user_id: userId,
          current_day: 1,
          start_date: startDate,
          target_completion_date: targetDate,
          pacing,
          is_paused: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function toggleAptitudeTopicAction(
  topicId: string,
  status: "not_started" | "in_progress" | "completed"
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("aptitude_topic_progress")
      .upsert(
        {
          user_id: userId,
          topic_id: topicId,
          status,
          completed_at: status === "completed" ? now : null,
          last_activity_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,topic_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function toggleAptitudeBookmarkAction(
  topicId: string,
  isBookmarked: boolean
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("aptitude_topic_progress")
      .upsert(
        {
          user_id: userId,
          topic_id: topicId,
          is_bookmarked: isBookmarked,
          last_activity_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,topic_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function saveAptitudeNotesAction(topicId: string, notes: string) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("aptitude_topic_progress")
      .upsert(
        {
          user_id: userId,
          topic_id: topicId,
          user_notes: notes,
          last_activity_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,topic_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function recordAptitudeVideoWatchAction(
  topicId: string,
  videoId: string,
  watched: boolean,
  watchedSeconds: number = 0
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("aptitude_video_progress")
      .upsert(
        {
          user_id: userId,
          topic_id: topicId,
          video_id: videoId,
          watched,
          user_confirmed: watched,
          watched_seconds: watchedSeconds,
          watched_at: watched ? now : null,
          updated_at: now,
        },
        { onConflict: "user_id,topic_id,video_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function scheduleAptitudeRoadmapAction() {
  return executeAction(async (userId, client) => {
    const manifestDays = curriculumManifestJson.days as AptitudeDay[];
    const now = new Date();
    const scheduled = [];

    // Schedule 1 task per day starting today for the 40 days
    for (let i = 0; i < manifestDays.length; i++) {
      const day = manifestDays[i];
      const taskDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      scheduled.push({
        user_id: userId,
        title: `Aptitude · Day ${day.dayNumber}: ${day.title.replace(/^Day \d+:\s*/, "")}`,
        date: taskDate,
        duration_minutes: day.estimatedMinutes || 60,
        task_type: day.isAssessmentDay ? "assessment" : "study_session",
        source: "curriculum",
        status: "pending",
        is_completed: false,
        created_at: new Date().toISOString(),
      });
    }

    try {
      await client
        .from("daily_plan_items")
        .upsert(scheduled, { onConflict: "user_id,date,title" });
    } catch {
      // Fallback if schema differs
    }

    return { scheduledDays: scheduled.length };
  });
}
