"use client";

import * as React from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubjectBadge } from "./subject-badge";
import type { CalendarViewMode, CalendarPlanHeader } from "../types";

export interface CalendarHeaderProps {
  monthLabel: string;
  plan: CalendarPlanHeader | null;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onAskPrime?: () => void;
  isAIOpen?: boolean;
}

export function CalendarHeader({
  monthLabel,
  plan,
  view,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onAskPrime,
  isAIOpen = false,
}: CalendarHeaderProps) {
  const trajectory = plan?.trajectory || "on_track";
  const trajectoryText = trajectory.replace("_", " ").toUpperCase();
  const isAtRisk = trajectory === "at_risk" || trajectory === "infeasible";

  return (
    <div className="w-full border-b border-[#1A1A1A] pb-4 space-y-4">
      {/* Top Identity & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Range Context */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">
              CALENDAR
            </span>
            <span className="text-[#333333]">/</span>
            <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
              {monthLabel}
            </span>
            <span className="text-[#333333]">·</span>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border",
                isAtRisk
                  ? "border-[#FF0000]/40 text-[#FF0000] bg-[#FF0000]/10"
                  : "border-[#262626] text-[#AAAAAA] bg-[#0E0E0E]"
              )}
            >
              {trajectoryText}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#888888]">
            <span>Preparation across time</span>
            {plan && (
              <>
                <span className="text-[#333333]">·</span>
                <span className="font-mono text-[11px] text-[#A0A0A0]">
                  {plan.startDate.toUpperCase()} — {plan.targetDate.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* View Switcher & AI Context */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Segmented View Switcher */}
          <div
            role="tablist"
            aria-label="Calendar view switcher"
            className="inline-flex items-center p-0.5 sm:p-1 rounded-md bg-[#0C0C0C] border border-[#222222]"
          >
            {(["month", "week", "agenda"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={view === mode}
                onClick={() => onViewChange(mode)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 rounded text-xs font-mono capitalize transition-all cursor-pointer",
                  view === mode
                    ? "bg-[#1E1E1E] text-white border border-[#333333] shadow-sm font-semibold"
                    : "text-[#888888] hover:text-[#CCCCCC] border border-transparent"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Ask PRIME Button */}
          {onAskPrime && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAskPrime}
              className={cn(
                "text-xs font-mono h-8 border-[#262626] bg-[#0E0E0E] text-[#E0E0E0] hover:text-white hover:border-[#383838] gap-1.5 cursor-pointer px-2.5 sm:px-3 transition-colors",
                isAIOpen &&
                  "border-[#FF0000]/60 bg-[#160606] text-white shadow-[0_0_10px_rgba(255,0,0,0.25)]"
              )}
            >
              <Icon icon={SparklesIcon} size={14} className="text-[#FF0000]" />
              <span>Ask PRIME</span>
            </Button>
          )}
        </div>
      </div>

      {/* Month Navigation & Today Jump Bar */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Previous Month */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="h-8 w-8 p-0 flex-shrink-0 border-[#222222] bg-[#0C0C0C] text-[#AAAAAA] hover:text-white hover:border-[#383838]"
          >
            <Icon icon={ArrowLeft01Icon} size={16} />
          </Button>

          {/* Next Month */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            aria-label="Next month"
            className="h-8 w-8 p-0 flex-shrink-0 border-[#222222] bg-[#0C0C0C] text-[#AAAAAA] hover:text-white hover:border-[#383838]"
          >
            <Icon icon={ArrowRight01Icon} size={16} />
          </Button>

          {/* Current Month Heading */}
          <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide px-1.5 sm:px-2 truncate">
            {monthLabel}
          </span>
        </div>

        {/* Jump to Today */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onJumpToday}
          className="h-8 text-xs font-mono flex-shrink-0 border-[#262626] bg-[#0E0E0E] text-[#CCCCCC] hover:text-white hover:border-[#3A3A3A] gap-1.5 px-2.5 sm:px-3"
        >
          <Icon icon={Calendar01Icon} size={14} />
          <span>Today</span>
        </Button>
      </div>

      {/* Curriculum Subject Legend */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-[#141414] text-[11px] font-mono text-[#888888]">
        <span className="text-[10px] uppercase text-[#666666] tracking-wider shrink-0">Roadmaps:</span>
        <SubjectBadge subject="dsa" size="xs" showLabel={true} />
        <SubjectBadge subject="dbms" size="xs" showLabel={true} />
        <SubjectBadge subject="os" size="xs" showLabel={true} />
        <SubjectBadge subject="cn" size="xs" showLabel={true} />
        <SubjectBadge subject="oop" size="xs" showLabel={true} />
        <SubjectBadge subject="aptitude" size="xs" showLabel={true} />
      </div>
    </div>
  );
}

