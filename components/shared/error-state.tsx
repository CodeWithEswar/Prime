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
 * PRIME Error State Primitive
 * Restrained error notification with pure red destructive indicator.
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
          "flex items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--destructive-border)] bg-[var(--destructive-soft)] text-xs text-red-300",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Icon icon={AlertCircleIcon} size={15} className="text-red-400 shrink-0" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 px-2 text-xs text-red-300 hover:text-white hover:bg-red-950/40"
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
        "flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-md)] border border-red-900/40 bg-red-950/15",
        className
      )}
      {...props}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-950/40 border border-red-900/60 text-red-400 mb-3">
        <Icon icon={AlertCircleIcon} size={20} />
      </div>

      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">{message}</p>

      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          className="mt-4 border-red-900/50 hover:border-red-800"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
