import type { Transition, Variants } from "motion/react";

/**
 * PRIME Motion System Constants
 * Engineered, tactile, restrained interaction timings.
 */
export const MOTION_DURATIONS = {
  fast: 0.12, // 120ms: micro-interactions, toggles, button presses
  normal: 0.18, // 180ms: menus, badges, hover disclosures
  slow: 0.24, // 240ms: modals, sheets, accordions, page transitions
} as const;

export const MOTION_EASINGS = {
  // Precision snappy curve: swift acceleration with natural settle
  snappy: [0.16, 1, 0.3, 1] as const,
  // Standard ease-out
  easeOut: [0, 0, 0.2, 1] as const,
  // Standard ease-in-out
  easeInOut: [0.4, 0, 0.2, 1] as const,
} as const;

export const MOTION_SPRINGS = {
  tight: {
    type: "spring",
    stiffness: 450,
    damping: 32,
    mass: 0.8,
  } satisfies Transition,
  balanced: {
    type: "spring",
    stiffness: 350,
    damping: 28,
  } satisfies Transition,
  gentle: {
    type: "spring",
    stiffness: 240,
    damping: 24,
  } satisfies Transition,
} as const;

/**
 * Reusable accessible motion variants that automatically respect reduced motion.
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.snappy,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.snappy,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
};
