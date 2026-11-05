import { checkAndSetAlertCooldown } from "../storage/kv";
import type { MonitorWorkerEnv } from "../types/monitoring";

export type AlertType = "outage" | "recovery" | "degradation";

export interface AlertPayload {
  type: AlertType;
  serviceId: string;
  title: string;
  message: string;
  severity: "critical" | "major" | "minor";
  timestamp: string;
}

/**
 * Dispatches deduplicated operational alerts with 1-hour cooldown.
 * Communicates with the trusted Node.js API route to deliver emails via Nodemailer.
 */
export async function dispatchOperationalAlert(
  env: MonitorWorkerEnv,
  payload: AlertPayload
): Promise<{ dispatched: boolean; reason?: string }> {
  const cooldownKey = `${payload.type}:${payload.serviceId}`;

  // Enforce 1-hour cooldown per alert type & service
  const canSend = await checkAndSetAlertCooldown(env.STATUS_KV, cooldownKey, 3600);
  if (!canSend) {
    return { dispatched: false, reason: "alert_suppressed_by_cooldown" };
  }

  const appUrl = env.APP_URL || "https://primeprep.app";
  const internalSecret = env.ALERT_INTERNAL_SECRET || "";
  const recipient = env.ALERT_EMAIL_RECIPIENT || "admin@primeprep.app";

  if (!appUrl) {
    return { dispatched: false, reason: "no_app_url_configured" };
  }

  try {
    const response = await fetch(`${appUrl.replace(/\/+$/, "")}/api/internal/monitoring/alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
      },
      body: JSON.stringify({
        ...payload,
        recipient,
      }),
    });

    if (!response.ok) {
      return {
        dispatched: false,
        reason: `alert_endpoint_returned_${response.status}`,
      };
    }

    return { dispatched: true };
  } catch (err: any) {
    return {
      dispatched: false,
      reason: err?.message || "alert_network_failed",
    };
  }
}

