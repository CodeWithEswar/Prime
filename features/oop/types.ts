import type {
  OOPDaySchedule,
  OOPLLDCase,
  OOPOutputPredictionQuestion,
  OOPPrerequisiteItem,
  OOPProgressMetrics,
  OOPSegmentItem,
  OOPSupplementaryItem,
  OOPVideoItem,
  UserOOPDayProgress,
  UserOOPDesignAttempt,
  UserOOPLabAttempt,
  UserOOPSegmentProgress,
  UserOOPVideoProgress,
} from "@/domain/oop";

export type OOPTab =
  | "overview"
  | "roadmap"
  | "videos"
  | "labs"
  | "practice"
  | "revision"
  | "interview"
  | "analytics";

export interface OOPCourseState {
  enrolled: boolean;
  enrolledAt: string | null;
  currentDay: number;
  videoProgress: Record<string, UserOOPVideoProgress>;
  segmentProgress: Record<string, UserOOPSegmentProgress>;
  labAttempts: Record<string, UserOOPLabAttempt>;
  dayProgress: Record<number, UserOOPDayProgress>;
  designAttempts: Record<string, UserOOPDesignAttempt>;
}

export interface OOPDashboardData {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    estimatedDays: number;
    difficulty: string;
  };
  days: OOPDaySchedule[];
  videos: OOPVideoItem[];
  segments: OOPSegmentItem[];
  prerequisites: OOPPrerequisiteItem[];
  supplementaryVideos: OOPSupplementaryItem[];
  outputPredictions: OOPOutputPredictionQuestion[];
  lldCases: OOPLLDCase[];
  userState: OOPCourseState;
  metrics: OOPProgressMetrics;
}

