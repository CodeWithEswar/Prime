"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface TaskRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onToggle"
> {
  title: string;
  category?: string;
  duration?: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  onToggle?: (completed: boolean) => void;
  action?: React.ReactNode;
}

/**
 * PRIME Task Row Primitive
 * Precision actionable task item with interactive states.
 */
export function TaskRow({
  title,
  category,
  duration,
  completed = false,
  active = false,
  disabled = false,
  onToggle,
  action,
  className,
  ...props
}: TaskRowProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[var(--radius-sm)] border bg-[var(--surface-base)] transition-all duration-120",
        active
          ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] shadow-[0_0_12px_rgba(255,0,0,0.1)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]",
        completed && "opacity-75 bg-[var(--surface-raised)]",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Checkbox
          checked={completed}
          disabled={disabled}
          onCheckedChange={onToggle}
          aria-label={`Mark task as ${completed ? "incomplete" : "complete"}`}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate transition-colors",
              completed
                ? "line-through text-[var(--text-tertiary)]"
                : active
                  ? "text-white font-semibold"
                  : "text-[var(--foreground)]"
            )}
          >
            {title}
          </p>
          {(category || duration) && (
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[var(--text-tertiary)]">
              {category && <span>{category}</span>}
              {category && duration && <span>•</span>}
              {duration && <span>{duration}</span>}
            </div>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
