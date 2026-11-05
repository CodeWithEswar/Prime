import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getRoadmapDashboardData } from "@/features/roadmap/queries/get-roadmap-data";
import { RoadmapView } from "@/features/roadmap/components/roadmap-view";
import { getProblemMasteries } from "@/features/mastery/server/service";

export const metadata: Metadata = {
  title: "DSA Roadmap — PRIME Core Curriculum",
  description:
    "Curated 189 canonical DSA problems sequenced across 16 stages with pedagogical prerequisites and deterministic recommendations.",
};

function RoadmapSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Category & Title */}
      <div className="h-20 bg-[#0E0E0E] rounded-md border border-[#1A1A1A]" />

      {/* Progress Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-[#0A0A0A] rounded-md border border-[#161616]" />
        ))}
      </div>

      {/* Hero */}
      <div className="h-36 bg-[#0E0E0E] rounded-md border border-[#222222]" />

      {/* Filter strip */}
      <div className="h-10 bg-[#0A0A0A] rounded-md border border-[#161616]" />

      {/* Main Spine */}
      <div className="flex gap-8">
        <div className="hidden xl:block w-64 h-96 bg-[#0A0A0A] rounded-md border border-[#161616]" />
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#0A0A0A] rounded-md border border-[#161616]" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function RoadmapContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getRoadmapDashboardData(supabase, user?.id ?? null);
  if (user) {
    const items = data.stages.flatMap(stage => stage.items);
    const mastery = await getProblemMasteries(supabase, user.id, items.map(item => item.problemId)).catch(() => null);
    if (mastery) for (const item of items) {
      item.masteryLevel = mastery.get(item.problemId)?.level;
    }
  }

  let fundamentals = [
    {
      course: "dbms" as const,
      title: "Database Management Systems",
      label: "DBMS",
      slug: "dbms-12-day",
      href: "/roadmap/dbms",
      enrolled: false,
      completedDays: 0,
      totalDays: 12,
      watchedVideos: 0,
      totalVideos: 91,
      progressPercentage: 0,
    },
    {
      course: "os" as const,
      title: "Operating Systems",
      label: "OS",
      slug: "os-12-day",
      href: "/roadmap/os",
      enrolled: false,
      completedDays: 0,
      totalDays: 12,
      watchedVideos: 0,
      totalVideos: 77,
      progressPercentage: 0,
    },
    {
      course: "cn" as const,
      title: "Computer Networks",
      label: "CN",
      slug: "cn-12-day",
      href: "/roadmap/cn",
      enrolled: false,
      completedDays: 0,
      totalDays: 12,
      watchedVideos: 0,
      totalVideos: 135,
      progressPercentage: 0,
    },
    {
      course: "oop" as const,
      title: "OOP with Java",
      label: "OOP",
      slug: "oop-12-day",
      href: "/roadmap/oop",
      enrolled: false,
      completedDays: 0,
      totalDays: 12,
      watchedVideos: 0,
      totalVideos: 7,
      progressPercentage: 0,
    },
  ];

  if (user) {
    const { data: enrollments } = await supabase
      .from("learning_enrollments")
      .select("course:learning_courses(slug), current_day, status")
      .eq("user_id", user.id);

    const enrolledSlugs = new Set(
      (enrollments ?? [])
        .map((e) => {
          const course = e.course as { slug: string } | null;
          return course?.slug;
        })
        .filter(Boolean)
    );

    fundamentals = fundamentals.map((f) => ({
      ...f,
      enrolled: enrolledSlugs.has(f.slug),
    }));
  }

  data.fundamentals = fundamentals;

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <RoadmapView data={data} />
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapSkeleton />}>
      <RoadmapContent />
    </Suspense>
  );
}
