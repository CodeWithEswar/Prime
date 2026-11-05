import type { Metadata } from "next";
import { StatusClient } from "./status-client";
import type { PublicStatusSnapshot } from "@/workers/prime-monitor/src/types/monitoring";

export const metadata: Metadata = {
  title: "System Status",
  description:
    "Real-time infrastructure health, uptime tracking, and service history for PRIME.",
};

const CLOUDFLARE_WORKER_URL =
  process.env.CLOUDFLARE_MONITOR_WORKER_URL ||
  "https://prime-status-monitor.codewitheswar.workers.dev";

async function getInitialSnapshot(): Promise<PublicStatusSnapshot | null> {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_URL.replace(/\/+$/, "")}/api/status`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      return (await res.json()) as PublicStatusSnapshot;
    }
  } catch (err) {
    console.warn("Initial SSR status snapshot fetch failed:", err);
  }
  return null;
}

export default async function StatusPage() {
  const initialSnapshot = await getInitialSnapshot();

  return <StatusClient initialSnapshot={initialSnapshot} />;
}
