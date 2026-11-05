import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { UserPracticeSummary } from "../types";
import { getMasteredProblemIds } from "@/features/mastery/server/service";

/**
 * Computes truth-based summary statistics for the user's DSA preparation.
 * For unauthenticated users, returns all zeros gracefully without errors.
 */
export async function getUserPracticeSummary(
  supabase: SupabaseClient<Database>,
  userId?: string
): Promise<UserPracticeSummary> {
  const defaultSummary: UserPracticeSummary = {
    totalSolved: 0,
    totalAttempted: 0,
    totalNeedsRevision: 0,
    totalMastered: 0,
    revisionDueCount: 0,
    topicProgress: {},
  };

  if (!userId) {
    return defaultSummary;
  }

  const nowIso = new Date().toISOString();

  const [progressRes, revisionRes, mastered] = await Promise.all([
    supabase
      .from("user_problem_progress")
      .select("status")
      .eq("user_id", userId),

    supabase
      .from("revision_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("entity_type", "problem")
      .eq("status", "active")
      .lte("next_review_at", nowIso),
    getMasteredProblemIds(supabase, userId).catch(() => null),
  ]);

  let totalSolved = 0;
  let totalAttempted = 0;
  let totalNeedsRevision = 0;

  if (progressRes.data) {
    for (const row of progressRes.data) {
      if (row.status === "solved" || row.status === "mastered") totalSolved++;
      else if (row.status === "attempted") totalAttempted++;
      else if (row.status === "needs_revision") totalNeedsRevision++;
    }
  }

  return {
    totalSolved,
    totalAttempted,
    totalNeedsRevision,
    totalMastered: mastered?.length ?? null,
    revisionDueCount: revisionRes.count || 0,
    topicProgress: {},
  };
}

