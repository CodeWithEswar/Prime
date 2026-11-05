import "server-only";
import { renderEmailLayout } from "./layout";
import type { WeeklyProgressReportPayload } from "@/domain/notifications/types";

export function renderWeeklyProgressEmail(options: {
  payload: WeeklyProgressReportPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;

  const hours = Math.floor(payload.studyTimeMinutes / 60);
  const remainingMins = payload.studyTimeMinutes % 60;
  const formattedStudyTime =
    hours > 0 ? `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ""}` : `${payload.studyTimeMinutes}m`;

  const contentHtml = `
    <div style="background-color: #0A0A0A; border: 1px solid #1C1C1C; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <span style="font-size: 11px; color: #00E5FF; text-transform: uppercase; font-family: monospace; font-weight: 700;">
        EXCELLENCE INDEX &middot; ${payload.weekLabel}
      </span>
      <h2 style="font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 4px 0 16px;">
        Your Weekly Preparation at a Glance
      </h2>

      <!-- Metrics Grid -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="33%" style="padding: 12px; background-color: #0E0E0E; border: 1px solid #1F1F1F; border-radius: 6px;">
            <div style="font-size: 10px; color: #888888; text-transform: uppercase; font-family: monospace;">Tasks Done</div>
            <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px;">
              ${payload.tasksCompleted} / ${payload.tasksTotal}
            </div>
          </td>
          <td width="5%"></td>
          <td width="33%" style="padding: 12px; background-color: #0E0E0E; border: 1px solid #1F1F1F; border-radius: 6px;">
            <div style="font-size: 10px; color: #888888; text-transform: uppercase; font-family: monospace;">Study Time</div>
            <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-top: 4px;">
              ${formattedStudyTime}
            </div>
          </td>
          <td width="5%"></td>
          <td width="33%" style="padding: 12px; background-color: #0E0E0E; border: 1px solid #1F1F1F; border-radius: 6px;">
            <div style="font-size: 10px; color: #888888; text-transform: uppercase; font-family: monospace;">Solve Rate</div>
            <div style="font-size: 18px; font-weight: 800; color: #00E5FF; margin-top: 4px;">
              ${payload.dsaSolveRatePercent}%
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Qualitative Insights -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
      ${
        payload.strongestTopic
          ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #161616;">
              <span style="font-size: 11px; color: #10B981; font-family: monospace; font-weight: 700;">STRONGEST DOMAIN</span>
              <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin-top: 2px;">
                ${payload.strongestTopic}
              </div>
            </td>
          </tr>
        `
          : ""
      }
      ${
        payload.focusNextWeekTopic
          ? `
          <tr>
            <td style="padding: 10px 0;">
              <span style="font-size: 11px; color: #F59E0B; font-family: monospace; font-weight: 700;">RECOMMENDED FOCUS NEXT WEEK</span>
              <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin-top: 2px;">
                ${payload.focusNextWeekTopic}
              </div>
            </td>
          </tr>
        `
          : ""
      }
    </table>
  `;

  return renderEmailLayout({
    title: `Weekly Preparation Report: ${payload.weekLabel}`,
    eyebrow: "ANALYTICS PULSE",
    recipientName,
    contentHtml,
    actionText: "View Complete Weekly Analytics",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

