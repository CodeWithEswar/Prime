"use server";

import { enrollFundamentals } from "@/features/fundamentals/server/enroll";
import { scheduleFundamentalsCourse } from "@/features/planner/server/actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeAction<T>(run: (userId: string, client: any) => Promise<T>) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        error: "Please sign in to save your OOP learning progress.",
      };
    }

    const data = await run(user.id, client);
    revalidatePath("/roadmap/oop");
    revalidatePath("/fundamentals/oop");
    revalidatePath("/roadmap");
    return { ok: true as const, data };
  } catch (error) {
    console.error("OOP server action failed:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

export async function enrollOOPCourseAction(courseSlug = "oop-12-day") {
  return enrollFundamentals("oop", courseSlug);
}

export async function toggleOOPVideoWatchedAction(videoId: string, watched: boolean) {
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

export async function toggleOOPSegmentCompletedAction(
  segmentId: string,
  completed: boolean
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    const { data, error } = await client
      .from("learning_user_segment_progress")
      .upsert(
        {
          user_id: userId,
          segment_id: segmentId,
          status: completed ? "completed" : "not_started",
          completed_at: completed ? now : null,
          updated_at: now,
        },
        { onConflict: "user_id,segment_id" }
      )
      .select()
      .single();

    if (error) {
      console.warn(
        "Could not upsert segment progress to DB; client will retain local state.",
        error
      );
    }
    return data;
  });
}

export async function saveOOPVideoNoteAction(videoId: string, notes: string) {
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

export async function toggleOOPVideoBookmarkAction(videoId: string, isBookmarked: boolean) {
  return executeAction(async (_userId, _client) => {
    return { videoId, isBookmarked };
  });
}

export async function toggleOOPVideoRevisionAction(videoId: string, revisionDue: boolean) {
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

export async function recordOOPLabAttemptAction(
  labId: string,
  scenarioId = "default",
  isSuccess = true,
  notes?: string
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    const { data, error } = await client
      .from("learning_exercise_attempts")
      .upsert(
        {
          user_id: userId,
          exercise_id: `oop-lab-${labId}`,
          outcome: isSuccess ? "solved_independent" : "attempted",
          notes: notes || `Attempted OOP Laboratory: ${labId}`,
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

export async function recordOOPDesignAttemptAction(
  caseId: string,
  selfAssessment: "proficient" | "adequate" | "needs_review",
  notes?: string
) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    const { data, error } = await client
      .from("learning_exercise_attempts")
      .upsert(
        {
          user_id: userId,
          exercise_id: caseId,
          outcome: "solved_independent",
          notes: notes || `Completed LLD Case: ${caseId} (${selfAssessment})`,
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

export async function completeOOPDayAssignmentAction(dayNumber: number, notes?: string) {
  return executeAction(async (userId, client) => {
    const now = new Date().toISOString();

    let { data: courseDay } = await client
      .from("learning_course_days")
      .select("id")
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (!courseDay) {
      let { data: course } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", "oop-12-day")
        .maybeSingle();

      if (!course) {
        const { data: newCourse } = await client
          .from("learning_courses")
          .insert({
            slug: "oop-12-day",
            title: "12-Day OOP with Java",
            subject: "OOP",
            description: "12-day curriculum",
            estimated_days: 12,
            difficulty: "Hard",
          })
          .select("id")
          .single();
        course = newCourse;
      }

      const { data: newDay } = await client
        .from("learning_course_days")
        .insert({
          course_id: course.id,
          day_number: dayNumber,
          title: `Day ${dayNumber} Study Plan`,
          description: `Study requirements for OOP Day ${dayNumber}`,
          sort_order: dayNumber,
        })
        .select("id")
        .single();

      courseDay = newDay;
    }

    const { data, error } = await client
      .from("learning_day_progress")
      .upsert(
        {
          user_id: userId,
          course_day_id: courseDay.id,
          status: "completed",
          assignment_completed: true,
          assignment_notes: notes || null,
          completed_at: now,
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

export async function planOOPCourseInPlannerAction(courseSlug = "oop-12-day") {
  if (courseSlug !== "oop-12-day")
    return { ok: false as const, error: "Unknown roadmap." };
  return scheduleFundamentalsCourse("oop");
}
