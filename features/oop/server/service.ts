import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  OOP_12_DAY_CURRICULUM,
  calculateOOPMetrics,
  type OOPLLDCase,
  type OOPOutputPredictionQuestion,
  type OOPPrerequisiteItem,
  type OOPSegmentItem,
  type OOPSupplementaryItem,
  type OOPVideoItem,
  type UserOOPDayProgress,
  type UserOOPDesignAttempt,
  type UserOOPLabAttempt,
  type UserOOPSegmentProgress,
  type UserOOPVideoProgress,
} from "@/domain/oop";
import type { OOPCourseState, OOPDashboardData } from "../types";
import kunalManifestJson from "@/content/oop/kunal-playlist-manifest.json";
import segmentsManifestJson from "@/content/oop/oop-segments-manifest.json";
import prerequisitesManifestJson from "@/content/oop/oop-prerequisites-manifest.json";
import supplementaryManifestJson from "@/content/oop/oop-supplementary-manifest.json";
import exercisesJson from "@/content/oop/oop-exercises.json";

type Client = SupabaseClient<Database>;

const COURSE_SLUG = "oop-12-day";

export async function getOOPDashboardData(
  client: Client | null,
  userId: string | null
): Promise<OOPDashboardData> {
  const primaryVideos = kunalManifestJson as unknown as OOPVideoItem[];
  const segments = segmentsManifestJson as unknown as OOPSegmentItem[];
  const prerequisites = prerequisitesManifestJson as unknown as OOPPrerequisiteItem[];
  const supplementaryVideos = supplementaryManifestJson as unknown as OOPSupplementaryItem[];
  const { outputPredictions, lldCases } = exercisesJson as unknown as {
    outputPredictions: OOPOutputPredictionQuestion[];
    lldCases: OOPLLDCase[];
  };

  const userState: OOPCourseState = {
    enrolled: false,
    enrolledAt: null,
    currentDay: 1,
    videoProgress: {},
    segmentProgress: {},
    labAttempts: {},
    dayProgress: {},
    designAttempts: {},
  };

  if (client && userId) {
    try {
      // 1. Check Course Row
      const { data: courseRow } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", COURSE_SLUG)
        .maybeSingle();

      const courseId = courseRow?.id;

      // 2. Fetch User Progress in parallel
      const [enrollmentRes, videoProgRes, exerciseProgRes, dayProgRes] = await Promise.all([
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
          .select("course_day_id, assignment_completed, assignment_notes, completed_at, course_day:learning_course_days(day_number)")
          .eq("user_id", userId),
      ]);

      if (enrollmentRes?.data) {
        userState.enrolled = true;
        userState.enrolledAt = enrollmentRes.data.created_at;
        userState.currentDay = enrollmentRes.data.current_day ?? 1;
      }

      if (videoProgRes.data) {
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

      if (exerciseProgRes.data) {
        for (const row of exerciseProgRes.data) {
          const isCompleted = row.outcome === "solved_independent" || row.outcome === "solved_hint";
          if (row.exercise_id?.startsWith("oop-lab-")) {
            userState.labAttempts[row.exercise_id] = {
              labId: row.exercise_id,
              scenarioId: "default",
              status: isCompleted ? "completed" : "attempted",
              solutionNotes: row.notes,
              completedAt: row.attempted_at,
            };
          } else if (row.exercise_id?.startsWith("lld-")) {
            userState.designAttempts[row.exercise_id] = {
              caseId: row.exercise_id,
              notes: row.notes,
              selfAssessment: "proficient",
              completedAt: row.attempted_at,
            };
          }
        }
      }

      if (dayProgRes.data) {
        for (const row of dayProgRes.data) {
          const dayNumber = (row.course_day as { day_number?: number } | null)?.day_number;
          if (dayNumber) {
            userState.dayProgress[dayNumber] = {
              dayNumber,
              assignmentCompleted: Boolean(row.assignment_completed),
              notes: row.assignment_notes,
              completedAt: row.completed_at,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load user OOP progress from Supabase; using guest state.", err);
    }
  }

  const metrics = calculateOOPMetrics(
    OOP_12_DAY_CURRICULUM,
    primaryVideos,
    segments,
    userState.videoProgress,
    userState.segmentProgress,
    userState.labAttempts,
    userState.dayProgress,
    userState.designAttempts
  );

  return {
    course: {
      id: "course-oop-java",
      slug: COURSE_SLUG,
      title: "12-Day Object-Oriented Programming (OOP) with Java",
      description:
        "Master Java OOP through 7 verified Kunal Kushwaha master lectures, 21 timestamp segments, 10 interactive laboratories, SOLID refactoring, and 10 low-level design cases.",
      estimatedDays: 12,
      difficulty: "Hard",
    },
    days: OOP_12_DAY_CURRICULUM,
    videos: primaryVideos,
    segments,
    prerequisites,
    supplementaryVideos,
    outputPredictions,
    lldCases,
    userState,
    metrics,
  };
}

