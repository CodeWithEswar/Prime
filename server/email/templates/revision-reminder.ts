import "server-only";
import { renderEmailLayout } from "./layout";
import type { RevisionReminderPayload } from "@/domain/notifications/types";

export function renderRevisionReminderEmail(options: {
  payload: RevisionReminderPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;
  const total = payload.overdueCount + payload.dueTodayCount;

  const itemsHtml = payload.items
    .slice(0, 5)
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #1A1A1A;">
        <td style="padding: 10px 0; color: #FFFFFF; font-size: 13px; font-weight: 500;">
          ${item.title}
          <div style="font-size: 11px; color: #888888; margin-top: 2px; font-family: monospace;">
            ${item.topicName ?? "General"} ${item.intervalDays ? `· ${item.intervalDays}d interval` : ""}
          </div>
        </td>
        <td style="padding: 10px 0; text-align: right; vertical-align: top;">
          <span style="font-family: monospace; font-size: 10px; font-weight: 700; padding: 2px 6px; border: 1px solid ${
            item.difficulty === "HARD"
              ? "rgba(255, 0, 0, 0.4)"
              : item.difficulty === "MEDIUM"
                ? "rgba(245, 158, 11, 0.4)"
                : "rgba(16, 185, 129, 0.4)"
          }; color: ${
            item.difficulty === "HARD"
              ? "#FF4D4D"
              : item.difficulty === "MEDIUM"
                ? "#F59E0B"
                : "#10B981"
          }; border-radius: 3px;">
            ${item.difficulty}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  const contentHtml = `
    <div style="background-color: #0E0E0E; border: 1px solid #1C1C1C; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="font-size: 11px; color: #888888; text-transform: uppercase; font-family: monospace;">Retention Target</span>
            <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">
              ${total} Item${total === 1 ? "" : "s"} Due
            </div>
          </td>
          ${
            payload.overdueCount > 0
              ? `<td align="right">
                  <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; background-color: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.4); color: #FF4D4D; font-size: 11px; font-family: monospace; font-weight: 700;">
                    ${payload.overdueCount} OVERDUE
                  </span>
                </td>`
              : ""
          }
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #AAAAAA; line-height: 1.5; margin: 0 0 16px;">
      Your spaced-repetition memory buffer is waiting. Reviewing these concepts now reinforces long-term recall for technical interviews.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
      ${itemsHtml}
    </table>
  `;

  return renderEmailLayout({
    title: `${total} Concept${total === 1 ? "" : "s"} Ready for Revision`,
    eyebrow: "SPACED REPETITION",
    recipientName,
    contentHtml,
    actionText: "Start Revision Session",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

