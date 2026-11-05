import "server-only";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  fundamentalsCourses,
  type FundamentalsCourse,
} from "@/domain/fundamentals/courses";
import { scheduleFundamentalsCourse } from "@/features/planner/server/actions";
import { createNotification } from "@/features/notifications/server/sync-notifications";

export async function enrollFundamentals(course: FundamentalsCourse, slug: string) {
  const courseSlug = course + "-12-day";
  if (slug !== courseSlug) return { ok: false as const, error: "Unknown roadmap." };

  try {
    const client = await createClient();
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (!user) {
      if (
        authError &&
        authError.name !== "AuthSessionMissingError" &&
        authError.status !== 401
      )
        throw authError;
      return {
        ok: false as const,
        code: "sign_in" as const,
        error: "Sign in to save your roadmap progress.",
      };
    }

    const lookup = () =>
      client
        .from("learning_courses")
        .select("id,status")
        .eq("slug", courseSlug)
        .maybeSingle();
    let { data: catalog, error } = await lookup();
    if (error) throw error;

    if (!catalog) {
      // The catalog is read-only for learners. Seed only the built-in course requested.
      const definition = fundamentalsCourses[course];
      const { error: seedError } = await createAdminClient()
        .from("learning_courses")
        .upsert(
          {
            slug: courseSlug,
            title: definition.title,
            subject: definition.label,
            description: definition.description,
            difficulty: definition.difficulty,
            estimated_days: 12,
          },
          { onConflict: "slug", ignoreDuplicates: true }
        );
      if (seedError) throw seedError;
      ({ data: catalog, error } = await lookup());
      if (error) throw error;
    }
    if (!catalog || catalog.status !== "published")
      return { ok: false as const, error: "This roadmap is unavailable." };

    const { error: enrollmentError } = await client
      .from("learning_enrollments")
      .upsert(
        { user_id: user.id, course_id: catalog.id },
        { onConflict: "user_id,course_id", ignoreDuplicates: true }
      );
    if (enrollmentError) throw enrollmentError;

    const { data, error: readError } = await client
      .from("learning_enrollments")
      .select()
      .eq("user_id", user.id)
      .eq("course_id", catalog.id)
      .single();
    if (readError) throw readError;

    // Automatically place course sessions in the adaptive planner and calendar
    try {
      await scheduleFundamentalsCourse(course);
    } catch (schedErr) {
      console.warn("Could not auto-schedule course in planner upon enrollment", schedErr);
    }

    // Notify user of successful enrollment
    try {
      const definition = fundamentalsCourses[course];
      await createNotification({
        userId: user.id,
        category: "study_session_upcoming",
        title: `Enrolled: ${definition.title}`,
        body: `Day 1 is active. Your curriculum modules and laboratory simulators have been synchronized into your daily plan.`,
        actionUrl: `/fundamentals/${course}`,
        priority: "high",
      });
    } catch (notifErr) {
      console.warn("[Notifications] Enrollment notification warning:", notifErr);
    }

    for (const path of [
      "/roadmap/" + course,
      "/fundamentals/" + course,
      "/roadmap",
      "/plan",
      "/calendar",
      "/today",
      "/notifications",
      "/analytics",
    ])
      revalidatePath(path);
    return { ok: true as const, data };
  } catch (error) {
    console.error("Fundamentals enrollment failed", { course, error });
    return {
      ok: false as const,
      error: "Could not start this roadmap. Try again shortly.",
    };
  }
}
