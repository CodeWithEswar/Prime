"use client";

import * as React from "react";

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
      : "rgba(0, 0, 0, 0.45)";

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
