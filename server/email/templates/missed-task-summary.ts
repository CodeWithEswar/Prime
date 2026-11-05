import "server-only";
import { renderEmailLayout } from "./layout";
import type { MissedTaskSummaryPayload } from "@/domain/notifications/types";

export function renderMissedTaskSummaryEmail(options: {
  payload: MissedTaskSummaryPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;

  const tasksHtml = payload.missedTasks
    .slice(0, 5)
    .map(
      (task) => `
      <tr style="border-bottom: 1px solid #1A1A1A;">
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
      <span style="font-size: 11px; color: #F59E0B; text-transform: uppercase; font-family: monospace; font-weight: 700;">
        PLAN RECALIBRATION
      </span>
      <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 4px 0 10px;">
        ${payload.missedTasks.length} Incomplete Task${payload.missedTasks.length === 1 ? "" : "s"} (${payload.totalMissedMinutes}m)
      </h2>
      <p style="font-size: 12px; color: #AAAAAA; margin: 0; line-height: 1.5;">
        Life happens. Rebalance your tasks into upcoming days without sacrificing preparation depth or pacing.
      </p>
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
      ${tasksHtml}
    </table>
  `;

  return renderEmailLayout({
    title: `Rebalance Your Incomplete Tasks (${payload.date})`,
    eyebrow: "ADAPTIVE PLANNER",
    recipientName,
    contentHtml,
    actionText: "Rebalance in Planner",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

