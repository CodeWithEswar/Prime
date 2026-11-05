import { z } from "zod";

export const notificationCategorySchema = z.enum([
  "revision_due",
  "revision_overdue",
  "study_session_upcoming",
  "assessment_upcoming",
  "missed_daily_task",
  "daily_study_digest",
  "weekly_progress_report",
  "weekly_plan_reminder",
  "streak_at_risk",
  "goal_deadline",
  "system_announcement",
  "aptitude_daily_practice",
  "aptitude_assessment_upcoming",
]);

export const notificationPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const notificationChannelSchema = z.enum(["IN_APP", "EMAIL"]);

export const notificationPreferencesSchema = z.object({
  timezone: z.string().min(1).default("Asia/Kolkata"),
  inAppEnabled: z.boolean().default(true),
  emailEnabled: z.boolean().default(true),
  revisionEmailEnabled: z.boolean().default(true),
  sessionEmailEnabled: z.boolean().default(true),
  assessmentEmailEnabled: z.boolean().default(true),
  missedTaskEmailEnabled: z.boolean().default(true),
  aptitudeReminderEnabled: z.boolean().default(true),
  dailyDigestEnabled: z.boolean().default(true),
  weeklyReportEnabled: z.boolean().default(true),
  sessionLeadTimeMinutes: z
    .union([z.number(), z.enum(["5", "10", "15", "30", "60"])])
    .transform(Number)
    .pipe(
      z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(30), z.literal(60)])
    )
    .default(15),
  dailyDigestLocalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .default("07:00:00"),
  weeklyReportDay: z.number().int().min(0).max(6).default(0),
  weeklyReportLocalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .default("19:00:00"),
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .default("22:00:00"),
  quietHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .default("07:00:00"),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

export const notificationFilterSchema = z.object({
  category: notificationCategorySchema.optional(),
  unreadOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;

export const internalEmailDeliverySchema = z.object({
  deliveryId: z.string().uuid(),
  userId: z.string().uuid(),
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
  category: notificationCategorySchema,
  subject: z.string().min(1),
  idempotencyKey: z.string().min(8),
  payload: z.record(z.string(), z.unknown()),
  unsubscribeToken: z.string().uuid().optional(),
});

export type InternalEmailDeliveryInput = z.infer<typeof internalEmailDeliverySchema>;
