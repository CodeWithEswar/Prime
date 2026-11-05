"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface LineGridBackgroundProps {
  className?: string;
  spacing?: number;
  mask?: boolean;
  animated?: boolean;
  strokeColor?: string;
}

export function LineGridBackground({
  className,
  spacing = 48,
  mask = true,
  animated = true,
  strokeColor = "rgba(255, 255, 255, 0.05)",
}: LineGridBackgroundProps) {
  const reduced = usePrimeReducedMotion();

  const maskStyles = mask
    ? {
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, #000 35%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, #000 35%, transparent 100%)",
      }
    : undefined;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden z-0", className)}
      style={maskStyles}
    >
      <motion.div
        animate={
          animated && !reduced
            ? {
                x: [0, -spacing],
                y: [0, -spacing],
              }
            : undefined
        }
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -inset-[100px] h-[calc(100%+200px)] w-[calc(100%+200px)]"
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`tech-grid-pattern-${spacing}`}
              width={spacing}
              height={spacing}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
              />
              {/* Subtle technical crosshair at intersections */}
              <circle cx="0" cy="0" r="1" fill="rgba(255, 0, 0, 0.25)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#tech-grid-pattern-${spacing})`} />
        </svg>
      </motion.div>
    </div>
  );
}

