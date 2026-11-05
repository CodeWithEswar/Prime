import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodaySnapshot } from "@/features/today/server/get-today-snapshot";
import { TodayView } from "@/features/today/components/today-view";

export const metadata: Metadata = {
  title: "Today — PRIME Execution Runway",
  description: "Daily execution command center for technical interview preparation, retention reviews, and focus sessions.",
};

function TodaySkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#0A0A0A] rounded-md border border-[#161616]" />

      {/* Load Rail Skeleton */}
      <div className="h-20 bg-[#080808] rounded-md border border-[#141414]" />

      {/* Next Action Skeleton */}
      <div className="h-44 bg-[#0A0A0A] rounded-md border border-[#1A1A1A]" />

      {/* Task Rows Skeletons */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-32 bg-[#141414] rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-[#080808] rounded-md border border-[#141414]" />
        ))}
      </div>
    </div>
  );
}

async function TodayContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const snapshot = await getTodaySnapshot(supabase, user.id);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <TodayView initialSnapshot={snapshot} />
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <TodayContent />
    </Suspense>
  );
}
