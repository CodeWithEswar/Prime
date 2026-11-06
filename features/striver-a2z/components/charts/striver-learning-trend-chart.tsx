"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { PrimeChartContainer } from "./prime-chart-container";
import { PrimeChartTooltip } from "./prime-chart-tooltip";
import { primeChartColors, primeChartFont } from "./prime-chart-theme";
import { cn } from "@/lib/utils";

interface StriverLearningTrendChartProps {
  data: {
    date: string;
    completed: number;
    cumulative: number;
    problemsSolved?: number;
    cumulativeProblems?: number;
  }[];
}

export function StriverLearningTrendChart({ data }: StriverLearningTrendChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<"7d" | "30d">("30d");
  const [viewMode, setViewMode] = React.useState<"cumulative" | "daily">("cumulative");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Filter slice based on date range
  const filteredData = React.useMemo(() => {
    if (dateRange === "7d") {
      return data.slice(-7);
    }
    return data;
  }, [data, dateRange]);

  const maxVideoVal = Math.max(
    ...filteredData.map((d) => (viewMode === "cumulative" ? d.cumulative : d.completed)),
    5
  );

  return (
    <PrimeChartContainer
      title="Learning Completion & Velocity Runway"
      subtitle={
        viewMode === "cumulative"
          ? "Cumulative lectures watched and problems solved over time."
          : "Daily count of completed video lectures and solved coding problems."
      }
      badge={viewMode === "cumulative" ? "Cumulative Momentum" : "Daily Activity"}
      minHeight={320}
      controls={
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("cumulative")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all select-none",
                viewMode === "cumulative"
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={() => setViewMode("daily")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all select-none",
                viewMode === "daily"
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Daily
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setDateRange("7d")}
              className={cn(
                "px-2 py-1 rounded-md transition-all select-none",
                dateRange === "7d"
                  ? "bg-[#FF0000] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setDateRange("30d")}
              className={cn(
                "px-2 py-1 rounded-md transition-all select-none",
                dateRange === "30d"
                  ? "bg-[#FF0000] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              30D
            </button>
          </div>
        </div>
      }
    >
      <div className="h-72 sm:h-80 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer={false}
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="primeVideoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primeChartColors.primary} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={primeChartColors.primary} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="primeProblemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primeChartColors.practice} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={primeChartColors.practice} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={primeChartColors.grid} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                domain={[0, maxVideoVal]}
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{ stroke: primeChartColors.cursorLine, strokeWidth: 1 }}
                content={(props) => (
                  <PrimeChartTooltip
                    active={props.active}
                    payload={props.payload?.map((p) => ({
                      name: p.name as string,
                      value: p.value as number,
                      color: p.color as string,
                    }))}
                    label={props.label}
                    titleFormatter={(l) => `Date: ${l}`}
                    showTotal={viewMode === "daily"}
                  />
                )}
              />

              <Area
                type="monotone"
                dataKey={viewMode === "cumulative" ? "cumulative" : "completed"}
                name="Lectures Watched"
                stroke={primeChartColors.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#primeVideoGrad)"
              />

              <Area
                type="monotone"
                dataKey={viewMode === "cumulative" ? "cumulativeProblems" : "problemsSolved"}
                name="Problems Solved"
                stroke={primeChartColors.practice}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#primeProblemGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-white/[0.02] rounded-lg animate-pulse" />
        )}
      </div>
    </PrimeChartContainer>
  );
}

