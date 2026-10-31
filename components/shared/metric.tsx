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
 * PRIME Metric Display Primitive
 * High-density tabular metric with Geist Mono precision.
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
        "p-4 rounded-[var(--radius-md)] border bg-[var(--surface-base)] shadow-elevation-1 transition-colors",
        highlight
          ? "border-[var(--accent-border)] bg-[var(--surface-raised)]"
          : "border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        {trend && (
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              trend.direction === "up" && "text-[var(--success-foreground)]",
              trend.direction === "down" && "text-red-400",
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
