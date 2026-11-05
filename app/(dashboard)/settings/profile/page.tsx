import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function ProfileSettingsContent() {
  const data = await getSettingsOverview("profile");

  if (!data) {
    redirect("/login");
  }

  return <ProfileSettingsForm profile={data.profile} />;
}

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ProfileSettingsContent />
    </Suspense>
  );
}
