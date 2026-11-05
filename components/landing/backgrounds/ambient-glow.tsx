"use client";

import { motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface AmbientGlowProps {
  className?: string;
  position?: "top-right" | "top-left" | "center" | "bottom-right" | "bottom-left";
  intensity?: "subtle" | "medium" | "focus";
}

const POSITIONS = {
  "top-right": "-top-32 -right-32",
  "top-left": "-top-32 -left-32",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-right": "-bottom-32 -right-32",
  "bottom-left": "-bottom-32 -left-32",
};

const INTENSITIES = {
  subtle: "opacity-30",
  medium: "opacity-45",
  focus: "opacity-65",
};

export function AmbientGlow({
  className,
  position = "center",
  intensity = "subtle",
}: AmbientGlowProps) {
  const reduced = usePrimeReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute select-none overflow-hidden",
        POSITIONS[position],
        className
      )}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.5, 0.35],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "size-[480px] sm:size-[640px] rounded-full blur-[140px]",
          "bg-gradient-to-tr from-[#FF0000]/15 via-[#FF0000]/8 to-transparent",
          INTENSITIES[intensity]
        )}
      />
    </div>
  );
}

