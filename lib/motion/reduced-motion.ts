"use client";

import { useReducedMotion } from "motion/react";
import type { Variants, Transition } from "motion/react";

/**
 * Hook to check if reduced motion is requested.
 */
export function usePrimeReducedMotion(): boolean {
  const shouldReduce = useReducedMotion();
  return Boolean(shouldReduce);
}

/**
 * Strips transforms, translations, and scales from variants when reduced motion is enabled,
 * preserving pure opacity crossfades so presence and state changes remain immediate.
 */
export function createReducedMotionVariants(
  standardVariants: Variants,
  reducedVariants?: Variants
): Variants {
  if (reducedVariants) return reducedVariants;

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.08, ease: "linear" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.05, ease: "linear" },
    },
  };
}

/**
 * Returns instant linear transition when reduced motion is requested.
 */
export function getReducedTransition(
  standard: Transition,
  isReduced: boolean
): Transition {
  if (isReduced) {
    return { duration: 0.05, ease: "linear" };
  }
  return standard;
}
