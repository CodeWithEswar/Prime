"use client";

import { useState } from "react";
import type { DailyRollup, MonitorService } from "@/workers/prime-monitor/src/types/monitoring";
import { Icon } from "@/components/ui/icon";
import { DatabaseIcon } from "@hugeicons/core-free-icons";

interface ServiceCardProps {
  service: MonitorService;
  dailyRollups: DailyRollup[];
}

export function ServiceCard({ service, dailyRollups }: ServiceCardProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyRollup | null>(null);

  const statusBadge = {
    operational: {
      text: "Operational",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dotClass: "bg-emerald-500 animate-pulse",
    },
    degraded: {
      text: "Degraded",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dotClass: "bg-amber-500 animate-pulse",
    },
    partial_outage: {
      text: "Partial Outage",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
      dotClass: "bg-red-500",
    },
    major_outage: {
      text: "Major Outage",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
      dotClass: "bg-red-500",
    },
    maintenance: {
      text: "Maintenance",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dotClass: "bg-sky-500",
    },
    unknown: {
      text: "Unknown",
      badgeClass: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
      dotClass: "bg-neutral-500",
    },
  }[service.status];

  const getCellColor = (day: DailyRollup) => {
    switch (day.status) {
      case "operational":
        return "bg-emerald-500/90 hover:bg-emerald-400";
      case "degraded":
        return "bg-amber-500/90 hover:bg-amber-400";
      case "outage":
        return "bg-red-500/90 hover:bg-red-400";
      default:
        return "bg-neutral-800/80 hover:bg-neutral-700";
    }
  };

  const displayName = service.displayName.includes("Supabase")
    ? "Backend Infrastructure"
    : service.displayName;

  return (
    <div className="relative rounded-lg border border-neutral-800/80 bg-[#0A0A0A]/95 p-5 sm:p-6 backdrop-blur-md transition-colors hover:border-neutral-700 shadow-lg">
      {/* Service Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-neutral-800 bg-neutral-900/80 text-neutral-300">
            <Icon icon={DatabaseIcon} size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-white">{displayName}</h2>
              <span className="font-mono text-[11px] text-neutral-400 font-medium">(backend-core)</span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400 font-sans">
              Primary database storage, authentication &amp; API services
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {typeof service.lastResponseTimeMs === "number" && (
            <div className="font-mono text-xs text-neutral-400">
              RTT: <span className="text-neutral-200 font-semibold">{service.lastResponseTimeMs}ms</span>
            </div>
          )}
          <div
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider font-mono ${statusBadge.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`} />
            {statusBadge.text}
          </div>
        </div>
      </div>

      {/* 90-Day Uptime Grid Strip */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
            90-Day Telemetry History
          </span>
          <span className="font-mono text-xs text-neutral-200 font-semibold">
            {service.uptimePercentage90d > 0
              ? `${service.uptimePercentage90d.toFixed(1)}% uptime`
              : "Active monitoring"}
          </span>
        </div>

        {/* 90-cell responsive flex strip */}
        <div
          className="flex h-8 sm:h-9 w-full min-w-0 items-end gap-[1px] sm:gap-[2px] rounded border border-neutral-800/80 bg-neutral-950 p-1 overflow-hidden"
          onMouseLeave={() => setHoveredDay(null)}
        >
          {dailyRollups.map((day) => (
            <div
              key={day.date}
              onMouseEnter={() => setHoveredDay(day)}
              className={`h-full flex-1 min-w-0 transition-all cursor-pointer ${getCellColor(
                day
              )} ${hoveredDay?.date === day.date ? "scale-y-110 ring-1 ring-white" : ""}`}
            />
          ))}
        </div>

        {/* Axis Labels */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>90 days ago</span>
          <span className="truncate max-w-[200px] sm:max-w-none text-center">
            {hoveredDay ? (
              <span className="text-neutral-300">
                {hoveredDay.date}:{" "}
                <strong className="text-white capitalize">{hoveredDay.status.replace("_", " ")}</strong>
                {hoveredDay.totalChecks > 0 &&
                  ` (${hoveredDay.uptimePercentage}% · ${hoveredDay.averageLatencyMs}ms)`}
              </span>
            ) : (
              "Hover or tap for daily breakdown"
            )}
          </span>
          <span>Today</span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/60 pt-3 text-[11px] text-neutral-400 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            <span>Operational</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-amber-500" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-red-500" />
            <span>Outage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-neutral-800" />
            <span>Pre-monitoring</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-300">
          <span>24h: {service.uptimePercentage24h > 0 ? `${service.uptimePercentage24h.toFixed(1)}%` : "100%"}</span>
          <span>•</span>
          <span>7d: {service.uptimePercentage7d > 0 ? `${service.uptimePercentage7d.toFixed(1)}%` : "100%"}</span>
          <span>•</span>
          <span>30d: {service.uptimePercentage30d > 0 ? `${service.uptimePercentage30d.toFixed(1)}%` : "100%"}</span>
        </div>
      </div>
    </div>
  );
}
