"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { completeTaskAction } from "./actions";

export async function startStudySessionAction(
  taskId: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const nowIso = new Date().toISOString();

  // 1. Close any currently active study sessions for this user (prevent conflicting sessions)
  await supabase
    .from("study_sessions")
    .update({
      ended_at: nowIso,
    })
    .eq("user_id", user.id)
    .is("ended_at", null);

  // 2. Insert new active study session
  const { data: newSession, error: insertErr } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      task_id: taskId,
      session_type: "focus",
      started_at: nowIso,
      duration_seconds: 0,
    })
    .select("id")
    .single();

  if (insertErr || !newSession) {
    return { success: false, error: insertErr?.message || "Failed to start session" };
  }

  // 3. Mark task in_progress
  await supabase
    .from("daily_tasks")
    .update({
      status: "in_progress",
      updated_at: nowIso,
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .neq("status", "completed");

  revalidatePath("/today");
  return { success: true, sessionId: newSession.id };
}

export async function pauseStudySessionAction(
  sessionId: string,
  options: { taskId?: string } = {}
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
  let session: { id: string; started_at: string; duration_seconds: number | null } | null = null;

  if (isUuid) {
    const { data } = await supabase
      .from("study_sessions")
      .select("id, started_at, duration_seconds")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    session = data;
  }

  if (!session) {
    let query = supabase
      .from("study_sessions")
      .select("id, started_at, duration_seconds")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1);

    if (options.taskId) {
      query = query.eq("task_id", options.taskId);
    }
    const { data: fallback } = await query.maybeSingle();
    session = fallback;
  }

  if (!session) return { success: true };

  const now = Date.now();
  const startMs = Date.parse(session.started_at);
  const elapsedSinceStart = Number.isFinite(startMs) ? Math.max(0, Math.round((now - startMs) / 1000)) : 0;
  const newTotalSeconds = (session.duration_seconds || 0) + elapsedSinceStart;

  // We set ended_at to now to pause
  const { error } = await supabase
    .from("study_sessions")
    .update({
      duration_seconds: newTotalSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", session.id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/today");
  revalidatePath("/analytics");
  return { success: true };
}

export async function resumeStudySessionAction(
  sessionId: string,
  options: { taskId?: string } = {}
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const nowIso = new Date().toISOString();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);

  // Close any other open active sessions for this user
  let closeQuery = supabase
    .from("study_sessions")
    .update({ ended_at: nowIso })
    .eq("user_id", user.id)
    .is("ended_at", null);

  if (isUuid) {
    closeQuery = closeQuery.neq("id", sessionId);
  }
  await closeQuery;

  if (isUuid) {
    // Resume this session: clear ended_at, set started_at to now
    const { error } = await supabase
      .from("study_sessions")
      .update({
        started_at: nowIso,
        ended_at: null,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
  } else if (options.taskId) {
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      task_id: options.taskId,
      session_type: "focus",
      started_at: nowIso,
      duration_seconds: 0,
    });
  }

  revalidatePath("/today");
  revalidatePath("/analytics");
  return { success: true };
}

export async function finishStudySessionAction(
  sessionId: string,
  options: { markComplete?: boolean; taskId?: string } = {}
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
  let session: { id: string; task_id: string | null; started_at: string; duration_seconds: number | null; ended_at: string | null } | null = null;

  if (isUuid) {
    const { data } = await supabase
      .from("study_sessions")
      .select("id, task_id, started_at, duration_seconds, ended_at")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    session = data;
  }

  if (!session) {
    let query = supabase
      .from("study_sessions")
      .select("id, task_id, started_at, duration_seconds, ended_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(1);

    if (options.taskId) {
      query = query.eq("task_id", options.taskId);
    }
    const { data: fallback } = await query.maybeSingle();
    session = fallback;
  }

  const nowIso = new Date().toISOString();
  const targetTaskId = options.taskId || session?.task_id;

  if (session) {
    // If session was still running, add elapsed time
    let finalSeconds = session.duration_seconds || 0;
    if (!session.ended_at) {
      const startMs = Date.parse(session.started_at);
      if (Number.isFinite(startMs)) {
        finalSeconds += Math.max(0, Math.round((Date.now() - startMs) / 1000));
      }
    }

    // Close session
    await supabase
      .from("study_sessions")
      .update({
        ended_at: nowIso,
        duration_seconds: finalSeconds,
      })
      .eq("id", session.id)
      .eq("user_id", user.id);
  }

  // If user requested marking task complete
  if (options.markComplete && targetTaskId) {
    await completeTaskAction(targetTaskId);
  }

  revalidatePath("/today");
  revalidatePath("/analytics");
  return { success: true };
}

