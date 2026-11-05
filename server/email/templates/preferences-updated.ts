import "server-only";
import { renderEmailLayout } from "./layout";

export function renderPreferencesUpdatedEmail(options: {
  recipientName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}) {
  const { recipientName, unsubscribeUrl, preferencesUrl } = options;

  const contentHtml = `
    <div style="background-color: #0E0E0E; border: 1px solid #1C1C1C; border-radius: 6px; padding: 18px; margin-bottom: 20px;">
      <p style="font-size: 14px; color: #FFFFFF; line-height: 1.5; margin: 0;">
        Your PRIME notification, reminder, and quiet hour preferences have been successfully updated.
      </p>
    </div>
    <p style="font-size: 13px; color: #888888; line-height: 1.5; margin: 0;">
      If you did not make this change, please check your authenticated account settings immediately.
    </p>
  `;

  return renderEmailLayout({
    title: "Notification Preferences Updated",
    eyebrow: "SECURITY & SETTINGS",
    recipientName,
    contentHtml,
    actionText: "Review Notification Preferences",
    actionUrl: preferencesUrl || "https://primeprep.app/settings/notifications",
    unsubscribeUrl,
    preferencesUrl,
  });
}

