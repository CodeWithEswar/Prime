/**
 * PRIME Motion Durations
 * Restrained, tactile interaction timings.
 */
export const MOTION_DURATIONS = {
  instant: 0.08, // 80ms: micro-ticks, toggle switches
  fast: 0.12, // 120ms: button presses, small state changes
  normal: 0.18, // 180ms: menus, popovers, badges
  deliberate: 0.24, // 240ms: dialogs, sheets, page sections
} as const;
