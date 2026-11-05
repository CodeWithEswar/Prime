import type { WorkerEnv } from "../../shared/types";
import { workerLog } from "../../shared/logger";
import { createWorkerSupabaseClient } from "../../shared/supabase";

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

    if (url.pathname === "/keep-alive" || url.pathname === "/ping") {
      try {
        const supabase = createWorkerSupabaseClient(env);
        const { error } = await supabase.from("notifications").select("id").limit(1);
        return new Response(
          JSON.stringify({
            status: !error ? "active" : "degraded",
            service: "Supabase Keep-Alive (Planner)",
            timestamp: new Date().toISOString(),
            error: error?.message,
          }),
          {
            status: !error ? 200 : 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ status: "error", error: err?.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response("PRIME Planner Worker Foundation", { status: 200 });
  },

  /**
   * Scheduled Cron Entrypoint (Daily keep-alive and plan check)
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

    try {
      const supabase = createWorkerSupabaseClient(env);
      const { error } = await supabase.from("notifications").select("id").limit(1);
      workerLog("planner", "info", "Planner Supabase keep-alive pulse dispatched", {
        success: !error,
        error: error?.message,
      });
    } catch (err: any) {
      workerLog("planner", "warn", "Planner Supabase keep-alive failed", {
        error: err?.message,
      });
    }
  },
};

export default worker;
