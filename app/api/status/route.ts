import { NextResponse } from "next/server";

const CLOUDFLARE_WORKER_URL =
  process.env.CLOUDFLARE_MONITOR_WORKER_URL ||
  "https://prime-status-monitor.codewitheswar.workers.dev";

const CLOUDFLARE_ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || "de6ff29d95bdc8ce81317ce8a72424c0";
const CLOUDFLARE_KV_NAMESPACE_ID =
  process.env.CLOUDFLARE_KV_NAMESPACE_ID || "67161f7caef042739f7ea8eb1b405949";
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

/**
 * Public Status API endpoint.
 * Operationally independent of the monitored Supabase database.
 * Fetches cached status snapshots from Cloudflare Worker or directly from Cloudflare KV.
 */
export async function GET() {
  // Strategy 1: Fetch from Cloudflare Worker
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${CLOUDFLARE_WORKER_URL.replace(/\/+$/, "")}/api/status`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 30 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }
  } catch {
    // Cloudflare Worker unreachable, continue to fallback
  }

  // Strategy 2: Direct REST fetch to Cloudflare KV
  if (CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_KV_NAMESPACE_ID) {
    try {
      const kvEndpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/snapshot:latest`;
      const res = await fetch(kvEndpoint, {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        next: { revalidate: 30 },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        });
      }
    } catch {
      // KV direct fetch unreachable
    }
  }

  // Strategy 3: Graceful delayed monitoring snapshot fallback
  return NextResponse.json(
    {
      status: "unknown",
      summary: "Monitoring data is currently unavailable or delayed",
      services: [
        {
          id: "backend-db",
          slug: "backend-infrastructure",
          displayName: "Backend Infrastructure",
          description: "Database engine, authentication, and core API services",
          enabled: true,
          status: "unknown",
          uptimePercentage24h: 100,
          uptimePercentage7d: 100,
          uptimePercentage30d: 100,
          uptimePercentage90d: 100,
          lastCheckedAt: null,
          lastResponseTimeMs: null,
        },
      ],
      lastCheckedAt: null,
      lastAttemptedAt: new Date().toISOString(),
      coverage: {
        totalChecks24h: 0,
        successRate24h: 0,
        isFresh: false,
        windowMinutes: 5,
      },
      activeIncidents: [],
      recentObservations: [],
      dailyRollups: [],
      environment: process.env.NODE_ENV || "production",
      generatedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
