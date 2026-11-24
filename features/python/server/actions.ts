"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function togglePythonVideoProgressAction(
  videoId: string,
  watched: boolean,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const { error } = await supabase.from("learning_video_progress").upsert(
      {
        user_id: user.id,
        video_id: videoId,
        status: watched ? "completed" : "unwatched",
        watched_at: watched ? new Date().toISOString() : null,
        notes: notes ?? null,
      },
      { onConflict: "user_id,video_id" }
    );

    if (error) throw error;

    revalidatePath("/roadmap/python");
    revalidatePath("/roadmap");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update video progress";
    return { success: false, error: message };
  }
}

export async function togglePythonEnrollmentAction(enrolled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const { data: courseRow } = await supabase
      .from("learning_courses")
      .select("id")
      .eq("slug", "python-dsa")
      .maybeSingle();

    if (courseRow?.id) {
      if (enrolled) {
        await supabase.from("learning_enrollments").upsert(
          {
            user_id: user.id,
            course_id: courseRow.id,
            status: "active",
            current_day: 1,
          },
          { onConflict: "user_id,course_id" }
        );
      } else {
        await supabase
          .from("learning_enrollments")
          .delete()
          .eq("user_id", user.id)
          .eq("course_id", courseRow.id);
      }
    }

    revalidatePath("/roadmap/python");
    revalidatePath("/roadmap");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update enrollment";
    return { success: false, error: message };
  }
}
