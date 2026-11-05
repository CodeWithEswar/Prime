"use client";

import { useId, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PrimeChart } from "@/components/charts/prime-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { percent, type AnalyticsDay } from "./metrics";

const series = {
  activity: [
    ["attempts", "Attempts"],
    ["solves", "Successful attempts"],
    ["independent", "Independent solves"],
  ],
  performance: [
    ["rate", "Independent solve rate"],
    ["hints", "Hint-assisted rate"],
  ],
  execution: [
    ["planned", "Planned"],
    ["recorded", "Recorded"],
    ["available", "Capacity"],
  ],
} as const;

type Mode = keyof typeof series;
type Metric = (typeof series)[Mode][number][0];

function chartPoints(days: AnalyticsDay[], group: "day" | "week", mode: Mode) {
  const size = group === "week" ? 7 : 1;
  return Array.from({ length: Math.ceil(days.length / size) }, (_, i) => {
    const bucket = days.slice(i * size, (i + 1) * size);
    const date = bucket[0].date;
    const end = bucket.at(-1)!.date;
    const total = (
      key:
        | "attempts"
        | "solves"
        | "independent"
        | "planned"
        | "recorded"
        | "available"
        | "eligible"
        | "assisted"
        | "completed"
        | "committed"
    ) =>
      bucket.every((day) => day[key] !== null)
        ? bucket.reduce((sum, day) => sum + (day[key] ?? 0), 0)
        : null;
    const eligible = total("eligible") ?? 0;
    const values = Object.fromEntries(
      series[mode].map(([key]) => [
        key,
        key === "rate"
          ? percent(total("independent") ?? 0, eligible)
          : key === "hints"
            ? percent(total("assisted") ?? 0, eligible)
            : total(key),
      ])
    ) as Record<Metric, number | null>;
    return {
      date,
      end,
      ...values,
      eligible,
      completed: total("completed"),
      committed: total("committed"),
    };
  });
}

const colors = ["var(--foreground)", "var(--text-secondary)", "var(--accent)"];
const modeLabels = {
  activity: "Activity",
  performance: "Performance",
  execution: "Execution",
};
const modes = ["activity", "performance", "execution"] as const;
const dash = [undefined, "5 3", "2 4"];
const labelDate = (value: string) => value.slice(5).replace("-", "/");

