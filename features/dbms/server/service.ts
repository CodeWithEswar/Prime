import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  DBMS_DAYS_CURRICULUM,
  calculateDBMSProgress,
  type DBMSDashboardData,
  type DBMSVideoItem,
  type DBMSSQLExercise,
  type DBMSCourseState,
  type UserVideoProgress,
  type UserExerciseAttempt,
  type UserDayProgress,
} from "@/domain/dbms";
import nesoManifestJson from "@/content/dbms/neso-video-manifest.json";
import supplementaryManifestJson from "@/content/dbms/supplementary-manifest.json";
import sqlExercisesJson from "@/content/dbms/sql-exercises.json";

type Client = SupabaseClient<Database>;

const COURSE_SLUG = "dbms-12-day";

export async function getDBMSDashboardData(
  client: Client | null,
  userId: string | null
): Promise<DBMSDashboardData> {
  const nesoVideos = nesoManifestJson as unknown as DBMSVideoItem[];
  const supplementaryVideos = (supplementaryManifestJson as unknown as DBMSVideoItem[]).map((v) => ({
    ...v,
    isSupplementary: true,
  }));
  const allVideos: DBMSVideoItem[] = [...nesoVideos, ...supplementaryVideos];
  const exercises = sqlExercisesJson as unknown as DBMSSQLExercise[];

  const userState: DBMSCourseState = {
    enrolled: false,
    enrolledAt: null,
    currentDay: 1,
    videoProgress: {},
    exerciseAttempts: {},
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

      // 2. Parallel queries for enrollment, video progress, exercise attempts, and day progress
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
          const isSolved = row.outcome === "solved_independent" || row.outcome === "solved_hint";
          userState.exerciseAttempts[row.exercise_id] = {
            exerciseId: row.exercise_id,
            status: isSolved ? "solved" : row.outcome === "attempted" ? "attempted" : "skipped",
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
      console.warn("Could not load DBMS user progress from database; utilizing memory fallback.", err);
    }
  }

  const metrics = calculateDBMSProgress(
    DBMS_DAYS_CURRICULUM,
    allVideos,
    userState.videoProgress,
    userState.dayProgress,
    exercises,
    userState.exerciseAttempts
  );

  return {
    course: {
      id: COURSE_SLUG,
      slug: COURSE_SLUG,
      title: "12-Day DBMS Mastery Curriculum",
      description:
        "Comprehensive CS Fundamentals roadmap featuring 91 verified Neso Academy video lessons, advanced topics (Normalization, ACID Transactions, B+ Trees), hands-on SQL practice, and interview scenarios.",
      estimatedDays: 12,
      difficulty: "Medium",
    },
    days: DBMS_DAYS_CURRICULUM,
    videos: allVideos,
    exercises,
    userState,
    metrics,
  };
}
