import * as React from "react";
import { RotateRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface RevisionBadgeProps {
  isDue: boolean;
  isOverdue?: boolean;
  nextRevisionAt?: string | null;
  className?: string;
}

export function RevisionBadge({
  isDue,
  isOverdue = false,
  nextRevisionAt,
  className,
}: RevisionBadgeProps) {
  if (!nextRevisionAt) {
    return null;
  }

  if (isOverdue) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono font-medium tracking-wide border",
          "bg-[rgba(255,0,0,0.12)] text-[var(--accent)] border-[var(--accent-border)]",
          className
        )}
      >
        <Icon icon={RotateRight01Icon} size={11} className="shrink-0 text-[var(--accent)]" />
        <span>Overdue</span>
      </span>
    );
  }

  if (isDue) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono font-medium tracking-wide border",
          "bg-[rgba(255,0,0,0.08)] text-[var(--accent)] border-[var(--accent-border)]",
          className
        )}
      >
        <Icon icon={RotateRight01Icon} size={11} className="shrink-0 text-[var(--accent)]" />
        <span>Due today</span>
      </span>
    );
  }

  return null;
}
