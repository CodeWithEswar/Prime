import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import type {
  KunalBootcampDetail,
  KunalModuleDetail,
  KunalVideoItem,
  KunalAssignmentItem,
  KunalProblemItem,
  TopicMasteryLevel,
  AssignmentStatus,
  ProblemSolveStatus,
} from "../types";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  }
  return `${seconds}s`;
}

interface RawManifest {
  course: KunalBootcampDetail["course"];
  modules: Array<{
    stepNumber: number;
    title: string;
    slug: string;
    description: string;
    topicTags: string[];
    videoIds: string[];
    assignmentSlugs: string[];
    videos: Array<{
      position: number;
      youtubeVideoId: string;
      title: string;
      durationSeconds: number;
      durationText: string;
      thumbnailUrl: string;
      channelTitle: string;
      canonicalWatchUrl: string;
      topicSlug: string;
      chapters: Array<{
        title: string;
        timestampSeconds: number;
        endSeconds: number | null;
        timestampFormatted: string;
        sourceUrl: string;
      }>;
    }>;
    assignments: Array<{
      number: number;
      slug: string;
      title: string;
      filename: string;
      githubPath: string;
      githubUrl: string;
      problems: Array<{
        slug: string;
        title: string;
        difficulty: "easy" | "medium" | "hard";
        leetcodeUrl: string;
      }>;
      tasks: Array<{
        number: number;
        task: string;
      }>;
    }>;
    problems: Array<{
      slug: string;
      title: string;
      difficulty: "easy" | "medium" | "hard";
      leetcodeUrl: string;
    }>;
  }>;
  assignments: RawManifest["modules"][0]["assignments"];
}

