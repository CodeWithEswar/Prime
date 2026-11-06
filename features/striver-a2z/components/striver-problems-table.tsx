"use client";

import * as React from "react";
import {
  CodeCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  LinkSquare02Icon,
  Calendar01Icon,
  RepeatIcon,
  Search01Icon,
  BookOpen01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AddToPlanDialog } from "@/features/dsa-playlists/components/add-to-plan-dialog";
import { CreateRevisionDialog } from "@/features/dsa-playlists/components/create-revision-dialog";
import type { StriverProblemItem } from "../types";

interface StriverProblemsTableProps {
  problems: StriverProblemItem[];
  topicTitle: string;
}

export function StriverProblemsTable({
  problems,
  topicTitle,
}: StriverProblemsTableProps) {
  const [search, setSearch] = React.useState("");
  const [filterDifficulty, setFilterDifficulty] = React.useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "unsolved" | "solved">("all");

  // Dialog states for planning / revision
  const [planProblem, setPlanProblem] = React.useState<StriverProblemItem | null>(null);
  const [revisionProblem, setRevisionProblem] = React.useState<StriverProblemItem | null>(null);

  const filteredProblems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) {
        return false;
      }
      if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterStatus === "solved" && p.status !== "solved") {
        return false;
      }
      if (filterStatus === "unsolved" && p.status === "solved") {
        return false;
      }
      return true;
    });
  }, [problems, search, filterDifficulty, filterStatus]);

  const solvedCount = problems.filter((p) => p.status === "solved").length;
  const progressPct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;
  const isFiltered = search.trim().length > 0 || filterDifficulty !== "all" || filterStatus !== "all";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-md overflow-hidden space-y-4 p-4 sm:p-5 shadow-sm">
      {/* 1. Header Row: Title, Mastery Badge & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] shrink-0">
            <Icon icon={CodeCircleIcon} size={15} />
          </div>

          <h3 className="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-white whitespace-nowrap">
            Target Practice Problems
          </h3>

          <Badge
            variant="outline"
            className="font-mono text-[11px] px-2 py-0.5 bg-white/[0.04] text-neutral-300 border-white/[0.1] whitespace-nowrap shrink-0"
          >
            <span className="text-white font-semibold">{solvedCount}</span> / {problems.length} Solved ({progressPct}%)
          </Badge>
        </div>

        <p className="text-xs text-neutral-400 font-sans truncate max-w-md">
          Independent coding problems for <span className="text-white font-medium">{topicTitle}</span>
        </p>
      </div>

      {/* 2. Responsive Filter Toolbar: Search Bar + Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Icon
            icon={Search01Icon}
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter problems by title..."
            className="h-8 pl-8 pr-7 text-xs bg-black/60 border-white/[0.1] text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-1 focus-visible:ring-[#FF0000]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              aria-label="Clear search"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap pb-1 md:pb-0">
          {/* Difficulty Filter */}
          <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 shrink-0 font-mono text-[10px]">
            {(["all", "easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setFilterDifficulty(diff)}
                className={cn(
                  "px-2.5 py-1 rounded-md uppercase tracking-wider transition-all select-none",
                  filterDifficulty === diff
                    ? "bg-white/[0.15] text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {diff.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 shrink-0 font-mono text-[10px]">
            {(["all", "unsolved", "solved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={cn(
                  "px-2.5 py-1 rounded-md uppercase tracking-wider transition-all select-none",
                  filterStatus === st
                    ? "bg-[#FF0000] text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="py-12 px-4 text-center space-y-2 border border-dashed border-white/[0.08] rounded-lg bg-black/30">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-neutral-500 mx-auto">
            <Icon icon={CodeCircleIcon} size={18} />
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            No practice problems match the current filter.
          </p>
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterDifficulty("all");
                setFilterStatus("all");
              }}
              className="h-7 text-xs font-mono text-[#FF0000] hover:text-[#FF4D4D] hover:bg-transparent"
            >
              Reset filters
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04] overflow-x-auto">
          <TooltipProvider delayDuration={200}>
            {filteredProblems.map((prob) => {
              const isSolved = prob.status === "solved";
              const isAttempted = prob.status === "attempted";

              const diffColor =
                prob.difficulty === "easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : prob.difficulty === "hard"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20";

              return (
                <div
                  key={prob.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-2 rounded-lg hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Left: Position, Status & Title */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Status Indicator */}
                    <div className="shrink-0 pt-0.5 sm:pt-0">
                      {isSolved ? (
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                          title="Solved independently"
                        >
                          <Icon icon={CheckmarkCircle01Icon} size={14} />
                        </div>
                      ) : isAttempted ? (
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400"
                          title="Attempted"
                        >
                          <Icon icon={AlertCircleIcon} size={14} />
                        </div>
                      ) : (
                        <div
                          className="h-4 w-4 rounded-full border border-neutral-700 bg-neutral-900 ml-0.5"
                          title="Unsolved"
                        />
                      )}
                    </div>

                    {/* Position */}
                    <span className="font-mono text-[11px] text-neutral-600 w-6 shrink-0">
                      #{prob.position}
                    </span>

                    {/* Problem Details */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-medium text-white group-hover:text-neutral-100">
                          {prob.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-mono px-1.5 py-0 capitalize", diffColor)}
                        >
                          {prob.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 flex-wrap">
                        <span>
                          Status:{" "}
                          <strong
                            className={
                              isSolved
                                ? "text-emerald-400"
                                : isAttempted
                                ? "text-amber-400"
                                : "text-neutral-500"
                            }
                          >
                            {prob.status.toUpperCase()}
                          </strong>
                        </span>
                        {prob.articleUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={prob.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-white inline-flex items-center gap-0.5 hover:underline"
                            >
                              <Icon icon={BookOpen01Icon} size={10} />
                              Editorial
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPlanProblem(prob)}
                          className="h-7 w-7 p-0 text-neutral-500 hover:text-white"
                          aria-label="Add problem to Daily Plan"
                        >
                          <Icon icon={Calendar01Icon} size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Add to Daily Plan
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevisionProblem(prob)}
                          className="h-7 w-7 p-0 text-neutral-500 hover:text-white"
                          aria-label="Add problem to Revision schedule"
                        >
                          <Icon icon={RepeatIcon} size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Add to Revision
                      </TooltipContent>
                    </Tooltip>

                    {/* Solve Link */}
                    {prob.leetcodeUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 px-2.5 text-[11px] font-mono border-white/[0.1] bg-white/[0.03] text-neutral-300 hover:text-white hover:bg-white/[0.08] gap-1"
                      >
                        <a href={prob.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                          <span>Solve</span>
                          <Icon icon={LinkSquare02Icon} size={11} />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="h-7 px-2 text-[11px] font-mono text-neutral-600"
                      >
                        Internal
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {/* Dialogs */}
      {planProblem && (
        <AddToPlanDialog
          open={Boolean(planProblem)}
          onOpenChange={(open) => !open && setPlanProblem(null)}
          title={planProblem.title}
          durationSeconds={1800}
        />
      )}

      {revisionProblem && (
        <CreateRevisionDialog
          open={Boolean(revisionProblem)}
          onOpenChange={(open) => !open && setRevisionProblem(null)}
          title={revisionProblem.title}
        />
      )}
    </div>
  );
}
