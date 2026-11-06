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
import { MoreHorizontalIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PrimeChartContainer } from "./prime-chart-container";
import { PrimeChartTooltip } from "./prime-chart-tooltip";
import { primeChartColors, primeChartFont } from "./prime-chart-theme";
import { useMounted } from "../../hooks/use-mounted";
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
  const mounted = useMounted();
  const [dateRange, setDateRange] = React.useState<"7d" | "30d">("30d");
  const [viewMode, setViewMode] = React.useState<"cumulative" | "daily">("cumulative");

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
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
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
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              30D
            </button>
          </div>
        </div>
      }
      mobileControls={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
              aria-label="Chart display options"
            >
              <Icon icon={MoreHorizontalIcon} size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#0C0C0C] border-white/10 text-neutral-200 font-mono text-xs shadow-xl">
            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
              Display Mode
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setViewMode("cumulative")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                viewMode === "cumulative" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Cumulative</span>
              {viewMode === "cumulative" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setViewMode("daily")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                viewMode === "daily" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Daily Velocity</span>
              {viewMode === "daily" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10 my-1" />

            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
              Time Horizon
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setDateRange("7d")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                dateRange === "7d" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Last 7 Days</span>
              {dateRange === "7d" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDateRange("30d")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                dateRange === "30d" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Last 30 Days</span>
              {dateRange === "30d" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

