import * as React from "react";
import { cn } from "@/lib/utils";

export type PageFrameVariant = "workspace" | "wide-table" | "reading" | "focus" | "full";

export interface PageFrameProps {
  title?: string;
  description?: string;
  category?: string;
  actions?: React.ReactNode;
  variant?: PageFrameVariant;
  children: React.ReactNode;
  className?: string;
}

const variantWidths: Record<PageFrameVariant, string> = {
  "wide-table": "max-w-none",
  workspace: "max-w-6xl",
  reading: "max-w-4xl",
  full: "max-w-full",
  focus: "max-w-2xl",
};

export function PageFrame({
  title,
  description,
  category,
  actions,
  variant = "wide-table",
  children,
  className,
}: PageFrameProps) {
  const hasHeader = Boolean(title || description || category || actions);

  return (
    <div
      className={cn(
        "shell-page-frame w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",
        variantWidths[variant] || "max-w-7xl",
        className
      )}
    >
      {/* Open Page Header */}
      {hasHeader && (
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="space-y-1 min-w-0">
            {category && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  {category}
                </span>
              </div>
            )}

            {title && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {title}
              </h1>
            )}

            {description && (
              <p className="text-xs text-[var(--text-secondary)] font-sans max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </header>
      )}

      {/* Main Page Content Body */}
      <div>{children}</div>
    </div>
  );
}
