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

  const avgLatency = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, p) => acc + p.latency, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const maxLatency = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((p) => p.latency));
  }, [chartData]);

  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-medium text-white">Backend Probe Latency</h3>
            <span className="font-mono text-xs text-neutral-400">
              Avg: <strong className="text-neutral-200">{avgLatency}ms</strong> · Max:{" "}
              <strong className="text-neutral-200">{maxLatency}ms</strong>
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            Round-trip response time from Cloudflare edge to backend services
          </p>
        </div>

        {/* Range Buttons */}
        <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-900/60 p-0.5 text-xs self-start sm:self-auto">
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

      {/* Recharts Canvas */}
      <div className="mt-6 h-60 w-full min-w-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#222222" }}
              />
              <YAxis
                width={48}
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-neutral-800 bg-black/95 p-2.5 shadow-xl backdrop-blur-md">
                        <div className="text-[11px] font-medium text-neutral-400">
                          {data.time}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              data.status === "up" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          <span className="font-mono text-xs font-semibold text-white">
                            {data.latency} ms
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-400">
            Awaiting telemetry observations from Cloudflare edge...
          </div>
        )}
      </div>
    </div>
  );
}
