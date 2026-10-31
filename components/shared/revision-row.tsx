import * as React from "react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RevisionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  topic: string;
  interval: string; // e.g. "Day 3" | "Day 7" | "Day 14"
  dueDate: string;
  status: "due_today" | "overdue" | "upcoming";
  onReview?: () => void;
}

/**
 * PRIME Spaced Repetition Revision Row Primitive
 * Direct actionable item with Pure Red urgency signaling.
 */
export function RevisionRow({
  topic,
  interval,
  dueDate,
  status,
  onReview,
  className,
  ...props
}: RevisionRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] border bg-[var(--surface-base)] transition-all duration-120",
        status === "due_today" &&
          "border-[var(--accent-border)] bg-[var(--accent-subtle)] shadow-[0_0_12px_rgba(255,0,0,0.08)]",
        status === "overdue" && "border-red-900/60 bg-red-950/20",
        status === "upcoming" &&
          "border-[var(--border-subtle)] hover:border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)] font-mono text-xs font-semibold border",
            status === "due_today"
              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.4)]"
              : status === "overdue"
                ? "bg-red-950/50 text-red-400 border-red-800/60"
                : "bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
          )}
        >
          {interval}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{topic}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-tertiary)] font-mono">
            <Icon icon={Clock01Icon} size={12} />
            <span
              className={cn(
                status === "due_today" && "text-[var(--accent)] font-semibold",
                status === "overdue" && "text-red-400 font-semibold"
              )}
            >
              {dueDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={status === "due_today" ? "primary" : "secondary"}
          onClick={onReview}
        >
          Review Now
        </Button>
      </div>
    </div>
  );
}
