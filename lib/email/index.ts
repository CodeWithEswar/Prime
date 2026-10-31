import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/validation/env.server";
import { logger } from "@/lib/logging";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (!serverEnv.RESEND_API_KEY) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(serverEnv.RESEND_API_KEY);
  }
  return resendInstance;
}

/**
 * Sends a transactional email through Resend.
 * In development or when RESEND_API_KEY is not configured, logs to stdout safely.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client || serverEnv.NODE_ENV === "development") {
    logger.info("Email dispatch simulated (development/unconfigured boundary)", {
      operation: "sendEmail",
      recipient: Array.isArray(to) ? to.join(", ") : to,
      subject,
    });
    return {
      success: true,
      id: "simulated-email-id",
    };
  }

  try {
    const response = await client.emails.send({
      from: serverEnv.EMAIL_FROM,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (response.error) {
      logger.error("Resend API rejected email dispatch", {
        operation: "sendEmail",
        errorCode: response.error.name,
      });
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error) {
    logger.error(
      "Resend network exception during email dispatch",
      {
        operation: "sendEmail",
      },
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
}
