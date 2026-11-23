import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  calculateDataEngineeringProgress,
  DATA_ENGINEERING_STAGE_INTERVIEWS,
  type DataEngineeringDashboardData,
  type DataEngineeringVideoItem,
  type DataEngineeringExercise,
  type DataEngineeringStageSchedule,
  type DataEngineeringCourseState,
} from "@/domain/data-engineering";
import manifestJson from "@/content/data-engineering/data-engineering-manifest.json";
import exercisesJson from "@/content/data-engineering/data-engineering-exercises.json";

type Client = SupabaseClient<Database>;

const COURSE_SLUG = "data-engineering-12-day";

const STAGE_PRACTICAL_ASSIGNMENTS: Record<
  number,
  { title: string; description: string; submissionType: "checkbox" | "query" | "code" }
> = {
  1: {
    title: "Production Python & POSIX ETL Pipeline",
    description:
      "Build a robust Python pipeline that streams paginated records from a public API, performs data validation with Pydantic, writes partitioned Parquet into DuckDB, and schedules daily ingestion using crontab with POSIX error traps.",
    submissionType: "checkbox",
  },
  2: {
    title: "Kimball Dimensional Schema & Snowflake Clones",
    description:
      "Design an enterprise dimensional model for an on-demand delivery platform. Implement SCD Type 2 tracking for delivery partners and write zero-copy clone migration tests in Snowflake.",
    submissionType: "checkbox",
  },
  3: {
    title: "Lakehouse Medallion Architecture with Apache Iceberg",
    description:
      "Implement Bronze, Silver, and Gold lakehouse tiers using Apache Iceberg open table formats. Evolve partition schemes dynamically and execute historical time-travel audit queries.",
    submissionType: "checkbox",
  },
  4: {
    title: "Distributed PySpark Optimization & Skew Mitigation",
    description:
      "Process 100M+ event logs with PySpark. Apply key salting to eliminate shuffle partition skew, utilize Adaptive Query Execution (AQE), and benchmark broadcast hash joins against standard sort-merge joins.",
    submissionType: "checkbox",
  },
  5: {
    title: "Idempotent Apache Airflow DAG with SLAs & Alerting",
    description:
      "Author an Airflow production DAG with execution_date partitioning, TaskGroups, dynamic task mapping, exponential retry policies, and automated Slack webhook error alerting.",
    submissionType: "checkbox",
  },
  6: {
    title: "Real-Time Streaming Engine with Kafka & Apache Flink",
    description:
      "Set up a high-throughput Apache Kafka topic with partitioning keys. Ingest the event stream in Apache Flink, calculating 5-minute tumbling window metrics with event-time watermarking.",
    submissionType: "checkbox",
  },
  7: {
    title: "dbt Incremental Pipeline & Automated Quality Gate",
    description:
      "Construct a dbt Core transformation project featuring incremental models with unique keys, modular Jinja macros, and automated Great Expectations data quality test suites.",
    submissionType: "checkbox",
  },
  8: {
    title: "DataOps Infrastructure as Code & Slim CI Pipeline",
    description:
      "Provision cloud data lake storage and IAM roles using Terraform. Create a GitHub Actions CI/CD workflow that executes Slim CI testing against modified dbt models and lints SQL with SQLFluff.",
    submissionType: "checkbox",
  },
};

