import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  count?: number | string;
  action?: React.ReactNode;
}

/**
 * PRIME Section Header Primitive
 * Structural heading separating visual modules.
 */
export function SectionHeader({
  title,
  description,
  count,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]",
        className
      )}
      {...props}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
          {count !== undefined && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-raised)] rounded-[var(--radius-xs)] border border-[var(--border-subtle)]">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
