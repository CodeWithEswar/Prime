import type { Transition } from "motion/react";
import { motionDuration, motionEase } from "./tokens";
import { motionSpring } from "./springs";

/**
 * Standardized Motion Transitions
 * Centralized transition definitions so components don't duplicate arbitrary timing.
 */
export const motionTransitions = {
  // Fast micro-transitions (color, border, icon crossfade)
  fast: {
    duration: motionDuration.fast,
    ease: motionEase.standard,
  } satisfies Transition,

  // Standard component entrance
  enter: {
    duration: motionDuration.normal,
    ease: motionEase.enter,
  } satisfies Transition,

  // Standard component exit (slightly faster than entrance)
  exit: {
    duration: motionDuration.fast,
    ease: motionEase.exit,
  } satisfies Transition,

  // Dialog entrance (180–240ms)
  dialogEnter: {
    duration: motionDuration.moderate,
    ease: motionEase.emphasized,
  } satisfies Transition,

  // Dialog exit (120–180ms)
  dialogExit: {
    duration: motionDuration.fast,
    ease: motionEase.exit,
  } satisfies Transition,

  // Directional Sheet / Panel entrance & exit
  sheet: motionSpring.panel,

  // Directional Tooltip (100–140ms)
  tooltip: {
    duration: motionDuration.fast,
    ease: motionEase.enter,
  } satisfies Transition,

  // Popover (140–180ms)
  popover: {
    duration: motionDuration.normal,
    ease: motionEase.enter,
  } satisfies Transition,

  // Dropdown menu (120–160ms)
  dropdown: {
    duration: motionDuration.fast,
    ease: motionEase.enter,
  } satisfies Transition,

  // Shared active indicator gliding (Tabs, Context Rail, Segmented Controls)
  sharedGlider: motionSpring.control,

  // Layout resizing (Viewport, Accordions)
  layout: {
    duration: motionDuration.moderate,
    ease: motionEase.standard,
  } satisfies Transition,
} as const;
