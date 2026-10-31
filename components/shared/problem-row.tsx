import * as React from "react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type PreparationStatus } from "@/components/shared/status";
import { cn } from "@/lib/utils";

export interface ProblemRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id"
> {
  id: string | number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  platform?: "LeetCode" | "TakeUForward" | "GeeksforGeeks" | string;
  platformUrl?: string;
  status: PreparationStatus;
}

/**
 * PRIME DSA Problem Row Primitive (Amendment Section 18)
 * Monochromatic difficulty hierarchy on pure black canvas with external link.
 */
export function ProblemRow({
  id,
  title,
  difficulty,
  topic,
  platform = "LeetCode",
  platformUrl = "#",
  status,
  className,
  ...props
}: ProblemRowProps) {
  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--prime-canvas)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)] transition-all duration-100",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs text-[var(--text-tertiary)] w-8 shrink-0">
          #{id}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={platformUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-white hover:text-[var(--accent)] transition-colors flex items-center gap-1 group/link"
            >
              <span className="truncate">{title}</span>
              <Icon
                icon={ArrowUpRight01Icon}
                size={13}
                className="opacity-50 group-hover/link:opacity-100 group-hover/link:text-[var(--accent)] shrink-0 transition-opacity"
              />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={difficulty} className="text-[10px] py-0 px-1.5 uppercase">
              {difficulty}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">{topic}</span>
            <span className="text-xs text-[var(--text-disabled)]">•</span>
            <span className="text-xs text-[var(--text-tertiary)]">{platform}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  );
}
