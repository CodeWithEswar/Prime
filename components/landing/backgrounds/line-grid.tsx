"use client";

import { cn } from "@/lib/utils";

interface LineGridProps {
  className?: string;
  spacing?: number;
  mask?: boolean;
}

export function LineGrid({
  className,
  spacing = 64,
  mask = true,
}: LineGridProps) {
  const maskStyle = mask
    ? {
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 95%)",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 95%)",
      }
    : undefined;

  return (
    <div
      aria-hidden="true"
      style={maskStyle}
      className={cn(
        "pointer-events-none absolute inset-0 select-none opacity-15",
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
            id={`grid-pattern-${spacing}`}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-pattern-${spacing})`} />
      </svg>
    </div>
  );
}

