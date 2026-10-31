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
  { label: string; dotClass: string; containerClass: string }
> = {
  not_started: {
    label: "Not Started",
    dotClass: "bg-[var(--text-disabled)]",
    containerClass:
      "bg-[var(--surface-raised)] text-[var(--text-tertiary)] border-[var(--border-subtle)]",
  },
  learning: {
    label: "Learning",
    dotClass: "bg-[var(--info-foreground)] shadow-[0_0_6px_rgba(59,130,246,0.6)]",
    containerClass:
      "bg-[var(--info-soft)] text-[var(--info-foreground)] border-[var(--info-border)]",
  },
  solved: {
    label: "Solved",
    dotClass: "bg-[var(--success-foreground)] shadow-[0_0_6px_rgba(48,164,108,0.6)]",
    containerClass:
      "bg-[var(--success-soft)] text-[var(--success-foreground)] border-[var(--success-border)]",
  },
  needs_revision: {
    label: "Needs Revision",
    dotClass: "bg-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse",
    containerClass:
      "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] font-semibold",
  },
  mastered: {
    label: "Mastered",
    dotClass: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]",
    containerClass:
      "bg-emerald-950/30 text-emerald-300 border-emerald-800/40 font-semibold",
  },
};

/**
 * PRIME Status Badge Primitive
 * Explicit visual preparation state indicator with pure red revision trigger.
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
