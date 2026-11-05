import { Suspense } from "react";
import { getSettingsOverview } from "@/features/settings/server/get-settings-overview";
import { LearningSettingsForm } from "@/features/settings/components/learning-settings-form";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { redirect } from "next/navigation";

export const instant = false;

async function LearningSettingsContent() {
  const data = await getSettingsOverview("learning");

  if (!data) {
    redirect("/login");
  }

  return <LearningSettingsForm preferences={data.learning} />;
}

export default function LearningSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <LearningSettingsContent />
    </Suspense>
  );
}
