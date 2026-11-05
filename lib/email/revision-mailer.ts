import nodemailer from "nodemailer";

export interface RevisionDigestItem {
  title: string;
  difficulty: string;
  topicName?: string;
  stageLabel?: string;
}

export interface SendRevisionDigestOptions {
  to: string;
  userName?: string;
  overdueCount: number;
  dueTodayCount: number;
  items: RevisionDigestItem[];
  appUrl?: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_PASS;

  if (!user || !rawPass) {
    return null;
  }

  const pass = rawPass.replace(/^["']|["']$/g, "").trim();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendRevisionDigestEmail(options: SendRevisionDigestOptions) {
  const {
    to,
    userName = "Candidate",
    overdueCount,
    dueTodayCount,
    items,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } = options;

  const totalDue = overdueCount + dueTodayCount;
  if (totalDue === 0) {
    return { success: true, skipped: true, reason: "No items due" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: true, skipped: true, simulated: true, reason: "SMTP credentials not configured in environment" };
  }

  const itemsHtml = items
    .slice(0, 5)
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #1a1a1a;">
        <td style="padding: 12px 0; color: #ffffff; font-size: 14px; font-weight: 500;">
          ${item.title}
          <div style="font-size: 11px; color: #888888; margin-top: 2px;">
            ${item.topicName ?? "General"} · ${item.stageLabel ?? "Spaced Repetition"}
          </div>
        </td>
        <td style="padding: 12px 0; text-align: right;">
          <span style="font-family: monospace; font-size: 11px; padding: 2px 6px; border: 1px solid #262626; border-radius: 3px; color: #cccccc;">
            ${item.difficulty.toUpperCase()}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PRIME Revision Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 40px auto; background-color: #050505; border: 1px solid #1f1f1f; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; border-bottom: 1px solid #161616;">
        <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
          <span style="color: #ff0000;">■</span> PRIME
        </div>
        <div style="margin-top: 16px; font-size: 12px; font-family: monospace; letter-spacing: 0.1em; color: #ff0000; text-transform: uppercase;">
          ● REVISION COMMAND
        </div>
        <h1 style="margin: 8px 0 4px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
          Review what matters before it fades.
        </h1>
        <p style="margin: 0; font-size: 14px; color: #888888;">
          Spaced repetition retention queue for ${userName}
        </p>
      </td>
    </tr>

    <!-- Metrics -->
    <tr>
      <td style="padding: 24px 32px; background-color: #080808; border-bottom: 1px solid #161616;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-right: 12px;">
              <div style="background-color: #0d0d0d; border: 1px solid ${overdueCount > 0 ? "#ff0000" : "#262626"}; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-family: monospace; color: ${overdueCount > 0 ? "#ff4d4d" : "#888888"}; text-transform: uppercase;">Overdue</div>
                <div style="font-size: 28px; font-weight: 800; color: ${overdueCount > 0 ? "#ff0000" : "#ffffff"}; margin-top: 4px;">${overdueCount}</div>
              </div>
            </td>
            <td width="50%" style="padding-left: 12px;">
              <div style="background-color: #0d0d0d; border: 1px solid #262626; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-family: monospace; color: #888888; text-transform: uppercase;">Due Today</div>
                <div style="font-size: 28px; font-weight: 800; color: #ffffff; margin-top: 4px;">${dueTodayCount}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Queue List -->
    <tr>
      <td style="padding: 24px 32px;">
        <div style="font-size: 12px; font-family: monospace; color: #666666; text-transform: uppercase; margin-bottom: 8px;">
          Priority Review Queue
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
        </table>

        <!-- CTA Button -->
        <div style="margin-top: 32px; text-align: center;">
          <a href="${appUrl}/revision" style="display: inline-block; background-color: #ff0000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 4px; letter-spacing: 0.02em;">
            Open Revision Command ↗
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #050505; border-top: 1px solid #161616; text-align: center; font-size: 11px; color: #555555; font-family: monospace;">
        PRIME · Preparation Roadmap for Interviews, Mastery & Excellence
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"PRIME" <${process.env.GMAIL_USER || "notifications@primeprep.app"}>`,
      to,
      subject: `PRIME Revision: ${totalDue} problem${totalDue > 1 ? "s" : ""} due for review`,
      html: emailHtml,
    });

    return {
      success: true,
      messageId: info.messageId,
      totalDue,
    };
  } catch (error: unknown) {
    console.error("Nodemailer dispatch failed:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return {
      success: false,
      error: message,
    };
  }
}

