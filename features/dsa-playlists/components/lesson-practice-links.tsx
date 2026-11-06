"use client";

import Link from "next/link";
import { CodeCircleIcon, ArrowRight01Icon, LinkSquare01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { DSALessonItem } from "../types";

interface LessonPracticeLinksProps {
  linkedProblems: DSALessonItem["linkedProblems"];
  topicSlug: string;
}

export function LessonPracticeLinks({
  linkedProblems,
  topicSlug,
}: LessonPracticeLinksProps) {
  return (
    <div className="space-y-3 p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={CodeCircleIcon} size={15} className="text-[#FF4D4D]" />
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Connected Practice Questions
          </h4>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs font-mono text-[#FF4D4D] hover:text-[#FF6666] gap-1 p-0 hover:bg-transparent"
          asChild
        >
          <Link href={`/practice/dsa?topic=${topicSlug}`}>
            <span>View All #{topicSlug}</span>
            <Icon icon={ArrowRight01Icon} size={12} />
          </Link>
        </Button>
      </div>

      {linkedProblems.length > 0 ? (
        <div className="space-y-2">
          {linkedProblems.map((prob) => {
            const diffColor =
              prob.difficulty === "easy"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : prob.difficulty === "medium"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20";

            return (
              <div
                key={prob.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-[#121212] hover:bg-[#181818] transition-colors gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase border ${diffColor} flex-shrink-0`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="text-xs font-medium text-white truncate">
                    {prob.title}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs font-mono bg-black/40 border-white/10 hover:border-white/20 text-neutral-300 hover:text-white gap-1 flex-shrink-0"
                  asChild
                >
                  <Link href={`/practice/dsa/${prob.slug}`}>
                    <span>Solve in PRIME</span>
                    <Icon icon={LinkSquare01Icon} size={11} className="text-[#FF4D4D]" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center rounded-lg border border-white/[0.04] bg-[#0E0E0E] text-xs font-mono text-neutral-500">
          <span>No direct question link. Practice general problems from the #{topicSlug} topic.</span>
        </div>
      )}
    </div>
  );
}

