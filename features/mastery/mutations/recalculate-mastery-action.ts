"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recalculateProblemMastery } from "../server/service";
import { recalculateMasteryInputSchema, type RecalculateMasteryInput } from "../schema";

export interface RecalculateMasteryActionResult {
  success: boolean;
  error?: string;
  data?: {
    problemId: string;
    level: string;
    score: number;
    nextEvidence: string;
  };
}

export async function recalculateMasteryAction(
  input: RecalculateMasteryInput
): Promise<RecalculateMasteryActionResult> {
  const parsed = recalculateMasteryInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid problem ID provided for mastery calculation.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to calculate mastery.",
    };
  }

  try {
    const result = await recalculateProblemMastery({
      supabase,
      userId: user.id,
      problemId: parsed.data.problemId,
    });

    revalidatePath("/mastery");
    revalidatePath("/practice/dsa");
    revalidatePath("/roadmap");
    revalidatePath("/analytics");

    return {
      success: true,
      data: {
        problemId: result.problemId,
        level: result.level,
        score: result.score,
        nextEvidence: result.nextEvidence,
      },
    };
  } catch (err) {
    console.error("Failed to recalculate mastery:", err);
    return {
      success: false,
      error: "Failed to recalculate mastery. Please try again.",
    };
  }
}

