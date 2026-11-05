import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { SecuritySettingsForm } from "@/features/settings/components/security-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function SecuritySettingsContent() {
  const data = await getSettingsOverview("security");

  if (!data) {
    redirect("/login");
  }

  return <SecuritySettingsForm security={data.security} />;
}

export default function SecuritySettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SecuritySettingsContent />
    </Suspense>
  );
}
