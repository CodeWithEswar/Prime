"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { snoozeRevisionFormSchema, type SnoozeRevisionFormData } from "../schema";

export interface SnoozeRevisionActionResult {
  success: boolean;
  error?: string;
  data?: {
    revisionItemId: string;
    snoozedUntil: string;
  };
}

export async function snoozeProblemRevisionAction(
  formData: SnoozeRevisionFormData
): Promise<SnoozeRevisionActionResult> {
  const validation = snoozeRevisionFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: "Invalid snooze configuration.",
    };
  }

  const { problemId, snoozeUntil } = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to snooze a revision.",
    };
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "snooze_problem_revision",
      {
        p_problem_id: problemId,
        p_snooze_until: snoozeUntil,
      }
    );

    if (rpcError) {
      console.error("Database RPC failed in snooze_problem_revision:", rpcError);
      return {
        success: false,
        error: "Failed to snooze revision. Please try again.",
      };
    }

    const payload = rpcResult as {
      revision_item_id: string;
      snoozed_until: string;
    };

    revalidatePath("/revision");
    revalidatePath("/practice/dsa");
    revalidatePath("/analytics");

    return {
      success: true,
      data: {
        revisionItemId: payload.revision_item_id,
        snoozedUntil: payload.snoozed_until,
      },
    };
  } catch (err: unknown) {
    console.error("Unexpected error during snoozeProblemRevisionAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred while snoozing your revision.",
    };
  }
}

