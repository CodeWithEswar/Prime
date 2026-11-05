/**
 * PRIME Motion Design Tokens — Typography & Kinetic Motion
 * Centralized easing curves, stagger intervals, typing speeds, and scramble rates.
 */

export const textMotionTokens = {
  // Typing animation timings
  typing: {
    standard: 45, // ms per character
    fast: 28,
    slow: 70,
    backspace: 22,
    pauseBeforeDelete: 2400, // ms to linger on full phrase
    pauseBeforeType: 500, // ms after clearing
  },

  // Stagger intervals (seconds)
  stagger: {
    character: 0.025,
    word: 0.05,
    line: 0.12,
    badge: 0.08,
  },

  // Line mask transition
  lineMask: {
    duration: 0.65,
    ease: [0.16, 1, 0.3, 1] as const, // Quintic ease-out for dramatic deceleration
  },

  // Character reveal transition
  character: {
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as const,
    offsetY: "25%",
  },

  // Rotating text transition
  rotating: {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1] as const,
    interval: 3400, // ms between phrase shifts
  },

  // Scramble character sets
  scramble: {
    defaultCharset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#________",
    technicalCharset: "01ABCDEF0123456789_#/:<>",
    stepMs: 30,
    cyclesPerChar: 3,
  },

  // Gradient sweep
  gradient: {
    duration: 5,
  },

  // Springs
  springs: {
    snappy: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
    gentle: {
      type: "spring" as const,
      stiffness: 180,
      damping: 24,
    },
  },
} as const;

