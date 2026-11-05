import * as React from "react";
import { cn } from "@/lib/utils";

export interface BackgroundTransitionProps {
  position?: "top" | "bottom" | "both";
  height?: string | number;
  fromColor?: string;
  className?: string;
}

/**
 * Seamless atmospheric gradient masks connecting adjacent sections
 * without abrupt background color jumps or flash of dark bars.
 */
export function BackgroundTransition({
  position = "top",
  height = "h-24 sm:h-32",
  fromColor = "#000000",
  className,
}: BackgroundTransitionProps) {
  if (position === "both") {
    return (
      <>
        <div
          aria-hidden="true"
          style={{ background: `linear-gradient(to bottom, ${fromColor}, transparent)` }}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10",
            height,
            className
          )}
        />
        <div
          aria-hidden="true"
          style={{ background: `linear-gradient(to top, ${fromColor}, transparent)` }}
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10",
            height,
            className
          )}
        />
      </>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        background: `linear-gradient(to ${position === "top" ? "bottom" : "top"}, ${fromColor}, transparent)`,
      }}
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10",
        position === "top" ? "top-0" : "bottom-0",
        height,
        className
      )}
    />
  );
}

