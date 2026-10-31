import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PrimeMark, type PrimeMarkVariant } from "./prime-mark";
import { PrimeWordmark, type PrimeWordmarkVariant } from "./prime-wordmark";

export type PrimeLogoVariant = "brand" | "light" | "white" | "black" | "red" | "current";
export type PrimeLogoSize = "sm" | "md" | "lg" | "xl";
export type PrimeLogoOrientation = "horizontal" | "stacked";

export interface PrimeLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: PrimeLogoSize;
  variant?: PrimeLogoVariant;
  orientation?: PrimeLogoOrientation;
  withExpansion?: boolean;
  withTagline?: boolean;
  href?: string;
  className?: string;
}

const SIZE_CONFIG: Record<
  PrimeLogoSize,
  {
    markSize: number;
    wordmarkHeight: number;
    gapHorizontal: string;
    gapVertical: string;
  }
> = {
  sm: {
    markSize: 20,
    wordmarkHeight: 14,
    gapHorizontal: "gap-2.5",
    gapVertical: "gap-2",
  },
  md: {
    markSize: 24,
    wordmarkHeight: 18,
    gapHorizontal: "gap-3",
    gapVertical: "gap-2.5",
  },
  lg: {
    markSize: 36,
    wordmarkHeight: 24,
    gapHorizontal: "gap-4",
    gapVertical: "gap-3",
  },
  xl: {
    markSize: 48,
    wordmarkHeight: 32,
    gapHorizontal: "gap-5",
    gapVertical: "gap-4",
  },
};

export function PrimeLogo({
  size = "md",
  variant = "brand",
  orientation = "horizontal",
  withExpansion = false,
  withTagline = false,
  href,
  className,
  ...props
}: PrimeLogoProps) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const markVariant: PrimeMarkVariant =
    variant === "brand"
      ? "brand"
      : variant === "light"
        ? "light"
        : variant === "white"
          ? "white"
          : variant === "black"
            ? "black"
            : variant === "red"
              ? "brand"
              : "current";

  const wordmarkVariant: PrimeWordmarkVariant = variant;

  const content = (
    <div
      className={cn(
        "inline-flex items-center select-none group",
        orientation === "horizontal"
          ? ["flex-row", config.gapHorizontal]
          : ["flex-col", config.gapVertical, "text-center"],
        className
      )}
      {...props}
    >
      <PrimeMark
        size={config.markSize}
        variant={markVariant}
        className="transition-transform duration-200 group-hover:scale-105"
      />
      <PrimeWordmark
        size={config.wordmarkHeight}
        variant={wordmarkVariant}
        withExpansion={withExpansion}
        withTagline={withTagline}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
        aria-label="PRIME Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
