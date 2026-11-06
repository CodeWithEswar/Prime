/**
 * PRIME Focus Mode — 360° Magnetic Blaze Ray Simulation Engine
 * Manages the ray pool, inward gravitational acceleration, smooth pause/resume
 * deceleration/acceleration physics, and high-performance Canvas 2D rendering.
 */

import type { MagneticRay, RayLayer } from "../types";
import {
  polarToCartesian,
  getEllipticalBoundaryRadius,
  computeInwardProgress,
  computeInwardAcceleration,
  computeRayAlpha,
} from "./ray-geometry";

export interface RayEngineState {
  isRunning: boolean;
  isPaused: boolean;
  reducedMotion: boolean;
}

export interface RayEngineDimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  maxRadius: number;
  innerRadiusX: number;
  innerRadiusY: number;
}

export class RayEngine {
  private rays: MagneticRay[] = [];
  private dimensions: RayEngineDimensions = {
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    maxRadius: 0,
    innerRadiusX: 180,
    innerRadiusY: 110,
  };

  // Speed and glow smoothing factors for 60fps interpolation (<300ms transitions)
  private currentSpeedFactor = 1.0;
  private currentGlowFactor = 1.0;

  /**
   * Initializes or updates viewport dimensions and scales ray count adaptively
   */
  public resize(width: number, height: number): void {
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.hypot(centerX, centerY) * 1.05;

    // Adapt central exclusion zone to match the countdown typography proportions
    const innerRadiusX = isMobile ? 120 : isTablet ? 155 : 190;
    const innerRadiusY = isMobile ? 80 : isTablet ? 100 : 120;

    this.dimensions = {
      width,
      height,
      centerX,
      centerY,
      maxRadius,
      innerRadiusX,
      innerRadiusY,
    };

    const targetRayCount = isMobile ? 75 : isTablet ? 120 : 185;
    this.syncRayCount(targetRayCount);
  }

  /**
   * Adjusts ray pool size without unnecessary garbage collection
   */
  private syncRayCount(count: number): void {
    if (this.rays.length === count) return;

    if (this.rays.length < count) {
      const startIndex = this.rays.length;
      for (let i = startIndex; i < count; i++) {
        this.rays.push(this.createRay(i, true));
      }
    } else {
      this.rays.length = count;
    }
  }

  /**
   * Instantiates a single ray with deterministic layer distribution across 360°
   */
  private createRay(id: number, randomStart = true): MagneticRay {
    const rand = Math.random();
    let layer: RayLayer = "mid";
    let baseLength = 90;
    let baseSpeed = 340;
    let width = 1.5;
    let opacity = 0.65;

    if (rand < 0.35) {
      // Outer field: dimmer, longer trails entering from all directions
      layer = "outer";
      baseLength = 70 + Math.random() * 55;
      baseSpeed = 220 + Math.random() * 110;
      width = 0.9 + Math.random() * 0.5;
      opacity = 0.28 + Math.random() * 0.2;
    } else if (rand < 0.8) {
      // Mid field: clearly visible red rays accelerating inward
      layer = "mid";
      baseLength = 85 + Math.random() * 75;
      baseSpeed = 310 + Math.random() * 140;
      width = 1.3 + Math.random() * 0.7;
      opacity = 0.55 + Math.random() * 0.25;
    } else {
      // Inner field: sharp, highly energized streaks plunging toward the exclusion boundary
      layer = "inner";
      baseLength = 45 + Math.random() * 45;
      baseSpeed = 440 + Math.random() * 200;
      width = 1.8 + Math.random() * 0.8;
      opacity = 0.75 + Math.random() * 0.25;
    }

    const angle = Math.random() * Math.PI * 2;
    const minInner = Math.min(this.dimensions.innerRadiusX, this.dimensions.innerRadiusY);
    const innerBoundary = getEllipticalBoundaryRadius(
      this.dimensions.innerRadiusX,
      this.dimensions.innerRadiusY,
      angle
    );

    // Initial radial placement: distribute across the full field if initial, or at outer boundary
    const radius = randomStart
      ? innerBoundary + Math.random() * (this.dimensions.maxRadius - innerBoundary)
      : this.dimensions.maxRadius + Math.random() * 90;

    return {
      id,
      angle,
      radius,
      baseLength,
      length: baseLength,
      baseSpeed,
      speed: baseSpeed,
      width,
      opacity,
      energy: 0.8 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      angularDrift: (Math.random() - 0.5) * 0.04, // subtle natural curve
      layer,
    };
  }

  /**
   * Re-spawns an existing ray object at the outer boundary (zero object allocations)
   */
  private respawnRay(ray: MagneticRay): void {
    ray.angle = Math.random() * Math.PI * 2;
    ray.radius = this.dimensions.maxRadius + Math.random() * 80;
    ray.angularDrift = (Math.random() - 0.5) * 0.04;
    ray.phase = Math.random() * Math.PI * 2;
  }

