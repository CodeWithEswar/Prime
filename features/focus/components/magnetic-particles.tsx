"use client";

import { useEffect, useRef, memo } from "react";
import type { MagneticParticle } from "../types";

interface MagneticParticlesProps {
  isRunning: boolean;
  isPaused: boolean;
  reducedMotion?: boolean;
}

export const MagneticParticles = memo(function MagneticParticles({
  isRunning,
  isPaused,
  reducedMotion = false,
}: MagneticParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable reactive ref for high-frequency animation controller
  // Allows the next rAF to instantly adapt velocity damping without re-initializing particles
  const stateRef = useRef({ isRunning, isPaused });
  stateRef.current = { isRunning, isPaused };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let dpr = 1;

    // Responsive particle count (desktop 140, mobile 65)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 65 : 140;

    let currentSpeed = stateRef.current.isRunning ? 1.0 : 0.08;

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const maxRadius = Math.max(width, height) * 0.55;
    const minRadius = 55;

    // Create persistent particle pool ONCE
    const particles: MagneticParticle[] = [];

    function initParticle(id: number, randomStart = true): MagneticParticle {
      const angle = Math.random() * Math.PI * 2;
      const distance = randomStart
        ? minRadius + Math.random() * (maxRadius - minRadius)
        : maxRadius * (0.8 + Math.random() * 0.2);

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const orbitDirection = Math.random() > 0.5 ? 1 : -1;
      const baseOpacity = 0.25 + Math.random() * 0.65;
      const radius = 1 + Math.random() * 1.8;
      const speed = 0.6 + Math.random() * 0.9;

      return {
        id,
        x,
        y,
        velocityX: 0,
        velocityY: 0,
        radius,
        opacity: baseOpacity,
        baseOpacity,
        energy: Math.random(),
        orbitDirection,
        angle,
        distance,
        speed,
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(initParticle(i, true));
    }

    // Static layout for reduced motion preference
    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 30, 30, ${p.baseOpacity * 0.4})`;
        ctx.fill();
      });
      return () => window.removeEventListener("resize", resize);
    }

    // High-performance RAF animation loop
    function animate() {
      if (!ctx) return;

      const running = stateRef.current.isRunning;
      const targetSpeed = running ? 1.0 : 0.05;

      // Responsive smooth damping: fast deceleration on pause (<250ms), smooth acceleration on resume
      const lerpFactor = running ? 0.08 : 0.05;
      currentSpeed += (targetSpeed - currentSpeed) * lerpFactor;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Seamless particle recycling at boundaries
        if (dist < minRadius || dist > maxRadius * 1.25) {
          particles[i] = initParticle(p.id, false);
          continue;
        }

        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Gravitational attraction
        const gravitationalForce = (0.55 / Math.pow(dist / 200, 0.45)) * p.speed;

        // Controlled orbital swirl
        const tangentX = -ny * p.orbitDirection;
        const tangentY = nx * p.orbitDirection;
        const swirlForce = (0.35 / Math.pow(dist / 160, 0.35)) * p.speed;

        // Velocity damping for stability
        p.velocityX = p.velocityX * 0.92 + (nx * gravitationalForce + tangentX * swirlForce) * 0.08;
        p.velocityY = p.velocityY * 0.92 + (ny * gravitationalForce + tangentY * swirlForce) * 0.08;

        const step = currentSpeed * 2.2;
        p.x += p.velocityX * step;
        p.y += p.velocityY * step;

        let fadeAlpha = 1;
        if (dist < minRadius + 90) {
          fadeAlpha = Math.max(0, (dist - minRadius) / 90);
        } else if (dist > maxRadius * 0.75) {
          fadeAlpha = Math.max(0, (maxRadius - dist) / (maxRadius * 0.25));
        }

        const alpha = p.baseOpacity * fadeAlpha * (running ? 1 : 0.45);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 40, 40, ${alpha})`;
        ctx.shadowColor = "#FF0000";
        ctx.shadowBlur = p.radius * 3.5;
        ctx.fill();

        // Trailing motion streak for active particles
        if (currentSpeed > 0.3 && p.speed > 0.85) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.velocityX * step * 2.2, p.y - p.velocityY * step * 2.2);
          ctx.strokeStyle = `rgba(255, 60, 60, ${alpha * 0.4})`;
          ctx.lineWidth = p.radius * 0.8;
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]); // Only runs ONCE on mount! State changes are read via stateRef.current!

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  );
});
