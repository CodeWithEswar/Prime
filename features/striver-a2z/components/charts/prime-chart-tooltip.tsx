"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
  fill?: string;
  rx?: number;
}

export function PrimeSlimBarCursor({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  maxWidth = 52,
  fill = "rgba(255, 255, 255, 0.04)",
  rx = 6,
}: PrimeSlimBarCursorProps) {
  if (width <= 0 || height <= 0) return null;
  const slimWidth = Math.min(width, maxWidth);
  const centeredX = x + (width - slimWidth) / 2;

  return (
    <rect
      x={centeredX}
      y={y}
      width={slimWidth}
      height={height}
      fill={fill}
      rx={rx}
      ry={rx}
      pointerEvents="none"
    />
  );
}

