export type DBMSVideoDifficulty = "Easy" | "Medium" | "Hard";
export type DBMSVideoImportance = "Low" | "Medium" | "High" | "Critical";

export interface DBMSVideoItem {
  position: number;
  youtubeVideoId: string;
  title: string;
  channel: string;
  canonicalUrl: string;
  playlistUrl?: string;
  dayNumber: number;
  difficulty: DBMSVideoDifficulty;
  importance: DBMSVideoImportance;
  topicSlug: string;
  estimatedMinutes: number;
  verificationStatus: "verified" | "unverified";
  isSupplementary?: boolean;
  language?: string;
}

export interface DBMSSQLExercise {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  difficulty: DBMSVideoDifficulty;
  externalUrl: string;
  sourcePlatform: string;
  topic: string;
  estimatedMinutes: number;
}

export interface DBMSInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: DBMSVideoImportance;
  category: string;
}

export interface DBMSDaySchedule {
  dayNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  focus: string;
  estimatedMinutes: number;
  videoPositions: number[];
  supplementaryVideoIds?: string[];
  learningOutcomes: string[];
  practicalAssignment: {
    title: string;
    description: string;
    submissionType?: "text" | "checkbox" | "query";
  };
  interviewQuestions: DBMSInterviewQuestion[];
}

export interface UserVideoProgress {
  videoId: string;
  watched: boolean;
  watchedAt?: string | null;
  notes?: string | null;
  difficultyRating?: DBMSVideoDifficulty | null;
  isBookmarked?: boolean;
  revisionDue?: boolean;
}

export interface UserExerciseAttempt {
  exerciseId: string;
  status: "attempted" | "solved" | "skipped";
  solutionNotes?: string | null;
  completedAt?: string | null;
}

export interface UserDayProgress {
  dayNumber: number;
  assignmentCompleted: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

export interface DBMSCourseState {
  enrolled: boolean;
  enrolledAt?: string | null;
  currentDay: number;
  videoProgress: Record<string, UserVideoProgress>;
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  dayProgress: Record<number, UserDayProgress>;
}

export interface DBMSTopicMastery {
  topicSlug: string;
  topicTitle: string;
  totalVideos: number;
  watchedVideos: number;
  percentage: number;
  masteryStatus: "not_started" | "in_progress" | "mastered";
}

export interface DBMSProgressMetrics {
  totalVideos: number;
  watchedVideos: number;
  totalMinutes: number;
  watchedMinutes: number;
  percentageComplete: number;
  completedDays: number;
  currentDay: number;
  solvedExercises: number;
  totalExercises: number;
  topicsMastery: DBMSTopicMastery[];
}

export interface DBMSDashboardData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    estimatedDays: number;
    difficulty: DBMSVideoDifficulty;
  };
  days: DBMSDaySchedule[];
  videos: DBMSVideoItem[];
  exercises: DBMSSQLExercise[];
  userState: DBMSCourseState;
  metrics: DBMSProgressMetrics;
}

