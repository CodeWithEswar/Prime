import type { Variants } from "motion/react";
import { motionDuration, motionEase } from "./tokens";
import { motionSpring } from "./springs";
import { motionTransitions } from "./transitions";

export type OverlaySide = "top" | "bottom" | "left" | "right";

/**
 * Directional Offset Utility
 * Derives spatial offset from placement side so overlays visibly emerge from their triggers.
 * top    → y: +distance
 * bottom → y: -distance
 * left   → x: +distance
 * right  → x: -distance
 */
export function getDirectionalOffset(side: OverlaySide, distance = 4) {
  switch (side) {
    case "top":
      return { x: 0, y: distance };
    case "bottom":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
  }
}

/**
 * Clean Fade In/Out
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: motionTransitions.enter,
  },
  exit: {
    opacity: 0,
    transition: motionTransitions.exit,
  },
};

/**
 * Upward subtle entrance (cards, rows, content reveal)
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.enter,
  },
  exit: {
    opacity: 0,
    y: 3,
    transition: motionTransitions.exit,
  },
};

/**
 * Downward subtle entrance
 */
export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.enter,
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: motionTransitions.exit,
  },
};

/**
 * Dialog Modal (180–240ms in, 120–180ms out)
 * Scale .98 → 1, y 8px → 0. Closing is slightly faster without dramatic zoom-out.
 */
export const dialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTransitions.dialogEnter,
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    y: 4,
    transition: motionTransitions.dialogExit,
  },
};

/**
 * Dialog Backdrop (transparent → rgba(0,0,0,0.84))
 */
export const dialogBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionDuration.moderate, ease: motionEase.standard },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionDuration.fast, ease: motionEase.exit },
  },
};

/**
 * Directional Sheet Variants
 * Originates from side and maintains spatial continuity on reverse exit.
 */
export const sheetVariants = {
  right: {
    hidden: { x: "100%" },
    visible: { x: 0, transition: motionSpring.panel },
    exit: {
      x: "100%",
      transition: { duration: motionDuration.fast, ease: motionEase.exit },
    },
  },
  left: {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: motionSpring.panel },
    exit: {
      x: "-100%",
      transition: { duration: motionDuration.fast, ease: motionEase.exit },
    },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: 0, transition: motionSpring.panel },
    exit: {
      y: "100%",
      transition: { duration: motionDuration.fast, ease: motionEase.exit },
    },
  },
  top: {
    hidden: { y: "-100%" },
    visible: { y: 0, transition: motionSpring.panel },
    exit: {
      y: "-100%",
      transition: { duration: motionDuration.fast, ease: motionEase.exit },
    },
  },
} as const;

/**
 * Tooltip (100–140ms duration, subtle scale .96 → 1, directional offset 2–4px)
 */
export function createTooltipVariants(side: OverlaySide = "top"): Variants {
  const offset = getDirectionalOffset(side, 3);
  return {
    hidden: {
      opacity: 0,
      scale: 0.96,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: motionTransitions.tooltip,
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      x: offset.x / 2,
      y: offset.y / 2,
      transition: motionTransitions.exit,
    },
  };
}

/**
 * Popover (140–180ms duration, scale .98 → 1, directional offset 4–6px)
 */
export function createPopoverVariants(side: OverlaySide = "bottom"): Variants {
  const offset = getDirectionalOffset(side, 5);
  return {
    hidden: {
      opacity: 0,
      scale: 0.98,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: motionTransitions.popover,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      x: offset.x / 2,
      y: offset.y / 2,
      transition: motionTransitions.exit,
    },
  };
}

/**
 * Dropdown Menu (120–160ms duration, opacity + scale .98 → 1 + y -4px → 0)
 */
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTransitions.dropdown,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -2,
    transition: motionTransitions.exit,
  },
};

/**
 * Command Palette (180–220ms, keyboard-first velocity)
 */
export const commandVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: motionDuration.normal,
      ease: motionEase.enter,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: motionTransitions.exit,
  },
};

/**
 * Tab Content Transition (opacity + 2–4px y, 120–180ms)
 */
export const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 3,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.fast,
      ease: motionEase.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: {
      duration: motionDuration.instant,
      ease: motionEase.exit,
    },
  },
};

// Backward-compatible exports
export const fadeInVariants = fadeVariants;
export const slideUpVariants = fadeUpVariants;
export const scalePressVariants = {
  rest: { scale: 1 },
  tap: { scale: 0.985 },
};
export const modalExpandVariants = dialogVariants;
