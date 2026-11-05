"use client";

import { CourseHero, type CourseHeroActions } from "@/components/shared/course-roadmap";
import type { OSProgressMetrics } from "@/domain/os";

export function OSHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: OSProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="12-Day Operating Systems Learning Roadmap"
      description="Work through process scheduling, synchronization, deadlocks, virtual memory, and disk scheduling."
      edition="77 Indexed Neso Academy Lessons + 6 Interactive Labs"
      links={[
        ["/roadmap/dbms", "DBMS Roadmap"],
        ["/roadmap/cn", "CN Roadmap"],
        ["/roadmap/oop", "OOP (Java)"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="os"
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