export default function PreparationPulse({
  days,
  previous,
  group,
  initialMode = "activity",
  fixed = false,
  title = "Preparation Pulse",
}: {
  days: AnalyticsDay[];
  previous?: AnalyticsDay[];
  group: "day" | "week";
  initialMode?: Mode;
  fixed?: boolean;
  title?: string;
}) {
  const [mode, setMode] = useState(initialMode);
  const tabLayoutId = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const keys = series[mode];
  const strokeColors =
    mode === "performance"
      ? [colors[2], colors[0]]
      : mode === "execution"
        ? [colors[0], colors[2], colors[1]]
        : colors;
  const main = keys[0][0];
  const points = useMemo(() => {
    const before = previous ? chartPoints(previous, group, mode) : [];
    return chartPoints(days, group, mode).map((point, index) => ({
      ...point,
      prior: before[index]?.[main] ?? null,
      priorDate: before[index]?.date,
    }));
  }, [days, previous, group, mode, main]);
  const index = hovered ?? selected ?? points.length - 1;
  const point = points[index] ?? points.at(-1)!;
  const unit = mode === "performance" ? "%" : mode === "execution" ? " min" : "";
  const value = (amount: number | null) =>
    amount === null ? "—" : `${Number(amount.toFixed(1))}${unit}`;
  const meaningful = points.some(
    (row) =>
      keys.some(
        ([key]) => row[key] !== null && (mode === "performance" || row[key] !== 0)
      ) ||
      (row.prior !== null && (mode === "performance" || row.prior !== 0))
  );
  const summaries: Record<Mode, string> = {
    activity:
      "Recorded attempts and their outcomes. Repeat solves remain separate events.",
    performance:
      "Outcomes as a share of classified attempts. Gaps indicate no eligible evidence.",
    execution:
      "Planned workload, logged study time, and capacity in minutes. Missing capacity is shown as a gap.",
  };
  const step = (by: number) => {
    setHovered(null);
    setSelected(Math.max(0, Math.min(points.length - 1, index + by)));
  };

  const content = (
    <div className="analytics-pulse-content">
      <PrimeChart title={title} summary={summaries[mode]}>
        {meaningful ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={points}
              margin={{ top: 10, left: 0, right: 14, bottom: 4 }}
              accessibilityLayer
              onMouseMove={(state) => {
                if (state.activeTooltipIndex != null)
                  setHovered(Number(state.activeTooltipIndex));
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={(state) => {
                if (state.activeTooltipIndex != null) {
                  setHovered(null);
                  setSelected(Number(state.activeTooltipIndex));
                }
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-default)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="date"
                tickFormatter={labelDate}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={38}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={mode === "performance" ? [0, 100] : [0, "auto"]}
                tickFormatter={(tick) => `${tick}${mode === "performance" ? "%" : ""}`}
              />
              <Tooltip
                cursor={{ stroke: "var(--text-tertiary)", strokeDasharray: "3 4" }}
                content={() => null}
              />
              <ReferenceLine
                x={point.date}
                stroke="var(--accent)"
                strokeDasharray="3 4"
              />
              {keys.map(([key, label], i) => (
                <Line
                  key={key}
                  dataKey={key}
                  name={label}
                  type="linear"
                  stroke={strokeColors[i]}
                  strokeDasharray={dash[i]}
                  strokeWidth={i === 0 ? 2 : 1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                  isAnimationActive={false}
                />
              ))}
              {previous && (
                <Line
                  dataKey="prior"
                  name={`Previous ${keys[0][1].toLowerCase()}`}
                  stroke="var(--text-secondary)"
                  strokeDasharray="7 5"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {point[main] !== null && (
                <ReferenceDot
                  x={point.date}
                  y={point[main]}
                  r={4}
                  fill="var(--accent)"
                  stroke="var(--prime-canvas)"
                  strokeWidth={1}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="analytics-chart-empty">
            No recorded evidence for this view and period.
          </p>
        )}
      </PrimeChart>
      <div className="analytics-legend">
        {keys.map(([key, label], i) => (
          <span key={key}>
            <i
              style={{
                borderColor: strokeColors[i],
                borderStyle: dash[i] ? "dashed" : "solid",
              }}
            />
            {label}
          </span>
        ))}
        {previous && (
          <span>
            <i className="analytics-previous-mark" />
            Previous {keys[0][1].toLowerCase()}
          </span>
        )}
      </div>
      <div className="analytics-inspection">
        <div>
          <span className="analytics-kicker">
            Selected {group === "week" ? "interval" : "day"}
          </span>
          <div className="analytics-date">
            {point.date}
            {point.end !== point.date && ` – ${point.end}`}
          </div>
        </div>
        <dl className="analytics-readings">
          {keys.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{value(point[key])}</dd>
            </div>
          ))}
          {mode === "performance" && (
            <div>
              <dt>Eligible attempts</dt>
              <dd>{point.eligible}</dd>
            </div>
          )}
          {mode === "execution" && (
            <div>
              <dt>Completed tasks</dt>
              <dd>{point.completed ?? "—"}</dd>
            </div>
          )}
          {previous && (
            <div>
              <dt>Previous · {point.priorDate}</dt>
              <dd>{value(point.prior)}</dd>
            </div>
          )}
        </dl>
        <div className="analytics-controls analytics-chart-actions">
          <Button
            size="sm"
            variant="outline"
            disabled={index === 0}
            onClick={() => step(-1)}
          >
            Earlier
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={index === points.length - 1}
            onClick={() => step(1)}
          >
            Later
          </Button>
          {selected !== null && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setHovered(null);
                setSelected(null);
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      <details className="analytics-data">
        <summary>View chart data</summary>
        <div
          className="analytics-table-scroll"
          role="region"
          aria-label="Chart data"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {keys.map(([key, label]) => (
                  <th scope="col" key={key}>
                    {label}
                  </th>
                ))}
                {previous && <th scope="col">Previous · {keys[0][1]}</th>}
              </tr>
            </thead>
            <tbody>
              {points.map((row, i) => (
                <tr key={row.date}>
                  <th scope="row">
                    <button
                      type="button"
                      onClick={() => {
                        setHovered(null);
                        setSelected(i);
                      }}
                    >
                      {row.date}
                      {row.end !== row.date && ` – ${row.end}`}
                    </button>
                  </th>
                  {keys.map(([key]) => (
                    <td key={key}>{value(row[key])}</td>
                  ))}
                  {previous && <td>{value(row.prior)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );

  return (
    <Card
      elevation="raised"
      className="analytics-panel analytics-pulse"
      role="region"
      aria-label={title}
    >
      {fixed ? (
        content
      ) : (
        <Tabs
          value={mode}
          className="analytics-pulse-content"
          onValueChange={(value) => {
            setMode(value as Mode);
            setHovered(null);
          }}
        >
          <TabsList
            variant="segmented"
            className="analytics-pulse-modes"
            aria-label="Pulse mode"
            layoutId={tabLayoutId}
          >
            {modes.map((option) => (
              <TabsTrigger key={option} value={option}>
                {modeLabels[option]}
              </TabsTrigger>
            ))}
          </TabsList>
          {modes.map((option) => (
            <TabsContent key={option} value={option} className="analytics-tab-panel">
              {mode === option && content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </Card>
  );
}
