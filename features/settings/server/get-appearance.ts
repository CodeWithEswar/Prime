import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppearancePreferences } from "../types";
import { appearancePreferencesUpdateSchema } from "../schema";

export const getAppearancePreferences = cache(
  async (userId: string): Promise<AppearancePreferences> => {
    const client: SupabaseClient = await createClient();
    const { data, error } = await client
      .from("user_appearance_preferences")
      .select("theme,motion_preference,ui_density,font_scaling")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) console.warn("[Settings] Appearance preferences unavailable", error.code);
    return appearancePreferencesUpdateSchema.parse({
      theme: data?.theme ?? "dark",
      motionPreference: data?.motion_preference ?? "system",
      uiDensity: data?.ui_density ?? "comfortable",
      fontScaling: data?.font_scaling ?? "normal",
    });
  }
);
