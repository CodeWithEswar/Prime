"use client";

import { useMemo } from "react";
import { motion, type Variants } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { textMotionTokens } from "./text-motion-config";

export interface CharacterRevealProps {
  /** The text string to animate */
  text: string;
  /** Stagger time in seconds between characters */
  stagger?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** HTML element to render */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  /** Root element className */
  className?: string;
  /** Character span className */
  charClassName?: string;
  /** Optional pure red accent highlight for specific characters/words */
  accentWord?: string;
}

export function CharacterReveal({
  text,
  stagger = textMotionTokens.stagger.character,
  delay = 0,
  as: Component = "span",
  className = "",
  charClassName = "",
  accentWord,
}: CharacterRevealProps) {
  const reduced = usePrimeReducedMotion();

  // Segment words and characters while preserving grapheme clusters
  const words = useMemo(() => {
    return text.split(" ").map((word) => {
      // Use Intl.Segmenter if available, fallback to Array.from
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return {
          raw: word,
          isAccent: accentWord ? word.toLowerCase().includes(accentWord.toLowerCase()) : false,
          chars: Array.from(segmenter.segment(word), (s) => s.segment),
        };
      }
      return {
        raw: word,
        isAccent: accentWord ? word.toLowerCase().includes(accentWord.toLowerCase()) : false,
        chars: Array.from(word),
      };
    });
  }, [text, accentWord]);

  if (reduced) {
    return (
      <Component className={className}>
        {words.map((w, i) => (
          <span key={i} className={w.isAccent ? "text-[#FF0000]" : ""}>
            {w.raw}
            {i < words.length - 1 ? " " : ""}
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

  const charVariants: Variants = {
    hidden: { opacity: 0, y: textMotionTokens.character.offsetY },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: textMotionTokens.character.duration,
        ease: textMotionTokens.character.ease,
      },
    },
  };

  return (
    <Component className={className}>
      {/* Screen-reader accessible version */}
      <span className="sr-only">{text}</span>

      {/* Visual character-by-character animation */}
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        aria-hidden="true"
        className="inline-block"
      >
        {words.map((wordObj, wordIdx) => (
          <span
            key={wordIdx}
            className={`inline-block whitespace-nowrap ${
              wordObj.isAccent ? "text-[#FF0000]" : ""
            }`}
          >
            {wordObj.chars.map((char, charIdx) => (
              <motion.span
                key={charIdx}
                variants={charVariants}
                className={`inline-block ${charClassName}`}
              >
                {char}
              </motion.span>
            ))}
            {/* Non-breaking space separator */}
            {wordIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

