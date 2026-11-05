"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ToggleBookmarkActionResult {
  success: boolean;
  error?: string;
  bookmarked?: boolean;
}

export async function toggleRevisionBookmarkAction(
  problemId: string
): Promise<ToggleBookmarkActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to bookmark a problem.",
    };
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "toggle_revision_bookmark",
      {
        p_problem_id: problemId,
      }
    );

    if (rpcError) {
      console.error("Database RPC failed in toggle_revision_bookmark:", rpcError);
      return {
        success: false,
        error: "Failed to update bookmark.",
      };
    }

    revalidatePath("/revision");

    return {
      success: true,
      bookmarked: Boolean(rpcResult),
    };
  } catch (err: unknown) {
    console.error("Unexpected error during toggleRevisionBookmarkAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred while toggling bookmark.",
    };
  }
}

