export type DataEngineeringDifficulty = "Easy" | "Medium" | "Hard";
export type DataEngineeringImportance = "Low" | "Medium" | "High" | "Critical";

export interface DataEngineeringVideoItem {
  position: number;
  stageNumber: number;
  moduleId: string;
  youtubeVideoId: string;
  title: string;
  channel: string;
  canonicalUrl: string;
  playlistUrl?: string;
  difficulty: DataEngineeringDifficulty;
  importance: DataEngineeringImportance;
  topicSlug: string;
  estimatedMinutes: number;
  verificationStatus: "verified" | "unverified";
  verifiedAt?: string;
  keyTakeaways: string[];
  isSupplementary?: boolean;
}

export interface DataEngineeringExercise {
  id: string;
  stageNumber: number;
  moduleId?: string;
  title: string;
  description: string;
  difficulty: DataEngineeringDifficulty;
  externalUrl?: string;
  sourcePlatform: string;
  topic: string;
  estimatedMinutes: number;
  starterCode?: string;
}

export interface DataEngineeringInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: DataEngineeringImportance;
  category: string;
  codeSnippet?: string;
}

export interface DataEngineeringModule {
  id: string;
  title: string;
  summary: string;
  videos: DataEngineeringVideoItem[];
}

export interface DataEngineeringStageSchedule {
  stageNumber: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  estimatedMinutes: number;
  learningOutcomes: string[];
  modules: DataEngineeringModule[];
  videoPositions: number[];
  practicalAssignment: {
    title: string;
    description: string;
    submissionType?: "checkbox" | "query" | "code";
  };
  interviewQuestions: DataEngineeringInterviewQuestion[];
}

export interface UserVideoProgress {
  videoId: string;
  watched: boolean;
  watchedAt?: string | null;
  notes?: string | null;
  difficultyRating?: DataEngineeringDifficulty | null;
  isBookmarked?: boolean;
  revisionDue?: boolean;
}

export interface UserExerciseAttempt {
  exerciseId: string;
  status: "attempted" | "solved" | "skipped";
  solutionNotes?: string | null;
  completedAt?: string | null;
}

export interface UserStageProgress {
  stageNumber: number;
  assignmentCompleted: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

export interface DataEngineeringCourseState {
  enrolled: boolean;
  enrolledAt?: string | null;
  currentStage: number;
  videoProgress: Record<string, UserVideoProgress>;
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  stageProgress: Record<number, UserStageProgress>;
}

export interface DataEngineeringTopicMastery {
  topicSlug: string;
  topicTitle: string;
  stageNumber: number;
  totalVideos: number;
  watchedVideos: number;
  percentage: number;
  masteryStatus: "not_started" | "in_progress" | "mastered";
}

export interface DataEngineeringProgressMetrics {
  totalVideos: number;
  watchedVideos: number;
  totalMinutes: number;
  watchedMinutes: number;
  percentageComplete: number;
  completedStages: number;
  currentStage: number;
  solvedExercises: number;
  totalExercises: number;
  topicsMastery: DataEngineeringTopicMastery[];
}

export interface DataEngineeringDashboardData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    estimatedStages: number;
    estimatedHours: number;
    difficulty: DataEngineeringDifficulty;
  };
  stages: DataEngineeringStageSchedule[];
  videos: DataEngineeringVideoItem[];
  exercises: DataEngineeringExercise[];
  userState: DataEngineeringCourseState;
  metrics: DataEngineeringProgressMetrics;
}

export type DataEngineeringActiveTab =
  | "roadmap"
  | "videos"
  | "labs"
  | "interview"
  | "analytics";

export interface DataEngineeringVideoFilterState {
  stageNumber: number | "all";
  difficulty: "all" | "Easy" | "Medium" | "Hard";
  importance: "all" | "Critical" | "High" | "Medium" | "Low";
  status: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery: string;
}
