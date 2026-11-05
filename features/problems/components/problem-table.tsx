"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemRow } from "./problem-row";
import { ProblemMobileCard } from "./problem-mobile-card";
import { useSearchParams } from "next/navigation";
import {
  cleanCatalogQuery,
  problemHref,
  rememberCatalogPosition,
  readCatalogPosition,
  parseCatalogPosition,
  forgetCatalogPosition,
} from "../navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { PracticeCatalogResult } from "../types";

interface ProblemTableProps {
  data: PracticeCatalogResult;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  className?: string;
}

export function ProblemTable({
  data,
  isLoading = false,
  onPageChange,
  onClearFilters,
  className,
}: ProblemTableProps) {
  const query = useSearchParams();
  const queryString = cleanCatalogQuery(query);
  const returnHref = `/practice/dsa${queryString ? `?${queryString}` : ""}`;
  const { problems, totalCount, page, pageSize, totalPages } = data;
  React.useEffect(() => {
    if (isLoading) return;
    const saved = parseCatalogPosition(readCatalogPosition(returnHref));
    if (!saved) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: saved.y, behavior: "instant" });
      Array.from(
        document.querySelectorAll<HTMLAnchorElement>(
          `[data-problem-link][href^="/practice/dsa/${CSS.escape(saved.slug)}"]`
        )
      )
        .find((link) => link.getClientRects().length > 0)
        ?.focus({ preventScroll: true });
      forgetCatalogPosition(returnHref);
    });
    return () => cancelAnimationFrame(frame);
  }, [returnHref, isLoading]);

  const startIdx = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalCount);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Container */}
      <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--prime-canvas)] overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:flex items-center justify-between gap-3 px-4 py-2.5 bg-[var(--surface-base)] border-b border-[var(--border-subtle)] text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="w-12 text-center shrink-0">Status</span>
            <span className="ml-1">Problem</span>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <span className="min-w-[65px] text-right">Difficulty</span>
            <span className="w-16 text-right">Action</span>
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-48 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-12 h-6" />
                </div>
              </div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No problems found"
              description="No problems match your current filter and search criteria."
              action={
                <Button variant="outline" size="sm" onClick={onClearFilters}>
                  Clear all filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {problems.map((problem) => (
              <React.Fragment key={problem.id}>
                {/* Desktop View */}
                <div className="hidden sm:block">
                  <ProblemRow
                    problem={problem}
                    href={problemHref(problem.slug, query)}
                    onNavigate={() =>
                      rememberCatalogPosition(returnHref, problem.slug, problems)
                    }
                  />
                </div>
                {/* Mobile View */}
                <div className="block sm:hidden">
                  <ProblemMobileCard
                    problem={problem}
                    href={problemHref(problem.slug, query)}
                    onNavigate={() =>
                      rememberCatalogPosition(returnHref, problem.slug, problems)
                    }
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Shell */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs font-mono text-[var(--text-secondary)]">
          <div>
            Showing <span className="text-white font-medium">{startIdx}</span> to{" "}
            <span className="text-white font-medium">{endIdx}</span> of{" "}
            <span className="text-white font-medium">{totalCount.toLocaleString()}</span>{" "}
            problems
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="h-8 px-2.5 text-xs font-mono"
              aria-label="Previous page"
            >
              <Icon icon={ArrowLeft01Icon} size={14} className="mr-1" />
              Prev
            </Button>

            <span className="px-2 text-xs font-mono text-[var(--text-tertiary)]">
              {page} / {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-2.5 text-xs font-mono"
              aria-label="Next page"
            >
              Next
              <Icon icon={ArrowRight01Icon} size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
