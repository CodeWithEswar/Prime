import "server-only";
import { renderEmailLayout } from "./layout";
import type { StudySessionReminderPayload } from "@/domain/notifications/types";

export function renderStudySessionReminderEmail(options: {
  payload: StudySessionReminderPayload;
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { payload, recipientName, unsubscribeUrl, preferencesUrl } = options;

  const contentHtml = `
    <div style="background-color: #0E0E0E; border: 1px solid #1C1C1C; border-radius: 6px; padding: 18px; margin-bottom: 20px;">
      <span style="font-size: 11px; color: #888888; text-transform: uppercase; font-family: monospace;">Session Scheduled</span>
      <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 4px 0 10px;">
        ${payload.title}
      </h2>
      <div style="font-size: 12px; color: #AAAAAA; font-family: monospace;">
        Subject: <span style="color: #FFFFFF; font-weight: 600;">${payload.subject}</span> &middot;
        Planned Duration: <span style="color: #FFFFFF; font-weight: 600;">${payload.plannedMinutes}m</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #AAAAAA; line-height: 1.5; margin: 0 0 16px;">
      Your scheduled preparation block begins in <strong>${payload.leadTimeMinutes} minutes</strong>. Eliminating distractions now protects your cognitive focus.
    </p>
  `;

  return renderEmailLayout({
    title: `Study Session in ${payload.leadTimeMinutes} Minutes`,
    eyebrow: "PLANNER DISPATCH",
    recipientName,
    contentHtml,
    actionText: "Open Study Workspace",
    actionUrl: payload.actionUrl,
    unsubscribeUrl,
    preferencesUrl,
  });
}

