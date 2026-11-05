"use client";

import { CourseHero, type CourseHeroActions } from "@/components/shared/course-roadmap";
import type { OOPProgressMetrics } from "@/domain/oop";

export function OOPHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: OOPProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="Object-Oriented Programming with Java"
      description="Practice Java classes, inheritance, and interfaces, then apply SOLID principles to low-level design cases."
      edition="12 study days · 7 lectures · 10 labs · 10 design cases"
      links={[
        ["/roadmap/dbms", "DBMS"],
        ["/roadmap/os", "OS"],
        ["/roadmap/cn", "CN"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="oop"
      progress={metrics.coursePercentage}

      metrics={[
        { label: "Study Days", value: metrics.completedDays, total: metrics.totalDays },
        { label: "Lectures", value: metrics.watchedVideos, total: metrics.totalVideos },
        {
          label: "Segments",
          value: metrics.completedSegments,
          total: metrics.totalSegments,
        },
        {
          label: "Labs & LLD",
          value: metrics.completedLabs + metrics.completedDesignCases,
          total: 20,
        },
      ]}
    />
  );
}
