import type {
  OSDaySchedule,
  OSProgressMetrics,
  OSVideoItem,
  UserOSDayProgress,
  UserOSLabAttempt,
  UserOSVideoProgress,
} from "@/domain/os";

export type OSTab =
  | "overview"
  | "roadmap"
  | "videos"
  | "practice"
  | "simulators"
  | "revision"
  | "interview"
  | "analytics";

export interface OSCourseState {
  enrolled: boolean;
  enrolledAt: string | null;
  currentDay: number;
  videoProgress: Record<string, UserOSVideoProgress>;
  labAttempts: Record<string, UserOSLabAttempt>;
  dayProgress: Record<number, UserOSDayProgress>;
}

export interface OSDashboardData {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    estimatedDays: number;
    difficulty: string;
  };
  days: OSDaySchedule[];
  videos: OSVideoItem[];
  supplementaryVideos: OSVideoItem[];
  userState: OSCourseState;
  metrics: OSProgressMetrics;
}

