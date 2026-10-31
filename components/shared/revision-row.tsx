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
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[var(--radius-sm)] border transition-all duration-100",
        isActionRequired
          ? "border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.04)] shadow-elevation-1"
          : "border-[var(--border-subtle)] bg-[var(--prime-canvas)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex h-7 min-w-[54px] px-2.5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] font-mono text-xs font-semibold border whitespace-nowrap select-none mt-0.5 sm:mt-0",
            isActionRequired
              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.3)]"
              : "bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
          )}
        >
          {interval}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white leading-snug break-words sm:truncate">
            {topic}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-tertiary)] font-mono">
            <Icon icon={Clock01Icon} size={12} className="shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap",
                isActionRequired && "text-[var(--accent)] font-semibold"
              )}
            >
              {dueDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
        <Button
          size="sm"
          variant={isActionRequired ? "primary" : "secondary"}
          onClick={onReview}
          className="w-full sm:w-auto font-mono text-xs"
        >
          Review Now
        </Button>
      </div>
    </div>
  );
}
