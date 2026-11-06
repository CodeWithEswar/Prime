/**
 * PRIME — Kunal Kushwaha Java + DSA Bootcamp Domain Types
 */

export type AssignmentStatus = "not_started" | "in_progress" | "completed" | "revisit";
export type ProblemSolveStatus = "not_started" | "attempted" | "solved" | "revisit";
export type TopicMasteryLevel = "not_assessed" | "learning" | "practicing" | "developing" | "proficient";

export interface KunalChapterItem {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number | null;
  timestampFormatted: string;
  isCompleted: boolean;
  sourceUrl: string;
  verificationStatus: "verified" | "needs_review";
}

export interface KunalProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  leetcodeUrl: string;
  status: ProblemSolveStatus;
  solvedAt?: string | null;
}

export interface KunalAssignmentItem {
  id: string;
  number: number;
  slug: string;
  title: string;
  githubPath: string;
  githubUrl: string;
  description?: string;
  status: AssignmentStatus;
  notes?: string;
  problemsCount: number;
  tasksCount: number;
  problems: KunalProblemItem[];
  tasks: { number: number; task: string }[];
}

export interface KunalVideoItem {
  id: string;
  youtubeVideoId: string;
  position: number;
  title: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string;
  channelTitle: string;
  canonicalWatchUrl: string;
  topicSlug: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  hasNotes: boolean;
  notesContent?: string;
  chapters: KunalChapterItem[];
}

export interface KunalModuleDetail {
  stepNumber: number;
  title: string;
  slug: string;
  description: string;
  topicTags: string[];
  videosCount: number;
  totalDurationSeconds: number;
  assignmentsCount: number;
  problemsCount: number;
  videos: KunalVideoItem[];
  assignments: KunalAssignmentItem[];
  problems: KunalProblemItem[];
  stats: {
    completedVideos: number;
    solvedProblems: number;
    completedAssignments: number;
    masteryLevel: TopicMasteryLevel;
  };
}

export interface KunalBootcampDetail {
  course: {
    id: string;
    slug: string;
    alternateSlug: string;
    youtubePlaylistId: string;
    title: string;
    instructor: string;
    channelTitle: string;
    description: string;
    difficulty: string;
    level: string;
    focus: string;
    programmingLanguage: string;
    thumbnailUrl: string;
    officialPlaylistUrl: string;
    officialGithubUrl: string;
    officialSyllabusUrl: string;
    modulesCount: number;
    videosCount: number;
    totalDurationSeconds: number;
    assignmentsCount: number;
    totalProblemsCount: number;
    topicTags: string[];
  };
  modules: KunalModuleDetail[];
  activeModule: KunalModuleDetail;
  activeVideo: KunalVideoItem;
  activeAssignment?: KunalAssignmentItem | null;
  isEnrolled: boolean;
  enrollmentStatus: "active" | "paused" | "completed" | "archived" | null;
  overallStats: {
    totalVideos: number;
    completedVideos: number;
    videoProgressPercentage: number;
    totalProblems: number;
    solvedProblems: number;
    problemProgressPercentage: number;
    totalAssignments: number;
    completedAssignments: number;
    assignmentProgressPercentage: number;
    masteryPercentage: number;
    lastActivityAt: string | null;
  };
}

export interface KunalAnalyticsOverview {
  totalVideos: number;
  completedVideos: number;
  videoPct: number;
  totalProblems: number;
  solvedProblems: number;
  problemPct: number;
  totalAssignments: number;
  completedAssignments: number;
  assignmentPct: number;
  activeStudyDays: number;
  masteryPct: number;
}

export interface KunalVideoTrendPoint {
  date: string;
  completed: number;
  cumulative: number;
  problemsSolved: number;
  cumulativeProblems: number;
  assignmentsCompleted?: number;
}

export interface KunalProblemsByTopicItem {
  topic: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface KunalTopicCoverageItem {
  topic: string;
  videoPct: number;
  practicePct: number;
  assignmentPct: number;
}

export interface KunalWeeklyConsistencyItem {
  day: string;
  videosWatched: number;
  problemsSolved: number;
  assignmentsCompleted: number;
}

export interface KunalHeatmapDay {
  date: string;
  count: number;
  videos: number;
  problems: number;
  assignments: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface KunalAssignmentProgressItem {
  number: number;
  title: string;
  slug: string;
  status: AssignmentStatus;
  solvedProblems: number;
  totalProblems: number;
  progressPct: number;
}

export interface KunalRadarDimension {
  domain: string;
  score: number;
  solved: number;
  total: number;
  level: string;
}

export interface KunalMilestoneItem {
  id: string;
  title: string;
  category: "track" | "video" | "problem" | "revision" | "topic";
  timestamp: string;
  description: string;
}

export interface KunalAnalyticsData {
  overview: KunalAnalyticsOverview;
  videoCompletionTrend: KunalVideoTrendPoint[];
  problemsByTopic: KunalProblemsByTopicItem[];
  topicCoverage: KunalTopicCoverageItem[];
  weeklyConsistency: KunalWeeklyConsistencyItem[];
  learningVsPractice: { category: string; value: number }[];
  assignmentProgress: KunalAssignmentProgressItem[];
  activityHeatmap: KunalHeatmapDay[];
  radarMastery: KunalRadarDimension[];
  milestones: KunalMilestoneItem[];
}

