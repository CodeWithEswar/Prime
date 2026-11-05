import "server-only";
import { renderEmailLayout } from "./layout";
import type { DailyDigestPayload } from "@/domain/notifications/types";

export function renderDailyDigestEmail(options: {
  payload: DailyDigestPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;

  const tasksListHtml = payload.tasks
    .slice(0, 5)
    .map(
      (task, idx) => `
      <tr style="border-bottom: 1px solid #1A1A1A;">
        <td style="padding: 10px 0; width: 28px; font-family: monospace; font-size: 11px; color: #666666;">
          0${idx + 1}
        </td>
        <td style="padding: 10px 0; color: #FFFFFF; font-size: 13px; font-weight: 500;">
          ${task.title}
        </td>
        <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; color: #888888;">
          ${task.plannedMinutes}m
        </td>
      </tr>
    `
    )
    .join("");

  const contentHtml = `
    <div style="background-color: #0E0E0E; border: 1px solid #1C1C1C; border-radius: 6px; padding: 18px; margin-bottom: 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="font-size: 11px; color: #888888; text-transform: uppercase; font-family: monospace;">Today's Target</span>
            <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">
              ${payload.plannedMinutes}m Planned
            </div>
            <div style="font-size: 11px; color: #777777; font-family: monospace; margin-top: 4px;">
              Capacity: ${payload.availableMinutes}m &middot; ${payload.taskCount} tasks &middot; ${payload.revisionCount} revisions
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #AAAAAA; line-height: 1.5; margin: 0 0 16px;">
      Here is your focused roadmap for today. Consistency compound interest is the single biggest predictor of interview success.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
      ${tasksListHtml}
    </table>
  `;

  return renderEmailLayout({
    title: `Today's Preparation Focus (${payload.date})`,
    eyebrow: "DAILY PREPARATION PULSE",
    recipientName,
    contentHtml,
    actionText: "Open Today's Workspace",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

