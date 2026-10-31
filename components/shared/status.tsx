import * as React from "react";
import { cn } from "@/lib/utils";

export type PreparationStatus =
  "not_started" | "learning" | "solved" | "needs_revision" | "mastered";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: PreparationStatus;
  size?: "sm" | "default";
}

const statusConfig: Record<
  PreparationStatus,
  { label: string; symbol: string; dotClass: string; containerClass: string }
> = {
  not_started: {
    label: "Not Started",
    symbol: "○",
    dotClass: "bg-[rgba(255,255,255,0.40)]",
    containerClass:
      "bg-[var(--surface-base)] text-[rgba(255,255,255,0.40)] border-[var(--border-subtle)]",
  },
  learning: {
    label: "Learning",
    symbol: "◐",
    dotClass: "bg-[rgba(255,255,255,0.80)]",
    containerClass:
      "bg-[var(--surface-raised)] text-[rgba(255,255,255,0.80)] border-[var(--border-default)]",
  },
  solved: {
    label: "Solved",
    symbol: "✓",
    dotClass: "bg-[#ffffff]",
    containerClass:
      "bg-[var(--surface-raised)] text-white border-[var(--border-strong)] font-medium",
  },
  needs_revision: {
    label: "Needs Revision",
    symbol: "↻",
    dotClass: "bg-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.6)] animate-pulse",
    containerClass:
      "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] font-semibold",
  },
  mastered: {
    label: "Mastered",
    symbol: "◆",
    dotClass: "bg-[#ffffff]",
    containerClass:
      "bg-[var(--surface-elevated)] text-white border-[var(--border-strong)] font-semibold",
  },
};

/**
 * PRIME Status Badge Primitive (Amendment Section 17)
 * Strictly monochrome with Pure Red dedicated exclusively to Needs Revision.
 */
export function StatusBadge({
  status,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border font-mono select-none",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        config.containerClass,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      {config.label}
    </span>
  );
}
