"use client";

import { CourseHero, type CourseHeroActions } from "@/components/shared/course-roadmap";
import type { CNProgressMetrics } from "@/domain/cn";

export function CNHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: CNProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="12-Day Computer Networks Learning Roadmap & Laboratory"
      description="Practice subnetting and routing, then trace how TCP, DNS, and HTTP work across the network."
      edition="135 Neso Academy Positions + 10 Interactive Labs"
      links={[
        ["/roadmap/os", "OS Roadmap"],
        ["/roadmap/dbms", "DBMS Roadmap"],
        ["/roadmap/oop", "OOP (Java)"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="cn"
      progress={metrics.completionPercentage}

      metrics={[
        {
          label: "Videos Watched",
          value: metrics.watchedVideos,
          total: metrics.totalVideos,
        },
        {
          label: "Days Completed",
          value: metrics.completedDays,
          total: metrics.totalDays,
        },
        {
          label: "Labs Verified",
          value: metrics.labsCompletedCount,
          total: metrics.totalLabs,
        },
        { label: "Revisions Due", value: metrics.revisionDueCount },
      ]}
    />
  );
}
