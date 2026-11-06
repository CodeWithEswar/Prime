"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enrollInPlaylistAction(playlistSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to enroll in this course." };
  }

  // 1. Get playlist id
  const { data: pl, error: plErr } = await supabase
    .from("dsa_playlists")
    .select("id")
    .eq("slug", playlistSlug)
    .single();

  if (plErr || !pl) {
    return { success: false, error: "Playlist not found." };
  }

  // 2. Get first video
  const { data: firstItem } = await supabase
    .from("dsa_playlist_items")
    .select("video_id")
    .eq("playlist_id", pl.id)
    .eq("position", 1)
    .maybeSingle();

  // 3. Upsert enrollment
  const { error: enrollErr } = await supabase
    .from("dsa_playlist_enrollments")
    .upsert(
      {
        user_id: user.id,
        playlist_id: pl.id,
        status: "active",
        last_video_id: firstItem?.video_id || null,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: "user_id,playlist_id" }
    );

  if (enrollErr) {
    console.error("Enrollment error:", enrollErr);
    return { success: false, error: "Failed to enroll in playlist." };
  }

  revalidatePath(`/practice/dsa/playlists`);
  revalidatePath(`/practice/dsa/playlists/${playlistSlug}`);
  revalidatePath(`/dsa/playlists`);
  revalidatePath(`/today`);

  return { success: true };
}

