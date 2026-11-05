import type { HealthObservation } from "../types/monitoring";

export interface SupabaseCheckOptions {
  supabaseUrl: string;
  apiKey: string;
  timeoutMs?: number;
  scheduledAt?: string;
  serviceId?: string;
}

/**
 * Checks Supabase PostgreSQL & PostgREST health via the dedicated singleton probe table.
 * Adheres to strict read-only least-privilege using the anon key.
 * Enforces a bounded 5-second timeout and validates the exact payload marker.
 */
export async function checkSupabaseHealth(
  options: SupabaseCheckOptions
): Promise<HealthObservation> {
  const {
    supabaseUrl,
    apiKey,
    timeoutMs = 5000,
    scheduledAt = new Date().toISOString(),
    serviceId = "supabase-db",
  } = options;

  const checkedAt = new Date().toISOString();

  if (!supabaseUrl || !apiKey) {
    return {
      serviceId,
      scheduledAt,
      checkedAt,
      status: "unknown",
      responseTimeMs: null,
      httpStatus: null,
      errorCode: "MISSING_CREDENTIALS",
    };
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/system_health_probe?select=marker,updated_at&id=eq.1`;
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const responseTimeMs = Date.now() - startTime;
    clearTimeout(timeoutTimer);

    if (!response.ok) {
      return {
        serviceId,
        scheduledAt,
        checkedAt,
        status: "down",
        responseTimeMs,
        httpStatus: response.status,
        errorCode: `HTTP_${response.status}`,
      };
    }

    const data = await response.json();

    // Verify response schema & marker
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      data[0]?.marker !== "prime-ok"
    ) {
      return {
        serviceId,
        scheduledAt,
        checkedAt,
        status: "down",
        responseTimeMs,
        httpStatus: response.status,
        errorCode: "INVALID_PROBE_PAYLOAD",
      };
    }

    return {
      serviceId,
      scheduledAt,
      checkedAt,
      status: "up",
      responseTimeMs,
      httpStatus: 200,
      errorCode: null,
    };
  } catch (err: any) {
    clearTimeout(timeoutTimer);
    const responseTimeMs = Date.now() - startTime;

    if (err?.name === "AbortError" || err?.message?.includes("abort")) {
      return {
        serviceId,
        scheduledAt,
        checkedAt,
        status: "down",
        responseTimeMs: timeoutMs,
        httpStatus: 408,
        errorCode: "TIMEOUT_EXCEEDED",
      };
    }

    return {
      serviceId,
      scheduledAt,
      checkedAt,
      status: "down",
      responseTimeMs: responseTimeMs > 0 ? responseTimeMs : null,
      httpStatus: null,
      errorCode: err?.name || "FETCH_NETWORK_ERROR",
    };
  }
}

