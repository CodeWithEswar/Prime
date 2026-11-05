"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface WordRevealProps {
  /** The text string to animate on scroll */
  text: string;
  /** Words to highlight with pure red (#FF0000) when active */
  highlightWords?: string[];
  /** Container CSS classes */
  className?: string;
  /** Individual word CSS classes */
  wordClassName?: string;
}

function WordItem({
  word,
  range,
  progress,
  isHighlight,
  className,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
  isHighlight: boolean;
  className?: string;
}) {
  // Smoothly interpolate opacity from muted (0.22) to fully visible (1)
  const opacity = useTransform(progress, range, [0.22, 1]);
  // Subtle vertical lift into place as it activates
  const y = useTransform(progress, range, [4, 0]);

  return (
    <span className="relative inline-block mr-[0.28em] last:mr-0">
      <motion.span
        style={{ opacity, y }}
        className={`inline-block transition-colors duration-150 ${
          isHighlight ? "font-semibold text-[#FF0000]" : "text-white"
        } ${className || ""}`}
      >
        {word}
      </motion.span>
    </span>
  );
}

export function WordReveal({
  text,
  highlightWords = [],
  className = "",
  wordClassName = "",
}: WordRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const reduced = usePrimeReducedMotion();

  const words = useMemo(() => text.split(/\s+/), [text]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "center 0.45"],
  });

  const normalizedHighlights = useMemo(
    () => highlightWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")),
    [highlightWords]
  );

  if (reduced) {
    return (
      <p ref={containerRef} className={className}>
        {words.map((word, index) => {
          const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
          const isHighlight = normalizedHighlights.includes(clean);
          return (
            <span
              key={index}
              className={`inline-block mr-[0.28em] last:mr-0 ${
                isHighlight ? "font-semibold text-[#FF0000]" : "text-white"
              } ${wordClassName}`}
            >
              {word}
            </span>
          );
        })}
      </p>
    );
  }

  return (
    <p
      ref={containerRef}
      className={`relative select-none leading-relaxed ${className}`}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline">
        {words.map((word, index) => {
          const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
          const isHighlight = normalizedHighlights.includes(clean);

          // Calculate progression segment for each word
          const start = index / words.length;
          const end = Math.min(start + 1 / words.length, 1);

          return (
            <WordItem
              key={index}
              word={word}
              range={[start, end]}
              progress={scrollYProgress}
              isHighlight={isHighlight}
              className={wordClassName}
            />
          );
        })}
      </span>
    </p>
  );
}

