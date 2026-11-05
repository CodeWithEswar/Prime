import * as React from "react";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard" | string;
  className?: string;
}

const difficultyConfig: Record<
  string,
  {
    textColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    shadowColor: string;
  }
> = {
  easy: {
    textColor: "text-[#10B981]",
    bgColor: "bg-[#10B981]/10",
    borderColor: "border-[#10B981]/25",
    dotColor: "bg-[#10B981]",
    shadowColor: "shadow-[0_0_6px_#10B981]",
  },
  medium: {
    textColor: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10",
    borderColor: "border-[#F59E0B]/25",
    dotColor: "bg-[#F59E0B]",
    shadowColor: "shadow-[0_0_6px_#F59E0B]",
  },
  hard: {
    textColor: "text-[#EF4444]",
    bgColor: "bg-[#EF4444]/10",
    borderColor: "border-[#EF4444]/25",
    dotColor: "bg-[#EF4444]",
    shadowColor: "shadow-[0_0_6px_#EF4444]",
  },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const norm = (difficulty || "medium").toLowerCase();
  const cfg = difficultyConfig[norm] || difficultyConfig.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-mono font-semibold uppercase tracking-wider border shrink-0",
        cfg.textColor,
        cfg.bgColor,
        cfg.borderColor,
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dotColor, cfg.shadowColor)}
        aria-hidden="true"
      />
      {difficulty}
    </span>
  );
}

