"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Bookmark02Icon,
  Bookmark01Icon,
  ArrowRight01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RevisionProblemItem } from "../types";
import { toggleRevisionBookmarkAction } from "../mutations/toggle-bookmark";
import { toast } from "sonner";
import { cleanProblemTitle } from "@/lib/utils";
import { LabLinks } from "@/features/algorithm-lab/components/lab-links";

interface RevisionRowProps {
  item: RevisionProblemItem;
  onReview: (item: RevisionProblemItem) => void;
  onSnooze: (item: RevisionProblemItem) => void;
}

export function RevisionRow({ item, onReview, onSnooze }: RevisionRowProps) {
  const [isBookmarked, setIsBookmarked] = useState(item.bookmarked);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleBookmark = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);

    try {
      const res = await toggleRevisionBookmarkAction(item.problemId);
      if (res.success && res.bookmarked !== undefined) {
        setIsBookmarked(res.bookmarked);
      }
    } catch {
      setIsBookmarked(!nextVal);
      toast.error("Failed to update bookmark");
    } finally {
      setIsToggling(false);
    }
  };

  const difficultyColors = {
    EASY: "border-[#15803D]/40 text-[#4ADE80] bg-[#051A0E]/30",
    MEDIUM: "border-[#D97706]/40 text-[#FBBF24] bg-[#1A1305]/30",
    HARD: "border-[#DC2626]/40 text-[#F87171] bg-[#1A0505]/30",
  };

  const outcomeLabels: Record<string, string> = {
    independent: "Independent",
    hint: "Hint",
    solution_viewed: "Solution",
    unsolved: "Unsolved",
  };

  const reviewColors: Record<string, string> = {
    forgot: "text-[#FF4D4D]",
    hard: "text-[#FFAA00]",
    okay: "text-white",
    easy: "text-[#4ADE80]",
  };

  return (
    <div className="group relative flex flex-col p-4 sm:p-5 lg:p-5.5 rounded-lg border border-[#1C1C1C] bg-[#0A0A0A] hover:border-[#2C2C2C] hover:bg-[#0E0E0E] transition-all gap-3 sm:gap-3.5">
      {/* 1. Primary Header Row: Bookmark + Title + Difficulty Badge + Action Controls */}
      <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark problem"}
            className={`mt-0.5 sm:mt-0 p-1 -ml-1 rounded transition-colors shrink-0 ${
              isBookmarked
                ? "text-[#FF0000] hover:text-[#CC0000]"
                : "text-[#555555] hover:text-[#AAAAAA]"
            }`}
          >
            <Icon icon={isBookmarked ? Bookmark02Icon : Bookmark01Icon} size={18} />
          </button>

          {/* Title + Difficulty Badge */}
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <Link
              href={`/practice/dsa/${item.slug}`}
              title={cleanProblemTitle(item.title)}
              className="text-xs sm:text-sm font-semibold text-white hover:text-[#FF4D4D] transition-colors leading-snug break-words"
            >
              {cleanProblemTitle(item.title)}
            </Link>

            <span
              className={`shrink-0 font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border uppercase tracking-wider ${
                difficultyColors[item.difficulty] || difficultyColors.MEDIUM
              }`}
            >
              {item.difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls (Review Button + Dropdown Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-center">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onReview(item)}
            className="h-8 px-2.5 sm:px-3 font-mono text-xs font-semibold shrink-0"
          >
            <span>Review</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1.5 text-[#777777] hover:text-white rounded hover:bg-[#1A1A1A] transition-colors"
                aria-label="More options"
              >
                <Icon icon={MoreVerticalIcon} size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0A0A0A] border-[#222222] text-[#E0E0E0]"
            >
              <DropdownMenuItem
                onClick={() => onReview(item)}
                className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
              >
                Record Review
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/plan?revision=" + encodeURIComponent(item.id)}>Plan review</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/practice/dsa/" + encodeURIComponent(item.slug) + "#mastery-evidence"}>View mastery evidence</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSnooze(item)}
                className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
              >
                Snooze Revision...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleBookmark}
                className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
              >
                {isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1A1A1A]" />
              <DropdownMenuItem asChild>
                <Link
                  href={`/practice/dsa/${item.slug}`}
                  className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white block w-full"
                >
                  Problem Workspace
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Visual Pattern Lab Link (Indented to align with title) */}
      <LabLinks
        topics={item.topics.map((topic) => topic.slug)}
        label={
          item.lastReview?.rating === "forgot" || item.lastReview?.rating === "hard"
            ? "Rebuild the pattern visually"
            : "Review the pattern visually"
        }
        compact
        className="pl-0 sm:pl-[26px] my-0"
        style={{ marginBlock: 2 }}
      />

      {/* 3. Sub-Row: Topics & Platform + Telemetry Metrics with clear divider and margin */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-3.5 border-t border-[#181818]">
        {/* Topics & Platform */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#777777] min-w-0 sm:pl-[26px]">
          <span className="text-[#888888]">
            {item.topics.length > 0 ? (
              item.topics.map((t) => t.name).join(" · ")
            ) : (
              "General DSA"
            )}
          </span>
          {item.platform && (
            <>
              <span className="text-[#444444]">·</span>
              <span className="font-mono text-[11px] text-[#666666] shrink-0">
                {item.platform}
              </span>
            </>
          )}
        </div>

        {/* Telemetry Metrics: Due/Stage, Last Attempt, Last Review */}
        <div className="grid grid-cols-3 sm:flex items-center gap-3 sm:gap-5 lg:gap-6 text-left shrink-0 bg-[#060606] sm:bg-[#070707] lg:bg-transparent p-2.5 sm:p-3 lg:p-0 rounded-md border border-[#161616] lg:border-0">
          {/* Due / Interval Column */}
          <div className="min-w-0 sm:min-w-[85px]">
            <div className="text-[10px] font-mono uppercase text-[#666666] tracking-wider mb-0.5 truncate">
              {item.isOverdue ? "Due" : "Interval"}
            </div>
            {item.isOverdue ? (
              <span className="text-xs font-semibold text-[#FF4D4D] font-mono truncate block">
                {item.timingLabel}
              </span>
            ) : (
              <span className="text-xs font-medium text-[#C2C2C2] font-mono truncate block">
                {item.intervalDays === 1 ? "1 Day" : `${item.intervalDays} Days`}
              </span>
            )}
          </div>

          {/* Last Attempt Column */}
          <div className="min-w-0 sm:min-w-[125px]">
            <div className="text-[10px] font-mono uppercase text-[#666666] tracking-wider mb-0.5 truncate">
              Last Attempt
            </div>
            <div
              className="text-xs text-[#CCCCCC] font-mono truncate"
              title={
                item.lastAttempt
                  ? `${outcomeLabels[item.lastAttempt.outcome] ?? item.lastAttempt.outcome} · ${item.lastAttempt.timeTakenMinutes}m`
                  : undefined
              }
            >
              {item.lastAttempt ? (
                <span>
                  {outcomeLabels[item.lastAttempt.outcome] ?? item.lastAttempt.outcome} ·{" "}
                  {item.lastAttempt.timeTakenMinutes}m
                </span>
              ) : (
                <span className="text-[#555555]">—</span>
              )}
            </div>
          </div>

          {/* Last Review Column */}
          <div className="min-w-0 sm:min-w-[75px]">
            <div className="text-[10px] font-mono uppercase text-[#666666] tracking-wider mb-0.5 truncate">
              Last Review
            </div>
            <div className="text-xs font-semibold capitalize font-mono truncate">
              {item.lastReview ? (
                <span className={reviewColors[item.lastReview.rating] ?? "text-white"}>
                  {item.lastReview.rating}
                </span>
              ) : (
                <span className="text-[#555555]">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
