import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. Production SMTP Provider configuration (e.g. SendGrid, Postmark, AWS SES, Resend SMTP)
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASSWORD || process.env.GMAIL_PASS || "";
  const pass = rawPass.replace(/^["']|["']$/g, "").trim();

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,
      socketTimeout: 15000,
      tls: {
        minVersion: "TLSv1.2",
      },
    });
    return cachedTransporter;
  }

  // 2. Verified Gmail App Password fallback
  if (user && pass) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });
    return cachedTransporter;
  }

  // 3. Development / Test Stream transport (prevents crashing if no SMTP credentials in dev)
  cachedTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });

  return cachedTransporter;
}

export function getSenderEmail(): string {
  return process.env.EMAIL_FROM || "PRIME <notifications@primeprep.app>";
}

export function getReplyToEmail(): string | undefined {
  return process.env.EMAIL_REPLY_TO || undefined;
}

