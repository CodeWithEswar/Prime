"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
} from "@/components/ui/dropdown-menu";
import { PrimeChartContainer } from "./prime-chart-container";
import { PrimeChartTooltip, PrimeSlimBarCursor } from "./prime-chart-tooltip";
import { primeChartColors, primeChartFont } from "./prime-chart-theme";
import { useMounted } from "../../hooks/use-mounted";
import { cn } from "@/lib/utils";

interface StriverProblemsColumnChartProps {
  data: {
    topic: string;
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }[];
}

export function StriverProblemsColumnChart({ data }: StriverProblemsColumnChartProps) {
  const mounted = useMounted();
  const [layoutMode, setLayoutMode] = React.useState<"stacked" | "grouped">("stacked");

  return (
    <PrimeChartContainer
      title="Coding Problems Solved by Category"
      subtitle="Vertical column breakdown across Easy, Medium, and Hard difficulty levels."
      minHeight={280}
      controls={
        <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setLayoutMode("stacked")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              layoutMode === "stacked"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Stacked
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("grouped")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              layoutMode === "grouped"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Grouped
          </button>
        </div>
      }
      mobileControls={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
              aria-label="Column chart layout options"
            >
              <Icon icon={MoreHorizontalIcon} size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#0C0C0C] border-white/10 text-neutral-200 font-mono text-xs shadow-xl">
            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
              Column Layout
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setLayoutMode("stacked")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                layoutMode === "stacked" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Stacked</span>
              {layoutMode === "stacked" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLayoutMode("grouped")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                layoutMode === "grouped" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Grouped</span>
              {layoutMode === "grouped" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer={false}
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid stroke={primeChartColors.grid} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="topic"
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={40}
              />

              <YAxis
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                cursor={
                  <PrimeSlimBarCursor
                    layoutMode={layoutMode}
                    maxWidth={layoutMode === "stacked" ? 42 : 72}
                    barWidth={18}
                    barGap={4}
                    totalSlots={3}
                  />
                }
                content={(props) => (
                  <PrimeChartTooltip
                    active={props.active}
                    payload={props.payload?.map((p) => ({
                      name: p.name as string,
                      value: p.value as number,
                      color: p.color as string,
                    }))}
                    label={props.label}
                    titleFormatter={(l) => `${l}`}
                    showTotal={true}
                  />
                )}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  fontFamily: primeChartFont.familyMono,
                  paddingTop: "6px",
                }}
              />

              <Bar
                dataKey="easy"
                name="Easy"
                stackId={layoutMode === "stacked" ? "a" : undefined}
                fill={primeChartColors.easy}
                maxBarSize={layoutMode === "stacked" ? 32 : 18}
                radius={layoutMode === "stacked" ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              />

              <Bar
                dataKey="medium"
                name="Medium"
                stackId={layoutMode === "stacked" ? "a" : undefined}
                fill={primeChartColors.medium}
                maxBarSize={layoutMode === "stacked" ? 32 : 18}
                radius={layoutMode === "stacked" ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              />

              <Bar
                dataKey="hard"
                name="Hard"
                stackId={layoutMode === "stacked" ? "a" : undefined}
                fill={primeChartColors.hard}
                maxBarSize={layoutMode === "stacked" ? 32 : 18}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-white/[0.02] rounded-lg animate-pulse" />
        )}
      </div>
    </PrimeChartContainer>
  );
}

