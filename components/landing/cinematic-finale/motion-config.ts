/**
 * Cinematic Finale Motion Design Tokens
 * Stage timings, spring parameters, easing curves, and camera push-in values.
 */

export const cinematicMotion = {
  // Scene reveal easing & timing
  sceneReveal: {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1] as const,
  },

  // Bridge lights activation stagger
  lightsStagger: 0.07, // seconds between sequential diode activations

  // Logo emergence
  logo: {
    duration: 1.4,
    delay: 0.3,
    ease: [0.16, 1, 0.3, 1] as const,
  },

  // Character breathing cycle
  breathing: {
    duration: 4.8,
    yOffset: -2,
    ease: "easeInOut" as const,
  },

  // Virtual camera scroll parallax range
  camera: {
    scale: [0.98, 1.05] as [number, number],
    y: [15, -15] as [number, number],
  },

  // Floating embers / particles
  particles: {
    minDuration: 12,
    maxDuration: 24,
  },
} as const;

