/**
 * PRIME Centralized Motion Tokens
 * Principles: FAST, PHYSICAL, DIRECTIONAL, CONSISTENT, INTENTIONAL.
 * Most interactions complete within 120–240ms; spatial transitions 280–360ms.
 */

export const motionDuration = {
  instant: 0.08, // 80ms: micro-ticks, toggle switches
  fast: 0.12, // 120ms: button presses, small state changes
  normal: 0.18, // 180ms: menus, popovers, badges
  moderate: 0.24, // 240ms: dialogs, sheets, larger panels
  slow: 0.32, // 320ms: large spatial transitions, viewport resizing
} as const;

export const motionEase = {
  // Balanced deceleration for continuous movement
  standard: [0.2, 0, 0, 1] as const,
  // Snappy entrance with immediate deceleration and gentle settle
  enter: [0.16, 1, 0.3, 1] as const,
  // Quick acceleration out of view
  exit: [0.4, 0, 1, 1] as const,
  // High-emphasis focal entrance
  emphasized: [0.22, 1, 0.36, 1] as const,
} as const;

// Backward-compatible aliases for legacy imports
export const MOTION_DURATIONS = {
  instant: motionDuration.instant,
  fast: motionDuration.fast,
  normal: motionDuration.normal,
  deliberate: motionDuration.moderate,
} as const;

export const MOTION_EASINGS = {
  snappy: motionEase.enter,
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: motionEase.standard,
  tactile: [0.25, 0.1, 0.25, 1] as const,
} as const;
