import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { ConnectionsSettingsView } from "@/features/settings/components/connections-settings-view";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function ConnectionsSettingsContent() {
  const data = await getSettingsOverview("connections");

  if (!data) {
    redirect("/login");
  }

  return (
    <ConnectionsSettingsView
      email={data.profile.email}
      providers={data.security.providers}
    />
  );
}

export default function ConnectionsSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ConnectionsSettingsContent />
    </Suspense>
  );
}
