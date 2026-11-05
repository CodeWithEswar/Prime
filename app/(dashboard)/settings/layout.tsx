import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { SettingsDraftGuard } from "@/features/settings/components/settings-primitives";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";

export const instant = false;

export const metadata: Metadata = {
  title: "Settings — PRIME",
  description: "Manage your account and preparation preferences.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageFrame
      title="Settings"
      description="Manage your account and preparation preferences."
      variant="workspace"
      className="@container"
    >
      <SettingsDraftGuard>
        <div className="grid min-w-0 gap-6 @min-[58rem]:grid-cols-[12.5rem_minmax(0,1fr)] @min-[58rem]:gap-8">
          <SettingsNav />
          <div className="min-w-0">
            <Suspense fallback={<SettingsSkeleton />}>{children}</Suspense>
          </div>
        </div>
      </SettingsDraftGuard>
    </PageFrame>
  );
}
