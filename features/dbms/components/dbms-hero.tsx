"use client";

import { CourseHero, type CourseHeroActions } from "@/components/shared/course-roadmap";
import type { DBMSProgressMetrics } from "@/domain/dbms";

export function DBMSHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: DBMSProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="12-Day DBMS Learning Roadmap"
      description="Study relational databases from schema design and normalization through transactions, indexing, and query optimization."
      edition="91 Verified Neso Academy Lectures + 12 Deep Dives"
      links={[
        ["/roadmap/os", "OS Roadmap"],
        ["/roadmap/cn", "CN Roadmap"],
        ["/roadmap/oop", "OOP (Java)"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="dbms"
      progress={metrics.percentageComplete}
      progressLabel="Overall Progress"
      metrics={[
        {
          label: "Videos Watched",
          value: metrics.watchedVideos,
          total: metrics.totalVideos,
        },
        { label: "Days Completed", value: metrics.completedDays, total: 12 },
        {
          label: "Time Invested",
          value: `${Math.round(metrics.watchedMinutes / 60)}h`,
          total: `${Math.round(metrics.totalMinutes / 60)}h`,
        },
        {
          label: "SQL Solved",
          value: metrics.solvedExercises,
          total: metrics.totalExercises,
        },
      ]}
      note={`Day ${metrics.currentDay} of 12 · ${Math.max(0, Math.round((metrics.totalMinutes - metrics.watchedMinutes) / 60))} hours remaining`}
    />
  );
}
