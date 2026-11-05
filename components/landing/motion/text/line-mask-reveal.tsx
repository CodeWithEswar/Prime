"use client";

import { motion, type Variants } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { textMotionTokens } from "./text-motion-config";

export interface LineMaskRevealProps {
  /** Array of lines to reveal */
  lines: string[];
  /** HTML element to render as (h1, h2, h3, div, etc.) */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** Overall wrapper className */
  className?: string;
  /** Each line's inner className */
  lineClassName?: string;
  /** Line index (0-based) to apply red accent color to */
  accentLineIndex?: number;
  /** Stagger time in seconds between lines */
  stagger?: number;
  /** Delay before animation begins */
  delay?: number;
}

export function LineMaskReveal({
  lines,
  as: Component = "h2",
  className = "",
  lineClassName = "",
  accentLineIndex,
  stagger = textMotionTokens.stagger.line,
  delay = 0,
}: LineMaskRevealProps) {
  const reduced = usePrimeReducedMotion();

  if (reduced) {
    return (
      <Component className={className}>
        {lines.map((line, i) => (
          <span
            key={i}
            className={`block ${i === accentLineIndex ? "text-[#FF0000]" : ""} ${lineClassName}`}
          >
            {line}
          </span>
        ))}
      </Component>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: {
      y: "110%",
      opacity: 0,
    },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: textMotionTokens.lineMask.duration,
        ease: textMotionTokens.lineMask.ease,
      },
    },
  };

  const fullText = lines.join(" ");

  return (
    <Component className={className}>
      <span className="sr-only">{fullText}</span>

      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        aria-hidden="true"
        className="block"
      >
        {lines.map((line, idx) => (
          <span key={idx} className="block overflow-hidden py-0.5">
            <motion.span
              variants={lineVariants}
              className={`block leading-tight ${
                idx === accentLineIndex ? "text-[#FF0000]" : ""
              } ${lineClassName}`}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

