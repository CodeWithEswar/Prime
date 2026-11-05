"use client";
import { useId } from "react";
import {
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { PrimeChart, PrimeChartTooltip } from "@/components/charts/prime-chart";
import { usePrimeReducedMotion } from "@/lib/motion";
import {
  practiceAnalytics,
  outcomeNames,
  reviewNames,
  formatPracticeDate,
} from "../selectors/intelligence";
import type { ProblemAttemptRecord, ProblemReviewRecord } from "../types";
const axis = { fill: "#666666", fontSize: 10, fontFamily: "var(--font-geist-mono)" };
export function ProblemCharts({
  attempts,
  total,
  estimatedMinutes,
  reviews = [],
}: {
  attempts: ProblemAttemptRecord[];
  total: number;
  estimatedMinutes: number | null;
  reviews?: ProblemReviewRecord[];
}) {
  const data = practiceAnalytics(attempts, total, reviews),
    reduced = usePrimeReducedMotion();
  const confidenceGradient = `confidence-${useId().replace(/:/g, "")}`;
  return (
    <div className="problem-charts">
      {data.showTime && (
        <PrimeChart
          title="Attempt time"
          value={`${data.time.at(-1)!.minutes.toFixed(1)} min`}
          summary={`From ${data.time[0].minutes.toFixed(1)} min on attempt ${data.time[0].number} to ${data.time.at(-1)!.minutes.toFixed(1)} min on attempt ${data.time.at(-1)!.number}. Outcomes may differ.`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              accessibilityLayer={false}
              data={data.time}
              margin={{ top: 14, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="number"
                tick={axis}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `#${v}`}
                minTickGap={28}
              />
              <YAxis
                tick={axis}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              {estimatedMinutes !== null && estimatedMinutes > 0 && (
                <ReferenceLine
                  y={estimatedMinutes}
                  stroke="#ffffff33"
                  strokeDasharray="3 5"
                  label={{
                    value: "Target",
                    position: "insideTopRight",
                    fill: "#ffffff77",
                    fontSize: 10,
                  }}
                />
              )}
              <Tooltip
                trigger="click"
                cursor={{ fill: "rgba(255, 0, 0, 0.04)" }}
                content={(props) => {
                  const p = data.time.find((p) => p.number === Number(props.label));
                  return (
                    <PrimeChartTooltip
                      active={props.active}
                      title={`Attempt #${p?.number ?? ""}`}
                      lines={
                        p
                          ? [
                              `${p.minutes.toFixed(1)} min`,
                              outcomeNames[p.outcome],
                              `Confidence ${p.confidence ?? "unavailable"}${p.confidence ? "/5" : ""}`,
                              formatPracticeDate(p.attemptedAt),
                            ]
                          : []
                      }
                    />
                  );
                }}
              />
              <Bar
                dataKey="minutes"
                maxBarSize={32}
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: "#ff3333", stroke: "#000000", strokeWidth: 1 }}
                isAnimationActive={!reduced}
                animationDuration={180}
              >
                {data.time.map((point, index) => (
                  <Cell
                    key={point.id}
                    fill={index === data.time.length - 1 ? "#ff0000" : "#D4D4D4"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}
      {data.showConfidence && (
        <PrimeChart
          title="Confidence"
          value={`${data.confidence.at(-1)!.confidence}/5`}
          summary={`Latest confidence ${data.confidence.at(-1)!.confidence}/5. Self-reported after each attempt.`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              accessibilityLayer={false}
              data={data.confidence}
              margin={{ top: 14, right: 12, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id={confidenceGradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff0000" stopOpacity={0.32} />
                  <stop offset="60%" stopColor="#ff0000" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="number"
                tick={axis}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `#${v}`}
                minTickGap={28}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={axis}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                trigger="click"
                content={(props) => {
                  const p = data.confidence.find((p) => p.number === Number(props.label));
                  return (
                    <PrimeChartTooltip
                      active={props.active}
                      title={`Attempt #${p?.number ?? ""}`}
                      lines={
                        p
                          ? [
                              `${p.confidence}/5`,
                              outcomeNames[p.outcome],
                              formatPracticeDate(p.attemptedAt),
                            ]
                          : []
                      }
                    />
                  );
                }}
              />
              <Area
                type="linear"
                dataKey="confidence"
                stroke="#ffffff"
                strokeWidth={2}
                fill={`url(#${confidenceGradient})`}
                baseValue={1}
                dot={{ r: 3, fill: "#0A0A0A", stroke: "#ffffff", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#ff0000", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={!reduced}
                animationDuration={180}
              />
              <ReferenceDot
                x={data.confidence.at(-1)!.number}
                y={data.confidence.at(-1)!.confidence}
                r={4.5}
                fill="#ff0000"
                stroke="#000000"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}
      {data.showRetention && (
        <PrimeChart
          title="Review outcome progression"
          value={reviewNames[data.retention.at(-1)!.rating]}
          summary="Forgot → Hard → Okay → Easy is an ordinal review scale, not a scientific memory score."
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              accessibilityLayer={false}
              data={data.retention}
              margin={{ top: 14, right: 12, left: 2, bottom: 0 }}
            >
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="number"
                tick={axis}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `#${v}`}
              />
              <YAxis
                domain={[1, 4]}
                ticks={[1, 2, 3, 4]}
                width={45}
                tick={{ ...axis, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => ["", "Forgot", "Hard", "Okay", "Easy"][v] ?? ""}
              />
              <Tooltip
                trigger="click"
                content={(props) => {
                  const p = data.retention.find((p) => p.number === Number(props.label));
                  return (
                    <PrimeChartTooltip
                      active={props.active}
                      title={`Review #${p?.number ?? ""}`}
                      lines={
                        p ? [reviewNames[p.rating], formatPracticeDate(p.reviewedAt)] : []
                      }
                    />
                  );
                }}
              />
              <Line
                type="stepAfter"
                dataKey="value"
                stroke="#ff0000"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0A0A0A", stroke: "#ff0000", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#ff0000", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={!reduced}
                animationDuration={180}
              />
              <ReferenceDot
                x={data.retention.at(-1)!.number}
                y={data.retention.at(-1)!.value}
                r={4.5}
                fill="#ff0000"
                stroke="#000000"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}
    </div>
  );
}
