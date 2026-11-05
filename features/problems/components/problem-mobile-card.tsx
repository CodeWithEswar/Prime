"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { RevisionBadge } from "./revision-badge";
import { PriorityBadge } from "./priority-badge";
import { DifficultyBadge } from "./difficulty-badge";
import { cn, cleanProblemTitle } from "@/lib/utils";
import type { CatalogProblemItem, UserProblemStatus } from "../types";

interface ProblemMobileCardProps {
  problem: CatalogProblemItem;
  isSelected?: boolean;
  onSelect?: (problem: CatalogProblemItem) => void;
  href?: string;
  onNavigate?: () => void;
  className?: string;
}

function StatusSymbol({ status }: { status: UserProblemStatus }) {
  switch (status) {
    case "solved":
      return (
        <span
          className="text-[#10B981] font-mono text-xs leading-none font-bold"
          title="Solved"
          aria-label="Status: Solved"
        >
          ✓
        </span>
      );
    case "needs_revision":
      return (
        <span
          className="text-[var(--accent)] font-mono text-xs leading-none font-bold animate-pulse"
          title="Needs Revision"
          aria-label="Status: Needs Revision"
        >
          ↻
        </span>
      );
    case "mastered":
      return (
        <span
          className="text-purple-400 font-mono text-[11px] leading-none font-bold shadow-[0_0_6px_rgba(168,85,247,0.4)]"
          title="Mastered"
          aria-label="Status: Mastered"
        >
          ◆
        </span>
      );
    case "attempted":
      return (
        <span
          className="text-[#F59E0B] font-mono text-xs leading-none"
          title="Attempted"
          aria-label="Status: Attempted"
        >
          ◐
        </span>
      );
    case "not_started":
    default:
      return (
        <span
          className="text-[var(--text-disabled)] font-mono text-xs leading-none"
          title="Not Started"
          aria-label="Status: Not Started"
        >
          ○
        </span>
      );
  }
}

export function ProblemMobileCard({
  problem,
  isSelected = false,
  onSelect,
  href,
  onNavigate,
  className,
}: ProblemMobileCardProps) {
  const collectionLabel = React.useMemo(() => {
    if (problem.collections && problem.collections.length > 0) {
      const first = problem.collections[0].name;
      const extra = problem.collections.length - 1;
      return extra > 0 ? `${first} +${extra}` : first;
    }
    if (problem.collectionCount > 0) {
      return `${problem.collectionCount} ${
        problem.collectionCount === 1 ? "set" : "sets"
      }`;
    }
    return null;
  }, [problem.collections, problem.collectionCount]);

  return (
    <div
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a,button")) return;
        if (onSelect) onSelect(problem);
        else
          event.currentTarget
            .querySelector<HTMLAnchorElement>("[data-problem-link]")
            ?.click();
      }}
      className={cn(
        "group relative p-3.5 border-b border-[var(--border-subtle)] bg-[var(--prime-canvas)] transition-all cursor-pointer flex flex-col gap-2 select-none",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-transparent before:transition-colors",
        "hover:bg-[rgba(255,255,255,0.02)] hover:before:bg-[var(--accent)]",
        isSelected &&
          "bg-[rgba(255,255,255,0.03)] before:bg-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="shrink-0 mt-0.5 w-5 flex items-center justify-center">
            <StatusSymbol
              status={
                problem.masteryLevel === "mastered" && problem.status === "solved"
                  ? "mastered"
                  : problem.status
              }
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                data-problem-link
                href={href ?? `/practice/dsa/${problem.slug}`}
                prefetch={false}
                onNavigate={onNavigate}
                onClick={(event) => {
                  if (onSelect) {
                    event.preventDefault();
                    onSelect(problem);
                  }
                }}
                className="text-sm font-medium text-[rgba(255,255,255,0.92)] group-hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                {cleanProblemTitle(problem.title)}
              </Link>

              {/* Priority Badge */}
              <PriorityBadge priority={problem.primePriority} />

              {/* Revision Badge */}
              <RevisionBadge
                isDue={problem.isRevisionDue}
                isOverdue={problem.isRevisionOverdue}
                nextRevisionAt={problem.nextRevisionAt}
              />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[var(--text-tertiary)]">
              {problem.primaryTopic && <span>{problem.primaryTopic.name}</span>}
              {collectionLabel && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[180px]">{collectionLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {problem.externalUrl ? (
          <a
            href={problem.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${problem.title} on external practice platform`}
            className="shrink-0 inline-flex items-center gap-1 p-1.5 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--text-secondary)] hover:text-white bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
          >
            <Icon icon={ArrowUpRight01Icon} size={13} />
          </a>
        ) : (
          <span
            className="text-[10px] text-[var(--text-tertiary)] font-mono"
            aria-label="Practice link pending verification"
          >
            Pending
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-[var(--border-subtle)]/40">
        <DifficultyBadge difficulty={problem.difficulty} />

        {problem.companyRelevance ? (
          <span className="text-[var(--text-secondary)] truncate">
            {problem.companyRelevance.companyName} (freq{" "}
            {problem.companyRelevance.frequency})
          </span>
        ) : (
          problem.acceptanceRate !== null && (
            <span className="text-[var(--text-tertiary)]">
              {problem.acceptanceRate.toFixed(1)}% acc
            </span>
          )
        )}
      </div>
    </div>
  );
}
