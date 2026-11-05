"use client";

import { motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface TextHighlightProps {
  children: React.ReactNode;
  className?: string;
  /** Highlight color, defaults to pure red (#FF0000) */
  color?: string;
}

export function TextHighlight({
  children,
  className = "",
  color = "#FF0000",
}: TextHighlightProps) {
  const reduced = usePrimeReducedMotion();

  if (reduced) {
    return (
      <span className={`relative inline-block text-white ${className}`}>
        <span style={{ color }}>{children}</span>
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ originX: 0, backgroundColor: color }}
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        aria-hidden="true"
      />
    </span>
  );
}

