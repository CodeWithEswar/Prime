"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { primeChartColors } from "./prime-chart-theme";

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  dataKey?: string;
  unit?: string;
}

interface PrimeChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  titleFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number | string, name?: string) => string;
  showTotal?: boolean;
  className?: string;
}

export function PrimeChartTooltip({
  active,
  payload,
  label,
  titleFormatter,
  valueFormatter,
  showTotal = false,
  className,
}: PrimeChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const formattedTitle =
    titleFormatter && label !== undefined
      ? titleFormatter(label)
      : label !== undefined
      ? String(label)
      : undefined;

  const total = showTotal
    ? payload.reduce((acc, curr) => {
        const val = typeof curr.value === "number" ? curr.value : parseFloat(curr.value as string);
        return acc + (isNaN(val) ? 0 : val);
      }, 0)
    : 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.12] bg-[#0E0E0E]/95 p-3 font-mono text-xs shadow-2xl backdrop-blur-md space-y-2 min-w-[170px] select-none",
        className
      )}
    >
      {formattedTitle && (
        <div className="border-b border-white/[0.08] pb-1.5 font-bold text-white tracking-wide">
          {formattedTitle}
        </div>
      )}

      <div className="space-y-1">
        {payload.map((item, idx) => {
          const itemColor = item.color || item.fill || item.stroke || "#FF0000";
          const formattedVal = valueFormatter
            ? valueFormatter(item.value, item.name)
            : typeof item.value === "number"
            ? item.value.toLocaleString()
            : item.value;

          return (
            <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: itemColor }}
                />
                <span className="text-neutral-400 capitalize">{item.name}</span>
              </div>
              <span className="font-bold text-white">
                {formattedVal}
                {item.unit ? ` ${item.unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {showTotal && payload.length > 1 && (
        <div className="border-t border-white/[0.08] pt-1.5 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400 font-semibold uppercase text-[10px]">Total</span>
          <span className="font-bold text-emerald-400">
            {valueFormatter ? valueFormatter(total, "Total") : total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export interface PrimeSlimBarCursorProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  layoutMode?: "stacked" | "grouped";
  barWidth?: number;
  barGap?: number;
  totalSlots?: number;
  fill?: string;
  rx?: number;
  payload?: Array<{
    name?: string;
    value?: number;
    [key: string]: unknown;
  }>;
}

export function PrimeSlimBarCursor(props: PrimeSlimBarCursorProps) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    maxWidth = 52,
    layoutMode = "stacked",
    barWidth = 18,
    barGap = 4,
    totalSlots = 3,
    rx = 6,
    payload,
  } = props;

  if (width <= 0 || height <= 0) return null;

  // Enforce black transparent fill ("rgba(0, 0, 0, 0.45)")
  // Ignore any Recharts default light grey fill (#f5f5f5 / #d8d8d8 / #ccc)
  const cursorFill =
    props.fill &&
    !props.fill.startsWith("#") &&
    !props.fill.includes("255, 255, 255")
      ? props.fill
      : primeChartColors.barCursorBg;

  let rectX = x;
  let rectWidth = maxWidth;

  if (layoutMode === "grouped" && Array.isArray(payload) && payload.length > 0) {
    // Find indices of non-zero bars to wrap ONLY the active rendered bars
    const nonZeroIndices: number[] = [];
    payload.forEach((item, idx) => {
      if (item && typeof item.value === "number" && item.value > 0) {
        nonZeroIndices.push(idx);
      }
    });

    if (nonZeroIndices.length > 0) {
      const minIdx = Math.min(...nonZeroIndices);
      const maxIdx = Math.max(...nonZeroIndices);
      const activeSlotCount = maxIdx - minIdx + 1;

      // Recharts groups all slots centered inside the category band
      const slots = Math.max(totalSlots, payload.length);
      const totalGroupWidth = slots * barWidth + (slots - 1) * barGap;
      const groupStartX = x + (width - totalGroupWidth) / 2;

      // Active bar cluster bounds
      const activeStartX = groupStartX + minIdx * (barWidth + barGap);
      const activeSpanWidth = activeSlotCount * barWidth + (activeSlotCount - 1) * barGap;

      // Add snug 5px padding on each side
      const padding = 5;
      rectWidth = activeSpanWidth + padding * 2;
      rectX = activeStartX - padding;
    } else {
      rectWidth = Math.min(width, maxWidth);
      rectX = x + (width - rectWidth) / 2;
    }
  } else {
    // Stacked mode or single bar
    rectWidth = Math.min(width, maxWidth);
    rectX = x + (width - rectWidth) / 2;
  }

  return (
    <rect
      x={rectX}
      y={y}
      width={rectWidth}
      height={height}
      fill={cursorFill}
      rx={rx}
      ry={rx}
      pointerEvents="none"
    />
  );
}

