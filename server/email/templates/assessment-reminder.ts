import "server-only";
import { renderEmailLayout } from "./layout";
import type { AssessmentReminderPayload } from "@/domain/notifications/types";

export function renderAssessmentReminderEmail(options: {
  payload: AssessmentReminderPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;

  const contentHtml = `
    <div style="background-color: #0E0E0E; border: 1px solid #1C1C1C; border-radius: 6px; padding: 18px; margin-bottom: 20px;">
      <span style="font-size: 11px; color: #A855F7; text-transform: uppercase; font-family: monospace; font-weight: 700;">
        ${payload.category.toUpperCase()} SIMULATION
      </span>
      <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 4px 0 10px;">
        ${payload.title}
      </h2>
      <div style="font-size: 12px; color: #AAAAAA; font-family: monospace;">
        Scheduled Time: <span style="color: #FFFFFF; font-weight: 600;">${payload.scheduledTime}</span>
        ${payload.estimatedMinutes ? ` &middot; Duration: <span style="color: #FFFFFF; font-weight: 600;">~${payload.estimatedMinutes}m</span>` : ""}
      </div>
    </div>

    <p style="font-size: 13px; color: #AAAAAA; line-height: 1.5; margin: 0 0 16px;">
      Your timed technical assessment is coming up. Make sure your workspace is ready and you have a quiet environment to replicate real interview pressure.
    </p>
  `;

  return renderEmailLayout({
    title: `Upcoming Assessment: ${payload.title}`,
    eyebrow: "EVALUATION PROTOCOL",
    recipientName,
    contentHtml,
    actionText: "Launch Assessment Workspace",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

