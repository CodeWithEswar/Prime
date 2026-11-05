"use client";
import {
  LineChart,
  Line,
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
import { PrimeChart, PrimeChartTooltip } from "@/components/charts/prime-chart";
import { usePrimeReducedMotion } from "@/lib/motion";
import { temperature, weatherTime, measure } from "@/lib/weather/format";
import type { WeatherHour } from "@/lib/weather/types";
import type { TemperatureUnit } from "@/lib/weather/schema";
const tick = { fill: "#ffffff70", fontSize: 10, fontFamily: "var(--font-geist-mono)" };
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
    points = hours.map((h) => ({
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
  const tooltip = (label: unknown, active?: boolean) => {
    const p = points.find((h) => h.time === Number(label));
    return (
      <PrimeChartTooltip
        active={active}
        title={p ? weatherTime(p.time, timezone) : ""}
        lines={
          p
            ? [
                temperature(p.temperature, unit),
                `Feels like ${temperature(p.feelsLike, unit)}`,
                `Precipitation ${measure(p.rainProbability, "%")}`,
                `Humidity ${measure(p.humidity, "%")}`,
                `Wind ${measure(p.windSpeed, " km/h")}`,
              ]
            : []
        }
      />
    );
  };
  return (
    <div className="weather-charts">
      {valid.length >= 2 && (
        <PrimeChart
          title="Temperature over 24 hours"
          value={temperature(valid[0].temperature, unit)}
          summary={`From ${temperature(valid[0].temperature, unit)} at ${weatherTime(valid[0].time, timezone)} to ${temperature(valid.at(-1)!.temperature, unit)} at ${weatherTime(valid.at(-1)!.time, timezone)}.`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={points}
              accessibilityLayer
              margin={{ top: 14, right: 12, left: -12, bottom: 0 }}
              onClick={(state) => {
                const time = Number(state.activeLabel);
                if (points.some((p) => p.time === time)) onSelect(time);
              }}
            >
              <CartesianGrid vertical={false} stroke="#ffffff0d" />
              <XAxis
                dataKey="time"
                tick={tick}
                axisLine={false}
                tickLine={false}
                minTickGap={35}
                tickFormatter={(t) =>
                  weatherTime(Number(t), timezone, { hour: "numeric" })
                }
              />
              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(t) => `${Math.round(Number(t))}°`}
              />
              <Tooltip
                trigger="click"
                content={(props) => tooltip(props.label, props.active)}
              />
              <Line
                dataKey="displayTemperature"
                stroke="#fff"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={!reduced}
                animationDuration={200}
              />
              {points.find((p) => p.time === selected)?.displayTemperature != null && (
                <ReferenceDot
                  x={selected}
                  y={points.find((p) => p.time === selected)!.displayTemperature!}
                  r={4}
                  fill="#ff0000"
                  stroke="#000"
                />
              )}
            </LineChart>
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
              margin={{ top: 14, right: 12, left: -12, bottom: 0 }}
              onClick={(state) => {
                const time = Number(state.activeLabel);
                if (points.some((p) => p.time === time)) onSelect(time);
              }}
            >
              <CartesianGrid vertical={false} stroke="#ffffff0d" />
              <XAxis
                dataKey="time"
                tick={tick}
                axisLine={false}
                tickLine={false}
                minTickGap={35}
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
                width={45}
                tickFormatter={(t) => `${t}%`}
              />
              <Tooltip
                trigger="click"
                cursor={{ fill: "#ffffff05" }}
                content={(props) => tooltip(props.label, props.active)}
              />
              <Bar
                dataKey="rainProbability"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
                isAnimationActive={!reduced}
                animationDuration={200}
              >
                {points.map((p) => (
                  <Cell
                    key={p.time}
                    fill={p.time === selected ? "#ff0000" : "#ffffff55"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PrimeChart>
      )}
    </div>
  );
}
