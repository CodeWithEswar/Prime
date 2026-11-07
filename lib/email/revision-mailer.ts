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
    .map((item) => {
      const diff = item.difficulty.toUpperCase();
      const diffBg =
        diff === "HARD"
          ? "rgba(255, 0, 0, 0.1)"
          : diff === "MEDIUM"
            ? "rgba(245, 158, 11, 0.1)"
            : "rgba(16, 185, 129, 0.1)";
      const diffBorder =
        diff === "HARD"
          ? "rgba(255, 0, 0, 0.35)"
          : diff === "MEDIUM"
            ? "rgba(245, 158, 11, 0.35)"
            : "rgba(16, 185, 129, 0.35)";
      const diffColor =
        diff === "HARD"
          ? "#FF4D4D"
          : diff === "MEDIUM"
            ? "#F59E0B"
            : "#10B981";

      return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
        <td style="padding: 14px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">
          ${item.title}
          <div style="font-size: 11px; color: #8E8E93; margin-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${item.topicName ?? "General"} &middot; ${item.stageLabel ?? "Spaced Repetition"}
          </div>
        </td>
        <td style="padding: 14px 0; text-align: right; vertical-align: top;">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; border: 1px solid ${diffBorder}; background-color: ${diffBg}; border-radius: 4px; color: ${diffColor};">
            ${diff}
          </span>
        </td>
      </tr>
    `;
    })
    .join("");

  const emailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <title>PRIME Revision Command</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">
        
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #080808; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);">
          
          <!-- Top Crimson Accent Stripe -->
          <tr>
            <td height="3" style="height: 3px; background: #FF0000; background: linear-gradient(90deg, #FF0000 0%, #B80000 50%, #4D0000 100%); line-height: 3px; font-size: 0px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <a href="${appUrl}" target="_blank" style="text-decoration: none; color: #FFFFFF; display: inline-block;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align: middle; padding-right: 12px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background-color: #120303; border: 1px solid rgba(255, 0, 0, 0.35); border-radius: 6px;">
                              <tr>
                                <td style="padding: 5px 6px; line-height: 0; text-align: center; vertical-align: middle;">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                                    <path d="M3 23V14L10.5 9.2H13.5V12.8L7.5 15.2V22L3 23Z" fill="#FF0000" />
                                    <path d="M16.5 1L9 7H16.5V14.2L10.5 16.6V20.4L21 15V4.5L16.5 1Z" fill="#FF0000" />
                                  </svg>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: 0.18em; color: #FFFFFF; text-transform: uppercase;">
                              PRIME
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 0, 0, 0.08); border: 1px solid rgba(255, 0, 0, 0.35); border-radius: 9999px;">
                      <tr>
                        <td style="padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #FF3B3B; text-transform: uppercase; white-space: nowrap;">
                          <span style="color: #FF0000; font-size: 9px; margin-right: 4px;">&#9679;</span> REVISION COMMAND
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 20px 0 6px; font-size: 22px; font-weight: 800; line-height: 1.3; color: #FFFFFF; letter-spacing: -0.02em;">
                Review what matters before it fades.
              </h1>
              <p style="margin: 0; font-size: 13px; color: #8E8E93;">
                Spaced repetition memory buffer for <span style="color: #CCCCCC; font-weight: 600;">${userName}</span>
              </p>
            </td>
          </tr>

          <!-- Metrics -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0B0B0B; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 8px;">
                    <div style="background-color: ${overdueCount > 0 ? "rgba(255, 0, 0, 0.06)" : "#0E0E0E"}; border: 1px solid ${overdueCount > 0 ? "rgba(255, 0, 0, 0.35)" : "rgba(255, 255, 255, 0.08)"}; border-radius: 8px; padding: 16px;">
                      <div style="font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: ${overdueCount > 0 ? "#FF4D4D" : "#888888"}; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                        ${overdueCount > 0 ? "● Overdue" : "Overdue"}
                      </div>
                      <div style="font-size: 28px; font-weight: 900; color: ${overdueCount > 0 ? "#FF0000" : "#FFFFFF"}; margin-top: 4px; letter-spacing: -0.02em;">
                        ${overdueCount}
                      </div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <div style="background-color: #0E0E0E; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px;">
                      <div style="font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #888888; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                        Due Today
                      </div>
                      <div style="font-size: 28px; font-weight: 900; color: #FFFFFF; margin-top: 4px; letter-spacing: -0.02em;">
                        ${dueTodayCount}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Queue List -->
          <tr>
            <td style="padding: 24px 32px 30px;">
              <div style="font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #777777; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
                Priority Review Queue
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${itemsHtml}
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0 8px; width: 100%;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #FF0000; box-shadow: 0 4px 18px rgba(255, 0, 0, 0.4);">
                          <a href="${appUrl}/revision" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 8px; letter-spacing: 0.04em; text-transform: uppercase;">
                            Open Revision Command &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 32px 28px; background-color: #040404; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="margin-bottom: 6px;">
                You are receiving this because of your spaced repetition schedule in PRIME.
              </div>
              <div style="font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #444444; letter-spacing: 0.08em; text-transform: uppercase;">
                PRIME &middot; Preparation Roadmap for Interviews, Mastery &amp; Excellence
              </div>
            </td>
          </tr>

        </table>

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

