"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { textMotionTokens } from "./text-motion-config";

export interface TypingTextProps {
  /** Array of phrases to cycle through, or single phrase */
  phrases: string | string[];
  /** Milliseconds per character typed */
  typingSpeed?: number;
  /** Milliseconds per character deleted */
  deletingSpeed?: number;
  /** Pause duration after typing phrase (ms) */
  pauseDuration?: number;
  /** Whether to continuously loop through phrases */
  loop?: boolean;
  /** Whether to show the blinking terminal cursor */
  cursor?: boolean;
  /** Optional cursor character, defaults to block "█" or bar "|" */
  cursorChar?: string;
  /** Additional CSS classes for text container */
  className?: string;
  /** Additional CSS classes for blinking cursor */
  cursorClassName?: string;
}

export function TypingText({
  phrases,
  typingSpeed = textMotionTokens.typing.standard,
  deletingSpeed = textMotionTokens.typing.backspace,
  pauseDuration = textMotionTokens.typing.pauseBeforeDelete,
  loop = true,
  cursor = true,
  cursorChar = "█",
  className = "",
  cursorClassName = "",
}: TypingTextProps) {
  const phraseList = Array.isArray(phrases) ? phrases : [phrases];
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { margin: "-5% 0px", once: false });
  const reduced = usePrimeReducedMotion();

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phraseList[phraseIndex] || "";
  const displayedText = currentPhrase.slice(0, charIndex);

  useEffect(() => {
    // Only animate when inside viewport and motion enabled
    if (reduced || !isInView) return;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        // Typing forward
        timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        // Finished typing current phrase
        if (phraseList.length > 1 && loop) {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    } else {
      if (charIndex > 0) {
        // Backspacing
        timer = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, deletingSpeed);
      } else {
        // Fully deleted current phrase, move to next
        timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phraseList.length);
        }, textMotionTokens.typing.pauseBeforeType);
      }
    }

    return () => clearTimeout(timer);
  }, [
    charIndex,
    isDeleting,
    phraseIndex,
    currentPhrase,
    phraseList.length,
    loop,
    isInView,
    reduced,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  if (reduced) {
    return (
      <span ref={containerRef} className={`inline-block ${className}`}>
        {phraseList[0]}
      </span>
    );
  }

  // Combined full text for assistive technology
  const fullTextAccessible = phraseList.join(". ");

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center align-baseline font-mono tracking-tight ${className}`}
    >
      {/* Screen-reader accessible static content */}
      <span className="sr-only">{fullTextAccessible}</span>

      {/* Visual animated typewriter presentation */}
      <span aria-hidden="true" className="inline-block whitespace-pre">
        {displayedText}
      </span>

      {cursor && (
        <span
          aria-hidden="true"
          className={`inline-block ml-1 text-[#FF0000] font-normal animate-pulse select-none ${cursorClassName}`}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}

