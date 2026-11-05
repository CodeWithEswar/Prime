import type { Variants } from "motion/react";

/**
 * PRIME Landing Page Motion Design Tokens
 * Centralized easing, timing, and spring curves for coherent cinematic motion.
 */
export const landingMotion = {
  hover: {
    duration: 0.18,
    ease: "easeOut",
  },
  reveal: {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for snappy deceleration
  },
  stagger: 0.08,
  spring: {
    type: "spring" as const,
    stiffness: 180,
    damping: 24,
  },
  subtleSpring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  magneticSpring: {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
    mass: 0.5,
  },
} as const;

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: landingMotion.reveal.duration, ease: landingMotion.reveal.ease },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: landingMotion.reveal.duration, ease: landingMotion.reveal.ease },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: landingMotion.stagger,
      delayChildren: 0.05,
    },
  },
};

