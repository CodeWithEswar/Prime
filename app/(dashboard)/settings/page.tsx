import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { SettingsOverviewView } from "@/features/settings/components/settings-overview-view";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function SettingsOverviewContent() {
  const data = await getSettingsOverview();

  if (!data) {
    redirect("/login");
  }

  return <SettingsOverviewView data={data} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsOverviewContent />
    </Suspense>
  );
}
