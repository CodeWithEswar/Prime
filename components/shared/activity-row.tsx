import * as React from "react";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface ActivityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: IconSvgElement;
  title: string;
  description?: string;
  timestamp: string;
  iconClassName?: string;
}

/**
 * PRIME Activity Feed Row Primitive
 * Chronological execution log item with mono timestamp.
 */
export function ActivityRow({
  icon,
  title,
  description,
  timestamp,
  iconClassName,
  className,
  ...props
}: ActivityRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2.5 px-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] transition-colors",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] mt-0.5",
          iconClassName
        )}
      >
        <Icon icon={icon} size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] leading-snug">{title}</p>
        {description && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>

      <span className="font-mono text-[11px] text-[var(--text-disabled)] shrink-0 pt-0.5">
        {timestamp}
      </span>
    </div>
  );
}
