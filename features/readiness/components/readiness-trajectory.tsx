"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PrimeChart } from "@/components/charts/prime-chart";
import { Card } from "@/components/ui/card";
import type { TrajectoryDataPoint } from "@/domain/readiness";

export function ReadinessTrajectory({
  trajectory = [],
}: {
  trajectory?: TrajectoryDataPoint[];
}) {
  const latest = trajectory.at(-1);
  if (!latest) {
    return (
      <Card elevation="raised" className="space-y-1.5 p-4">
        <h2 className="text-sm font-semibold">No historical trajectory yet</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Your timeline will appear after you record practice evidence.
        </p>
      </Card>
    );
  }

  const totals = [
    ["Recorded attempts", latest.cumulativeAttempts],
    ["Estimated assessed", latest.assessedCompetencies],
    ["Estimated aligned", latest.alignedCompetencies],
    ["Recorded days", trajectory.length],
  ] as const;

  return (
    <div className="min-w-0 space-y-3">
      <Card elevation="raised" className="overflow-hidden">
        <dl className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] @min-[36rem]:grid-cols-4">
          {totals.map(([label, value]) => (
            <div key={label} className="min-w-0 bg-[var(--surface-raised)] p-3">
              <dt className="text-xs text-[var(--text-secondary)]">{label}</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card
        elevation="raised"
        className="min-w-0 space-y-3 p-3 sm:p-4 [&_.prime-chart-heading]:text-sm [&_.prime-chart-heading]:font-semibold [&_.prime-chart-summary]:mb-2 [&_.prime-chart-summary]:text-xs [&_.prime-chart-summary]:text-[var(--text-secondary)] [&_.prime-chart-hint]:text-xs [&_.prime-chart-hint]:text-[var(--text-secondary)]"
      >
        <PrimeChart
          title="Preparation evidence growth timeline"
          summary="Cumulative recorded attempts and estimated skill coverage on study dates."
        >
          <div className="h-52 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                accessibilityLayer
                data={trajectory}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border-default)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) => date.slice(5)}
                  minTickGap={22}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                />
                <YAxis
                  width={32}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Line
                  dataKey="cumulativeAttempts"
                  name="Recorded attempts"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={trajectory.length === 1}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="assessedCompetencies"
                  name="Estimated assessed skills"
                  stroke="var(--foreground)"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  dot={trajectory.length === 1}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PrimeChart>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <i aria-hidden="true" className="w-4 border-t-2 border-[var(--accent)]" />{" "}
            Recorded attempts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              aria-hidden="true"
              className="w-4 border-t-2 border-dashed border-[var(--foreground)]"
            />{" "}
            Estimated assessed skills
          </span>
        </div>
      </Card>
    </div>
  );
}
