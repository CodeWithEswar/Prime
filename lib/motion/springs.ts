import type { Transition } from "motion/react";

/**
 * PRIME Motion Springs
 * Solid, damp physical springs preventing excessive or toy-like bounce.
 */
export const motionSpring = {
  // High-frequency tactile response for buttons, toggles, micro-switches
  press: {
    type: "spring",
    stiffness: 520,
    damping: 32,
    mass: 0.55,
  } satisfies Transition,

  // Intermediate physical response for sliders, controls, segmented surfaces
  control: {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.7,
  } satisfies Transition,

  // Weighted spatial response for slide-out sheets, drawers, side panels
  panel: {
    type: "spring",
    stiffness: 340,
    damping: 36,
    mass: 0.85,
  } satisfies Transition,

  // Smooth settled response for large layout expansions and accordions
  gentle: {
    type: "spring",
    stiffness: 280,
    damping: 30,
    mass: 0.9,
  } satisfies Transition,
} as const;

// Backward-compatible aliases
export const MOTION_SPRINGS = {
  tight: motionSpring.press,
  balanced: motionSpring.panel,
  gentle: motionSpring.gentle,
} as const;
