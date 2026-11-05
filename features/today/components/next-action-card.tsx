"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ArrowRight01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import type { TodayNextAction } from "../types";

interface NextActionCardProps {
  action: TodayNextAction;
  onWhyToday: (action: TodayNextAction) => void;
  onStartAction: (action: TodayNextAction) => void;
}

const difficultyColors = {
  EASY: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
  MEDIUM: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
  HARD: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
};

export function NextActionCard({ action, onWhyToday, onStartAction }: NextActionCardProps) {
  const isContinue = action.actionType === "continue";
  const isReview = action.actionType === "review";

  const href =
    action.taskType === "dsa_problem" && action.problemSlug
      ? `/practice/dsa/${action.problemSlug}?from=today&taskId=${action.taskId}`
      : action.taskType === "revision"
        ? `/revision`
        : undefined;

  return (
    <div className="relative group p-5 sm:p-6 rounded-lg bg-[#0C0C0C] border border-[#222222] shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all hover:border-[#333333]">
      {/* Top row: Terminal beacon + Action Type + Target time */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Pure Red terminal needle */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
          </span>

          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF0000]">
            {isContinue
              ? "CONTINUE ACTIVE SESSION"
              : isReview
                ? "PRIORITY REVIEW NOW"
                : "START NEXT IN PREPARATION"}
          </span>
        </div>

        <span className="font-mono text-xs text-[#888888] font-medium bg-[#141414] px-2.5 py-1 rounded border border-[#222222]">
          {action.targetMinutes}m target
        </span>
      </div>

      {/* Main Title & Context Strip */}
      <div className="space-y-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {action.title}
        </h2>

        {/* Badges strip: Difficulty, Topic, Stage */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {action.difficulty && (
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                difficultyColors[action.difficulty]
              }`}
            >
              {action.difficulty}
            </span>
          )}

          {action.topicName && (
            <span className="text-[#888888] font-mono text-[11px]">
              {action.topicName}
            </span>
          )}

          {action.stageName && (
            <>
              <span className="text-[#333333]">·</span>
              <span className="text-[#AAAAAA] text-xs font-medium">
                {action.stageName}
              </span>
            </>
          )}

          {action.isOverdue && (
            <>
              <span className="text-[#333333]">·</span>
              <span className="font-mono text-[10px] text-[#FF4D4D] font-bold uppercase tracking-wider">
                OVERDUE
              </span>
            </>
          )}
        </div>

        {/* Deterministic Reason line */}
        <p className="text-xs text-[#777777] leading-relaxed pt-1">
          {action.reasonExplanation}
        </p>
      </div>

      {/* Bottom CTA & "Why today?" */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#181818]">
        {/* Primary Action Button */}
        {href ? (
          <Link
            href={href}
            onClick={() => onStartAction(action)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs text-white bg-[#FF0000] hover:bg-[#CC0000] transition-colors shadow-[0_0_16px_rgba(255,0,0,0.3)] active:scale-[0.98]"
          >
            <span>
              {isContinue
                ? "Continue Session"
                : isReview
                  ? "Start Revision"
                  : "Start Problem"}
            </span>
            <Icon icon={ArrowRight01Icon} size={14} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onStartAction(action)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs text-white bg-[#FF0000] hover:bg-[#CC0000] transition-colors shadow-[0_0_16px_rgba(255,0,0,0.3)] active:scale-[0.98]"
          >
            <span>{isContinue ? "Continue Session" : "Start Next"}</span>
            <Icon icon={ArrowRight01Icon} size={14} />
          </button>
        )}

        {/* Why Today? trigger */}
        <button
          type="button"
          onClick={() => onWhyToday(action)}
          className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors"
        >
          <Icon icon={HelpCircleIcon} size={14} />
          <span>Why today?</span>
        </button>
      </div>
    </div>
  );
}