export async function getKunalBootcamp(
  preferredTopicSlug?: string,
  preferredVideoId?: string,
  preferredAssignmentSlug?: string
): Promise<KunalBootcampDetail> {
  const manifestPath = path.resolve(process.cwd(), "content/dsa/kunal-bootcamp-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Kunal Kushwaha Bootcamp manifest not found at content/dsa/kunal-bootcamp-manifest.json");
  }

  const manifestData: RawManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch user progress records if logged in
  const completedVideoIds = new Set<string>();
  const bookmarkedVideoIds = new Set<string>();
  const videoNotesMap = new Map<string, string>();
  const completedChapterIds = new Set<string>();
  const assignmentStatusMap = new Map<string, AssignmentStatus>();
  const solvedProblemSlugs = new Set<string>();
  const attemptedProblemSlugs = new Set<string>();
  let isEnrolled = false;
  let enrollmentStatus: KunalBootcampDetail["enrollmentStatus"] = null;
  let lastVideoId: string | null = null;
  let lastActivityAt: string | null = null;

  if (user) {
    // Resolve playlist IDs for Kunal track
    const { data: plRows } = await (supabase as any)
      .from("dsa_playlists")
      .select("id")
      .or("slug.eq.kunal-kushwaha,slug.eq.kunal-java-dsa");
    const plIds: string[] = (plRows || []).map((r: { id: string }) => r.id);

    // Parallel fetch of user progress across dimensions
    const [
      enrollmentRes,
      videoProgressRes,
      videoBookmarksRes,
      videoNotesRes,
      chapterProgressRes,
      assignmentProgressRes,
      problemAttemptsRes,
    ] = await Promise.all([
      plIds.length > 0
        ? (supabase as any)
            .from("dsa_playlist_enrollments")
            .select("status, last_video_id, last_activity_at")
            .eq("user_id", user.id)
            .in("playlist_id", plIds)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("dsa_video_progress")
        .select("video_id, status, last_opened_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("dsa_video_bookmarks")
        .select("video_id")
        .eq("user_id", user.id),
      supabase
        .from("dsa_video_notes")
        .select("video_id, content")
        .eq("user_id", user.id),
      (supabase as any)
        .from("dsa_chapter_progress")
        .select("chapter_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true),
      (supabase as any)
        .from("dsa_user_assignment_progress")
        .select("assignment_id, status")
        .eq("user_id", user.id),
      supabase
        .from("problem_attempts")
        .select("problem_id, outcome, problems(leetcode_slug, slug)")
        .eq("user_id", user.id),
    ]);

    if (enrollmentRes.data) {
      isEnrolled = true;
      enrollmentStatus = enrollmentRes.data.status as KunalBootcampDetail["enrollmentStatus"];
      lastVideoId = enrollmentRes.data.last_video_id;
      lastActivityAt = enrollmentRes.data.last_activity_at;
    }

    if (videoProgressRes.data) {
      for (const p of videoProgressRes.data) {
        completedVideoIds.add(p.video_id);
      }
    }

    if (videoBookmarksRes.data) {
      for (const b of videoBookmarksRes.data) {
        if (b.video_id) bookmarkedVideoIds.add(b.video_id);
      }
    }

    if (videoNotesRes.data) {
      for (const n of videoNotesRes.data) {
        if (n.video_id && n.content) videoNotesMap.set(n.video_id, n.content);
      }
    }

    if (chapterProgressRes.data) {
      for (const c of chapterProgressRes.data) {
        completedChapterIds.add(c.chapter_id);
      }
    }

    if (assignmentProgressRes.data) {
      for (const a of assignmentProgressRes.data) {
        assignmentStatusMap.set(a.assignment_id, a.status as AssignmentStatus);
      }
    }

    if (problemAttemptsRes.data) {
      for (const att of problemAttemptsRes.data) {
        const prob = att.problems as unknown as { leetcode_slug?: string; slug?: string } | null;
        const slug = prob?.leetcode_slug || prob?.slug;
        if (slug) {
          if (att.outcome === "solved") {
            solvedProblemSlugs.add(slug);
          } else {
            attemptedProblemSlugs.add(slug);
          }
        }
      }
    }
  }

  // 2. Build Modules, Videos, Chapters, Assignments, and Problems
  let totalVideosCount = 0;
  let totalCompletedVideosCount = 0;
  let totalProblemsCount = 0;
  let totalSolvedProblemsCount = 0;
  let totalAssignmentsCount = 0;
  let totalCompletedAssignmentsCount = 0;

  const modules: KunalModuleDetail[] = manifestData.modules.map((m) => {
    // Videos in this module
    const videos: KunalVideoItem[] = m.videos.map((v) => {
      const isCompleted = completedVideoIds.has(v.youtubeVideoId);
      const isBookmarked = bookmarkedVideoIds.has(v.youtubeVideoId);
      const notesContent = videoNotesMap.get(v.youtubeVideoId);

      const chapters = v.chapters.map((c, cIdx) => {
        const chapterId = `ch-${v.youtubeVideoId}-${cIdx}`;
        return {
          id: chapterId,
          title: c.title,
          startSeconds: c.timestampSeconds,
          endSeconds: c.endSeconds,
          timestampFormatted: c.timestampFormatted,
          isCompleted: completedChapterIds.has(chapterId) || isCompleted,
          sourceUrl: c.sourceUrl,
          verificationStatus: "verified" as const,
        };
      });

      return {
        id: v.youtubeVideoId,
        youtubeVideoId: v.youtubeVideoId,
        position: v.position,
        title: v.title,
        durationSeconds: v.durationSeconds,
        durationFormatted: formatDuration(v.durationSeconds),
        thumbnailUrl: v.thumbnailUrl,
        channelTitle: v.channelTitle,
        canonicalWatchUrl: v.canonicalWatchUrl,
        topicSlug: m.slug,
        isCompleted,
        isBookmarked,
        hasNotes: !!notesContent,
        notesContent,
        chapters,
      };
    });

    // Assignments in this module
    const assignments: KunalAssignmentItem[] = m.assignments.map((a) => {
      const assignmentId = a.slug;
      const status = assignmentStatusMap.get(assignmentId) || "not_started";

      const assignmentProblems: KunalProblemItem[] = a.problems.map((p) => {
        let pStatus: ProblemSolveStatus = "not_started";
        if (solvedProblemSlugs.has(p.slug)) {
          pStatus = "solved";
        } else if (attemptedProblemSlugs.has(p.slug)) {
          pStatus = "attempted";
        }

        return {
          id: p.slug,
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty,
          leetcodeUrl: p.leetcodeUrl,
          status: pStatus,
        };
      });

      return {
        id: assignmentId,
        number: a.number,
        slug: a.slug,
        title: a.title,
        githubPath: a.githubPath,
        githubUrl: a.githubUrl,
        status,
        problemsCount: assignmentProblems.length,
        tasksCount: a.tasks.length,
        problems: assignmentProblems,
        tasks: a.tasks,
      };
    });

    // Problems in this module
    const problems: KunalProblemItem[] = m.problems.map((p) => {
      let pStatus: ProblemSolveStatus = "not_started";
      if (solvedProblemSlugs.has(p.slug)) {
        pStatus = "solved";
      } else if (attemptedProblemSlugs.has(p.slug)) {
        pStatus = "attempted";
      }

      return {
        id: p.slug,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        leetcodeUrl: p.leetcodeUrl,
        status: pStatus,
      };
    });

    const completedVids = videos.filter((v) => v.isCompleted).length;
    const solvedProbs = problems.filter((p) => p.status === "solved").length;
    const completedAssigns = assignments.filter((a) => a.status === "completed").length;

    totalVideosCount += videos.length;
    totalCompletedVideosCount += completedVids;
    totalProblemsCount += problems.length;
    totalSolvedProblemsCount += solvedProbs;
    totalAssignmentsCount += assignments.length;
    totalCompletedAssignmentsCount += completedAssigns;

    // Mastery calculation
    let masteryLevel: TopicMasteryLevel = "not_assessed";
    if (problems.length > 0) {
      const solveRatio = solvedProbs / problems.length;
      if (solvedProbs === 0 && completedVids > 0) {
        masteryLevel = "learning";
      } else if (solveRatio > 0 && solveRatio < 0.4) {
        masteryLevel = "practicing";
      } else if (solveRatio >= 0.4 && solveRatio < 0.8) {
        masteryLevel = "developing";
      } else if (solveRatio >= 0.8) {
        masteryLevel = "proficient";
      }
    } else if (completedVids > 0 || completedAssigns > 0) {
      masteryLevel = "learning";
    }

    const totalDurationSeconds = videos.reduce((acc, v) => acc + v.durationSeconds, 0);

    return {
      stepNumber: m.stepNumber,
      title: m.title,
      slug: m.slug,
      description: m.description,
      topicTags: m.topicTags,
      videosCount: videos.length,
      totalDurationSeconds,
      assignmentsCount: assignments.length,
      problemsCount: problems.length,
      videos,
      assignments,
      problems,
      stats: {
        completedVideos: completedVids,
        solvedProblems: solvedProbs,
        completedAssignments: completedAssigns,
        masteryLevel,
      },
    };
  });

  // 3. Determine Active Module, Video & Assignment
  let activeModule = modules[0];
  if (preferredTopicSlug) {
    const matched = modules.find((m) => m.slug === preferredTopicSlug);
    if (matched) activeModule = matched;
  }

  // Find active video
  let activeVideo = activeModule.videos[0] || modules[0]?.videos[0];
  if (preferredVideoId) {
    for (const mod of modules) {
      const matchedVid = mod.videos.find((v) => v.youtubeVideoId === preferredVideoId || v.id === preferredVideoId);
      if (matchedVid) {
        activeVideo = matchedVid;
        activeModule = mod;
        break;
      }
    }
  } else if (lastVideoId) {
    for (const mod of modules) {
      const matchedVid = mod.videos.find((v) => v.youtubeVideoId === lastVideoId || v.id === lastVideoId);
      if (matchedVid) {
        activeVideo = matchedVid;
        activeModule = mod;
        break;
      }
    }
  }

  // Find active assignment
  let activeAssignment = activeModule.assignments[0] || null;
  if (preferredAssignmentSlug) {
    for (const mod of modules) {
      const matchedAssign = mod.assignments.find((a) => a.slug === preferredAssignmentSlug);
      if (matchedAssign) {
        activeAssignment = matchedAssign;
        break;
      }
    }
  }

  // Calculate percentages
  const videoProgressPercentage =
    totalVideosCount > 0 ? Math.round((totalCompletedVideosCount / totalVideosCount) * 100) : 0;

  const problemProgressPercentage =
    totalProblemsCount > 0 ? Math.round((totalSolvedProblemsCount / totalProblemsCount) * 100) : 0;

  const assignmentProgressPercentage =
    totalAssignmentsCount > 0
      ? Math.round((totalCompletedAssignmentsCount / totalAssignmentsCount) * 100)
      : 0;

  const masteryPercentage = Math.round(
    videoProgressPercentage * 0.35 +
      problemProgressPercentage * 0.45 +
      assignmentProgressPercentage * 0.2
  );

  return {
    course: manifestData.course,
    modules,
    activeModule,
    activeVideo,
    activeAssignment,
    isEnrolled,
    enrollmentStatus,
    overallStats: {
      totalVideos: totalVideosCount,
      completedVideos: totalCompletedVideosCount,
      videoProgressPercentage,
      totalProblems: totalProblemsCount,
      solvedProblems: totalSolvedProblemsCount,
      problemProgressPercentage,
      totalAssignments: totalAssignmentsCount,
      completedAssignments: totalCompletedAssignmentsCount,
      assignmentProgressPercentage,
      masteryPercentage,
      lastActivityAt,
    },
  };
}

