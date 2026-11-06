/**
 * PRIME Focus Mode — 360° Magnetic Blaze Canvas Component
 * Renders hundreds of luminous red energy rays continuously accelerating inward
 * toward the central countdown timer with sub-50ms pause/resume reactivity.
 */

"use client";

import { useEffect, useRef, memo } from "react";
import { RayEngine } from "../lib/ray-engine";

interface MagneticBlazeRaysProps {
  isRunning: boolean;
  isPaused: boolean;
  reducedMotion?: boolean;
}

export const MagneticBlazeRays = memo(function MagneticBlazeRays({
  isRunning,
  isPaused,
  reducedMotion = false,
}: MagneticBlazeRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent reactive state ref for 60fps RAF loop without component remounting
  const stateRef = useRef({ isRunning, isPaused, reducedMotion });
  stateRef.current = { isRunning, isPaused, reducedMotion };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new RayEngine();
    let animationFrameId: number;
    let lastTime = performance.now();
    let isVisible = !document.hidden;

    function handleResize() {
      if (!canvas || !container || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      engine.resize(width, height);

      if (stateRef.current.reducedMotion) {
        engine.renderStatic(ctx);
      }
    }

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If reduced motion is requested, render a static artistic frame and skip the RAF loop
    if (stateRef.current.reducedMotion) {
      engine.renderStatic(ctx);
      return () => {
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    // Main 60fps continuous animation loop
    function loop(now: number) {
      if (!ctx) return;

      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      if (isVisible) {
        engine.update(dt, stateRef.current);
        engine.render(ctx, stateRef.current);
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

