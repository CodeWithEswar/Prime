"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface InteractiveDotGridProps {
  className?: string;
  spacing?: number;
  dotSize?: number;
  glowRadius?: number;
  mask?: "radial" | "top-bottom" | "none";
}

/**
 * High-performance interactive glowing dot grid.
 * Rendered via single RAF-driven Canvas with smooth proximity illumination.
 * Falls back to static SVG for touch devices and reduced-motion preference.
 */
const noopSubscribe = () => () => {};
const getIsTouch = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export function InteractiveDotGrid({
  className,
  spacing = 28,
  dotSize = 1.2,
  glowRadius = 130,
  mask = "radial",
}: InteractiveDotGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = usePrimeReducedMotion();
  const isTouch = React.useSyncExternalStore(noopSubscribe, getIsTouch, () => false);

  React.useEffect(() => {
    if (reduced || isTouch) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let isVisible = true;
    let rafId: number;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    container.addEventListener("mousemove", handlePointerMove, { passive: true });
    container.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    const render = () => {
      if (isVisible) {
        // Smoothly interpolate mouse coordinates for silky falloff
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;

        ctx.clearRect(0, 0, width, height);

        const cols = Math.floor(width / spacing) + 1;
        const rows = Math.floor(height / spacing) + 1;
        const offsetX = (width - (cols - 1) * spacing) / 2;
        const offsetY = (height - (rows - 1) * spacing) / 2;

        for (let r = 0; r < rows; r++) {
          const cy = offsetY + r * spacing;
          for (let c = 0; c < cols; c++) {
            const cx = offsetX + c * spacing;

            const dx = cx - mouseX;
            const dy = cy - mouseY;
            const dist = Math.hypot(dx, dy);

            let currentDotSize = dotSize;
            let fillStyle = "rgba(255, 255, 255, 0.08)";

            if (dist < glowRadius) {
              const intensity = Math.pow(1 - dist / glowRadius, 2);
              currentDotSize = dotSize + intensity * 1.5;
              // Pure red proximity illumination
              fillStyle = `rgba(255, ${Math.round(20 * (1 - intensity))}, ${Math.round(20 * (1 - intensity))}, ${0.12 + intensity * 0.75})`;
            }

            ctx.fillStyle = fillStyle;
            ctx.beginPath();
            ctx.arc(cx, cy, currentDotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [reduced, isTouch, spacing, dotSize, glowRadius]);

  const maskStyles =
    mask === "radial"
      ? {
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 30%, transparent 100%)",
        }
      : mask === "top-bottom"
      ? {
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)",
        }
      : undefined;

  // Fallback for reduced-motion or mobile/touch
  if (reduced || isTouch) {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-0", className)}
        style={maskStyles}
      >
        <svg
          className="h-full w-full text-white/[0.08]"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="static-dots-fallback"
              width={spacing}
              height={spacing}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={spacing / 2} cy={spacing / 2} r={dotSize} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#static-dots-fallback)" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={maskStyles}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

