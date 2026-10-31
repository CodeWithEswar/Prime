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
          worker: "planner",
          environment: env.ENVIRONMENT || "development",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response("PRIME Planner Worker Foundation", { status: 200 });
  },

  /**
   * Scheduled Cron Entrypoint (Foundation Skeleton)
   * Real daily plan scheduling logic is deferred to feature phases.
   */
  async scheduled(
    event: { cron: string; scheduledTime: number },
    env: WorkerEnv
  ): Promise<void> {
    workerLog("planner", "info", "Scheduled planner execution triggered", {
      cron: event.cron,
      scheduledTime: event.scheduledTime,
      environment: env.ENVIRONMENT,
    });
  },
};

export default worker;
