import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricStripItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
}

export interface MetricStripProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MetricStripItem[];
}

/**
 * PRIME Metric Strip Primitive (Amendment Section 2)
 * Pure black horizontal strip separated with thin white-alpha borders.
 */
export function MetricStrip({ items, className, ...props }: MetricStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--prime-canvas)] shadow-elevation-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex-1 min-w-[140px] p-3.5 sm:px-4 sm:py-3 space-y-1"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            {item.label}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white font-mono-numbers">
              {item.value}
            </span>
            {item.unit && (
              <span className="font-mono text-xs text-[var(--text-tertiary)]">
                {item.unit}
              </span>
            )}
            {item.change && (
              <span className="ml-auto font-mono text-[10px] text-white opacity-70">
                {item.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
