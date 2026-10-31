import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  variant?: "default" | "segmented";
  segments?: number;
  size?: "sm" | "default" | "lg";
  indicatorClassName?: string;
  showLabel?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = "default",
      segments = 5,
      size = "default",
      indicatorClassName,
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
    }[size];

    if (variant === "segmented") {
      const activeSegments = Math.round((percentage / 100) * segments);

      return (
        <div className="w-full space-y-1.5" ref={ref} {...props}>
          {showLabel && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-mono">
                {Math.round(percentage)}%
              </span>
              <span className="text-[var(--text-tertiary)] font-mono text-[10px]">
                {activeSegments}/{segments}
              </span>
            </div>
          )}
          <div
            className="flex gap-1 w-full"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemax={max}
          >
            {Array.from({ length: segments }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-[1px] transition-colors duration-200",
                  sizeClasses,
                  index < activeSegments
                    ? "bg-[var(--accent)] shadow-[0_0_6px_rgba(255,0,0,0.4)]"
                    : "bg-[var(--surface-raised)] border border-[var(--border-subtle)]"
                )}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-1.5" ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)]">Progress</span>
            <span className="text-white font-mono font-medium">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)]",
            sizeClasses,
            className
          )}
        >
          <div
            className={cn(
              "h-full w-full flex-1 bg-[var(--accent)] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,0,0,0.5)]",
              indicatorClassName
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";
