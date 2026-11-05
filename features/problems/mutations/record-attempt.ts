"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  recordAttemptFormSchema,
  type RecordAttemptFormData,
  type RecordAttemptFormInput,
} from "../schema";
import { deriveAttemptEffects } from "@/domain/attempts";
import type { UserProblemStatus } from "../types";
import { createNotification } from "@/features/notifications/server/sync-notifications";

export interface RecordAttemptActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: {
    attemptId: string;
    nextStatus: UserProblemStatus;
    nextIntervalDays: number;
    nextRevisionDate: string;
  };
}

/**
 * Server Action: Validates and securely records a DSA problem practice attempt.
 * Derives effects using pure domain rules and applies changes atomically via PostgreSQL RPC.
 */
export async function recordProblemAttemptAction(
  formData: RecordAttemptFormInput | RecordAttemptFormData
): Promise<RecordAttemptActionResult> {
  // 1. Validate Input Boundary
  const validation = recordAttemptFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: "Please correct the errors in the form.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { problemId, outcome, durationMinutes, confidence, notes } = validation.data;

  // 2. Authenticate User Boundary (Never trust client-provided user_id)
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to record a practice attempt.",
    };
  }

  try {
    // 3. Fetch Current Problem Progress & Revision Interval for Domain Calculation
    const [progressRes, revisionRes, problemRes] = await Promise.all([
      supabase
        .from("user_problem_progress")
        .select("status")
        .eq("user_id", user.id)
        .eq("problem_id", problemId)
        .maybeSingle(),

      supabase
        .from("revision_items")
        .select("interval_days")
        .eq("user_id", user.id)
        .eq("entity_type", "problem")
        .eq("entity_id", problemId)
        .maybeSingle(),
      supabase
        .from("problems")
        .select("id, title, slug")
        .eq("id", problemId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    if (progressRes.error || revisionRes.error)
      throw new Error("Current preparation state could not be loaded.");
    if (problemRes.error || !problemRes.data)
      return {
        success: false,
        error: "This problem is not available for recording an attempt.",
      };

    const currentStatus =
      (progressRes.data?.status as UserProblemStatus) || "not_started";
    const currentIntervalDays = revisionRes.data?.interval_days || 0;

    // 4. Pure Domain Effect Derivation
    const effects = deriveAttemptEffects({
      outcome,
      confidence,
      timeTakenMinutes: durationMinutes,
      currentStatus,
      currentIntervalDays,
    });

    // 5. Execute Atomic PostgreSQL RPC
    const timeTakenSeconds = durationMinutes * 60;
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "record_problem_attempt",
      {
        p_problem_id: problemId,
        p_outcome: outcome,
        p_time_taken_seconds: timeTakenSeconds,
        p_confidence: confidence,
        p_notes: notes ?? undefined,
        p_next_status: effects.nextStatus,
        p_interval_days: effects.nextIntervalDays,
      }
    );

    if (rpcError) {
      console.error("❌ Database RPC failed in record_problem_attempt:", rpcError);
      return {
        success: false,
        error: "Failed to persist attempt. Please try again.",
      };
    }

    const resultPayload = z.object({ attempt_id: z.string().uuid() }).parse(rpcResult);

    // Notify user of recorded attempt and scheduled review
    try {
      const outcomeLabel =
        outcome === "independent"
          ? "Solved independently"
          : outcome === "hint"
            ? "Solved with hint"
            : outcome === "solution_viewed"
              ? "Solution reviewed"
              : "Attempt recorded";
      await createNotification({
        userId: user.id,
        category: "system_announcement",
        title: `Attempt Logged: ${problemRes.data.title || "Algorithm Problem"}`,
        body: `${outcomeLabel} (${durationMinutes}m). Scheduled for Stage ${effects.nextIntervalDays}-day revision.`,
        actionUrl: "/revision",
        priority: "medium",
      });
    } catch (notifErr) {
      console.warn("[Notifications] Attempt notification warning:", notifErr);
    }

    revalidatePath("/practice/dsa");
    revalidatePath(`/practice/dsa/${problemRes.data.slug}`);
    revalidatePath("/revision");
    revalidatePath("/notifications");
    revalidatePath("/mastery");
    revalidatePath("/roadmap");
    revalidatePath("/analytics");

    return {
      success: true,
      data: {
        attemptId: resultPayload.attempt_id,
        nextStatus: effects.nextStatus,
        nextIntervalDays: effects.nextIntervalDays,
        nextRevisionDate: effects.nextRevisionDate.toISOString(),
      },
    };
  } catch (err: unknown) {
    console.error("❌ Unexpected error during recordProblemAttemptAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving your attempt.",
    };
  }
}
