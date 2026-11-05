/**
 * PRIME — Aptitude, Reasoning, Verbal & Data Interpretation Domain Types
 */

export type AptitudeTrackSlug =
  | "quantitative-aptitude"
  | "logical-reasoning"
  | "verbal-ability"
  | "data-interpretation"
  | "assessments";

export interface AptitudeTrack {
  id: string;
  slug: AptitudeTrackSlug;
  title: string;
  description: string;
  orderIndex: number;
  color: string;
  totalDays: number;
  totalTopics: number;
}

export type AptitudeDifficulty = "Easy" | "Medium" | "Hard";
export type AptitudePriority = "Essential" | "High" | "Medium" | "Low";
export type VideoReviewStatus =
  "candidate_review_required" | "verified" | "rejected" | "unavailable" | "missing_video";

export interface AptitudeVideoItem {
  videoId: string;
  canonicalUrl: string;
  title: string;
  channelTitle: string;
  durationSeconds: number;
  durationFormatted: string;
  defaultAudioLanguage?: string;
  defaultLanguage?: string;
  embeddable: boolean;
  availability: "available" | "unavailable" | "restricted";
  reviewStatus: VideoReviewStatus;
  spokenEnglishVerified: boolean;
  audioLanguage?: "en";
  audioLanguageCheck?: {
    status: "english";
    method: string;
    sourceUrl: string;
    checkedAt: string;
  };
  topicCoverageVerified: boolean;
  reviewNotes?: string;
  sourceCheckedAt?: string;
  metadataVerified?: boolean;
  coverageNotes?: string;
}

export interface AptitudeTopicVideoAssociation {
  topicId: string;
  videoId: string;
  role: "primary" | "backup" | "supplementary";
  rank: number;
  coverageNotes?: string;
}

export interface AptitudeTopic {
  id: string; // e.g., "D01_T01"
  dayNumber: number;
  trackSlug: AptitudeTrackSlug;
  title: string;
  orderIndex: number;
  difficulty: AptitudeDifficulty;
  priority: AptitudePriority;
  estimatedMinutes: number;
  objectives: string[];
  prerequisites: string[];
  conceptChecklist: string[];
  formulaNotes?: string;
  primaryVideo?: AptitudeVideoItem | null;
  backupVideo?: AptitudeVideoItem | null;
  hasVideo: boolean;
  videoStatusReason?: string;
}

export interface AptitudeDay {
  id: string;
  dayNumber: number;
  trackSlug: AptitudeTrackSlug;
  title: string;
  subtitle: string;
  description: string;
  isAssessmentDay: boolean;
  estimatedMinutes: number;
  topics: AptitudeTopic[];
}

export interface UserAptitudeTopicProgress {
  topicId: string;
  status: "not_started" | "in_progress" | "practiced" | "completed";
  userNotes?: string | null;
  isBookmarked?: boolean;
  needsRevision?: boolean;
  lastActivityAt?: string | null;
  completedAt?: string | null;
}

export interface UserAptitudeVideoProgress {
  topicId: string;
  videoId: string;
  watched: boolean;
  userConfirmed: boolean;
  watchedSeconds: number;
  watchedAt?: string | null;
}

export interface AptitudeQuestion {
  id: string;
  topicId: string;
  trackSlug: AptitudeTrackSlug;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  solutionExplanation: string;
  distractorRationales?: Record<string, string>;
  difficulty: AptitudeDifficulty;
  questionType: "single_choice" | "multi_choice" | "numeric";
  formulaUsed?: string;
  provenance: "original" | "tcs_nqt" | "placement_pyq" | "curated";
}

export interface AptitudeAttempt {
  id: string;
  questionId: string;
  topicId: string;
  sessionId: string;
  selectedOptionIndex?: number;
  isCorrect: boolean;
  timeTakenMs: number;
  hintsUsed: number;
  confidence?: number;
  createdAt: string;
}

export interface AptitudeAssessmentBlueprint {
  sections: Array<{
    title: string;
    trackSlug: AptitudeTrackSlug;
    questionCount: number;
    recommendedMinutes: number;
  }>;
}

export interface AptitudeAssessment {
  id: string;
  dayNumber: number;
  title: string;
  trackSlug: AptitudeTrackSlug;
  assessmentType: "sectional" | "full_mock" | "diagnostic";
  timeLimitMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionIds: string[];
  blueprint: AptitudeAssessmentBlueprint;
}

export interface AptitudeAssessmentAttempt {
  id: string;
  assessmentId: string;
  startedAt: string;
  completedAt?: string | null;
  autoSubmitted: boolean;
  scoreAchieved: number;
  totalPossible: number;
  timeSpentSeconds: number;
  sectionalBreakdown: Record<
    string,
    {
      score: number;
      total: number;
      accuracy: number;
    }
  >;
  answersSummary: Record<string, number>; // questionId -> selectedOptionIndex
}

export interface AptitudeResourceReport {
  id: string;
  videoId: string;
  topicId: string;
  issueType:
    "broken_link" | "non_english_audio" | "poor_quality" | "wrong_topic" | "other";
  note: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

export interface AptitudeMetrics {
  totalTopics: number;
  completedTopics: number;
  totalVideos: number;
  watchedVideos: number;
  candidateReviewVideos: number;
  missingVideos: number;
  verifiedVideos: number;
  totalQuestionsPracticed: number;
  overallAccuracyPercentage: number;
  averageTimePerQuestionSeconds: number;
  trackProgress: Record<
    AptitudeTrackSlug,
    {
      totalTopics: number;
      completedTopics: number;
      percentage: number;
      accuracyPercentage: number;
    }
  >;
  placementReadinessIndex: number; // 0-100
  streakDays: number;
  estimatedMinutesRemaining: number;
}