export async function updateEnrollmentStatusAction(
  playlistSlug: string,
  status: "active" | "paused" | "archived"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  const { data: pl } = await supabase
    .from("dsa_playlists")
    .select("id")
    .eq("slug", playlistSlug)
    .single();

  if (!pl) return { success: false, error: "Playlist not found." };

  const { error } = await supabase
    .from("dsa_playlist_enrollments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("playlist_id", pl.id);

  if (error) {
    return { success: false, error: "Failed to update enrollment status." };
  }

  revalidatePath(`/practice/dsa/playlists`);
  revalidatePath(`/practice/dsa/playlists/${playlistSlug}`);
  return { success: true };
}

export async function markLessonCompletedAction(
  videoDbId: string,
  playlistSlug?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to track progress." };
  }

  const now = new Date().toISOString();

  // 1. Mark video completed
  const { error: progErr } = await supabase
    .from("dsa_video_progress")
    .upsert(
      {
        user_id: user.id,
        video_id: videoDbId,
        status: "completed",
        completed_at: now,
        last_opened_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,video_id" }
    );

  if (progErr) {
    console.error("Mark completed error:", progErr);
    return { success: false, error: "Failed to update lesson progress." };
  }

  // 2. If playlistSlug provided, update enrollment last active video and activity timestamp
  if (playlistSlug) {
    const { data: pl } = await supabase
      .from("dsa_playlists")
      .select("id")
      .eq("slug", playlistSlug)
      .maybeSingle();

    if (pl) {
      await supabase
        .from("dsa_playlist_enrollments")
        .upsert(
          {
            user_id: user.id,
            playlist_id: pl.id,
            last_video_id: videoDbId,
            last_activity_at: now,
            status: "active",
          },
          { onConflict: "user_id,playlist_id" }
        );
    }
  }

  if (playlistSlug) {
    revalidatePath(`/practice/dsa/playlists/${playlistSlug}`);
  }
  revalidatePath(`/practice/dsa/playlists`);
  revalidatePath(`/today`);

  return { success: true };
}

export async function markLessonIncompleteAction(
  videoDbId: string,
  playlistSlug?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  const { error } = await supabase
    .from("dsa_video_progress")
    .upsert(
      {
        user_id: user.id,
        video_id: videoDbId,
        status: "in_progress",
        completed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,video_id" }
    );

  if (error) {
    return { success: false, error: "Failed to update lesson progress." };
  }

  if (playlistSlug) {
    revalidatePath(`/practice/dsa/playlists/${playlistSlug}`);
  }
  revalidatePath(`/practice/dsa/playlists`);
  revalidatePath(`/today`);

  return { success: true };
}

export async function updateLessonPositionAction(
  videoDbId: string,
  positionSeconds: number,
  watchedSeconds: number,
  playlistSlug?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const now = new Date().toISOString();

  await supabase.from("dsa_video_progress").upsert(
    {
      user_id: user.id,
      video_id: videoDbId,
      last_position_seconds: Math.floor(positionSeconds),
      watched_seconds: Math.floor(watchedSeconds),
      last_opened_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,video_id" }
  );

  if (playlistSlug) {
    const { data: pl } = await supabase
      .from("dsa_playlists")
      .select("id")
      .eq("slug", playlistSlug)
      .maybeSingle();

    if (pl) {
      await supabase
        .from("dsa_playlist_enrollments")
        .update({
          last_video_id: videoDbId,
          last_activity_at: now,
        })
        .eq("user_id", user.id)
        .eq("playlist_id", pl.id);
    }
  }

  return { success: true };
}

export async function saveLessonNoteAction(
  videoDbId: string,
  content: string,
  timestampSeconds?: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Sign in to save notes." };

  const { error } = await supabase.from("dsa_video_notes").upsert(
    {
      user_id: user.id,
      video_id: videoDbId,
      content,
      timestamp_seconds: timestampSeconds ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" }
  );

  if (error) {
    return { success: false, error: "Failed to save note." };
  }

  return { success: true };
}

export async function toggleLessonBookmarkAction(
  videoDbId: string,
  playlistId?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Sign in to bookmark lessons." };

  // Check if exists
  const { data: existing } = await supabase
    .from("dsa_video_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoDbId)
    .maybeSingle();

  if (existing) {
    await supabase.from("dsa_video_bookmarks").delete().eq("id", existing.id);
    return { success: true, bookmarked: false };
  } else {
    await supabase.from("dsa_video_bookmarks").insert({
      user_id: user.id,
      video_id: videoDbId,
      playlist_id: playlistId || null,
    });
    return { success: true, bookmarked: true };
  }
}

export async function scheduleLessonPlanAction(
  videoDbId: string,
  date: string,
  title: string,
  plannedMinutes = 30
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Sign in to schedule tasks." };

  // 1. Ensure daily plan exists for user and date
  let { data: plan } = await supabase
    .from("daily_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("plan_date", date)
    .maybeSingle();

  if (!plan) {
    const { data: newPlan, error: planErr } = await supabase
      .from("daily_plans")
      .insert({
        user_id: user.id,
        plan_date: date,
        day_number: 1,
        status: "planned",
      })
      .select("id")
      .single();

    if (planErr || !newPlan) {
      return { success: false, error: "Failed to initialize daily plan." };
    }
    plan = newPlan;
  }

  // 2. Insert daily task
  const { error: taskErr } = await supabase.from("daily_tasks").insert({
    user_id: user.id,
    daily_plan_id: plan.id,
    task_type: "custom",
    title: `Watch DSA: ${title}`,
    status: "planned",
    priority: "p1",
    planned_minutes: plannedMinutes,
    scheduled_reason: `Scheduled DSA course video lesson`,
  });

  if (taskErr) {
    console.error("Daily task insert error:", taskErr);
    return { success: false, error: "Failed to schedule task." };
  }

  revalidatePath(`/today`);
  revalidatePath(`/plan`);
  return { success: true };
}

export async function createLessonRevisionAction(
  videoDbId: string,
  topicSlug: string,
  title: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Sign in to add revision." };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { error } = await supabase.from("revision_items").insert({
    user_id: user.id,
    entity_id: videoDbId,
    entity_type: "dsa_video",
    interval_days: 1,
    next_review_at: tomorrow.toISOString(),
    status: "pending",
  });

  if (error) {
    console.error("Revision item creation error:", error);
    return { success: false, error: "Failed to create revision item." };
  }

  revalidatePath(`/revision`);
  return { success: true };
}

