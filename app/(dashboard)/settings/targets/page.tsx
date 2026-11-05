import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { TargetsSettingsForm } from "@/features/settings/components/targets-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function TargetsSettingsContent() {
  const data = await getSettingsOverview("targets");

  if (!data) {
    redirect("/login");
  }

  return <TargetsSettingsForm targets={data.targets} />;
}

export default function TargetsSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <TargetsSettingsContent />
    </Suspense>
  );
}
