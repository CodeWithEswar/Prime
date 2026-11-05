import type { MonitorWorkerEnv } from "./types/monitoring";
import { executeMonitoringCycle } from "./services/snapshots";
import {
  getDailyRollups,
  getIncidentHistory,
  getLatestSnapshot,
  getRecentObservations,
} from "./storage/kv";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-internal-secret",
};

function jsonResponse(data: unknown, status: number = 200, cacheSeconds: number = 60): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
      ...CORS_HEADERS,
    },
  });
}

const worker = {
  /**
   * HTTP API Request Router
   */
  async fetch(request: Request, env: MonitorWorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health ping of the monitor worker itself
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({
        status: "operational",
        worker: "prime-status-monitor",
        environment: env.ENVIRONMENT || "production",
        timestamp: new Date().toISOString(),
      });
    }

    // Public Status Snapshot
    if (url.pathname === "/api/status") {
      let snapshot = await getLatestSnapshot(env.STATUS_KV);
      if (!snapshot) {
        // Cold start initial cycle
        snapshot = await executeMonitoringCycle(env);
      }
      return jsonResponse(snapshot, 200, 30);
    }

    // Services list & health
    if (url.pathname === "/api/status/services") {
      let snapshot = await getLatestSnapshot(env.STATUS_KV);
      if (!snapshot) {
        snapshot = await executeMonitoringCycle(env);
      }
      return jsonResponse({ services: snapshot.services }, 200, 30);
    }

    // 90-day Daily Uptime History
    if (url.pathname === "/api/status/history") {
      const rollups = await getDailyRollups(env.STATUS_KV);
      return jsonResponse({ dailyRollups: rollups }, 200, 60);
    }

    // Active & Past Incidents
    if (url.pathname === "/api/status/incidents") {
      const snapshot = await getLatestSnapshot(env.STATUS_KV);
      const history = await getIncidentHistory(env.STATUS_KV);
      return jsonResponse(
        {
          active: snapshot?.activeIncidents || [],
          history: history || [],
        },
        200,
        30
      );
    }

    // Latency Distribution / Time-series
    if (url.pathname === "/api/status/latency") {
      const observations = await getRecentObservations(env.STATUS_KV, 100);
      const points = observations.map((o) => ({
        timestamp: o.checkedAt,
        responseTimeMs: o.responseTimeMs,
        status: o.status,
      }));
      return jsonResponse({ observations: points }, 200, 30);
    }

    // Immediate check-now trigger
    if (url.pathname === "/api/check-now" && request.method === "POST") {
      const providedSecret =
        request.headers.get("x-internal-secret") ||
        request.headers.get("authorization")?.replace("Bearer ", "");

      if (
        env.ALERT_INTERNAL_SECRET &&
        providedSecret !== env.ALERT_INTERNAL_SECRET
      ) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const snapshot = await executeMonitoringCycle(env);
      return jsonResponse({ success: true, snapshot }, 200, 0);
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  },

  /**
   * Scheduled Cron Triggers:
   * Every 5 minutes -> Health check cycle
   * Daily midnight UTC -> Daily rollup & pruning
   */
  async scheduled(
    event: { cron: string; scheduledTime: number },
    env: MonitorWorkerEnv
  ): Promise<void> {
    console.log(`[prime-monitor] Cron triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`);
    try {
      await executeMonitoringCycle(env, event.scheduledTime);
    } catch (err) {
      console.error("[prime-monitor] Scheduled cycle failed:", err);
    }
  },
};

export default worker;
