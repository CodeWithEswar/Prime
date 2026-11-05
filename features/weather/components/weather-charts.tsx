"use client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ReferenceDot,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PrimeChart } from "@/components/charts/prime-chart";
import { usePrimeReducedMotion } from "@/lib/motion";
import { temperature, weatherTime, measure } from "@/lib/weather/format";
import { weatherCondition } from "@/lib/weather/conditions";
import type { WeatherHour } from "@/lib/weather/types";
import type { TemperatureUnit } from "@/lib/weather/schema";

const tick = {
  fill: "rgba(255, 255, 255, 0.45)",
  fontSize: 10,
  fontFamily: "var(--font-geist-mono), monospace",
};

interface ChartPoint extends WeatherHour {
  displayTemperature: number | null;
}

interface CompactTooltipProps {
  active?: boolean;
  label?: unknown;
  points: ChartPoint[];
  timezone: string;
  unit: TemperatureUnit;
  mode: "temperature" | "precipitation";
}

function CompactWeatherTooltip({
  active,
  label,
  points,
  timezone,
  unit,
  mode,
}: CompactTooltipProps) {
  if (!active || label == null) return null;
  const p = points.find((h) => h.time === Number(label));
  if (!p) return null;

  const condition = weatherCondition(p.code);
  const timeFormatted = weatherTime(p.time, timezone, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="weather-chart-tooltip-compact pointer-events-none select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_#ff0000]" />
          <span className="font-mono text-[11px] font-semibold text-white tracking-tight truncate">
            {timeFormatted}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[65px]">
          {condition.label}
        </span>
      </div>

      {/* Hero Metric */}
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="font-mono text-base font-bold text-white tracking-tight">
          {mode === "temperature"
            ? temperature(p.temperature, unit)
            : measure(p.rainProbability, "%")}
        </span>
        {mode === "temperature" && p.feelsLike !== null && (
          <span className="text-[10px] text-neutral-400 font-mono">
            Feels {temperature(p.feelsLike, unit)}
          </span>
        )}
        {mode === "precipitation" && p.temperature !== null && (
          <span className="text-[10px] text-neutral-400 font-mono">
            {temperature(p.temperature, unit)}
          </span>
        )}
      </div>

      {/* Compact Secondary Data */}
      <div className="mt-1.5 space-y-0.5 border-t border-white/5 pt-1 text-[10px] text-neutral-400 font-mono">
        {mode === "temperature" ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Rain</span>
              <span
                className={
                  p.rainProbability && p.rainProbability >= 50
                    ? "text-red-400 font-medium"
                    : "text-neutral-300"
                }
              >
                {measure(p.rainProbability, "%")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Wind</span>
              <span className="text-neutral-300">
                {measure(p.windSpeed, " km/h")}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Amount</span>
              <span className="text-neutral-300">
                {measure(p.precipitation, " mm", 1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Humidity</span>
              <span className="text-neutral-300">
                {measure(p.humidity, "%")}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function WeatherCharts({
  hours,
  timezone,
  unit,
  selected,
  onSelect,
}: {
  hours: WeatherHour[];
  timezone: string;
  unit: TemperatureUnit;
  selected: number;
  onSelect: (time: number) => void;
}) {
  const reduced = usePrimeReducedMotion(),
    points: ChartPoint[] = hours.map((h) => ({
      ...h,
      displayTemperature:
        h.temperature === null
          ? null
          : unit === "fahrenheit"
            ? (h.temperature * 9) / 5 + 32
            : h.temperature,
    }));
  const valid = points.filter((p) => p.temperature !== null),
    rain = points.filter((p) => p.rainProbability !== null),
    peak = rain.length ? Math.max(...rain.map((p) => p.rainProbability!)) : null;

  if (valid.length < 2 && (peak ?? 0) < 20) return null;

  return (
    <div className="weather-charts">
      {valid.length >= 2 && (
        <PrimeChart
          title="Temperature over 24 hours"
          value={temperature(valid[0].temperature, unit)}
          summary={`From ${temperature(valid[0].temperature, unit)} at ${weatherTime(valid[0].time, timezone)} to ${temperature(valid.at(-1)!.temperature, unit)} at ${weatherTime(valid.at(-1)!.time, timezone)}.`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={points}
              accessibilityLayer
              margin={{ top: 14, right: 12, left: -14, bottom: 0 }}
              onClick={(state) => {
                const time = Number(state?.activeLabel);
                if (points.some((p) => p.time === time)) onSelect(time);
              }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
                  <stop offset="65%" stopColor="#ff0000" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="time"
                tick={tick}
                axisLine={false}
                tickLine={false}
                minTickGap={32}
                tickFormatter={(t) =>
                  weatherTime(Number(t), timezone, { hour: "numeric" })
                }
              />
              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                width={42}
                domain={["dataMin - 1", "dataMax + 1"]}
                tickFormatter={(t) => `${Math.round(Number(t))}°`}
              />
              <Tooltip
                cursor={{
                  stroke: "rgba(255, 255, 255, 0.2)",
                  strokeDasharray: "3 3",
                  strokeWidth: 1,
                }}
                content={(props) => (
                  <CompactWeatherTooltip
                    active={props.active}
                    label={props.label}
                    points={points}
                    timezone={timezone}
                    unit={unit}
                    mode="temperature"
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="displayTemperature"
                stroke="#ffffff"
                strokeWidth={2}
                fill="url(#tempGradient)"
                isAnimationActive={!reduced}
                animationDuration={650}
                animationEasing="ease-out"
                activeDot={{
                  r: 5,
                  fill: "#ff0000",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
              {points.find((p) => p.time === selected)?.displayTemperature != null && (
                <ReferenceDot
                  x={selected}
                  y={points.find((p) => p.time === selected)!.displayTemperature!}
                  r={4.5}
                  fill="#ff0000"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}

      {peak !== null && peak >= 20 && (
        <PrimeChart
          title="Precipitation outlook"
          value={`${Math.round(peak)}% peak`}
          summary={`Precipitation probability reaches ${Math.round(peak)}% in the next 24 hours. Probability is separate from rainfall amount.`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={points}
              accessibilityLayer
              margin={{ top: 14, right: 12, left: -14, bottom: 0 }}
              onClick={(state) => {
                const time = Number(state?.activeLabel);
                if (points.some((p) => p.time === time)) onSelect(time);
              }}
            >
              <defs>
                <linearGradient id="barRainHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barRainActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff2222" stopOpacity={1} />
                  <stop offset="100%" stopColor="#cc0000" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="time"
                tick={tick}
                axisLine={false}
                tickLine={false}
                minTickGap={32}
                tickFormatter={(t) =>
                  weatherTime(Number(t), timezone, { hour: "numeric" })
                }
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tick={tick}
                axisLine={false}
                tickLine={false}
                width={42}
                tickFormatter={(t) => `${t}%`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.04)", radius: 4 }}
                content={(props) => (
                  <CompactWeatherTooltip
                    active={props.active}
                    label={props.label}
                    points={points}
                    timezone={timezone}
                    unit={unit}
                    mode="precipitation"
                  />
                )}
              />
              <Bar
                dataKey="rainProbability"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                isAnimationActive={!reduced}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {points.map((p) => {
                  const isSelected = p.time === selected;
                  const prob = p.rainProbability ?? 0;
                  const fill = isSelected
                    ? "url(#barRainActive)"
                    : prob >= 70
                      ? "url(#barRainHigh)"
                      : prob >= 40
                        ? "rgba(255, 255, 255, 0.45)"
                        : "rgba(255, 255, 255, 0.18)";
                  return <Cell key={p.time} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}
    </div>
  );
}
