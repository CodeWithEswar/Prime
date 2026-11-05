import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  CN_12_DAY_CURRICULUM,
  calculateCNMetrics,
  type CNVideoItem,
  type UserCNDayProgress,
  type UserCNLabAttempt,
  type UserCNVideoProgress,
} from "@/domain/cn";
import type { CNCourseState, CNDashboardData } from "../types";
import nesoManifestJson from "@/content/cn/neso-playlist-manifest.json";
import supplementaryManifestJson from "@/content/cn/cn-supplementary-manifest.json";

type Client = SupabaseClient<Database>;

const COURSE_SLUG = "cn-12-day";

export async function getCNDashboardData(
  client: Client | null,
  userId: string | null
): Promise<CNDashboardData> {
  const nesoVideos = nesoManifestJson as unknown as CNVideoItem[];
  const supplementaryVideos = (supplementaryManifestJson as unknown as CNVideoItem[]).map((v) => ({
    ...v,
    isSupplementary: true,
  }));
  const allVideos: CNVideoItem[] = [...nesoVideos, ...supplementaryVideos];

  const userState: CNCourseState = {
    enrolled: false,
    enrolledAt: null,
    currentDay: 1,
    videoProgress: {},
    labAttempts: {},
    dayProgress: {},
  };

  if (client && userId) {
    try {
      // 1. Get Course ID
      const { data: courseRow } = await client
        .from("learning_courses")
        .select("id")
        .eq("slug", COURSE_SLUG)
        .maybeSingle();

      const courseId = courseRow?.id;

      // 2. Parallel queries for enrollment, video progress, lab attempts, and day progress
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
          userState.labAttempts[row.exercise_id] = {
            labId: row.exercise_id,
            status: isCompleted ? "completed" : "attempted",
            solutionNotes: row.notes,
            completedAt: row.attempted_at,
          };
        }
      }

      if (dayProgRes.data) {
        for (const row of dayProgRes.data) {
          const dayNum = (row.course_day as any)?.day_number;
          if (dayNum) {
            userState.dayProgress[dayNum] = {
              dayNumber: dayNum,
              assignmentCompleted: row.assignment_completed,
              notes: row.assignment_notes,
              completedAt: row.completed_at,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Could not load CN user progress from database; utilizing memory fallback.", err);
    }
  }

  const metrics = calculateCNMetrics(
    allVideos,
    CN_12_DAY_CURRICULUM,
    userState.videoProgress,
    userState.dayProgress,
    userState.labAttempts
  );

  return {
    course: {
      id: COURSE_SLUG,
      slug: COURSE_SLUG,
      title: "12-Day Computer Networks Learning Roadmap & Network Laboratory",
      description:
        "Comprehensive CS Fundamentals roadmap featuring 135 indexed Neso Academy lessons, 10 interactive network engineering laboratories, and interview preparation.",
      estimatedDays: 12,
      difficulty: "Hard",
    },
    days: CN_12_DAY_CURRICULUM,
    videos: nesoVideos,
    supplementaryVideos,
    userState,
    metrics,
  };
}

