import * as React from "react";
import {
  SparklesIcon,
  FireIcon,
  Award01Icon,
  Flag01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority?: string | null;
  className?: string;
}

/**
 * Prime Curriculum Priority Badge
 * Visualizes curation importance: Core (Red Sparkle), High (Amber Flame),
 * Advanced (Purple Award), Standard (Sky Flag).
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (!priority) return null;
  const normalized = priority.toLowerCase().trim();

  if (normalized === "core" || normalized === "canonical") {
    return (
      <span
        title="Prime Curriculum Core Priority"
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-bold uppercase tracking-wider bg-[rgba(255,0,0,0.12)] text-[var(--accent)] border border-[rgba(255,0,0,0.30)] shadow-[0_0_8px_rgba(255,0,0,0.18)] shrink-0",
          className
        )}
      >
        <Icon icon={SparklesIcon} size={10} className="text-[var(--accent)]" />
        <span>Core</span>
      </span>
    );
  }

  if (normalized === "high") {
    return (
      <span
        title="High Interview Frequency Priority"
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] shrink-0",
          className
        )}
      >
        <Icon icon={FireIcon} size={10} className="text-amber-400" />
        <span>High</span>
      </span>
    );
  }

  if (normalized === "advanced") {
    return (
      <span
        title="Advanced Challenge Priority"
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)] shrink-0",
          className
        )}
      >
        <Icon icon={Award01Icon} size={10} className="text-purple-400" />
        <span>Advanced</span>
      </span>
    );
  }

  if (normalized === "standard") {
    return (
      <span
        title="Standard Practice Problem"
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-medium uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/25 shrink-0",
          className
        )}
      >
        <Icon icon={Flag01Icon} size={10} className="text-sky-400 opacity-90" />
        <span>Standard</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono uppercase tracking-wider bg-[var(--surface-raised)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] shrink-0",
        className
      )}
    >
      <Icon icon={Flag01Icon} size={10} className="opacity-60" />
      <span>{priority}</span>
    </span>
  );
}

