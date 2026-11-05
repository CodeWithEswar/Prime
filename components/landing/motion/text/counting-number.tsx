"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface CountingNumberProps {
  /** Target numeric value */
  value: number;
  /** Duration in seconds */
  duration?: number;
  /** Optional prefix e.g. "+" */
  prefix?: string;
  /** Optional suffix e.g. "%" or " days" */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** CSS class name */
  className?: string;
}

export function CountingNumber({
  value,
  duration = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = usePrimeReducedMotion();
  const [displayValue, setDisplayValue] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced || !isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, reduced]);

  const formatted =
    prefix +
    (reduced ? value : displayValue).toFixed(decimals) +
    suffix;

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}

