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

interface StriverCoverageChartProps {
  data: {
    topic: string;
    videoPct: number;
    practicePct: number;
  }[];
}

export function StriverCoverageChart({ data }: StriverCoverageChartProps) {
  const mounted = useMounted();

  return (
    <PrimeChartContainer
      title="Topic Coverage Comparison"
      subtitle="Side-by-side progression: Lecture Comprehension % vs Problem Practice % across topics."
      badge="Curriculum Sync"
      minHeight={280}
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
                domain={[0, 100]}
                stroke={primeChartColors.tickText}
                fontSize={primeChartFont.sizeXs}
                fontFamily={primeChartFont.familyMono}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />

              <Tooltip
                cursor={
                  <PrimeSlimBarCursor
                    layoutMode="grouped"
                    maxWidth={56}
                    barWidth={22}
                    barGap={4}
                    totalSlots={2}
                  />
                }
                content={(props) => (
                  <PrimeChartTooltip
                    active={props.active}
                    payload={props.payload?.map((p) => ({
                      name: p.name as string,
                      value: p.value as number,
                      color: p.color as string,
                      unit: "%",
                    }))}
                    label={props.label}
                    titleFormatter={(l) => `${l}`}
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
                dataKey="videoPct"
                name="Lectures Watched %"
                fill={primeChartColors.primary}
                maxBarSize={22}
                radius={[3, 3, 0, 0]}
              />

              <Bar
                dataKey="practicePct"
                name="Problems Solved %"
                fill={primeChartColors.practice}
                maxBarSize={22}
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

