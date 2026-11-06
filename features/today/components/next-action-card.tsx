"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  ArrowRight01Icon,
  HelpCircleIcon,
  Clock01Icon,
  PlayIcon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";
import type { TodayNextAction } from "../types";

interface NextActionCardProps {
  action: TodayNextAction;
  onWhyToday: (action: TodayNextAction) => void;
  onStartAction: (action: TodayNextAction) => void;
}

const difficultyColors = {
  EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  HARD: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

export function NextActionCard({
  action,
  onWhyToday,
  onStartAction,
}: NextActionCardProps) {
  const isContinue = action.actionType === "continue";
  const isReview = action.actionType === "review";

  const href =
    action.taskType === "dsa_problem" && action.problemSlug
      ? `/practice/dsa/${action.problemSlug}?from=today&taskId=${action.taskId}`
      : action.taskType === "revision"
        ? `/revision`
        : undefined;

  return (
    <section
      aria-label="Recommended next action"
      className="relative group rounded-lg bg-[#070707] border border-white/[0.1] hover:border-white/[0.18] transition-all shadow-md overflow-hidden"
    >
      {/* Left Red Indicator Bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#FF0000] shadow-[0_0_12px_#FF0000]" />

      <div className="p-5 sm:p-6 pl-6 sm:pl-7 space-y-4">
        {/* Top row: Beacon + Action Type + Target Duration */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Live pulsating beacon */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
            </span>

            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF0000]">
              {isContinue
                ? "Continue Active Session"
                : isReview
                  ? "Priority Spaced Review"
                  : "Start Next in Preparation"}
            </span>
          </div>

          {/* Target duration pill */}
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-300 bg-[#121212] px-2.5 py-1 rounded border border-white/[0.08]">
            <Icon icon={Clock01Icon} size={12} className="text-neutral-400" />
            <span>{action.targetMinutes}m target</span>
          </div>
        </div>

        {/* Main Title & Metadata strip */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {action.title}
          </h2>

          {/* Badges strip: Difficulty, Topic, Stage, Overdue */}
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
              <span className="inline-flex items-center gap-1 text-neutral-300 font-mono text-[11px] bg-neutral-900/80 px-2 py-0.5 rounded border border-white/[0.06]">
                <Icon icon={BookOpen01Icon} size={11} className="text-neutral-500" />
                {action.topicName}
              </span>
            )}

            {action.stageName && (
              <span className="text-neutral-400 text-xs font-medium">
                {action.stageName}
              </span>
            )}

            {action.isOverdue && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[#FF4D4D] bg-[#2A0505] border border-[#FF0000]/30 animate-pulse">
                OVERDUE
              </span>
            )}
          </div>

          {/* Deterministic Reason line */}
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans pt-0.5">
            {action.reasonExplanation}
          </p>
        </div>

        {/* Bottom CTA Bar & "Why today?" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {/* Action button cluster */}
          <div className="flex items-center gap-3">
            {href ? (
              <Button
                variant="primary"
                size="default"
                asChild
                className="w-full sm:w-auto gap-2"
              >
                <Link href={href} onClick={() => onStartAction(action)}>
                  <Icon icon={PlayIcon} size={14} />
                  <span>
                    {isContinue
                      ? "Continue Session"
                      : isReview
                        ? "Start Revision"
                        : "Start Next"}
                  </span>
                  <Icon icon={ArrowRight01Icon} size={15} />
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="default"
                className="w-full sm:w-auto gap-2"
                onClick={() => onStartAction(action)}
              >
                <Icon icon={PlayIcon} size={14} />
                <span>{isContinue ? "Continue Session" : "Start Next"}</span>
                <Icon icon={ArrowRight01Icon} size={15} />
              </Button>
            )}
          </div>

          {/* Why Today? trigger button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onWhyToday(action)}
            className="gap-1.5 text-xs text-neutral-400 hover:text-white"
          >
            <Icon icon={HelpCircleIcon} size={14} className="text-neutral-500" />
            <span>Why is this scheduled today?</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
