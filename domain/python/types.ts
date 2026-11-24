export type PythonDifficulty = "Easy" | "Medium" | "Hard";
export type PythonImportance = "Low" | "Medium" | "High" | "Critical";

export interface PythonVideoItem {
  position: number;
  stageNumber: number;
  moduleId: string;
  youtubeVideoId: string;
  title: string;
  channel: string;
  canonicalUrl: string;
  playlistUrl?: string;
  difficulty: PythonDifficulty;
  importance: PythonImportance;
  topicSlug: string;
  estimatedMinutes: number;
  verificationStatus: "verified" | "unverified";
  verifiedAt?: string;
  keyTakeaways: string[];
  isSupplementary?: boolean;
}

export interface PythonExercise {
  id: string;
  stageNumber: number;
  moduleId?: string;
  title: string;
  description: string;
  difficulty: PythonDifficulty;
  externalUrl?: string;
  sourcePlatform: string;
  topic: string;
  estimatedMinutes: number;
  starterCode?: string;
}

export interface PythonInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: PythonImportance;
  category: string;
  codeSnippet?: string;
}

export interface PythonModule {
  id: string;
  title: string;
  summary: string;
  videos: PythonVideoItem[];
}

export interface PythonStageSchedule {
  stageNumber: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  estimatedMinutes: number;
  learningOutcomes: string[];
  modules: PythonModule[];
  videoPositions: number[];
  practicalAssignment: {
    title: string;
    description: string;
    submissionType?: "checkbox" | "query" | "code";
  };
  interviewQuestions: PythonInterviewQuestion[];
}

export interface UserVideoProgress {
  watched: boolean;
  notes?: string;
  watchedAt?: string;
}

export interface UserStageProgress {
  stageNumber: number;
  completed: boolean;
  completedAt?: string;
  practicalAssignmentSubmitted?: boolean;
  practicalSubmissionNotes?: string;
}

export interface UserExerciseAttempt {
  exerciseId: string;
  status: "not_started" | "attempted" | "completed";
  completedAt?: string;
}

export interface PythonProgressMetrics {
  totalStages: number;
  completedStages: number;
  totalVideos: number;
  watchedVideos: number;
  totalEstimatedMinutes: number;
  watchedMinutes: number;
  progressPercentage: number;
  currentStreakDays: number;
  practicalAssignmentsCompleted: number;
  totalPracticalAssignments: number;
  exercisesCompleted: number;
  totalExercises: number;
}

export interface PythonTopicMastery {
  topicSlug: string;
  topicTitle: string;
  stageNumber: number;
  totalVideos: number;
  watchedVideos: number;
  percentage: number;
  masteryStatus: "not_started" | "in_progress" | "mastered";
}

export interface PythonCourseState {
  slug: string;
  title: string;
  estimatedStages: number;
  estimatedHours: number;
  enrolled: boolean;
  currentStage: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface PythonDashboardData {
  course: PythonCourseState;
  stages: PythonStageSchedule[];
  videos: PythonVideoItem[];
  exercises: PythonExercise[];
  metrics: PythonProgressMetrics;
  topicMastery: PythonTopicMastery[];
  userVideoProgress: Record<string, UserVideoProgress>;
  userStageProgress: Record<number, UserStageProgress>;
  userExerciseAttempts: Record<string, UserExerciseAttempt>;
  activeStageNumber: number;
}
