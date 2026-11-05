import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/server/email/send-email";

const monitoringAlertSchema = z.object({
  type: z.enum(["outage", "recovery", "degradation"]),
  serviceId: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(["critical", "major", "minor"]),
  timestamp: z.string(),
  recipient: z.string().email().optional(),
});

export async function POST(request: Request) {
  const expectedSecret =
    process.env.EMAIL_DELIVERY_INTERNAL_SECRET ||
    process.env.CRON_SECRET ||
    process.env.ALERT_INTERNAL_SECRET;

  const providedAuth =
    request.headers.get("x-internal-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // If secret is set in environment, enforce it
  if (expectedSecret && providedAuth !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized monitoring alert request" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = monitoringAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { type, title, message, severity, timestamp, recipient } = parsed.data;
  const targetEmail =
    recipient || process.env.ADMIN_ALERT_EMAIL || "alerts@primeprep.app";

  console.log(
    `[Monitoring Alert Received] [${severity.toUpperCase()}] ${type}: ${title} - ${message} (${timestamp})`
  );

  try {
    const subjectPrefix =
      severity === "critical"
        ? "[URGENT] Outage Alert:"
        : severity === "major"
          ? "[ALERT] Service Degraded:"
          : "[RECOVERY] Service Restored:";

    const emailResult = await sendNotificationEmail({
      to: targetEmail,
      recipientName: "PRIME Operations",
      category: "system_announcement", // Maps to existing notification template engine safely
      subject: `${subjectPrefix} ${title}`,
      payload: {
        alertType: type,
        severity,
        title,
        message,
        timestamp,
        statusPageUrl: "https://primeprep.app/status",
      },
    });

    return NextResponse.json({
      success: true,
      alertDispatched: emailResult.success,
      outcome: emailResult.outcome,
    });
  } catch (err: unknown) {
    console.error("[Monitoring Alert Email Error]", err);
    return NextResponse.json(
      { success: false, error: (err as Error)?.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
