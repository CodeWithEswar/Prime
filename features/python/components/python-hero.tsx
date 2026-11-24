"use client";

import {
  CourseHero,
  type CourseHeroActions,
} from "@/components/shared/course-roadmap";
import type { PythonProgressMetrics } from "@/domain/python";

export function PythonHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: PythonProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="Python & DSA Mastery Roadmap"
      description="Zero-to-Hero curriculum covering Python language internals, Big-O, Lists, Stacks, Queues, Binary Trees, Heaps, Backtracking, Graphs & Dynamic Programming."
      edition="8 Structured Stages • 43 Verified Video Lectures (~24 Hours)"
      links={[
        ["/roadmap/data-engineering", "Data Engineering"],
        ["/roadmap/dbms", "DBMS Roadmap"],
        ["/roadmap/os", "OS Roadmap"],
        ["/roadmap/cn", "CN Roadmap"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="python"
      progress={metrics.progressPercentage}
      progressLabel="Curriculum Progress"
      metrics={[
        {
          label: "Videos Watched",
          value: metrics.watchedVideos,
          total: metrics.totalVideos,
        },
        {
          label: "Stages Mastered",
          value: metrics.completedStages,
          total: metrics.totalStages,
        },
        {
          label: "Time Invested",
          value: `${Math.round(metrics.watchedMinutes / 60)}h`,
          total: `${Math.round(metrics.totalEstimatedMinutes / 60)}h`,
        },
        {
          label: "Labs Solved",
          value: metrics.exercisesCompleted,
          total: metrics.totalExercises,
        },
      ]}
      note={`Stage ${metrics.completedStages + 1} of 8 · ${Math.max(
        0,
        Math.round((metrics.totalEstimatedMinutes - metrics.watchedMinutes) / 60)
      )} hours remaining`}
    />
  );
}
