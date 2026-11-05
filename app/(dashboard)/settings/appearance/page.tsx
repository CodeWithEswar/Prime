import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { AppearanceSettingsForm } from "@/features/settings/components/appearance-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function AppearanceSettingsContent() {
  const data = await getSettingsOverview("appearance");

  if (!data) {
    redirect("/login");
  }

  return <AppearanceSettingsForm preferences={data.appearance} />;
}

export default function AppearanceSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <AppearanceSettingsContent />
    </Suspense>
  );
}
