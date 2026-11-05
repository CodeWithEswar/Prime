"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recordRevisionFormSchema, type RecordRevisionFormData } from "../schema";
import { createNotification } from "@/features/notifications/server/sync-notifications";

export interface CompleteRevisionActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: {
    revisionItemId: string;
    attemptId: string;
    problemId: string;
    rating: string;
    previousIntervalDays: number;
    nextIntervalDays: number;
    nextReviewAt: string;
  };
}

export async function completeProblemRevisionAction(
  formData: RecordRevisionFormData
): Promise<CompleteRevisionActionResult> {
  const validation = recordRevisionFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: "Please complete the required revision fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { problemId, rating, timeSpentMinutes, confidence, notes } = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to record a revision.",
    };
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "complete_problem_revision",
      {
        p_problem_id: problemId,
        p_rating: rating,
        p_time_spent_minutes: timeSpentMinutes,
        p_confidence: confidence,
        p_notes: notes ?? undefined,
      }
    );

    if (rpcError) {
      console.error("Database RPC failed in complete_problem_revision:", rpcError);
      return {
        success: false,
        error: "Failed to persist revision. Please try again.",
      };
    }

    const payload = rpcResult as {
      revision_item_id: string;
      attempt_id: string;
      problem_id: string;
      rating: string;
      previous_interval_days: number;
      next_interval_days: number;
      next_review_at: string;
    };

    // Notify user of successful retention milestone
    try {
      const { data: prob } = await supabase
        .from("problems")
        .select("title")
        .eq("id", problemId)
        .maybeSingle();

      const probTitle = prob?.title || "Problem";
      await createNotification({
        userId: user.id,
        category: "revision_due",
        title: `Retention Verified: ${probTitle}`,
        body: `Self-assessment: ${rating}. Stage upgraded from ${payload.previous_interval_days} to ${payload.next_interval_days} days.`,
        actionUrl: "/revision",
        priority: "medium",
      });
    } catch (notifErr) {
      console.warn("[Notifications] Revision complete notification warning:", notifErr);
    }

    revalidatePath("/revision");
    revalidatePath("/notifications");
    revalidatePath("/practice/dsa");
    revalidatePath("/practice/dsa/[problemSlug]", "page");
    revalidatePath("/mastery");
    revalidatePath("/roadmap");
    revalidatePath("/analytics");

    return {
      success: true,
      data: {
        revisionItemId: payload.revision_item_id,
        attemptId: payload.attempt_id,
        problemId: payload.problem_id,
        rating: payload.rating,
        previousIntervalDays: payload.previous_interval_days,
        nextIntervalDays: payload.next_interval_days,
        nextReviewAt: payload.next_review_at,
      },
    };
  } catch (err: unknown) {
    console.error("Unexpected error during completeProblemRevisionAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving your revision.",
    };
  }
}
