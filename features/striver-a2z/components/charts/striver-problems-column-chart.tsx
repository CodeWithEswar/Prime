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
      badge="Difficulty Grouped"
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
                cursor={<PrimeSlimBarCursor maxWidth={layoutMode === "stacked" ? 42 : 58} />}
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

