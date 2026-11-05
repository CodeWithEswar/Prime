import "server-only";
import { getEmailTransporter, getSenderEmail, getReplyToEmail } from "./transport";
import {
  renderRevisionReminderEmail,
  renderStudySessionReminderEmail,
  renderAssessmentReminderEmail,
  renderMissedTaskSummaryEmail,
  renderDailyDigestEmail,
  renderWeeklyProgressEmail,
  renderPreferencesUpdatedEmail,
} from "./templates";
import type {
  NotificationCategory,
  RevisionReminderPayload,
  StudySessionReminderPayload,
  AssessmentReminderPayload,
  MissedTaskSummaryPayload,
  DailyDigestPayload,
  WeeklyProgressReportPayload,
} from "@/domain/notifications/types";

export interface SendEmailOptions {
  to: string;
  recipientName?: string;
  category: NotificationCategory;
  subject: string;
  payload: Record<string, unknown>;
  unsubscribeToken?: string;
  appUrl?: string;
}

export interface SendEmailResult {
  success: boolean;
  outcome: "success" | "transient_failure" | "permanent_failure";
  providerMessageId?: string;
  providerResponse?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Classifies an error from SMTP/transport into transient vs permanent.
 */
export function classifySmtpError(error: unknown): {
  outcome: "transient_failure" | "permanent_failure";
  code: string;
  message: string;
} {
  const err = error as Record<string, unknown>;
  const responseCode = typeof err.responseCode === "number" ? err.responseCode : 0;
  const message = (err.message as string) || "Unknown SMTP error";
  const code = (err.code as string) || String(responseCode) || "SMTP_ERROR";

  // 5xx errors are permanent failures (mailbox not found, rejected, unauthorized)
  if (responseCode >= 500 && responseCode < 600) {
    return { outcome: "permanent_failure", code, message };
  }

  // Common permanent error codes
  if (
    code === "EENVELOPE" ||
    code === "EAUTH" ||
    code === "INVALID_RECIPIENT" ||
    message.includes("does not exist") ||
    message.includes("address rejected")
  ) {
    return { outcome: "permanent_failure", code, message };
  }

  // 4xx errors, connection timeouts, and DNS timeouts are transient failures eligible for retry
  return { outcome: "transient_failure", code, message };
}

export async function sendNotificationEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, recipientName, category, subject, payload, unsubscribeToken, appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://primeprep.app" } = options;

  const unsubscribeUrl = unsubscribeToken
    ? `${appUrl}/api/notification-unsubscribe?token=${unsubscribeToken}`
    : undefined;
  const preferencesUrl = `${appUrl}/settings/notifications`;

  let rendered: { html: string; text: string };

  switch (category) {
    case "revision_due":
    case "revision_overdue":
      rendered = renderRevisionReminderEmail({
        payload: payload as unknown as RevisionReminderPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    case "study_session_upcoming":
    case "weekly_plan_reminder":
      rendered = renderStudySessionReminderEmail({
        payload: payload as unknown as StudySessionReminderPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    case "assessment_upcoming":
      rendered = renderAssessmentReminderEmail({
        payload: payload as unknown as AssessmentReminderPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    case "missed_daily_task":
      rendered = renderMissedTaskSummaryEmail({
        payload: payload as unknown as MissedTaskSummaryPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    case "daily_study_digest":
      rendered = renderDailyDigestEmail({
        payload: payload as unknown as DailyDigestPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    case "weekly_progress_report":
      rendered = renderWeeklyProgressEmail({
        payload: payload as unknown as WeeklyProgressReportPayload,
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;

    default:
      rendered = renderPreferencesUpdatedEmail({
        recipientName,
        unsubscribeUrl,
        preferencesUrl,
      });
      break;
  }

  try {
    const transporter = getEmailTransporter();
    const info = await transporter.sendMail({
      from: getSenderEmail(),
      to,
      replyTo: getReplyToEmail(),
      subject,
      html: rendered.html,
      text: rendered.text,
      headers: {
        "X-PRIME-Category": category,
        ...(unsubscribeUrl ? { "List-Unsubscribe": `<${unsubscribeUrl}>` } : {}),
      },
    });

    return {
      success: true,
      outcome: "success",
      providerMessageId: info.messageId,
      providerResponse: typeof info.response === "string" ? info.response : undefined,
    };
  } catch (error) {
    const classified = classifySmtpError(error);
    return {
      success: false,
      outcome: classified.outcome,
      errorCode: classified.code,
      errorMessage: classified.message,
    };
  }
}

