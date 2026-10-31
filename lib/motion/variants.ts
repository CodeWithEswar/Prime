import type { Variants } from "motion/react";
import { MOTION_DURATIONS } from "./durations";
import { MOTION_EASINGS } from "./easing";

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
  hidden: { opacity: 0, y: 6 },
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

export const scalePressVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.98 },
};

export const modalExpandVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.deliberate,
      ease: MOTION_EASINGS.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
};
