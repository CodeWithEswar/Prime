/**
 * PRIME Focus Mode — Motion System Tokens
 * Configured spring transitions and timings for cinematic distraction-free focus.
 */

export const focusMotion = {
  enterDuration: 0.65,
  exitDuration: 0.35,
  controlDuration: 0.18,
  glowTransition: 0.8,
  pauseTransition: 0.65,
  spring: {
    stiffness: 120,
    damping: 24,
  },
  gentleSpring: {
    stiffness: 80,
    damping: 20,
  },
};

