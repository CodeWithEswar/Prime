import { describe, it, expect } from "vitest";
import {
  motionDuration,
  motionEase,
  motionSpring,
  getDirectionalOffset,
  dialogVariants,
  sheetVariants,
  createTooltipVariants,
  createPopoverVariants,
  createReducedMotionVariants,
} from "@/lib/motion";

describe("PRIME Centralized Motion System", () => {
  describe("Duration Tokens", () => {
    it("defines calibrated semantic durations within the 80–320ms envelope", () => {
      expect(motionDuration.instant).toBe(0.08);
      expect(motionDuration.fast).toBe(0.12);
      expect(motionDuration.normal).toBe(0.18);
      expect(motionDuration.moderate).toBe(0.24);
      expect(motionDuration.slow).toBe(0.32);
    });
  });

  describe("Easing Tokens", () => {
    it("defines standard cubic bezier curves", () => {
      expect(motionEase.standard).toEqual([0.2, 0, 0, 1]);
      expect(motionEase.enter).toEqual([0.16, 1, 0.3, 1]);
      expect(motionEase.exit).toEqual([0.4, 0, 1, 1]);
      expect(motionEase.emphasized).toEqual([0.22, 1, 0.36, 1]);
    });
  });

  describe("Spring Physics Tokens", () => {
    it("defines non-bouncy, high-damping physical springs", () => {
      expect(motionSpring.press.stiffness).toBe(520);
      expect(motionSpring.press.damping).toBe(32);
      expect(motionSpring.press.mass).toBe(0.55);

      expect(motionSpring.control.stiffness).toBe(420);
      expect(motionSpring.control.damping).toBe(34);
      expect(motionSpring.control.mass).toBe(0.7);

      expect(motionSpring.panel.stiffness).toBe(340);
      expect(motionSpring.panel.damping).toBe(36);
      expect(motionSpring.panel.mass).toBe(0.85);

      expect(motionSpring.gentle.stiffness).toBe(280);
      expect(motionSpring.gentle.damping).toBe(30);
      expect(motionSpring.gentle.mass).toBe(0.9);
    });
  });

  describe("Directional Overlay Utility", () => {
    it("derives spatial offset from placement side correctly", () => {
      expect(getDirectionalOffset("top", 4)).toEqual({ x: 0, y: 4 });
      expect(getDirectionalOffset("bottom", 4)).toEqual({ x: 0, y: -4 });
      expect(getDirectionalOffset("left", 4)).toEqual({ x: 4, y: 0 });
      expect(getDirectionalOffset("right", 4)).toEqual({ x: -4, y: 0 });
    });
  });

  describe("Shared Motion Variants", () => {
    it("defines dialog entrance and exit coordinates adhering to specs", () => {
      expect(dialogVariants.hidden).toMatchObject({
        opacity: 0,
        scale: 0.98,
        y: 8,
      });
      expect(dialogVariants.visible).toMatchObject({
        opacity: 1,
        scale: 1,
        y: 0,
      });
      expect(dialogVariants.exit).toMatchObject({
        opacity: 0,
        scale: 0.985,
        y: 4,
      });
    });

    it("defines directional sheet transitions with spatial continuity", () => {
      expect(sheetVariants.right.hidden).toEqual({ x: "100%" });
      expect(sheetVariants.right.visible.x).toBe(0);
      expect(sheetVariants.right.exit.x).toBe("100%");

      expect(sheetVariants.left.hidden).toEqual({ x: "-100%" });
      expect(sheetVariants.left.visible.x).toBe(0);
      expect(sheetVariants.left.exit.x).toBe("-100%");

      expect(sheetVariants.bottom.hidden).toEqual({ y: "100%" });
      expect(sheetVariants.bottom.visible.y).toBe(0);
      expect(sheetVariants.bottom.exit.y).toBe("100%");
    });

    it("creates direction-aware tooltip variants", () => {
      const topTooltip = createTooltipVariants("top");
      expect(topTooltip.hidden).toMatchObject({
        opacity: 0,
        scale: 0.96,
        y: 3,
      });

      const bottomTooltip = createTooltipVariants("bottom");
      expect(bottomTooltip.hidden).toMatchObject({
        opacity: 0,
        scale: 0.96,
        y: -3,
      });
    });

    it("creates direction-aware popover variants", () => {
      const bottomPopover = createPopoverVariants("bottom");
      expect(bottomPopover.hidden).toMatchObject({
        opacity: 0,
        scale: 0.98,
        y: -5,
      });
    });
  });

  describe("Reduced Motion Support", () => {
    it("strips transform, scale, and spring physics in reduced motion variants", () => {
      const reduced = createReducedMotionVariants(dialogVariants);
      expect(reduced.hidden).toEqual({ opacity: 0 });
      expect(reduced.visible).toMatchObject({ opacity: 1 });
      expect(reduced.exit).toMatchObject({ opacity: 0 });
      expect((reduced.hidden as Record<string, unknown>).scale).toBeUndefined();
      expect((reduced.hidden as Record<string, unknown>).y).toBeUndefined();
    });
  });
});
