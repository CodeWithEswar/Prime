"use server";

import { revalidatePath } from "next/cache";
import { enrollFundamentals } from "@/features/fundamentals/server/enroll";
import { scheduleFundamentalsCourse } from "@/features/planner/server/actions";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const COURSE_SLUG = "data-engineering-12-day";

async function executeAction<T>(
  run: (userId: string, client: SupabaseServerClient) => Promise<T>
) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        error: "Please sign in to save your Data Engineering learning progress.",
      };
    }

    const data = await run(user.id, client);
    revalidatePath("/roadmap/data-engineering");
    revalidatePath("/roadmap");
    return { ok: true as const, data };
  } catch (error) {
    console.error("Data Engineering server action failed:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

export async function enrollCourseAction(courseSlug: string = COURSE_SLUG) {
  return enrollFundamentals("data-engineering", courseSlug);
}

export async function schedulePlannerAction() {
  try {
    return await scheduleFundamentalsCourse("data-engineering");
  } catch (err) {
    console.warn("Could not schedule Data Engineering course in planner:", err);
    return { scheduledDays: 0, unplacedDays: 0 };
  }
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
  notes: string
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
  return executeAction(async () => {
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

export async function completeStageAssignmentAction(
  stageNumber: number,
  assignmentCompleted: boolean,
  notes?: string
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    const { data: dayRow } = await client
      .from("learning_course_days")
      .select("id")
      .eq("day_number", stageNumber)
      .maybeSingle();

    let courseDayId = dayRow?.id;
    if (!courseDayId) {
      const { data: course } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", COURSE_SLUG)
        .maybeSingle();

      if (course) {
        const { data: newDay } = await client
          .from("learning_course_days")
          .insert({
            course_id: course.id,
            day_number: stageNumber,
            title: `Stage ${stageNumber}`,
            description: `Stage ${stageNumber} Data Engineering Curriculum`,
            sort_order: stageNumber,
          })
          .select("id")
          .single();
        courseDayId = newDay?.id;
      }
    }

    if (!courseDayId) {
      return { stageNumber, assignmentCompleted, notes };
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
