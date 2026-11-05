"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProblemMasteryResult } from "@/domain/mastery";
import type { CoreProblemMetadata } from "../types";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

export interface ProblemEvidenceRowProps {
  mastery: ProblemMasteryResult;
  metadata?: CoreProblemMetadata;
  sequenceIndex: number;
  className?: string;
}

export function ProblemEvidenceRow({
  mastery,
  metadata,
  sequenceIndex,
  className,
}: ProblemEvidenceRowProps) {
  const { level, score, requirements, freshness } = mastery;
  const slug = metadata?.slug || mastery.problemId;
  const title = metadata?.title || "DSA Problem";
  const difficulty = metadata?.difficulty || "MEDIUM";

  // Format level badge
  const levelBadgeClass =
    level === "mastered"
      ? "badge-level-mastered"
      : level === "proficient"
        ? "badge-level-proficient"
        : level === "practiced"
          ? "badge-level-practiced"
          : level === "learning"
            ? "badge-level-learning"
            : level === "exposed"
              ? "badge-level-exposed"
              : "badge-level-unseen";

  // Build summary phrase
  const summaryParts: string[] = [];
  if (requirements.independentEvidenceCount > 0) {
    summaryParts.push(
      `${requirements.independentEvidenceCount} independent${requirements.independentEvidenceCount > 1 ? "s" : ""}`
    );
  } else if (requirements.totalAttemptCount > 0) {
    summaryParts.push("independent solve still needed");
  }

  if (requirements.longestSuccessfulIntervalDays > 0) {
    summaryParts.push(`${requirements.longestSuccessfulIntervalDays}d retained`);
  } else if (requirements.successfulRevisionCount > 0) {
    summaryParts.push("revision verified");
  }

  if (requirements.hasRecentForgot) {
    summaryParts.push("recent forgot regression");
  } else if (freshness === "stale" && level === "mastered") {
    summaryParts.push("refresh recommended");
  }

  const detailText =
    summaryParts.length > 0 ? summaryParts.join(" · ") : "no practice evidence recorded";

  const formattedSeq = String(sequenceIndex + 1).padStart(2, "0");

  return (
    <Link
      href={`/practice/dsa/${slug}#mastery-evidence`}
      className={cn(
        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--prime-surface)] p-2.5 transition-colors hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
        requirements.hasRecentForgot && "border-[#ff0000]/30 bg-[#ff0000]/5",
        className
      )}
    >
      <span className="shrink-0 select-none pt-0.5 text-xs tabular-nums text-[var(--text-secondary)]">
        {formattedSeq}
      </span>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-[1_1_9rem]">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="min-w-0 [overflow-wrap:anywhere] text-sm font-medium">
              {title}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">{difficulty}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            {requirements.hasRecentForgot && (
              <Icon icon={Alert02Icon} size={12} className="text-[#ff0000] shrink-0" />
            )}
            <span className={cn(requirements.hasRecentForgot && "text-[#ff0000]")}>
              {detailText}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 sm:flex-col sm:items-end">
          <Badge variant="outline" className={cn("capitalize", levelBadgeClass)}>
            {level}
          </Badge>
          <span className="text-xs tabular-nums text-[var(--text-secondary)]">
            {score > 0 ? `${score}/100` : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
