import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRange } from "@/features/calendar/server/get-calendar-range";
import { CalendarView } from "@/features/calendar/components/calendar-view";
import type { CalendarViewMode } from "@/features/calendar/types";

export const metadata: Metadata = {
  title: "Calendar — PRIME Preparation Canvas",
  description:
    "Temporal preparation canvas: workload intelligence, capacity mapping, and revision signals across time.",
};

function CalendarSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-6 lg:p-8 space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#0A0A0A] rounded-md border border-[#161616]" />

      {/* Grid + Lens Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-3">
          <div className="h-8 bg-[#090909] rounded border border-[#141414]" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-[#080808] rounded-md border border-[#141414]"
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-[380px] h-[520px] bg-[#0A0A0A] rounded-lg border border-[#181818]" />
      </div>
    </div>
  );
}

interface CalendarPageProps {
  searchParams?: Promise<{
    month?: string;
    date?: string;
    view?: string;
  }>;
}

async function CalendarContent({
  searchParams,
}: {
  searchParams?: Promise<{
    month?: string;
    date?: string;
    view?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const validView =
    resolvedParams.view === "week" || resolvedParams.view === "agenda"
      ? (resolvedParams.view as CalendarViewMode)
      : "month";

  const snapshot = await getCalendarRange(supabase, user.id, {
    month: resolvedParams.month,
    date: resolvedParams.date,
    view: validView,
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-6 lg:p-8">
      <CalendarView initialSnapshot={snapshot} />
    </div>
  );
}

export default function CalendarPage({ searchParams }: CalendarPageProps) {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarContent searchParams={searchParams} />
    </Suspense>
  );
}

