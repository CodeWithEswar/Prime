"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { motionDuration, motionEase, usePrimeReducedMotion } from "@/lib/motion";

export function LandingCanvas({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.35, 0.55, 0.75, 1],
    ["#000000", "#050000", "#000000", "#080000", "#030000", "#000000"]
  );
  return (
    <motion.div
      ref={ref}
      className="prime-landing"
      style={{ backgroundColor: reduced ? "#000" : backgroundColor }}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="landing-progress"
        style={{ scaleX: reduced ? 1 : scrollYProgress }}
      />
    </motion.div>
  );
}

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrimeReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [16, 0], opacity: [0.65, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: motionDuration.slow, ease: motionEase.enter }}
    >
      {children}
    </motion.div>
  );
}

// Angular terraces repeat the reference's ascending, nested architectural path.
const path =
  "M-100 640H120L300 460H390L565 285V180L505 240H455L650 45V360L370 640H250L110 780H-100";
export function StoryGeometry({
  variant = "hero",
  side = "right",
}: {
  variant?: "hero" | "revision" | "terminal";
  side?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [16, -24]);
  const length = useTransform(scrollYProgress, [0, 0.65], [0.08, 1]);
  return (
    <motion.div
      ref={ref}
      className={`story-geometry geometry-${variant} geometry-${side}`}
      style={{ y: reduced ? 0 : y }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 800 800" fill="none" focusable="false">
        <g stroke="#ff0000" strokeWidth="1">
          {[0, 1, 2, 3].map((i) => (
            <path
              className={i > 1 ? "geometry-detail" : undefined}
              key={i}
              d={path}
              transform={`translate(${-i * 47} ${i * 46})`}
              opacity={0.26 - i * 0.05}
            />
          ))}
          <motion.path
            d="M-100 540H65L245 360H335L510 185V105L650 -35"
            strokeOpacity=".65"
            style={{ pathLength: reduced ? 1 : length }}
          />
          <path d="M390 800L600 590H760L850 500" strokeOpacity=".5" />
        </g>
        <motion.path
          className="primary-geometry"
          d="M650 45L505 190H565V345L330 580H390L650 360Z"
          fill="#ff0000"
          initial={false}
          whileInView={reduced ? {} : { opacity: [0.5, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: motionEase.enter }}
        />
        <motion.path
          d={path}
          stroke="#ff0000"
          strokeWidth="1.5"
          initial={false}
          whileInView={reduced ? {} : { pathLength: [0, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: motionEase.enter }}
        />
      </svg>
    </motion.div>
  );
}

export function JourneyPath({ steps }: { steps: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start .85", "end .35"],
  });
  return (
    <div className="journey-path" ref={ref}>
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 50H180L220 10H420L460 50H650L690 10H1000"
          stroke="white"
          strokeOpacity=".12"
          fill="none"
        />
        <motion.path
          d="M0 50H180L220 10H420L460 50H650L690 10H1000"
          stroke="red"
          fill="none"
          style={{ pathLength: reduced ? 1 : scrollYProgress }}
        />
      </svg>
      <ol>
        {steps.map((step, i) => (
          <JourneyStep
            key={step}
            label={step}
            index={i}
            progress={scrollYProgress}
            reduced={!!reduced}
          />
        ))}
      </ol>
    </div>
  );
}
import type { MotionValue } from "motion/react";
function JourneyStep({
  label,
  index,
  progress,
  reduced,
}: {
  label: string;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const color = useTransform(
    progress,
    [Math.max(0, index / 5 - 0.08), Math.min(1, index / 5 + 0.12)],
    ["#999999", "#ff0000"]
  );
  return (
    <motion.li style={{ color: reduced ? "white" : color }}>
      <span>0{index + 1}</span>
      {label}
    </motion.li>
  );
}
