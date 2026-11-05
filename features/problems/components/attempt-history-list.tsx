"use client";

import * as React from "react";
import { Clock01Icon, Tick02Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ProblemAttemptRecord, AttemptOutcome } from "../types";

interface AttemptHistoryListProps {
  attempts: ProblemAttemptRecord[];
  className?: string;
}

const outcomeLabels: Record<AttemptOutcome, string> = {
  independent: "Independent",
  hint: "With Hints",
  solution_viewed: "Solution Viewed",
  unsolved: "Unsolved",
};

const outcomeStyles: Record<AttemptOutcome, { badge: string; dot: string }> = {
  independent: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  hint: {
    badge: "border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)]",
    dot: "bg-amber-400",
  },
  solution_viewed: {
    badge: "border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-secondary)]",
    dot: "bg-[var(--text-tertiary)]",
  },
  unsolved: {
    badge: "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]",
    dot: "bg-[var(--accent)]",
  },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function AttemptHistoryList({ attempts, className }: AttemptHistoryListProps) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className={cn("p-6 text-center border border-[var(--border-subtle)] bg-[var(--surface-base)]/50 rounded-[var(--radius-md)]", className)}>
        <p className="text-xs font-mono text-[var(--text-tertiary)]">
          No practice attempts recorded yet.
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Solve the problem on LeetCode, then record your attempt here to schedule spaced revisions.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {attempts.map((attempt) => {
        const style = outcomeStyles[attempt.outcome] || outcomeStyles.independent;
        return (
          <div
            key={attempt.id}
            className="p-3.5 border border-[var(--border-subtle)] bg-[var(--surface-base)] rounded-[var(--radius-md)] transition-colors hover:border-[var(--border-default)]"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Outcome Badge */}
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] border text-xs font-mono font-medium", style.badge)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                  {outcomeLabels[attempt.outcome] || attempt.outcome}
                </span>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  {formatDate(attempt.attemptedAt)}
                </span>
              </div>

              {/* Time & Confidence */}
              <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <Icon icon={Clock01Icon} size={12} className="opacity-70" />
                  {formatDuration(attempt.timeTakenSeconds)}
                </span>
                <div className="flex items-center gap-0.5" title={`Confidence: ${attempt.confidence}/5`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        idx < attempt.confidence
                          ? "bg-[rgba(255,255,255,0.85)]"
                          : "bg-[var(--border-subtle)]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Notes if present */}
            {attempt.notes && (
              <p className="mt-2 text-xs text-[var(--text-secondary)] font-sans border-l-2 border-[var(--border-default)] pl-2.5 py-0.5 whitespace-pre-wrap">
                {attempt.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

