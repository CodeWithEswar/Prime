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

interface StriverBalanceChartProps {
  data: {
    day: string;
    videosWatched: number;
    problemsSolved: number;
  }[];
}

export function StriverBalanceChart({ data }: StriverBalanceChartProps) {
  const mounted = useMounted();

  const totalVideos = data.reduce((s, d) => s + d.videosWatched, 0);
  const totalProblems = data.reduce((s, d) => s + d.problemsSolved, 0);
  const ratio = totalVideos > 0 ? (totalProblems / totalVideos).toFixed(1) : "0";

  return (
    <PrimeChartContainer
      title="Learning vs Practice Ratio"
      subtitle="Comparing lecture consumption against algorithmic implementation across weekdays."
      badge={`${ratio}x Solve-to-Watch Ratio`}
      minHeight={280}
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer={false}
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke={primeChartColors.grid} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="day"
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
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
                cursor={<PrimeSlimBarCursor maxWidth={56} />}
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
                dataKey="videosWatched"
                name="Lectures Watched"
                fill={primeChartColors.primary}
                maxBarSize={24}
                radius={[3, 3, 0, 0]}
              />

              <Bar
                dataKey="problemsSolved"
                name="Problems Solved"
                fill={primeChartColors.practice}
                maxBarSize={24}
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

