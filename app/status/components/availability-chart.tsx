"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyRollup } from "@/workers/prime-monitor/src/types/monitoring";

interface AvailabilityChartProps {
  rollups: DailyRollup[];
}

export function AvailabilityChart({ rollups }: AvailabilityChartProps) {
  const chartData = useMemo(() => {
    if (!rollups || rollups.length === 0) return [];

    // Filter to the last 14 days
    const recent = rollups.slice(-14);

    return recent.map((r) => {
      const parts = r.date.split("-");
      const shortDate = `${parts[1]}/${parts[2]}`;

      return {
        date: r.date,
        shortDate,
        uptime: r.totalChecks > 0 ? r.uptimePercentage : 0,
        checks: r.totalChecks,
        avgLatency: r.averageLatencyMs,
        status: r.status,
        hasData: r.totalChecks > 0,
      };
    });
  }, [rollups]);

  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-medium text-white">Daily Availability Trend</h3>
          <p className="text-xs text-neutral-400">
            Observed uptime percentage per day over recent monitoring intervals
          </p>
        </div>
      </div>

      <div className="mt-6 h-60 w-full min-w-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#222222" }}
              />
              <YAxis
                width={42}
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-neutral-800 bg-black/95 p-2.5 shadow-xl backdrop-blur-md">
                        <div className="text-[11px] font-medium text-neutral-400">
                          {data.date}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              data.hasData
                                ? data.uptime >= 95
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                                : "bg-neutral-600"
                            }`}
                          />
                          <span className="font-mono text-xs font-semibold text-white">
                            {data.hasData ? `${data.uptime}% Uptime` : "Pre-Monitoring Period"}
                          </span>
                        </div>
                        {data.hasData && (
                          <div className="mt-1 text-[11px] text-neutral-400">
                            {data.checks} probes · {data.avgLatency}ms latency
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="uptime" radius={[3, 3, 0, 0]}>
                {chartData.map((entry) => {
                  let fill = "#22c55e"; // emerald
                  if (!entry.hasData) fill = "rgba(40,40,40,0.5)";
                  else if (entry.uptime < 95) fill = "#ef4444";
                  else if (entry.uptime < 100) fill = "#f59e0b";

                  return <Cell key={entry.date} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-400">
            Awaiting daily rollups...
          </div>
        )}
      </div>
    </div>
  );
}
