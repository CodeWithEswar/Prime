"use server";

import { enrollFundamentals } from "@/features/fundamentals/server/enroll";
import { scheduleFundamentalsCourse } from "@/features/planner/server/actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DBMSVideoDifficulty } from "@/domain/dbms";

async function executeAction<T>(run: (userId: string, client: any) => Promise<T>) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        error: "Please sign in to save your DBMS learning progress.",
      };
    }

    const data = await run(user.id, client);
    revalidatePath("/roadmap/dbms");
    revalidatePath("/roadmap");
    return { ok: true as const, data };
  } catch (error) {
    console.error("DBMS server action failed:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

export async function enrollCourseAction(courseSlug: string = "dbms-12-day") {
  return enrollFundamentals("dbms", courseSlug);
}

export async function toggleVideoWatchedAction(videoId: string, watched: boolean) {
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

export async function saveVideoNotesAction(
  videoId: string,
  notes: string,
  difficultyRating?: DBMSVideoDifficulty | null
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("learning_video_progress")
      .upsert(
        {
          user_id: userId,
          video_id: videoId,
          notes,
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

export async function toggleVideoBookmarkAction(videoId: string, isBookmarked: boolean) {
  return executeAction(async (userId, client) => {
    // Bookmarks can be tracked in memory/localStorage or note prefix
    return { videoId, isBookmarked };
  });
}

export async function toggleVideoRevisionAction(videoId: string, revisionDue: boolean) {
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

export async function recordExerciseAttemptAction(
  exerciseId: string,
  status: "attempted" | "solved" | "skipped",
  solutionNotes?: string
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();
    const outcome =
      status === "solved"
        ? "solved_independent"
        : status === "attempted"
          ? "attempted"
          : "not_attempted";

    const { data, error } = await client
      .from("learning_exercise_attempts")
      .upsert(
        {
          user_id: userId,
          exercise_id: exerciseId,
          outcome,
          notes: solutionNotes ?? null,
          attempted_at: now,
        },
        { onConflict: "user_id,exercise_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function completeDayAssignmentAction(
  dayNumber: number,
  assignmentCompleted: boolean,
  notes?: string
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    // 1. Resolve course_day_id
    const { data: dayRow } = await client
      .from("learning_course_days")
      .select("id")
      .eq("day_number", dayNumber)
      .maybeSingle();

    let courseDayId = dayRow?.id;
    if (!courseDayId) {
      // Find course
      const { data: course } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", "dbms-12-day")
        .maybeSingle();

      if (course) {
        const { data: newDay } = await client
          .from("learning_course_days")
          .insert({
            course_id: course.id,
            day_number: dayNumber,
            title: `Day ${dayNumber}`,
            description: `Day ${dayNumber} DBMS Curriculum`,
            sort_order: dayNumber,
          })
          .select("id")
          .single();
        courseDayId = newDay?.id;
      }
    }

    if (!courseDayId) {
      throw new Error("Could not find day schedule reference.");
    }

    const { data, error } = await client
      .from("learning_day_progress")
      .upsert(
        {
          user_id: userId,
          course_day_id: courseDayId,
          assignment_completed: assignmentCompleted,
          assignment_notes: notes ?? null,
          completed_at: assignmentCompleted ? now : null,
          status: assignmentCompleted ? "completed" : "in_progress",
          updated_at: now,
        },
        { onConflict: "user_id,course_day_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function scheduleDBMSToPlannerAction(startDateStr?: string) {
  return scheduleFundamentalsCourse("dbms", startDateStr);
}
