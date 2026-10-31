import * as React from "react";
import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconSvgElement;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/**
 * PRIME Zero-Data Empty State Primitive
 * Clean, restrained empty state with pure black surface alignment.
 */
export function EmptyState({
  icon = BookOpen01Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-base)]",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border-default)] text-[var(--text-tertiary)] mb-4">
        <Icon icon={icon} size={22} />
      </div>

      <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
