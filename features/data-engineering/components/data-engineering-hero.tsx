"use client";

import {
  CourseHero,
  type CourseHeroActions,
} from "@/components/shared/course-roadmap";
import type { DataEngineeringProgressMetrics } from "@/domain/data-engineering";

export function DataEngineeringHero({
  metrics,
  ...actions
}: CourseHeroActions & { metrics: DataEngineeringProgressMetrics }) {
  return (
    <CourseHero
      {...actions}
      title="Data Engineering Mastery Roadmap"
      description="Zero-to-Hero curriculum covering Python, SQL, Kimball modeling, Snowflake, Lakehouses (Iceberg/Delta), Spark, Kafka, Airflow, dbt & Cloud DataOps."
      edition="8 Structured Stages • 54 Verified Video Lectures (~65 Hours)"
      links={[
        ["/roadmap/dbms", "DBMS Roadmap"],
        ["/roadmap/os", "OS Roadmap"],
        ["/roadmap/cn", "CN Roadmap"],
        ["/roadmap", "DSA Roadmap"],
      ]}
      course="data-engineering"
      progress={metrics.percentageComplete}
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
          total: 8,
        },
        {
          label: "Time Invested",
          value: `${Math.round(metrics.watchedMinutes / 60)}h`,
          total: `${Math.round(metrics.totalMinutes / 60)}h`,
        },
        {
          label: "Labs Solved",
          value: metrics.solvedExercises,
          total: metrics.totalExercises,
        },
      ]}
      note={`Stage ${metrics.currentStage} of 8 · ${Math.max(
        0,
        Math.round((metrics.totalMinutes - metrics.watchedMinutes) / 60)
      )} hours remaining`}
    />
  );
}
