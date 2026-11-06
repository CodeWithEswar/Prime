"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  scheduleLessonPlanAction,
  createLessonRevisionAction,
} from "@/features/dsa-playlists/server/playlist-actions";
import type { AssignmentStatus } from "../types";

export async function enrollInKunalBootcampAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to enroll in this course." };
  }

  // 1. Get playlist id for kunal-kushwaha or kunal-java-dsa
  const { data: pl } = await supabase
    .from("dsa_playlists")
    .select("id")
    .or("slug.eq.kunal-kushwaha,slug.eq.kunal-java-dsa")
    .limit(1)
    .maybeSingle();

  const playlistId = pl?.id;

  if (playlistId) {
    await supabase.from("dsa_playlist_enrollments").upsert(
      {
        user_id: user.id,
        playlist_id: playlistId,
        status: "active",
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: "user_id,playlist_id" }
    );
  }

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  revalidatePath("/practice/dsa/playlists");
  revalidatePath("/today");

  return { success: true };
}

export async function markKunalLessonCompletedAction(youtubeVideoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to track progress." };
  }

  const now = new Date().toISOString();

  // 1. Mark video progress
  await supabase.from("dsa_video_progress").upsert(
    {
      user_id: user.id,
      video_id: youtubeVideoId,
      status: "completed",
      completed_at: now,
      last_opened_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,video_id" }
  );

  // 2. Update enrollment activity
  const { data: pl } = await supabase
    .from("dsa_playlists")
    .select("id")
    .or("slug.eq.kunal-kushwaha,slug.eq.kunal-java-dsa")
    .limit(1)
    .maybeSingle();

  if (pl?.id) {
    await supabase.from("dsa_playlist_enrollments").upsert(
      {
        user_id: user.id,
        playlist_id: pl.id,
        status: "active",
        last_video_id: youtubeVideoId,
        last_activity_at: now,
      },
      { onConflict: "user_id,playlist_id" }
    );
  }

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  revalidatePath("/practice/dsa/playlists/kunal-kushwaha/analytics");
  revalidatePath("/practice/dsa/playlists");
  revalidatePath("/today");

  return { success: true };
}

export async function markKunalLessonIncompleteAction(youtubeVideoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  await supabase.from("dsa_video_progress").upsert(
    {
      user_id: user.id,
      video_id: youtubeVideoId,
      status: "in_progress",
      completed_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" }
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  revalidatePath("/practice/dsa/playlists/kunal-kushwaha/analytics");
  revalidatePath("/practice/dsa/playlists");

  return { success: true };
}

export async function toggleKunalChapterCompletedAction(chapterId: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  await (supabase as any).from("dsa_chapter_progress").upsert(
    {
      user_id: user.id,
      chapter_id: chapterId,
      completed,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,chapter_id" }
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  return { success: true };
}

export async function updateKunalAssignmentStatusAction(
  assignmentSlug: string,
  status: AssignmentStatus,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  const now = new Date().toISOString();

  await (supabase as any).from("dsa_user_assignment_progress").upsert(
    {
      user_id: user.id,
      assignment_id: assignmentSlug,
      status,
      notes: notes || null,
      last_activity_at: now,
      completed_at: status === "completed" ? now : null,
      updated_at: now,
    },
    { onConflict: "user_id,assignment_id" }
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  revalidatePath("/practice/dsa/playlists/kunal-kushwaha/analytics");
  return { success: true };
}

export async function saveKunalLessonNotesAction(youtubeVideoId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  await supabase.from("dsa_video_notes").upsert(
    {
      user_id: user.id,
      video_id: youtubeVideoId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" }
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  return { success: true };
}

export async function toggleKunalLessonBookmarkAction(youtubeVideoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("dsa_video_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", youtubeVideoId)
    .maybeSingle();

  if (existing) {
    await supabase.from("dsa_video_bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("dsa_video_bookmarks").insert({
      user_id: user.id,
      video_id: youtubeVideoId,
    });
  }

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  return { success: true, isBookmarked: !existing };
}

export async function toggleKunalProblemSolvedAction(problemSlug: string, solved: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  // Find canonical problem id
  const { data: prob } = await supabase
    .from("problems")
    .select("id")
    .or(`leetcode_slug.eq.${problemSlug},slug.eq.${problemSlug}`)
    .maybeSingle();

  const now = new Date().toISOString();

  if (prob?.id) {
    await supabase.from("problem_attempts").upsert(
      {
        user_id: user.id,
        problem_id: prob.id,
        outcome: solved ? "solved" : "attempted",
        confidence: 4,
        attempted_at: now,
      },
      { onConflict: "user_id,problem_id" }
    );
  }

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  revalidatePath("/practice/dsa/playlists/kunal-kushwaha/analytics");
  revalidatePath("/practice/dsa/sheets/striver-a2z");
  return { success: true };
}

export async function addKunalLessonToPlanAction(
  youtubeVideoId: string,
  title: string,
  scheduledDate: string
) {
  const res = await scheduleLessonPlanAction(
    youtubeVideoId,
    scheduledDate,
    title,
    30
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  return res;
}

export async function createKunalLessonRevisionAction(
  youtubeVideoId: string,
  title: string,
  topicSlug: string
) {
  const res = await createLessonRevisionAction(
    youtubeVideoId,
    topicSlug,
    title
  );

  revalidatePath("/practice/dsa/playlists/kunal-kushwaha");
  return res;
}

