import * as React from "react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "inline" | "card";
}

/**
 * PRIME Error State Primitive (Amendment Section 6)
 * Pure black canvas with pure red accent border and white-alpha messaging.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this data. Please try again.",
  onRetry,
  variant = "card",
  className,
  ...props
}: ErrorStateProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.04)] text-xs text-white",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Icon
            icon={AlertCircleIcon}
            size={15}
            className="text-[var(--accent)] shrink-0"
          />
          <span>{message}</span>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 px-2 text-xs text-white hover:bg-[rgba(255,0,0,0.12)]"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-md)] border border-[var(--prime-accent-border)] bg-[rgba(255,0,0,0.03)]",
        className
      )}
      {...props}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,0,0,0.08)] border border-[var(--prime-accent-border)] text-[var(--accent)] mb-3">
        <Icon icon={AlertCircleIcon} size={20} />
      </div>

      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">{message}</p>

      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
