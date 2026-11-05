"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { textMotionTokens } from "./text-motion-config";

export interface RotatingTextProps {
  /** Array of phrases to rotate through */
  phrases: string[];
  /** Milliseconds each phrase remains visible */
  interval?: number;
  /** Transition direction: vertical slide or fade */
  direction?: "up" | "down" | "fade";
  /** Additional classes */
  className?: string;
  /** Inner text classes */
  textClassName?: string;
}

export function RotatingText({
  phrases,
  interval = textMotionTokens.rotating.interval,
  direction = "up",
  className = "",
  textClassName = "",
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { margin: "-5% 0px", once: false });
  const reduced = usePrimeReducedMotion();

  useEffect(() => {
    if (!isInView || phrases.length <= 1 || reduced) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, phrases.length, interval, reduced]);

  if (phrases.length === 0) return null;

  if (reduced) {
    return (
      <span ref={containerRef} className={`inline-block ${className} ${textClassName}`}>
        {phrases[0]}
      </span>
    );
  }

  const yOffset = direction === "up" ? 14 : direction === "down" ? -14 : 0;

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center overflow-hidden align-baseline ${className}`}
    >
      {/* Screen-reader accessible full text */}
      <span className="sr-only">{phrases.join("; ")}</span>

      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: yOffset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -yOffset }}
          transition={{
            duration: textMotionTokens.rotating.duration,
            ease: textMotionTokens.rotating.ease,
          }}
          aria-hidden="true"
          className={`inline-block whitespace-nowrap ${textClassName}`}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