  /**
   * Advances the physical simulation by dt seconds
   */
  public update(dt: number, state: RayEngineState): void {
    if (state.reducedMotion) return;

    // Smooth speed and glow interpolation for instant, non-jarring state transitions
    const targetSpeedFactor = state.isPaused ? 0.03 : state.isRunning ? 1.0 : 0.0;
    const targetGlowFactor = state.isPaused ? 0.45 : 1.0;

    // Smooth 200-300ms transition curve
    const lerpRate = Math.min(1, dt * 8);
    this.currentSpeedFactor += (targetSpeedFactor - this.currentSpeedFactor) * lerpRate;
    this.currentGlowFactor += (targetGlowFactor - this.currentGlowFactor) * lerpRate;

    const { innerRadiusX, innerRadiusY, maxRadius } = this.dimensions;

    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];

      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ray.angle);
      const progress = computeInwardProgress(ray.radius, innerBoundary, maxRadius);
      const accel = computeInwardAcceleration(progress);

      // Inward movement: speed decreases radius (accelerating toward center)
      const effectiveVelocity = ray.speed * accel * this.currentSpeedFactor;
      ray.radius -= effectiveVelocity * dt;

      // Small natural angular drift
      ray.angle += ray.angularDrift * this.currentSpeedFactor * dt;

      // Dynamic streak length with perspective stretch
      ray.length = ray.baseLength * (1 + 0.65 * progress);

      // Respawn when ray reaches central exclusion boundary or drifts inside
      if (ray.radius <= innerBoundary) {
        this.respawnRay(ray);
      }
    }
  }

  /**
   * Renders the 360° Magnetic Blaze ray field onto the canvas
   */
  public render(ctx: CanvasRenderingContext2D, state: RayEngineState): void {
    const { width, height, centerX, centerY, innerRadiusX, innerRadiusY, maxRadius } =
      this.dimensions;

    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    // Additive screen blend mode produces brilliant neon light overlaps without expensive shadowBlur
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];

      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ray.angle);
      const progress = computeInwardProgress(ray.radius, innerBoundary, maxRadius);
      const alpha = computeRayAlpha(ray.opacity, progress) * this.currentGlowFactor;

      if (alpha <= 0.01) continue;

      // Inward direction: Head is closer to center (at ray.radius), Tail trails behind (at ray.radius + ray.length)
      const head = polarToCartesian(centerX, centerY, ray.angle, ray.radius);
      const tail = polarToCartesian(centerX, centerY, ray.angle, ray.radius + ray.length);

      // Gradient along the ray stroke: Brilliant hot red at the leading head, fading crimson at the tail
      const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);

      if (ray.layer === "inner") {
        // High-energy inner ray: brilliant red-white hot core
        grad.addColorStop(0, `rgba(255, 120, 120, ${alpha * 0.95})`);
        grad.addColorStop(0.2, `rgba(255, 0, 0, ${alpha * 0.9})`);
        grad.addColorStop(0.7, `rgba(180, 0, 0, ${alpha * 0.35})`);
        grad.addColorStop(1, "rgba(120, 0, 0, 0)");
      } else if (ray.layer === "mid") {
        // Mid-field blazing red streak
        grad.addColorStop(0, `rgba(255, 20, 20, ${alpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(255, 0, 0, ${alpha * 0.75})`);
        grad.addColorStop(0.8, `rgba(160, 0, 0, ${alpha * 0.25})`);
        grad.addColorStop(1, "rgba(80, 0, 0, 0)");
      } else {
        // Outer darker crimson trail
        grad.addColorStop(0, `rgba(230, 0, 0, ${alpha * 0.75})`);
        grad.addColorStop(0.4, `rgba(180, 0, 0, ${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(60, 0, 0, 0)");
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = ray.width;
      ctx.beginPath();
      ctx.moveTo(head.x, head.y);
      ctx.lineTo(tail.x, tail.y);
      ctx.stroke();

      // Sharp luminous spark on the leading tip of inner/mid rays near the center
      if (ray.layer === "inner" && progress > 0.45 && alpha > 0.4) {
        ctx.fillStyle = `rgba(255, 200, 200, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, ray.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  }

  /**
   * Renders a static aesthetic snapshot for prefers-reduced-motion users
   */
  public renderStatic(ctx: CanvasRenderingContext2D): void {
    this.currentSpeedFactor = 0;
    this.currentGlowFactor = 0.55;
    this.render(ctx, { isRunning: false, isPaused: true, reducedMotion: true });
  }

  public getRayCount(): number {
    return this.rays.length;
  }
}

