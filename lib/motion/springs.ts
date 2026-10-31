import type { Transition } from "motion/react";

/**
 * PRIME Motion Springs
 * Solid, damp physics preventing loose bounce.
 */
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
