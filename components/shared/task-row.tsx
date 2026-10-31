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
 * PRIME Task Row Primitive (Amendment Section 21)
 * Visually black surface with red indicator and red-alpha edge when active.
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
        "group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[var(--radius-sm)] border transition-all duration-100",
        active
          ? "border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.04)] shadow-elevation-1"
          : "border-[var(--border-subtle)] bg-[var(--prime-canvas)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]",
        completed && "opacity-60 bg-[var(--surface-raised)]",
        disabled && "pointer-events-none opacity-30",
        className
      )}
      {...props}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[var(--accent)]" />
      )}

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
                ? "line-through text-[var(--text-disabled)]"
                : active
                  ? "text-white font-semibold"
                  : "text-white"
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
