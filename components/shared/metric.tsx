import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  helper?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  highlight?: boolean;
}

/**
 * PRIME Metric Display Primitive (Amendment Section 7 & 8)
 * Monochromatic high-contrast figures with Pure Red reserved for critical highlight.
 */
export function Metric({
  label,
  value,
  unit,
  helper,
  trend,
  highlight = false,
  className,
  ...props
}: MetricProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-[var(--radius-md)] border bg-[var(--prime-canvas)] shadow-elevation-1 transition-colors",
        highlight
          ? "border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.04)]"
          : "border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono">
          {label}
        </span>
        {trend && (
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              trend.direction === "up" && "text-white opacity-80",
              trend.direction === "down" && "text-[var(--accent)] font-bold",
              trend.direction === "neutral" && "text-[var(--text-tertiary)]"
            )}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "—"}{" "}
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-white font-mono-numbers">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-[var(--text-tertiary)]">{unit}</span>
        )}
      </div>

      {helper && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{helper}</p>}
    </div>
  );
}
