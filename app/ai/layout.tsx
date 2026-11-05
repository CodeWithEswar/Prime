import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aiEnabled } from "@/lib/ai/config";
import { AIProvider } from "@/features/ai/ai-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsAppearance } from "@/features/settings/components/settings-appearance";
import { getAppearancePreferences } from "@/features/settings/server/get-appearance";
import "@/features/ai/components/ai.css";

export const metadata: Metadata = {
  title: "PRIME AI — Preparation Intelligence",
  description:
    "Direct algorithmic assistance, pattern guidance, and deliberate practice intelligence.",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AILayout({
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

  const appearance = await getAppearancePreferences(user.id);

  return (
    <TooltipProvider delayDuration={150}>
      <AIProvider key={user.id} userId={user.id} enabled={aiEnabled()}>
        <SettingsAppearance preferences={appearance} />
        <div className="ai-standalone-root">{children}</div>
      </AIProvider>
    </TooltipProvider>
  );
}

