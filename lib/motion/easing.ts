/**
 * PRIME Motion Easing Curves
 * Precise, developer-grade mechanical physics.
 */
export const MOTION_EASINGS = {
  // Snappy deceleration with immediate response and gentle settle
  snappy: [0.16, 1, 0.3, 1] as const,
  // Clean standard ease-out
  easeOut: [0, 0, 0.2, 1] as const,
  // Smooth symmetrical transitions
  easeInOut: [0.4, 0, 0.2, 1] as const,
  // Mechanical spring-like cubic
  tactile: [0.25, 0.1, 0.25, 1] as const,
} as const;
