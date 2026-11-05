"use client";

import { cn } from "@/lib/utils";

interface DotGridProps {
  className?: string;
  size?: number;
  mask?: "radial" | "top" | "bottom" | "none";
}

export function DotGrid({
  className,
  size = 24,
  mask = "radial",
}: DotGridProps) {
  const maskStyle =
    mask === "radial"
      ? {
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 30%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #000 30%, transparent 100%)",
        }
      : mask === "top"
      ? {
          WebkitMaskImage:
            "linear-gradient(to top, #000 0%, transparent 100%)",
          maskImage:
            "linear-gradient(to top, #000 0%, transparent 100%)",
        }
      : mask === "bottom"
      ? {
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, transparent 100%)",
        }
      : undefined;

  return (
    <div
      aria-hidden="true"
      style={maskStyle}
      className={cn(
        "pointer-events-none absolute inset-0 select-none opacity-20",
        className
      )}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={`dot-pattern-${size}`}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#FFFFFF" fillOpacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dot-pattern-${size})`} />
      </svg>
    </div>
  );
}

