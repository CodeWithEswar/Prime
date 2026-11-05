"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/server/sync-notifications";

export async function completeTaskAction(taskId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Fetch task to get planned minutes and daily_plan_id
  const { data: task, error: fetchErr } = await supabase
    .from("daily_tasks")
    .select("id, daily_plan_id, planned_minutes, status")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found" };
  }

  // Idempotency: If already completed, return success
  if (task.status === "completed") {
    return { success: true };
  }

  const nowIso = new Date().toISOString();

  // 2. Update task to completed
  const { error: updateErr } = await supabase
    .from("daily_tasks")
    .update({
      status: "completed",
      completed_at: nowIso,
      completed_minutes: task.planned_minutes,
      updated_at: nowIso,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 3. Close any active study session for this task
  await supabase
    .from("study_sessions")
    .update({
      ended_at: nowIso,
      duration_seconds: task.planned_minutes * 60,
    })
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .is("ended_at", null);

  // 4. Recalculate daily_plan metrics
  const { data: allPlanTasks } = await supabase
    .from("daily_tasks")
    .select("status, planned_minutes")
    .eq("daily_plan_id", task.daily_plan_id)
    .eq("user_id", user.id);

  const taskList = allPlanTasks ?? [];
  const completedMins = taskList
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.planned_minutes || 0), 0);
  const allComplete = taskList.length > 0 && taskList.every((t) => t.status === "completed" || t.status === "skipped");

  await supabase
    .from("daily_plans")
    .update({
      completed_minutes: completedMins,
      status: allComplete ? "completed" : "in_progress",
      updated_at: nowIso,
    })
    .eq("id", task.daily_plan_id)
    .eq("user_id", user.id);

  if (allComplete) {
    try {
      await createNotification({
        userId: user.id,
        category: "daily_study_digest",
        title: "Daily Runway Cleared! 🎉",
        body: `All planned tasks for today have been completed (${completedMins}m invested). Keep up the outstanding momentum!`,
        actionUrl: "/today",
        priority: "high",
      });
    } catch (notifErr) {
      console.warn("[Notifications] Daily complete notification warning:", notifErr);
    }
  }

  revalidatePath("/today");
  revalidatePath("/notifications");
  revalidatePath("/plan");
  revalidatePath("/calendar");
  revalidatePath("/analytics");
  return { success: true };
}

export async function skipTaskAction(
  taskId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("daily_tasks")
    .update({
      status: "skipped",
      decision_metadata: reason ? { skipReason: reason } : undefined,
      updated_at: nowIso,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/today");
  revalidatePath("/notifications");
  revalidatePath("/plan");
  revalidatePath("/calendar");
  revalidatePath("/analytics");
  return { success: true };
}
