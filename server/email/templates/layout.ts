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
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0 16px; width: 100%;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #FF0000; box-shadow: 0 4px 18px rgba(255, 0, 0, 0.4);">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 8px; letter-spacing: 0.04em; text-transform: uppercase;">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
      : "";

  const unsubscribeHtml = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color: #777777; text-decoration: underline;">Unsubscribe</a> &middot; `
    : "";

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">
        
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #080808; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);">
          
          <!-- Top Crimson Accent Stripe -->
          <tr>
            <td height="3" style="height: 3px; background: #FF0000; background: linear-gradient(90deg, #FF0000 0%, #B80000 50%, #4D0000 100%); line-height: 3px; font-size: 0px;">&nbsp;</td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td style="padding: 28px 32px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <!-- Logo / Brand Emblem -->
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
                    <!-- Eyebrow Pill Badge -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 0, 0, 0.08); border: 1px solid rgba(255, 0, 0, 0.35); border-radius: 9999px;">
                      <tr>
                        <td style="padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #FF3B3B; text-transform: uppercase; white-space: nowrap;">
                          <span style="color: #FF0000; font-size: 9px; margin-right: 4px;">&#9679;</span> ${eyebrow}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Title & Subtitle -->
              <h1 style="margin: 20px 0 6px; font-size: 22px; font-weight: 800; line-height: 1.3; color: #FFFFFF; letter-spacing: -0.02em;">
                ${title}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #8E8E93; letter-spacing: -0.01em;">
                Prepared for <span style="color: #CCCCCC; font-weight: 600;">${recipientName}</span> &middot; Technical Interview Mastery
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px 24px;">
              ${contentHtml}
              ${actionButtonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 30px; background-color: #040404; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; line-height: 1.6; color: #666666; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666;">
                You are receiving this notification because of your alert preferences in PRIME.
              </p>
              <p style="margin: 0;">
                ${unsubscribeHtml}
                <a href="${preferencesUrl}" style="color: #888888; text-decoration: underline;">Notification Preferences</a> &middot;
                <a href="${appUrl}" style="color: #888888; text-decoration: underline;">PRIME Platform</a>
              </p>
              <div style="margin-top: 14px; font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; color: #444444; letter-spacing: 0.08em; text-transform: uppercase;">
                PRIME &middot; Preparation Roadmap for Interviews, Mastery &amp; Excellence
              </div>
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

