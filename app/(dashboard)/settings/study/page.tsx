import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { StudySettingsForm } from "@/features/settings/components/study-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function StudySettingsContent() {
  const data = await getSettingsOverview("study");

  if (!data) {
    redirect("/login");
  }

  return <StudySettingsForm study={data.study} />;
}

export default function StudySettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <StudySettingsContent />
    </Suspense>
  );
}
