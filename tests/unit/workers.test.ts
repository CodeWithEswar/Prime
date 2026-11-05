import { describe, it, expect, vi } from "vitest";
import plannerWorker from "../../workers/planner/src/index";
import remindersWorker from "../../workers/reminders/src/index";
import { workerLog } from "../../workers/shared/logger";
import { createWorkerSupabaseClient } from "../../workers/shared/supabase";
import type { WorkerEnv } from "../../workers/shared/types";

describe("Cloudflare Workers Foundation", () => {
  const mockEnv: WorkerEnv = {
    ENVIRONMENT: "development",
    SUPABASE_URL: "https://irioygnezxaptppbfpqz.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock-service-role-key-for-unit-testing",
    EMAIL_FROM: "PRIME <notifications@primeprep.app>",
  };

  describe("prime-worker-planner", () => {
    it("responds to /health endpoint with valid status and json payload", async () => {
      const request = new Request("http://localhost/health");
      const response = await plannerWorker.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body = await response.json();
      expect(body.status).toBe("healthy");
      expect(body.worker).toBe("planner");
      expect(body.environment).toBe("development");
      expect(body.timestamp).toBeDefined();
    });

    it("responds to root route with foundation acknowledgment", async () => {
      const request = new Request("http://localhost/");
      const response = await plannerWorker.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toContain("PRIME Planner Worker Foundation");
    });

    it("responds to /keep-alive endpoint with service payload", async () => {
      const request = new Request("http://localhost/keep-alive");
      const response = await remindersWorker.fetch(request, mockEnv);
      expect([200, 503]).toContain(response.status);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.json();
      expect(body.service).toContain("Keep-Alive");
    });

    it("executes scheduled cron handler without throwing", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(
        plannerWorker.scheduled({ cron: "0 0 * * *", scheduledTime: Date.now() }, mockEnv)
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("responds to /keep-alive endpoint with service payload", async () => {
      const request = new Request("http://localhost/keep-alive");
      const response = await plannerWorker.fetch(request, mockEnv);
      expect([200, 503]).toContain(response.status);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.json();
      expect(body.service).toContain("Keep-Alive");
    });
  });

  describe("prime-worker-reminders", () => {
    it("responds to /health endpoint with valid status and json payload", async () => {
      const request = new Request("http://localhost/health");
      const response = await remindersWorker.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body = await response.json();
      expect(body.status).toBe("healthy");
      expect(body.worker).toBe("reminders");
      expect(body.environment).toBe("development");
      expect(body.timestamp).toBeDefined();
    });

    it("responds to root route with foundation acknowledgment", async () => {
      const request = new Request("http://localhost/");
      const response = await remindersWorker.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toContain("PRIME Reminders Worker Foundation");
    });

    it("responds to /keep-alive endpoint with service payload", async () => {
      const request = new Request("http://localhost/keep-alive");
      const response = await remindersWorker.fetch(request, mockEnv);
      expect([200, 503]).toContain(response.status);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.json();
      expect(body.service).toContain("Keep-Alive");
    });

    it("executes scheduled cron handler without throwing", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const dispatch = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify({ dispatched: 0 }), { status: 200 })
        );
      try {
        await expect(
          remindersWorker.scheduled(
            { cron: "0 6 * * *", scheduledTime: Date.now() },
            { ...mockEnv, APP_URL: "https://prime.test", CRON_SECRET: "unit-test-only" }
          )
        ).resolves.toBeUndefined();
        expect(dispatch).toHaveBeenCalledWith(
          "https://prime.test/api/reminders/dispatch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer unit-test-only",
            },
          }
        );
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        dispatch.mockRestore();
        consoleSpy.mockRestore();
      }
    });
  });

  describe("workers/shared", () => {
    it("outputs structured json logs with worker metadata", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      workerLog("test-worker", "info", "test message", { foo: "bar" });
      expect(logSpy).toHaveBeenCalled();
      const infoPayload = JSON.parse(logSpy.mock.calls[0][0]);
      expect(infoPayload.worker).toBe("test-worker");
      expect(infoPayload.level).toBe("info");
      expect(infoPayload.message).toBe("test message");
      expect(infoPayload.foo).toBe("bar");

      workerLog("test-worker", "warn", "warning message");
      expect(warnSpy).toHaveBeenCalled();

      workerLog("test-worker", "error", "error message");
      expect(errorSpy).toHaveBeenCalled();

      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("instantiates Supabase client from worker env bindings", () => {
      const client = createWorkerSupabaseClient(mockEnv);
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });
  });
});
