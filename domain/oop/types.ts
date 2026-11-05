/**
 * PRIME — Object-Oriented Programming (OOP) with Java Domain Types
 */

export type OOPDifficulty = "easy" | "medium" | "hard";
export type OOPImportance = "critical" | "high" | "medium" | "low";

export interface OOPVideoItem {
  order: number;
  youtubeVideoId: string;
  title: string;
  canonicalWatchUrl: string;
  playlistContextUrl: string;
  channelTitle: string;
  durationSeconds: number;
  assignedDays: number[];
  topicIds: string[];
  difficulty: OOPDifficulty;
  interviewImportance: OOPImportance;
  verificationStatus: "verified" | "unverified" | "unavailable";
  verifiedAt: string;
  sourceProvenance: string;
  isSupplementary?: boolean;
  contentKind?: "full_lesson" | "chapter_preview" | "unknown";
  coverageRationale?: string;
}

export interface OOPSegmentItem {
  segmentId: string;
  conceptTitle: string;
  assignedDay: number;
  parentVideoId: string;
  startSeconds: number;
  endSeconds?: number;
  directTimestampUrl: string;
  topicSlug: string;
  interviewImportance: OOPImportance;
}

export interface OOPPrerequisiteItem {
  prerequisiteId: string;
  youtubeVideoId: string;
  title: string;
  canonicalWatchUrl: string;
  channelTitle: string;
  durationSeconds: number;
  recommendedUse: string;
  verificationStatus: "verified" | "unverified";
}

export interface OOPSupplementaryItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  canonicalWatchUrl: string;
  channelTitle: string;
  durationSeconds: number;
  assignedStudyDay: number;
  topicIds: string[];
  difficulty: OOPDifficulty;
  interviewImportance: OOPImportance;
  contentKind: "full_lesson" | "chapter_preview" | "unknown";
  verificationStatus: "verified" | "unverified" | "unavailable";
  verifiedAt: string;
  isSupplementary: boolean;
  coverageRationale: string;
}

export interface OOPInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: OOPImportance;
  category: string;
}

export interface OOPDaySchedule {
  dayNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  focus: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All";
  difficulty: OOPDifficulty;
  importance: OOPImportance;
  estimatedMinutes: number;
  primaryVideoIds: string[];
  segmentIds: string[];
  prerequisiteIds?: string[];
  supplementaryIds?: string[];
  signatureLab: {
    id: string;
    name: string;
    description: string;
  };
  learningOutcomes: string[];
  deliverable: string;
  practicalAssignment: {
    title: string;
    description: string;
    tasks: string[];
    submissionHint: string;
  };
  interviewQuestions: OOPInterviewQuestion[];
}

export interface OOPOutputPredictionQuestion {
  id: string;
  title: string;
  day: number;
  topic: string;
  difficulty: OOPDifficulty;
  javaVersion: string;
  snippet: string;
  expectedOutput: string;
  explanation: string;
  misconceptionTags: string[];
}

export interface OOPLLDCase {
  id: string;
  caseNumber: number;
  title: string;
  day: number;
  difficulty: OOPDifficulty;
  interviewFrequency: string;
  summary: string;
  entities: string[];
  relationships: string[];
  constraints: string[];
  extensionPoints: string[];
  evaluationRubric: string[];
}

export interface UserOOPVideoProgress {
  videoId: string;
  watched: boolean;
  watchedAt: string | null;
  notes?: string | null;
  revisionDue?: boolean;
  isBookmarked?: boolean;
}

export interface UserOOPSegmentProgress {
  segmentId: string;
  completed: boolean;
  completedAt: string | null;
  notes?: string | null;
}

export interface UserOOPLabAttempt {
  labId: string;
  scenarioId: string;
  status: "attempted" | "completed";
  inputState?: Record<string, unknown>;
  resultState?: Record<string, unknown>;
  solutionNotes?: string | null;
  completedAt?: string | null;
}

export interface UserOOPDayProgress {
  dayNumber: number;
  assignmentCompleted: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

export interface UserOOPDesignAttempt {
  caseId: string;
  selfAssessment?: "proficient" | "adequate" | "needs_review";
  notes?: string | null;
  completedAt?: string | null;
}

export interface OOPProgressMetrics {
  totalDays: number;
  completedDays: number;
  totalVideos: number;
  watchedVideos: number;
  totalSegments: number;
  completedSegments: number;
  totalLabs: number;
  completedLabs: number;
  totalDesignCases: number;
  completedDesignCases: number;
  coursePercentage: number;
  streakDays: number;
  estimatedMinutesRemaining: number;
  totalStudyMinutesCompleted: number;
}

