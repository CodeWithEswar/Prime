import { describe, it, expect, vi } from "vitest";
import { checkSupabaseHealth } from "@/workers/prime-monitor/src/checks/supabase";
import {
  evaluateServiceState,
  aggregateSystemState,
} from "@/workers/prime-monitor/src/services/evaluator";
import { syncIncidentsWithState } from "@/workers/prime-monitor/src/services/incidents";
import {
  calculateDailyRollups,
  calculateWindowUptime,
} from "@/workers/prime-monitor/src/services/rollups";
import { dispatchOperationalAlert } from "@/workers/prime-monitor/src/services/alerts";
import monitorWorker from "@/workers/prime-monitor/src/index";
import type {
  HealthObservation,
  Incident,
  MonitorWorkerEnv,
} from "@/workers/prime-monitor/src/types/monitoring";

describe("PRIME Infrastructure Monitoring & Public Status Engine", () => {
  const mockEnv: MonitorWorkerEnv = {
    ENVIRONMENT: "development",
    SUPABASE_URL: "https://mock-supabase.supabase.co",
    SUPABASE_ANON_KEY: "mock-anon-key",
    APP_URL: "https://primeprep.app",
    ALERT_EMAIL_RECIPIENT: "alerts@primeprep.app",
    ALERT_INTERNAL_SECRET: "test-secret",
  };

  describe("Supabase Health Check Probe", () => {
    it("returns 'unknown' when credentials are missing", async () => {
      const res = await checkSupabaseHealth({
        supabaseUrl: "",
        apiKey: "",
      });
      expect(res.status).toBe("unknown");
      expect(res.errorCode).toBe("MISSING_CREDENTIALS");
    });

    it("validates successful probe with marker 'prime-ok'", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ marker: "prime-ok", updated_at: new Date().toISOString() }],
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await checkSupabaseHealth({
        supabaseUrl: "https://test.supabase.co",
        apiKey: "anon-key",
      });

      expect(res.status).toBe("up");
      expect(res.httpStatus).toBe(200);
      expect(res.errorCode).toBeNull();
      expect(res.responseTimeMs).toBeGreaterThanOrEqual(0);

      vi.unstubAllGlobals();
    });

    it("rejects response with invalid probe marker", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ marker: "compromised" }],
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await checkSupabaseHealth({
        supabaseUrl: "https://test.supabase.co",
        apiKey: "anon-key",
      });

      expect(res.status).toBe("down");
      expect(res.errorCode).toBe("INVALID_PROBE_PAYLOAD");

      vi.unstubAllGlobals();
    });

    it("handles HTTP 503 service unavailable", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await checkSupabaseHealth({
        supabaseUrl: "https://test.supabase.co",
        apiKey: "anon-key",
      });

      expect(res.status).toBe("down");
      expect(res.httpStatus).toBe(503);
      expect(res.errorCode).toBe("HTTP_503");

      vi.unstubAllGlobals();
    });
  });

  describe("Monitoring State Machine Evaluator", () => {
    const makeObs = (status: "up" | "down", rtt: number = 100, ageMinutes: number = 0): HealthObservation => ({
      serviceId: "backend-db",
      scheduledAt: new Date(Date.now() - ageMinutes * 60000).toISOString(),
      checkedAt: new Date(Date.now() - ageMinutes * 60000).toISOString(),
      status,
      responseTimeMs: rtt,
      httpStatus: status === "up" ? 200 : 500,
      errorCode: status === "up" ? null : "ERROR",
    });

    it("marks service as 'unknown' if observations are empty", () => {
      const evalResult = evaluateServiceState([]);
      expect(evalResult.state).toBe("unknown");
      expect(evalResult.isStale).toBe(true);
    });

    it("marks service as 'unknown' if observations are stale (>30 mins)", () => {
      const evalResult = evaluateServiceState([makeObs("up", 100, 45)]);
      expect(evalResult.state).toBe("unknown");
      expect(evalResult.isStale).toBe(true);
    });

    it("does not declare outage on a single failed check", () => {
      const obs = [makeObs("up", 100, 10), makeObs("down", 100, 0)];
      const evalResult = evaluateServiceState(obs, "operational");
      expect(evalResult.state).toBe("operational");
      expect(evalResult.consecutiveFailures).toBe(1);
    });

    it("triggers 'major_outage' after 3 consecutive failures", () => {
      const obs = [
        makeObs("up", 100, 15),
        makeObs("down", 100, 10),
        makeObs("down", 100, 5),
        makeObs("down", 100, 0),
      ];
      const evalResult = evaluateServiceState(obs, "operational");
      expect(evalResult.state).toBe("major_outage");
      expect(evalResult.consecutiveFailures).toBe(3);
    });

    it("requires 2 consecutive successes to confirm recovery from outage", () => {
      const obsAfter1Success = [
        makeObs("down", 100, 10),
        makeObs("down", 100, 5),
        makeObs("up", 100, 0),
      ];
      const evalResult1 = evaluateServiceState(obsAfter1Success, "major_outage");
      // Still in outage after 1 success
      expect(evalResult1.state).toBe("major_outage");

      const obsAfter2Successes = [
        makeObs("down", 100, 10),
        makeObs("up", 100, 5),
        makeObs("up", 100, 0),
      ];
      const evalResult2 = evaluateServiceState(obsAfter2Successes, "major_outage");
      // Recovered to operational after 2 consecutive successes
      expect(evalResult2.state).toBe("operational");
    });

    it("flags 'degraded' performance when latency exceeds 1200ms", () => {
      const obs = [makeObs("up", 1500, 0)];
      const evalResult = evaluateServiceState(obs, "operational");
      expect(evalResult.state).toBe("degraded");
    });

    it("aggregates system status accurately", () => {
      expect(aggregateSystemState(["operational", "operational"])).toBe("operational");
      expect(aggregateSystemState(["operational", "degraded"])).toBe("degraded");
      expect(aggregateSystemState(["operational", "major_outage"])).toBe("major_outage");
      expect(aggregateSystemState([])).toBe("unknown");
    });
  });

  describe("Incident Management Lifecycle", () => {
    it("creates critical incident upon confirmed major outage", () => {
      const result = syncIncidentsWithState(
        "backend-db",
        "Backend Infrastructure",
        "major_outage",
        [],
        []
      );

      expect(result.active).toHaveLength(1);
      expect(result.newIncidentCreated).toBeDefined();
      expect(result.newIncidentCreated?.severity).toBe("critical");
      expect(result.newIncidentCreated?.status).toBe("investigating");
    });

    it("resolves active incident when service transitions back to operational", () => {
      const activeInc: Incident = {
        id: "inc_123",
        serviceId: "backend-db",
        title: "Backend Outage",
        severity: "critical",
        status: "investigating",
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedAt: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        updates: [],
      };

      const result = syncIncidentsWithState(
        "backend-db",
        "Backend Infrastructure",
        "operational",
        [activeInc],
        []
      );

      expect(result.active).toHaveLength(0);
      expect(result.history).toHaveLength(1);
      expect(result.incidentResolved).toBeDefined();
      expect(result.incidentResolved?.status).toBe("resolved");
      expect(result.incidentResolved?.resolvedAt).toBeDefined();
    });
  });

  describe("Uptime Rollups & 90-Day Analytics", () => {
    it("calculates window uptime percentage correctly", () => {
      const obs: HealthObservation[] = [
        {
          serviceId: "backend-db",
          scheduledAt: new Date().toISOString(),
          checkedAt: new Date().toISOString(),
          status: "up",
          responseTimeMs: 120,
          httpStatus: 200,
          errorCode: null,
        },
        {
          serviceId: "backend-db",
          scheduledAt: new Date().toISOString(),
          checkedAt: new Date().toISOString(),
          status: "down",
          responseTimeMs: null,
          httpStatus: 500,
          errorCode: "ERR",
        },
      ];

      const uptime = calculateWindowUptime(obs, "backend-db", 24);
      expect(uptime).toBe(50.0);
    });

    it("generates 90-day sequence without fabricating 100% on missing days", () => {
      const rollups = calculateDailyRollups("backend-db", [], 90);
      expect(rollups).toHaveLength(90);
      expect(rollups[0].status).toBe("no_data");
      expect(rollups[0].uptimePercentage).toBe(0);
    });
  });

  describe("Alert Deduplication & Cooldown", () => {
    it("suppresses repeated alerts within 1-hour cooldown", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", mockFetch);

      const firstSend = await dispatchOperationalAlert(mockEnv, {
        type: "outage",
        serviceId: "backend-db",
        title: "Outage Alert",
        message: "Outage detected",
        severity: "critical",
        timestamp: new Date().toISOString(),
      });
      expect(firstSend.dispatched).toBe(true);

      const secondSend = await dispatchOperationalAlert(mockEnv, {
        type: "outage",
        serviceId: "backend-db",
        title: "Outage Alert",
        message: "Outage detected",
        severity: "critical",
        timestamp: new Date().toISOString(),
      });
      expect(secondSend.dispatched).toBe(false);
      expect(secondSend.reason).toBe("alert_suppressed_by_cooldown");

      vi.unstubAllGlobals();
    });
  });

  describe("Cloudflare Monitor Worker Endpoints", () => {
    it("responds to /health with worker operational status", async () => {
      const req = new Request("http://localhost/health");
      const res = await monitorWorker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.worker).toBe("prime-status-monitor");
      expect(data.status).toBe("operational");
    });

    it("responds to /api/status with valid status snapshot schema", async () => {
      const req = new Request("http://localhost/api/status");
      const res = await monitorWorker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      const snapshot = await res.json();
      expect(snapshot.status).toBeDefined();
      expect(snapshot.services).toBeDefined();
      expect(Array.isArray(snapshot.services)).toBe(true);
      expect(snapshot.coverage).toBeDefined();
    });

    it("responds to /api/status/history with daily rollups", async () => {
      const req = new Request("http://localhost/api/status/history");
      const res = await monitorWorker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.dailyRollups).toBeDefined();
    });

    it("responds to /api/status/latency with recent time-series", async () => {
      const req = new Request("http://localhost/api/status/latency");
      const res = await monitorWorker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.observations).toBeDefined();
    });
  });
});
