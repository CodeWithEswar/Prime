/**
 * PRIME Focus Mode — 360° Magnetic Blaze V2 Simulation Engine
 * Dense energy rays, slow-burning inward magnetic attraction, and realistic
 * flaming embers with tapered flame trails and heat-drift trajectories.
 */

import type {
  MagneticRay,
  RayType,
  FlamingEmber,
  EmberColorType,
  MagneticBlazeConfig,
} from "../types";
import { magneticBlazeConfig } from "../types";
import {
  polarToCartesian,
  getEllipticalBoundaryRadius,
  computeInwardProgress,
  computeInwardAcceleration,
  computeRayAlpha,
  computeEmberAlpha,
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
  private embers: FlamingEmber[] = [];

  private dimensions: RayEngineDimensions = {
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    maxRadius: 0,
    innerRadiusX: 190,
    innerRadiusY: 120,
  };

  private config: MagneticBlazeConfig = { ...magneticBlazeConfig };

  // Speed and glow smoothing factors for 60fps interpolation (250–350ms transitions)
  private currentSpeedFactor = 1.0;
  private currentGlowFactor = 1.0;

  /**
   * Initializes or updates viewport dimensions and scales ray & ember pools adaptively
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

    // V2: Dense energy rays (+50-70% higher density)
    // Mobile: 105 rays, 28 embers
    // Tablet: 160 rays, 45 embers
    // Desktop: 250 rays, 68 embers
    const targetRayCount = isMobile ? 105 : isTablet ? 160 : 250;
    const targetEmberCount = isMobile ? 28 : isTablet ? 45 : 68;

    this.syncRayCount(targetRayCount);
    this.syncEmberCount(targetEmberCount);
  }

  /**
   * Synchronizes ray pool size without memory leaks or repeated GC
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
   * Synchronizes flaming ember pool size
   */
  private syncEmberCount(count: number): void {
    if (this.embers.length === count) return;

    if (this.embers.length < count) {
      const startIndex = this.embers.length;
      for (let i = startIndex; i < count; i++) {
        this.embers.push(this.createEmber(i, true));
      }
    } else {
      this.embers.length = count;
    }
  }

  /**
   * Instantiates a single ray with 3 distinct categories:
   * - Primary Blaze Rays (30%): Long, sharp crimson streaks, thin bright-red cores
   * - Secondary Magnetic Rays (45%): Shorter, dimmer streaks with slight angular drift
   * - Micro Energy Rays (25%): Very thin, faint streaks creating continuous veil
   */
  private createRay(id: number, randomStart = true): MagneticRay {
    const rand = Math.random();
    let type: RayType = "secondary";
    let baseLength = 70;
    let baseSpeed = 160;
    let width = 1.2;
    let opacity = 0.55;

    if (rand < 0.3) {
      // Primary Blaze Rays: long, sharp, bright
      type = "primary";
      baseLength = (95 + Math.random() * 85) * this.config.trailLengthMultiplier;
      baseSpeed = (170 + Math.random() * 110) * this.config.speedMultiplier;
      width = 1.4 + Math.random() * 0.8;
      opacity = 0.65 + Math.random() * 0.25;
    } else if (rand < 0.75) {
      // Secondary Magnetic Rays: mid-length, supporting depth
      type = "secondary";
      baseLength = (55 + Math.random() * 65) * this.config.trailLengthMultiplier;
      baseSpeed = (130 + Math.random() * 90) * this.config.speedMultiplier;
      width = 1.0 + Math.random() * 0.5;
      opacity = 0.35 + Math.random() * 0.25;
    } else {
      // Micro Energy Rays: very thin, faint, ambient
      type = "micro";
      baseLength = (35 + Math.random() * 45) * this.config.trailLengthMultiplier;
      baseSpeed = (100 + Math.random() * 70) * this.config.speedMultiplier;
      width = 0.6 + Math.random() * 0.4;
      opacity = 0.16 + Math.random() * 0.18;
    }

    const angle = Math.random() * Math.PI * 2;
    const innerBoundary = getEllipticalBoundaryRadius(
      this.dimensions.innerRadiusX,
      this.dimensions.innerRadiusY,
      angle
    );

    const radius = randomStart
      ? innerBoundary + Math.random() * (this.dimensions.maxRadius - innerBoundary)
      : this.dimensions.maxRadius + Math.random() * 100;

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
      energy: 0.7 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      angularDrift: (Math.random() - 0.5) * this.config.angularDrift,
      layer: type,
      type,
    };
  }

  /**
   * Instantiates a single flaming ember with burning core, heat drift & flame trail
   */
  private createEmber(id: number, randomStart = true): FlamingEmber {
    const colorRand = Math.random();
    let colorType: EmberColorType = "hot_red";

    if (colorRand < 0.15) {
      colorType = "golden_ember"; // intense golden spark core
    } else if (colorRand < 0.45) {
      colorType = "orange_red"; // bright burning flame ember
    } else if (colorRand < 0.8) {
      colorType = "hot_red"; // signature vibrant scarlet ember
    } else {
      colorType = "crimson"; // deep smoldering crimson
    }

    const angle = Math.random() * Math.PI * 2;
    const innerBoundary = getEllipticalBoundaryRadius(
      this.dimensions.innerRadiusX,
      this.dimensions.innerRadiusY,
      angle
    );

    const radius = randomStart
      ? innerBoundary + Math.random() * (this.dimensions.maxRadius - innerBoundary)
      : this.dimensions.maxRadius + Math.random() * 120;

    // Slower, deliberate inward speed (~35% slower)
    const baseSpeed = (110 + Math.random() * 90) * this.config.speedMultiplier;
    const size = 1.4 + Math.random() * 2.0;
    const opacity = 0.65 + Math.random() * 0.35;
    const trailLength = (16 + Math.random() * 28) * this.config.trailLengthMultiplier;
    const hasTrail = Math.random() > 0.22;

    return {
      id,
      angle,
      radius,
      size,
      baseSpeed,
      speed: baseSpeed,
      swirlRate: (Math.random() - 0.5) * 0.16, // heat swirl rate
      swirlPhase: Math.random() * Math.PI * 2,
      opacity,
      baseOpacity: opacity,
      colorType,
      trailLength,
      hasTrail,
    };
  }

  /**
   * Respawns a ray object at the outer boundary in place
   */
  private respawnRay(ray: MagneticRay): void {
    ray.angle = Math.random() * Math.PI * 2;
    ray.radius = this.dimensions.maxRadius + Math.random() * 90;
    ray.angularDrift = (Math.random() - 0.5) * this.config.angularDrift;
    ray.phase = Math.random() * Math.PI * 2;
  }

  /**
   * Respawns a flaming ember object at the outer boundary in place
   */
  private respawnEmber(ember: FlamingEmber): void {
    ember.angle = Math.random() * Math.PI * 2;
    ember.radius = this.dimensions.maxRadius + Math.random() * 110;
    ember.swirlRate = (Math.random() - 0.5) * 0.16;
    ember.swirlPhase = Math.random() * Math.PI * 2;
  }

  /**
   * Advances the physical simulation by dt seconds
   */
  public update(dt: number, state: RayEngineState): void {
    if (state.reducedMotion) return;

    // Smooth speed and glow interpolation for graceful 250–350ms pause/resume easing
    const targetSpeedFactor = state.isPaused ? 0.02 : state.isRunning ? 1.0 : 0.0;
    const targetGlowFactor = state.isPaused ? 0.45 : 1.0;

    const lerpRate = Math.min(1, dt * 7);
    this.currentSpeedFactor += (targetSpeedFactor - this.currentSpeedFactor) * lerpRate;
    this.currentGlowFactor += (targetGlowFactor - this.currentGlowFactor) * lerpRate;

    const { innerRadiusX, innerRadiusY, maxRadius } = this.dimensions;

    // 1. Update Energy Rays
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ray.angle);
      const progress = computeInwardProgress(ray.radius, innerBoundary, maxRadius);
      const accel = computeInwardAcceleration(progress) * this.config.attractionStrength;

      const effectiveVelocity = ray.speed * accel * this.currentSpeedFactor;
      ray.radius -= effectiveVelocity * dt;

      // Subtle angular drift
      ray.angle += ray.angularDrift * this.currentSpeedFactor * dt;

      // Dynamic streak length with perspective stretch
      ray.length = ray.baseLength * (1 + 0.65 * progress);

      if (ray.radius <= innerBoundary) {
        this.respawnRay(ray);
      }
    }

    // 2. Update Flaming Embers (vortex heat drift + curved trajectories)
    for (let i = 0; i < this.embers.length; i++) {
      const ember = this.embers[i];
      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ember.angle);
      const progress = computeInwardProgress(ember.radius, innerBoundary, maxRadius);
      const accel = computeInwardAcceleration(progress) * this.config.attractionStrength;

      const effectiveVelocity = ember.speed * accel * this.currentSpeedFactor;
      ember.radius -= effectiveVelocity * dt;

      // Realistic heat drift: subtle wave oscillation + radial magnetic swirl
      const heatWave = Math.sin(ember.swirlPhase + progress * 6) * 0.08;
      ember.angle += (ember.swirlRate + heatWave) * this.currentSpeedFactor * dt;

      if (ember.radius <= innerBoundary) {
        this.respawnEmber(ember);
      }
    }
  }

  /**
   * Renders the 360° Magnetic Blaze ray and ember field onto the canvas
   */
  public render(ctx: CanvasRenderingContext2D, state: RayEngineState): void {
    const { width, height, centerX, centerY, innerRadiusX, innerRadiusY, maxRadius } =
      this.dimensions;

    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    // Screen blend mode creates rich optical overlaps and neon glows without expensive shadowBlur
    ctx.globalCompositeOperation = "screen";

    const glowMul = this.currentGlowFactor * this.config.glowIntensity;

    // -------------------------------------------------------------
    // LAYER 1: Background & Midground — 360° Energy Rays
    // -------------------------------------------------------------
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ray.angle);
      const progress = computeInwardProgress(ray.radius, innerBoundary, maxRadius);
      const alpha = computeRayAlpha(ray.opacity, progress) * glowMul;

      if (alpha <= 0.01) continue;

      const head = polarToCartesian(centerX, centerY, ray.angle, ray.radius);
      const tail = polarToCartesian(centerX, centerY, ray.angle, ray.radius + ray.length);

      const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);

      if (ray.type === "primary") {
        // Primary Blaze Rays: vibrant scarlet core with bright white-red head
        grad.addColorStop(0, `rgba(255, 140, 140, ${alpha * 0.95})`);
        grad.addColorStop(0.2, `rgba(255, 0, 0, ${alpha * 0.9})`);
        grad.addColorStop(0.7, `rgba(180, 0, 0, ${alpha * 0.35})`);
        grad.addColorStop(1, "rgba(100, 0, 0, 0)");
      } else if (ray.type === "secondary") {
        // Secondary Magnetic Rays: warm glowing crimson
        grad.addColorStop(0, `rgba(255, 40, 40, ${alpha * 0.85})`);
        grad.addColorStop(0.3, `rgba(230, 0, 0, ${alpha * 0.7})`);
        grad.addColorStop(0.8, `rgba(150, 0, 0, ${alpha * 0.25})`);
        grad.addColorStop(1, "rgba(70, 0, 0, 0)");
      } else {
        // Micro Energy Rays: faint atmospheric veil
        grad.addColorStop(0, `rgba(210, 0, 0, ${alpha * 0.65})`);
        grad.addColorStop(0.4, `rgba(160, 0, 0, ${alpha * 0.4})`);
        grad.addColorStop(1, "rgba(50, 0, 0, 0)");
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = ray.width;
      ctx.beginPath();
      ctx.moveTo(head.x, head.y);
      ctx.lineTo(tail.x, tail.y);
      ctx.stroke();

      // Sharp glowing tip on primary blaze rays near center
      if (ray.type === "primary" && progress > 0.45 && alpha > 0.35) {
        ctx.fillStyle = `rgba(255, 210, 210, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, ray.width * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -------------------------------------------------------------
    // LAYER 2: Foreground — Flaming Embers & Flame Trails
    // -------------------------------------------------------------
    for (let i = 0; i < this.embers.length; i++) {
      const ember = this.embers[i];
      const innerBoundary = getEllipticalBoundaryRadius(innerRadiusX, innerRadiusY, ember.angle);
      const progress = computeInwardProgress(ember.radius, innerBoundary, maxRadius);
      const alpha = computeEmberAlpha(ember.opacity, progress) * glowMul;

      if (alpha <= 0.01) continue;

      const head = polarToCartesian(centerX, centerY, ember.angle, ember.radius);

      // 1. Tapered Flame Trail behind the ember
      if (ember.hasTrail) {
        const trailLen = ember.trailLength * (0.9 + 0.5 * progress);
        const trailTail = polarToCartesian(
          centerX,
          centerY,
          ember.angle - ember.swirlRate * 0.05,
          ember.radius + trailLen
        );

        const trailGrad = ctx.createLinearGradient(head.x, head.y, trailTail.x, trailTail.y);

        if (ember.colorType === "golden_ember") {
          trailGrad.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.85})`);
          trailGrad.addColorStop(0.3, `rgba(255, 120, 0, ${alpha * 0.6})`);
          trailGrad.addColorStop(1, "rgba(180, 0, 0, 0)");
        } else if (ember.colorType === "orange_red") {
          trailGrad.addColorStop(0, `rgba(255, 90, 30, ${alpha * 0.85})`);
          trailGrad.addColorStop(0.4, `rgba(255, 0, 0, ${alpha * 0.55})`);
          trailGrad.addColorStop(1, "rgba(120, 0, 0, 0)");
        } else {
          trailGrad.addColorStop(0, `rgba(255, 30, 30, ${alpha * 0.8})`);
          trailGrad.addColorStop(0.4, `rgba(200, 0, 0, ${alpha * 0.5})`);
          trailGrad.addColorStop(1, "rgba(80, 0, 0, 0)");
        }

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = ember.size * 0.85;
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(trailTail.x, trailTail.y);
        ctx.stroke();
      }

      // 2. Burning Ember Spark Core & Soft Halo
      const emberRadius = ember.size * (0.8 + 0.25 * Math.sin(ember.swirlPhase));

      // Outer halo
      let haloColor = `rgba(255, 0, 0, ${alpha * 0.25})`;
      let coreColor = `rgba(255, 60, 60, ${alpha * 0.95})`;

      if (ember.colorType === "golden_ember") {
        haloColor = `rgba(255, 180, 0, ${alpha * 0.35})`;
        coreColor = `rgba(255, 240, 150, ${alpha * 0.98})`;
      } else if (ember.colorType === "orange_red") {
        haloColor = `rgba(255, 80, 0, ${alpha * 0.3})`;
        coreColor = `rgba(255, 170, 80, ${alpha * 0.95})`;
      }

      // Outer soft halo
      ctx.fillStyle = haloColor;
      ctx.beginPath();
      ctx.arc(head.x, head.y, emberRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Bright incandescent core
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(head.x, head.y, emberRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset composite operation to normal
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

  public getEmberCount(): number {
    return this.embers.length;
  }

  public getConfig(): MagneticBlazeConfig {
    return this.config;
  }

  public setConfig(custom: Partial<MagneticBlazeConfig>): void {
    this.config = { ...this.config, ...custom };
  }
}
