"use client";

import * as React from "react";
import Link from "next/link";
import {
  CodeCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Time02Icon,
  LinkSquare02Icon,
  Calendar01Icon,
  RepeatIcon,
  Search01Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) {
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

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md overflow-hidden space-y-4 p-4 sm:p-5">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon icon={CodeCircleIcon} size={18} className="text-[#FF0000]" />
            <h4 className="font-mono text-sm font-semibold uppercase tracking-wider text-white">
              Target Practice Problems
            </h4>
            <Badge
              variant="outline"
              className="font-mono text-[11px] bg-white/[0.04] text-neutral-300 border-white/[0.1]"
            >
              {solvedCount} / {problems.length} Solved ({progressPct}%)
            </Badge>
          </div>
          <p className="text-xs text-neutral-400">
            Independent coding problems for <span className="text-white font-medium">{topicTitle}</span>.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-48">
            <Icon
              icon={Search01Icon}
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter problems..."
              className="h-8 pl-8 text-xs bg-black/60 border-white/[0.1] text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#FF0000]"
            />
          </div>

          <div className="flex items-center gap-1 border border-white/[0.08] rounded-md p-0.5 bg-black/40">
            {(["all", "easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                  filterDifficulty === diff
                    ? "bg-white/20 text-white font-medium"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                {diff.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-white/[0.08] rounded-md p-0.5 bg-black/40">
            {(["all", "unsolved", "solved"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                  filterStatus === st
                    ? "bg-[#FF0000] text-white font-medium"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          No practice problems match the current filter.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04] overflow-x-auto">
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
                  <div className="flex-shrink-0 pt-0.5 sm:pt-0">
                    {isSolved ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400" title="Solved independently">
                        <Icon icon={CheckmarkCircle01Icon} size={14} />
                      </div>
                    ) : isAttempted ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400" title="Attempted">
                        <Icon icon={AlertCircleIcon} size={14} />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-neutral-700 bg-neutral-900 ml-0.5" title="Unsolved" />
                    )}
                  </div>

                  {/* Position */}
                  <span className="font-mono text-[11px] text-neutral-600 w-6 flex-shrink-0">
                    #{prob.position}
                  </span>

                  {/* Problem Details */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-white truncate group-hover:text-neutral-100">
                        {prob.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-1.5 py-0 capitalize ${diffColor}`}
                      >
                        {prob.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                      <span>Status: <strong className={isSolved ? "text-emerald-400" : isAttempted ? "text-amber-400" : "text-neutral-500"}>{prob.status.toUpperCase()}</strong></span>
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
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlanProblem(prob)}
                    className="h-7 w-7 p-0 text-neutral-500 hover:text-white"
                    title="Add problem to Daily Plan"
                  >
                    <Icon icon={Calendar01Icon} size={13} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevisionProblem(prob)}
                    className="h-7 w-7 p-0 text-neutral-500 hover:text-white"
                    title="Add problem to Revision schedule"
                  >
                    <Icon icon={RepeatIcon} size={13} />
                  </Button>

                  {/* External or Internal Solve Link */}
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
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] font-mono border-white/[0.1] bg-white/[0.03] text-neutral-500 cursor-not-allowed"
                    >
                      Practice
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Dialogs */}
      {planProblem && (
        <AddToPlanDialog
          open={Boolean(planProblem)}
          onOpenChange={(open) => !open && setPlanProblem(null)}
          videoId={planProblem.id}
          title={planProblem.title}
          durationSeconds={1800}
        />
      )}

      {revisionProblem && (
        <CreateRevisionDialog
          open={Boolean(revisionProblem)}
          onOpenChange={(open) => !open && setRevisionProblem(null)}
          videoId={revisionProblem.id}
          title={revisionProblem.title}
        />
      )}
    </div>
  );
}

