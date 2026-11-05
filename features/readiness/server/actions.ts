"use server";

import { createClient } from "@/lib/supabase/server";
import { getTargetReadinessData } from "./service";
import type { TargetReadinessResult } from "@/domain/readiness";

export async function fetchTargetReadinessAction(
  profileId?: string,
  companyId?: string
): Promise<{ data: TargetReadinessResult | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized" };
    }

    const data = await getTargetReadinessData(supabase, user.id, profileId, companyId);
    return { data, error: null };
  } catch (err) {
    console.error("fetchTargetReadinessAction error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load readiness data",
    };
  }
}
