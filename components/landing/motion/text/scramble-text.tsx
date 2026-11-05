"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { textMotionTokens } from "./text-motion-config";

export interface ScrambleTextProps {
  /** The final string to resolve to */
  text: string;
  /** Character set used for random scrambling */
  charset?: string;
  /** Interval in milliseconds between frame scrambles */
  stepMs?: number;
  /** Total cycles to scramble before settling each character */
  cyclesPerChar?: number;
  /** Trigger mode: 'in-view' (runs once when scrolled into view) or 'hover' */
  trigger?: "in-view" | "hover";
  /** CSS class names */
  className?: string;
}

export function ScrambleText({
  text,
  charset = textMotionTokens.scramble.technicalCharset,
  stepMs = textMotionTokens.scramble.stepMs,
  cyclesPerChar = textMotionTokens.scramble.cyclesPerChar,
  trigger = "in-view",
  className = "",
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const reduced = usePrimeReducedMotion();

  const [displayText, setDisplayText] = useState(text);
  const [hasResolved, setHasResolved] = useState(false);

  const startScramble = useCallback(() => {
    if (reduced || !text) {
      return;
    }

    let frame = 0;
    const maxFrames = text.length * cyclesPerChar;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / maxFrames;
      const charsSettled = Math.floor(progress * text.length);

      const next = text
        .split("")
        .map((char, index) => {
          if (char === " " || char === "/" || char === "-") return char;
          if (index < charsSettled) {
            return text[index];
          }
          return charset[Math.floor(Math.random() * charset.length)];
        })
        .join("");

      setDisplayText(next);

      if (frame >= maxFrames) {
        clearInterval(interval);
        setDisplayText(text);
        setHasResolved(true);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [text, charset, stepMs, cyclesPerChar, reduced]);

  useEffect(() => {
    if (reduced || !text) return;
    if (trigger === "in-view" && isInView && !hasResolved) {
      const cleanup = startScramble();
      return cleanup;
    }
  }, [reduced, text, trigger, isInView, hasResolved, startScramble]);

  if (reduced) {
    return (
      <span ref={containerRef} className={`font-mono ${className}`}>
        {text}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      onMouseEnter={trigger === "hover" ? startScramble : undefined}
      className={`font-mono select-none ${className}`}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
}

