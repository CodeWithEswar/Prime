"use client";

import { useEffect, useState, useCallback } from "react";
import type { PublicStatusSnapshot } from "@/workers/prime-monitor/src/types/monitoring";
import { StatusHeader } from "./components/status-header";
import { OverviewMetrics } from "./components/overview-metrics";
import { ServiceCard } from "./components/service-card";
import { LatencyChart } from "./components/latency-chart";
import { AvailabilityChart } from "./components/availability-chart";
import { IncidentTimeline } from "./components/incident-timeline";
import { StatusDisclaimer } from "./components/status-disclaimer";

interface StatusClientProps {
  initialSnapshot: PublicStatusSnapshot | null;
}

export function StatusClient({ initialSnapshot }: StatusClientProps) {
  const [snapshot, setSnapshot] = useState<PublicStatusSnapshot | null>(
    initialSnapshot
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSnapshot(data);
      }
    } catch (err) {
      console.error("Failed to refresh status snapshot:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh snapshot every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshStatus();
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshStatus]);

  const backendService =
    snapshot?.services.find((s) => s.id === "backend-db") ||
    snapshot?.services[0] || {
      id: "backend-db",
      slug: "backend-infrastructure",
      displayName: "Backend Infrastructure",
      description: "Database engine, authentication, and core API services",
      enabled: true,
      status: snapshot?.status || "unknown",
      uptimePercentage24h: 100,
      uptimePercentage7d: 100,
      uptimePercentage30d: 100,
      uptimePercentage90d: 100,
      lastCheckedAt: snapshot?.lastCheckedAt || null,
      lastResponseTimeMs: null,
    };

  return (
    <div className="min-h-screen bg-black text-neutral-100 antialiased selection:bg-red-500/30 selection:text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <StatusHeader
          snapshot={snapshot}
          isLoading={isLoading}
          onRefresh={refreshStatus}
        />

        <OverviewMetrics snapshot={snapshot} />

        {/* Monitored Services List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Monitored Infrastructure
            </h2>
            <span className="font-mono text-xs text-neutral-400">
              1 Active Service Probe
            </span>
          </div>

          <ServiceCard
            service={backendService}
            dailyRollups={snapshot?.dailyRollups || []}
          />
        </section>

        {/* Charts Section — Full-width single column stack */}
        <section className="space-y-6">
          <LatencyChart observations={snapshot?.recentObservations || []} />
          <AvailabilityChart rollups={snapshot?.dailyRollups || []} />
        </section>

        {/* Incidents Timeline */}
        <section>
          <IncidentTimeline
            activeIncidents={snapshot?.activeIncidents || []}
            pastIncidents={[]}
          />
        </section>

        {/* Disclaimers & SLA Context */}
        <StatusDisclaimer />
      </div>
    </div>
  );
}
