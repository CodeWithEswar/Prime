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
    maxWidth,
    layoutMode = "stacked",
    rx = 4,
  } = props;

  if (width <= 0 || height <= 0) return null;

  // Snug fit:
  // Stacked: single bar ~18px + 8px padding = 26px
  // Grouped: 3 bars ~36px + 8px padding = 50px
  const defaultWidth = layoutMode === "stacked" ? 26 : 50;
  const targetWidth = maxWidth !== undefined ? maxWidth : defaultWidth;
  const rectWidth = Math.min(width, targetWidth);
  const rectX = x + (width - rectWidth) / 2;

  return (
    <rect
      x={rectX}
      y={y}
      width={rectWidth}
      height={height}
      fill="rgba(0, 0, 0, 0.55)"
      rx={rx}
      ry={rx}
      pointerEvents="none"
    />
  );
}

