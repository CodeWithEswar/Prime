import { z } from "zod";

export const experienceLevelEnum = z.enum(["beginner", "intermediate", "advanced"]);
export type ExperienceLevel = z.infer<typeof experienceLevelEnum>;

export const difficultyPreferenceEnum = z.enum([
  "foundational",
  "balanced",
  "aggressive",
]);
export type DifficultyPreference = z.infer<typeof difficultyPreferenceEnum>;

export const userSettingsSchema = z.object({
  user_id: z.string().uuid(),
  target_role: z.string().min(1).default("Software Engineer"),
  target_package: z.string().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  daily_study_minutes: z.number().int().positive().default(120),
  experience_level: experienceLevelEnum.default("intermediate"),
  timezone: z.string().default("Asia/Kolkata"),
  rest_days: z.array(z.number().int().min(0).max(6)).default([]),
  difficulty_preference: difficultyPreferenceEnum.default("balanced"),
  morning_email_enabled: z.boolean().default(true),
  morning_email_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .default("07:00:00"),
  evening_email_enabled: z.boolean().default(true),
  weekly_report_enabled: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

// Profile Update Schema
export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, "Display name cannot be empty").max(50),
  fullName: z.string().trim().max(100).nullable().optional(),
  institution: z.string().trim().max(120).nullable().optional(),
  degree: z.string().trim().max(80).nullable().optional(),
  specialization: z.string().trim().max(80).nullable().optional(),
  graduationYear: z.number().int().min(1980).max(2035).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Career Targets Schema
export const careerTargetsUpdateSchema = z.object({
  targetRole: z
    .string()
    .trim()
    .min(2, "Target role must be at least 2 characters")
    .max(80),
  targetCompanies: z.array(z.string().trim().min(1)).max(20).default([]),
  primaryTargetCompany: z.string().trim().max(80).nullable().optional(),
  targetPackage: z.string().trim().max(40).nullable().optional(),
  targetCompensationAmount: z.number().positive().nullable().optional(),
  targetCompensationCurrency: z.string().default("INR"),
  targetCompensationPeriod: z.enum(["annual", "monthly"]).default("annual"),
  minAcceptableCompensation: z.number().positive().nullable().optional(),
  targetDate: z.iso.date("Enter a valid target date").nullable().optional(),
  experienceLevel: experienceLevelEnum.default("intermediate"),
  difficultyPreference: difficultyPreferenceEnum.default("balanced"),
});
export type CareerTargetsUpdateInput = z.infer<typeof careerTargetsUpdateSchema>;

// Study Commitment Schema
export const studyCommitmentUpdateSchema = z
  .object({
    dailyStudyMinutes: z
      .number()
      .int()
      .min(15, "Minimum 15 minutes daily")
      .max(720, "Maximum 12 hours daily"),
    restDays: z.array(z.number().int().min(0).max(6)).default([]),
    availabilityRules: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          availableMinutes: z.number().int().min(0).max(720),
          isRestDay: z.boolean(),
          preferredStartTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Enter a valid start time")
            .nullable()
            .optional(),
          preferredEndTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Enter a valid end time")
            .nullable()
            .optional(),
        })
      )
      .length(7),
  })
  .superRefine((value, context) => {
    if (new Set(value.availabilityRules.map((rule) => rule.dayOfWeek)).size !== 7)
      context.addIssue({
        code: "custom",
        path: ["availabilityRules"],
        message: "Include each day of the week once.",
      });
    value.availabilityRules.forEach((rule, index) => {
      if (rule.isRestDay) return;
      if (Boolean(rule.preferredStartTime) !== Boolean(rule.preferredEndTime))
        context.addIssue({
          code: "custom",
          path: ["availabilityRules", index],
          message: "Enter both a start and end time, or leave both empty.",
        });
      if (
        rule.preferredStartTime &&
        rule.preferredEndTime &&
        rule.preferredEndTime.slice(0, 5) <= rule.preferredStartTime.slice(0, 5)
      )
        context.addIssue({
          code: "custom",
          path: ["availabilityRules", index, "preferredEndTime"],
          message: "The end time must be after the start time.",
        });
    });
  });
export type StudyCommitmentUpdateInput = z.infer<typeof studyCommitmentUpdateSchema>;

// Learning Preferences Schema
export const learningPreferencesUpdateSchema = z.object({
  preferredLanguage: z
    .enum(["java", "python", "cpp", "javascript", "typescript"])
    .default("java"),
  difficultyLevel: z
    .enum(["beginner", "intermediate", "advanced", "adaptive"])
    .default("intermediate"),
  learningPace: z
    .enum(["relaxed", "standard", "accelerated", "intensive"])
    .default("standard"),
  defaultSessionMinutes: z
    .union([z.literal(30), z.literal(45), z.literal(60), z.literal(90), z.literal(120)])
    .default(60),
  revisionMode: z.enum(["adaptive", "spaced_standard", "manual"]).default("adaptive"),
  instructionalLanguage: z.string().default("english"),
  videoPlayerMode: z.enum(["embedded", "youtube"]).default("embedded"),
  showSupplementaryLessons: z.boolean().default(true),
  enableAptitudeModule: z.boolean().default(true),
  aptitudeTrackFocus: z
    .enum(["comprehensive", "campus_nqt", "quant_only", "logical_verbal"])
    .default("comprehensive"),
  aptitudeDailyTargetMinutes: z.number().int().min(15).max(180).default(30),
});
export type LearningPreferencesUpdateInput = z.infer<
  typeof learningPreferencesUpdateSchema
>;

// Appearance Preferences Schema
export const appearancePreferencesUpdateSchema = z.object({
  theme: z.enum(["dark", "system"]).default("dark"),
  motionPreference: z.enum(["system", "reduced", "standard"]).default("system"),
  uiDensity: z.enum(["comfortable", "compact"]).default("comfortable"),
  fontScaling: z.enum(["normal", "large"]).default("normal"),
});
export type AppearancePreferencesUpdateInput = z.infer<
  typeof appearancePreferencesUpdateSchema
>;

// Account Deletion Schema
export const accountDeletionSchema = z.object({
  confirmationText: z.literal("DELETE MY ACCOUNT"),
  reason: z.string().max(300).optional(),
});
export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>;

// Email Change Schema
export const emailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
});
export type EmailChangeInput = z.infer<typeof emailChangeSchema>;
