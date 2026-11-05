"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface RadialLinePatternProps {
  className?: string;
  rings?: number;
  center?: "center" | "top-right" | "bottom-left";
  accentColor?: string;
}

export function RadialLinePattern({
  className,
  rings = 7,
  center = "center",
  accentColor = "rgba(255, 0, 0, 0.12)",
}: RadialLinePatternProps) {
  const reduced = usePrimeReducedMotion();

  const centerCoordinates = {
    center: { cx: "50%", cy: "50%" },
    "top-right": { cx: "85%", cy: "15%" },
    "bottom-left": { cx: "15%", cy: "85%" },
  }[center];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden z-0 select-none",
        className
      )}
      style={{
        maskImage:
          "radial-gradient(ellipse 65% 55% at 50% 50%, #000 20%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 65% 55% at 50% 50%, #000 20%, transparent 80%)",
      }}
    >
      <motion.svg
        animate={
          !reduced
            ? {
                rotate: [0, 360],
              }
            : undefined
        }
        transition={{
          duration: 160,
          repeat: Infinity,
          ease: "linear",
        }}
        className="h-[140%] w-[140%] -left-[20%] -top-[20%] absolute opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" fill="none">
          {Array.from({ length: rings }).map((_, i) => {
            const radius = (i + 1) * 70;
            const isAccent = i % 2 === 1;
            return (
              <circle
                key={i}
                cx={centerCoordinates.cx}
                cy={centerCoordinates.cy}
                r={radius}
                stroke={isAccent ? accentColor : "rgba(255, 255, 255, 0.04)"}
                strokeWidth={isAccent ? 1.2 : 0.8}
                strokeDasharray={isAccent ? "6 8" : undefined}
              />
            );
          })}
          {/* Radial Technical Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={centerCoordinates.cx}
              y1={centerCoordinates.cy}
              x2="100%"
              y2="100%"
              stroke="rgba(255, 255, 255, 0.025)"
              strokeWidth="0.8"
              transform={`rotate(${angle}, 500, 500)`}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}

