"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { HealthObservation } from "@/workers/prime-monitor/src/types/monitoring";

interface LatencyChartProps {
  observations: HealthObservation[];
}

export function LatencyChart({ observations }: LatencyChartProps) {
  const [range, setRange] = useState<"recent" | "24h">("recent");

  const chartData = useMemo(() => {
    if (!observations || observations.length === 0) return [];

    const filtered =
      range === "recent"
        ? observations.slice(-30)
        : observations.slice(-100);

    return filtered.map((obs) => {
      const d = new Date(obs.checkedAt);
      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        timestamp: obs.checkedAt,
        time: timeStr,
        latency: obs.responseTimeMs ?? 0,
        status: obs.status,
      };
    });
  }, [observations, range]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { current: 0, avg: 0, p95: 0, min: 0, max: 0 };
    }

    const latencies = chartData.map((p) => p.latency);
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / latencies.length);
    const max = Math.max(...latencies);
    const min = Math.min(...latencies);

    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.min(
      Math.floor(sorted.length * 0.95),
      sorted.length - 1
    );
    const p95 = sorted[p95Index] ?? max;
    const current = latencies[latencies.length - 1] ?? 0;

    return { current, avg, p95, min, max };
  }, [chartData]);

  // Telemetry status: Emerald for nominal, amber for degraded, red for critical
  const statusConfig = useMemo(() => {
    if (stats.avg > 800 || stats.current > 1000) {
      return {
        color: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.15)",
        label: "Latency Elevated",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-500",
      };
    }
    return {
      color: "#10b981", // Professional Emerald
      glow: "rgba(16, 185, 129, 0.12)",
      label: "Nominal Performance",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dotClass: "bg-emerald-500 animate-pulse",
    };
  }, [stats]);

  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
      {/* Header & Telemetry Metric Bar */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm sm:text-base font-medium text-white">
                Backend Probe Latency
              </h3>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusConfig.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </div>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              Edge-to-database round-trip time across Cloudflare network
            </p>
          </div>

          {/* Range Control */}
          <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-900/60 p-0.5 text-xs self-start sm:self-auto font-mono">
            <button
              type="button"
              onClick={() => setRange("recent")}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                range === "recent"
                  ? "bg-neutral-800 font-medium text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Last 30 Checks
            </button>
            <button
              type="button"
              onClick={() => setRange("24h")}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                range === "24h"
                  ? "bg-neutral-800 font-medium text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Full Window
            </button>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-neutral-900 pt-3 text-left">
          <div className="rounded-md border border-neutral-900 bg-neutral-900/30 p-2">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400">
              Current
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {stats.current}
              <span className="text-[10px] text-neutral-400 font-normal ml-0.5">ms</span>
            </span>
          </div>
          <div className="rounded-md border border-neutral-900 bg-neutral-900/30 p-2">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400">
              Mean
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-200">
              {stats.avg}
              <span className="text-[10px] text-neutral-400 font-normal ml-0.5">ms</span>
            </span>
          </div>
          <div className="rounded-md border border-neutral-900 bg-neutral-900/30 p-2">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400">
              P95 Peak
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-200">
              {stats.p95}
              <span className="text-[10px] text-neutral-400 font-normal ml-0.5">ms</span>
            </span>
          </div>
          <div className="rounded-md border border-neutral-900 bg-neutral-900/30 p-2">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400">
              Max Peak
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-300">
              {stats.max}
              <span className="text-[10px] text-neutral-400 font-normal ml-0.5">ms</span>
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Canvas */}
      <div className="mt-4 h-52 w-full min-w-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 10, left: -4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={statusConfig.color} stopOpacity={0.16} />
                  <stop offset="95%" stopColor={statusConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#52525b"
                fontSize={9}
                fontFamily="var(--font-geist-mono), monospace"
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
              />
              <YAxis
                width={50}
                stroke="#52525b"
                fontSize={9}
                fontFamily="var(--font-geist-mono), monospace"
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              {/* SLA Target Reference Line */}
              <ReferenceLine
                y={300}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeDasharray="3 3"
                label={{
                  value: "300ms SLA",
                  position: "insideTopLeft",
                  fill: "#71717a",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isSpike = data.latency > 800;
                    return (
                      <div className="rounded-lg border border-neutral-800 bg-[#080808]/95 p-3 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[10px] text-neutral-400">
                            {data.time}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                              data.status === "up" && !isSpike
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {data.status === "up" ? (isSpike ? "Spike" : "Nominal") : "Down"}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                          <span className="font-mono text-base font-bold text-white">
                            {data.latency}
                          </span>
                          <span className="font-mono text-xs text-neutral-400">ms RTT</span>
                        </div>
                        <div className="mt-1 text-[10px] text-neutral-400 font-mono">
                          {data.latency <= 300
                            ? "✓ Within 300ms target"
                            : `+${data.latency - 300}ms above target`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotoneX"
                dataKey="latency"
                stroke={statusConfig.color}
                strokeWidth={1.75}
                fillOpacity={1}
                fill="url(#latencyGradient)"
                activeDot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: statusConfig.color,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-neutral-800/80 text-xs text-neutral-400 font-mono">
            Awaiting telemetry observations from Cloudflare edge...
          </div>
        )}
      </div>
    </div>
  );
}
