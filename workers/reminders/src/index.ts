import type { WorkerEnv } from "../../shared/types";
import { workerLog } from "../../shared/logger";

const worker = {
  /**
   * Health / Dev Entrypoint
   */
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          worker: "reminders",
          environment: env.ENVIRONMENT || "development",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response("PRIME Reminders Worker Foundation", { status: 200 });
  },

  /**
   * Scheduled Cron Entrypoint (Foundation Skeleton)
   * Real email reminder dispatch logic is deferred to feature phases.
   */
  async scheduled(
    event: { cron: string; scheduledTime: number },
    env: WorkerEnv
  ): Promise<void> {
    workerLog("reminders", "info", "Scheduled reminder dispatch triggered", {
      cron: event.cron,
      scheduledTime: event.scheduledTime,
      environment: env.ENVIRONMENT,
    });
  },
};

export default worker;
