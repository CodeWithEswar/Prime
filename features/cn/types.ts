import type {
  CNDaySchedule,
  CNProgressMetrics,
  CNVideoItem,
  UserCNDayProgress,
  UserCNLabAttempt,
  UserCNVideoProgress,
} from "@/domain/cn";

export type CNTab =
  | "overview"
  | "roadmap"
  | "videos"
  | "labs"
  | "exercises"
  | "revision"
  | "interview"
  | "analytics";

export interface CNCourseState {
  enrolled: boolean;
  enrolledAt: string | null;
  currentDay: number;
  videoProgress: Record<string, UserCNVideoProgress>;
  labAttempts: Record<string, UserCNLabAttempt>;
  dayProgress: Record<number, UserCNDayProgress>;
}

export interface CNDashboardData {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    estimatedDays: number;
    difficulty: string;
  };
  days: CNDaySchedule[];
  videos: CNVideoItem[];
  supplementaryVideos: CNVideoItem[];
  userState: CNCourseState;
  metrics: CNProgressMetrics;
}