export async function getDataEngineeringDashboardData(
  client: Client | null,
  userId: string | null
): Promise<DataEngineeringDashboardData> {
  const allVideos: DataEngineeringVideoItem[] = (
    manifestJson.videos as unknown as DataEngineeringVideoItem[]
  ).map((v) => ({
    ...v,
    verificationStatus: "verified",
  }));

  const exercises = exercisesJson as unknown as DataEngineeringExercise[];

  const rawStages = manifestJson.stages;
  const stages: DataEngineeringStageSchedule[] = rawStages.map((st) => {
    const stageNum = st.stageNumber;
    const stageVideos = allVideos.filter((v) => v.stageNumber === stageNum);
    const videoPositions = stageVideos.map((v) => v.position);

    const practicalAssignment =
      STAGE_PRACTICAL_ASSIGNMENTS[stageNum] ?? {
        title: `Stage ${stageNum} Capstone Implementation`,
        description: `Complete all stage ${stageNum} hands-on labs and architecture designs.`,
        submissionType: "checkbox" as const,
      };

    const interviewQuestions =
      DATA_ENGINEERING_STAGE_INTERVIEWS[stageNum] ?? [];

    const modules = st.modules.map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      videos: m.videos.map((v) => ({
        ...v,
        stageNumber: stageNum,
        moduleId: m.id,
        difficulty: v.difficulty as DataEngineeringVideoItem["difficulty"],
        importance: v.importance as DataEngineeringVideoItem["importance"],
        verificationStatus: "verified" as const,
      })),
    }));

    return {
      stageNumber: stageNum,
      id: st.id,
      title: st.title,
      subtitle: st.subtitle,
      description: st.description,
      level: st.level,
      estimatedMinutes: st.estimatedMinutes,
      learningOutcomes: st.learningOutcomes,
      modules,
      videoPositions,
      practicalAssignment,
      interviewQuestions,
    };
  });

  const userState: DataEngineeringCourseState = {
    enrolled: false,
    enrolledAt: null,
    currentStage: 1,
    videoProgress: {},
    exerciseAttempts: {},
    stageProgress: {},
  };

  if (client && userId) {
    try {
      const { data: courseRow } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", COURSE_SLUG)
        .maybeSingle();

      const courseId = courseRow?.id;

      const [enrollmentRes, videoProgRes, exerciseProgRes, dayProgRes] =
        await Promise.all([
          courseId
            ? client
                .from("learning_enrollments")
                .select("current_day, created_at, status")
                .eq("user_id", userId)
                .eq("course_id", courseId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          client
            .from("learning_video_progress")
            .select("video_id, status, watched_at, notes, needs_revision")
            .eq("user_id", userId),
          client
            .from("learning_exercise_attempts")
            .select("exercise_id, outcome, notes, attempted_at")
            .eq("user_id", userId),
          client
            .from("learning_day_progress")
            .select(
              "course_day_id, assignment_completed, assignment_notes, completed_at, course_day:learning_course_days(day_number)"
            )
            .eq("user_id", userId),
        ]);

      if (enrollmentRes?.data) {
        userState.enrolled = true;
        userState.enrolledAt = enrollmentRes.data.created_at;
        userState.currentStage = enrollmentRes.data.current_day ?? 1;
      }

      if (videoProgRes?.data) {
        for (const row of videoProgRes.data) {
          userState.videoProgress[row.video_id] = {
            videoId: row.video_id,
            watched: row.status === "watched" || row.status === "completed",
            watchedAt: row.watched_at,
            notes: row.notes,
            revisionDue: row.needs_revision,
          };
        }
      }

      if (exerciseProgRes?.data) {
        for (const row of exerciseProgRes.data) {
          const isSolved =
            row.outcome === "solved_independent" || row.outcome === "solved_hint";
          userState.exerciseAttempts[row.exercise_id] = {
            exerciseId: row.exercise_id,
            status: isSolved
              ? "solved"
              : row.outcome === "attempted"
                ? "attempted"
                : "skipped",
            solutionNotes: row.notes,
            completedAt: row.attempted_at,
          };
        }
      }

      if (dayProgRes?.data) {
        for (const row of dayProgRes.data) {
          const dayNum = (row.course_day as { day_number?: number } | null)?.day_number;
          if (dayNum) {
            userState.stageProgress[dayNum] = {
              stageNumber: dayNum,
              assignmentCompleted: row.assignment_completed,
              notes: row.assignment_notes,
              completedAt: row.completed_at,
            };
          }
        }
      }
    } catch (err) {
      console.warn(
        "Could not load Data Engineering user progress from database; utilizing memory fallback.",
        err
      );
    }
  }

  const metrics = calculateDataEngineeringProgress(
    stages,
    allVideos,
    userState.videoProgress,
    userState.stageProgress,
    exercises,
    userState.exerciseAttempts
  );

  return {
    course: {
      id: COURSE_SLUG,
      slug: COURSE_SLUG,
      title: manifestJson.title,
      description: manifestJson.subtitle,
      estimatedStages: 8,
      estimatedHours: Math.round(manifestJson.totalEstimatedMinutes / 60),
      difficulty: "Hard",
    },
    stages,
    videos: allVideos,
    exercises,
    userState,
    metrics,
  };
}
