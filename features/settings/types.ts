/**
 * PRIME Settings & User Preferences — Domain Contracts & Types
 */

export interface UserProfileExtended {
  id: string;
  email: string;
  displayName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  institution: string | null;
  degree: string | null;
  specialization: string | null;
  graduationYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareerTargets {
  targetRole: string;
  targetCompanies: string[];
  primaryTargetCompany: string | null;
  targetPackage: string | null;
  targetCompensationAmount: number | null;
  targetCompensationCurrency: string;
  targetCompensationPeriod: "annual" | "monthly";
  minAcceptableCompensation: number | null;
  targetDate: string | null;
  startDate: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  difficultyPreference: "foundational" | "balanced" | "aggressive";
}

export interface WeekdayAvailabilityItem {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  availableMinutes: number;
  isRestDay: boolean;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
}

export interface StudyCommitment {
  dailyStudyMinutes: number;
  restDays: number[];
  weeklyCapacityMinutes: number;
  weeklyTargetMinutes: number;
  availabilityRules: WeekdayAvailabilityItem[];
  feasibilityRatio: number; // weeklyTargetMinutes / weeklyCapacityMinutes
  isFeasible: boolean;
}

export interface LearningPreferences {
  preferredLanguage: "java" | "python" | "cpp" | "javascript" | "typescript";
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "adaptive";
  learningPace: "relaxed" | "standard" | "accelerated" | "intensive";
  defaultSessionMinutes: 30 | 45 | 60 | 90 | 120;
  revisionMode: "adaptive" | "spaced_standard" | "manual";
  instructionalLanguage: string;
  videoPlayerMode: "embedded" | "youtube";
  showSupplementaryLessons: boolean;
  enableAptitudeModule?: boolean;
  aptitudeTrackFocus?: "comprehensive" | "campus_nqt" | "quant_only" | "logical_verbal";
  aptitudeDailyTargetMinutes?: number;
}

export interface AppearancePreferences {
  theme: "dark" | "system";
  motionPreference: "system" | "reduced" | "standard";
  uiDensity: "comfortable" | "compact";
  fontScaling: "normal" | "large";
}

export interface SecurityAuditEvent {
  id: string;
  eventType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AccountSecuritySummary {
  email: string;
  emailConfirmed: boolean;
  providers: string[];
  createdAt: string;
  lastSignInAt?: string | null;
  recentSecurityEvents: SecurityAuditEvent[];
}

export interface ConnectedProviderInfo {
  provider: "google" | "github" | "email";
  label: string;
  connected: boolean;
  email?: string | null;
  linkedAt?: string | null;
  canDisconnect: boolean;
}

export interface SettingsOverviewData {
  profile: UserProfileExtended;
  targets: CareerTargets;
  study: StudyCommitment;
  learning: LearningPreferences;
  appearance: AppearancePreferences;
  notificationsEnabled: boolean;
  security: AccountSecuritySummary;
}

