import "server-only";

export interface EmailLayoutOptions {
  title: string;
  eyebrow: string;
  recipientName?: string;
  contentHtml: string;
  actionText?: string;
  actionUrl?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
  appUrl?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): {
  html: string;
  text: string;
} {
  const {
    title,
    eyebrow,
    recipientName = "Candidate",
    contentHtml,
    actionText,
    actionUrl,
    unsubscribeUrl,
    preferencesUrl = "https://primeprep.app/settings/notifications",
    appUrl = "https://primeprep.app",
  } = options;

  const actionButtonHtml =
    actionText && actionUrl
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px;">
          <tr>
            <td align="center" style="border-radius: 6px; background-color: #FF0000;">
              <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 6px; letter-spacing: 0.02em;">
                ${actionText} &rarr;
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  const unsubscribeHtml = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color: #666666; text-decoration: underline;">Unsubscribe</a> &middot; `
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #060606; border: 1px solid #1F1F1F; border-radius: 8px; overflow: hidden;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #161616;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">
                      <span style="color: #FF0000; margin-right: 4px;">&#9632;</span> PRIME
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #FF0000; text-transform: uppercase;">
                      ${eyebrow}
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 6px; font-size: 20px; font-weight: 700; line-height: 1.3; color: #FFFFFF; letter-spacing: -0.3px;">
                ${title}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #888888;">
                Prepared for ${recipientName}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 32px;">
              ${contentHtml}
              ${actionButtonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px; background-color: #030303; border-top: 1px solid #161616; font-size: 11px; line-height: 1.6; color: #555555; text-align: center;">
              <p style="margin: 0 0 8px;">
                You are receiving this because of your notification settings in PRIME.
              </p>
              <p style="margin: 0;">
                ${unsubscribeHtml}
                <a href="${preferencesUrl}" style="color: #666666; text-decoration: underline;">Notification Preferences</a> &middot;
                <a href="${appUrl}" style="color: #666666; text-decoration: underline;">PRIME App</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain text fallback
  const text = `
PRIME - ${eyebrow}
============================================================
${title}
Prepared for ${recipientName}

------------------------------------------------------------
${contentHtml.replace(/<[^>]*>?/gm, "").trim()}
------------------------------------------------------------

${actionText && actionUrl ? `${actionText}: ${actionUrl}\n\n` : ""}
Manage notification settings: ${preferencesUrl}
${unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}\n` : ""}
PRIME - Preparation Roadmap for Interviews, Mastery & Excellence
`.trim();

  return { html, text };
}

