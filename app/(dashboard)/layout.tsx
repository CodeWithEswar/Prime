import type { Metadata } from "next";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aiEnabled } from "@/lib/ai/config";
import { AppShell, type ShellData, type ShellUserData } from "@/components/shell";
import { SIDEBAR_PREFERENCE_COOKIE } from "@/components/shell/preference";
import { SettingsAppearance } from "@/features/settings/components/settings-appearance";
import { getAppearancePreferences } from "@/features/settings/server/get-appearance";

export const metadata: Metadata = {
  title: "Workspace — PRIME",
  description: "Preparation Roadmap for Interviews, Mastery & Excellence",
  robots: { index: false, follow: false },
};
export const instant = false;
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const initialCollapsed =
    (await cookies()).get(SIDEBAR_PREFERENCE_COOKIE)?.value === "true";
  const identity: ShellUserData = {
    id: user.id,
    email: user.email ?? "",
    displayName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "PRIME Member",
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
  const data: ShellData = {
    user: identity,
    preparationContext: null,
    dayContext: null,
    revisionDueCount: 0,
  };
  try {
    const [profile, settings, revisions] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_settings")
        .select("target_role,target_date,start_date,daily_study_minutes")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("revision_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")
        .lte("next_review_at", new Date().toISOString()),
    ]);
    if (profile.data) {
      data.user = {
        ...identity,
        displayName: profile.data.display_name || identity.displayName,
        avatarUrl: profile.data.avatar_url || identity.avatarUrl,
      };
    }
    // A default role alone is not evidence that this user configured a target.
    if (settings.data?.target_role && settings.data.target_date)
      data.preparationContext = {
        targetRole: settings.data.target_role,
        targetDate: settings.data.target_date,
        startDate: settings.data.start_date,
        dailyStudyMinutes: settings.data.daily_study_minutes,
      };
    data.revisionDueCount = revisions.error ? 0 : (revisions.count ?? 0);
    // Calendar elapsed time is not completed preparation. Planner day stays absent until supplied by a real plan.
  } catch {
    console.warn("PRIME shell context is temporarily unavailable.");
  }
  const appearance = await getAppearancePreferences(user.id);
  return (
    <AppShell
      shellData={data}
      initialCollapsed={initialCollapsed}
      aiEnabled={aiEnabled()}
    >
      <SettingsAppearance preferences={appearance} />
      {children}
    </AppShell>
  );
}
