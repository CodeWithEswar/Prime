"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface KineticHeadingProps {
  /** The primary headline text */
  title: string;
  /** Sub-line or highlighted suffix */
  highlight?: string;
  /** HTML element */
  as?: "h1" | "h2" | "h3";
  /** Root className */
  className?: string;
}

export function KineticHeading({
  title,
  highlight,
  as: Component = "h2",
  className = "",
}: KineticHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "center 0.5"],
  });

  // Kinetic scroll transforms: subtle lift and letter-spacing expansion
  const y = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const tracking = useTransform(scrollYProgress, [0, 1], ["-0.03em", "-0.015em"]);

  if (reduced) {
    return (
      <div ref={containerRef} className={className}>
        <Component className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
          {title}
          {highlight && (
            <>
              <br />
              <span className="text-[#FF0000]">{highlight}</span>
            </>
          )}
        </Component>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <motion.div style={{ y, opacity, letterSpacing: tracking }}>
        <Component className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
          {title}
          {highlight && (
            <>
              <br />
              <span className="text-[#FF0000] transition-colors duration-300">
                {highlight}
              </span>
            </>
          )}
        </Component>
      </motion.div>
    </div>
  );
}

