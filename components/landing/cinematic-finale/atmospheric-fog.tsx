"use client";

import { usePrimeReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AtmosphericFogProps {
  className?: string;
  variant?: "distant" | "mid" | "foreground";
}

/**
 * Multi-layered atmospheric fog drifts smoothly across the bridge.
 * Uses hardware-accelerated transforms and SVG gradient meshes rather than heavy blur filters.
 */
export function AtmosphericFog({ className = "", variant = "mid" }: AtmosphericFogProps) {
  const reduced = usePrimeReducedMotion();

  if (variant === "distant") {
    return (
      <div
        className={cn(
          "absolute inset-0 pointer-events-none overflow-hidden select-none",
          className
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute w-[200%] h-full top-0 left-[-50%]",
            reduced ? "opacity-20" : "animate-[fogDriftSlow_45s_linear_infinite] opacity-30"
          )}
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 48%, rgba(255, 0, 0, 0.12) 0%, rgba(20, 0, 0, 0.05) 45%, transparent 75%), " +
              "radial-gradient(ellipse 80% 30% at 30% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 60%), " +
              "radial-gradient(ellipse 70% 35% at 75% 52%, rgba(255, 0, 0, 0.08) 0%, transparent 65%)",
          }}
        />
      </div>
    );
  }

  if (variant === "foreground") {
    return (
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-48 pointer-events-none overflow-hidden select-none z-20",
          className
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute w-[200%] h-full bottom-0 left-[-50%]",
            reduced ? "opacity-25" : "animate-[fogDriftReverse_28s_linear_infinite] opacity-40"
          )}
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(255, 0, 0, 0.06) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 80%), " +
              "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  // Mid-ground volumetric mist
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden select-none z-10",
        className
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute w-[200%] h-full top-1/4 left-[-50%]",
          reduced ? "opacity-25" : "animate-[fogDrift_32s_linear_infinite] opacity-35"
        )}
        style={{
          background:
            "radial-gradient(ellipse 50% 30% at 45% 45%, rgba(255, 255, 255, 0.05) 0%, transparent 60%), " +
            "radial-gradient(ellipse 65% 25% at 70% 48%, rgba(255, 0, 0, 0.09) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 28% at 20% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

