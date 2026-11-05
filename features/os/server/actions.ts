"use server";

import { enrollFundamentals } from "@/features/fundamentals/server/enroll";
import { scheduleFundamentalsCourse } from "@/features/planner/server/actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OSVideoDifficulty } from "@/domain/os";

async function executeAction<T>(run: (userId: string, client: any) => Promise<T>) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        error: "Please sign in to save your Operating Systems learning progress.",
      };
    }

    const data = await run(user.id, client);
    revalidatePath("/roadmap/os");
    revalidatePath("/fundamentals/os");
    revalidatePath("/roadmap");
    return { ok: true as const, data };
  } catch (error) {
    console.error("OS server action failed:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

export async function enrollOSCourseAction(courseSlug = "os-12-day") {
  return enrollFundamentals("os", courseSlug);
}

export async function toggleOSVideoWatchedAction(videoId: string, watched: boolean) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("learning_video_progress")
      .upsert(
        {
          user_id: userId,
          video_id: videoId,
          status: watched ? "watched" : "not_started",
          watched_at: watched ? now : null,
          updated_at: now,
        },
        { onConflict: "user_id,video_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function saveOSVideoNoteAction(
  videoId: string,
  note: string,
  difficultyRating?: OSVideoDifficulty,
  needsRevision?: boolean
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      user_id: userId,
      video_id: videoId,
      notes: note,
      updated_at: now,
    };
    if (difficultyRating !== undefined) updates.difficulty_rating = difficultyRating;
    if (needsRevision !== undefined) updates.needs_revision = needsRevision;

    const { data, error } = await client
      .from("learning_video_progress")
      .upsert(updates, { onConflict: "user_id,video_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function toggleOSVideoBookmarkAction(videoId: string, isBookmarked: boolean) {
  return executeAction(async (_userId, _client) => {
    return { videoId, isBookmarked };
  });
}

export async function toggleOSVideoRevisionAction(videoId: string, revisionDue: boolean) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("learning_video_progress")
      .upsert(
        {
          user_id: userId,
          video_id: videoId,
          needs_revision: revisionDue,
          updated_at: now,
        },
        { onConflict: "user_id,video_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function recordOSLabAttemptAction(
  labId: string,
  status: "attempted" | "completed" | "needs_revision",
  solutionNotes?: string
) {
  return executeAction(async (userId, client) => {
    const outcome = status === "completed" ? "solved_independent" : "attempted";
    const { data, error } = await client
      .from("learning_exercise_attempts")
      .insert({
        user_id: userId,
        exercise_id: labId,
        outcome,
        notes: solutionNotes || null,
        attempted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function completeOSDayAssignmentAction(
  dayNumber: number,
  notes?: string,
  courseSlug = "os-12-day"
) {
  return executeAction(async (userId, client) => {
    // 1. Get Course and Day ID
    const { data: course } = await client
      .from("learning_courses")
      .select("id")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (!course) throw new Error("Course not found");

    let { data: courseDay } = await client
      .from("learning_course_days")
      .select("id")
      .eq("course_id", course.id)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (!courseDay) {
      const { data: newDay, error: dayInsertErr } = await client
        .from("learning_course_days")
        .insert({
          course_id: course.id,
          day_number: dayNumber,
          title: `Day ${dayNumber}`,
        })
        .select("id")
        .single();
      if (dayInsertErr) throw dayInsertErr;
      courseDay = newDay;
    }

    const { data, error } = await client
      .from("learning_day_progress")
      .upsert(
        {
          user_id: userId,
          course_day_id: courseDay.id,
          assignment_completed: true,
          assignment_notes: notes || null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_day_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function planOSCourseInPlannerAction(startDate?: string) {
  return scheduleFundamentalsCourse("os", startDate);
}
