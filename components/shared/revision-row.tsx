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
 * PRIME Spaced Repetition Revision Row Primitive (Amendment Section 6 & 17)
 * High-information item where Pure Red explicitly directs attention to Due Today items.
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
  const isActionRequired = status === "due_today" || status === "overdue";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] border transition-all duration-100",
        isActionRequired
          ? "border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.04)] shadow-elevation-1"
          : "border-[var(--border-subtle)] bg-[var(--prime-canvas)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)] font-mono text-xs font-semibold border",
            isActionRequired
              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
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
              className={cn(isActionRequired && "text-[var(--accent)] font-semibold")}
            >
              {dueDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={isActionRequired ? "primary" : "secondary"}
          onClick={onReview}
        >
          Review Now
        </Button>
      </div>
    </div>
  );
}
