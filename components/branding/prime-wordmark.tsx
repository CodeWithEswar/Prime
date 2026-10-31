import * as React from "react";
import { cn } from "@/lib/utils";

export const PRIME_WORDMARK_PATH =
  "M0.0 0.0L0.0 19.59L4.08 19.59L4.08 13.88L4.9 13.06L17.96 13.06L20.41 11.43L21.22 9.8L21.22 3.67L19.59 0.82L17.96 0.0ZM4.08 4.49L4.9 3.67L15.92 3.67L16.73 4.49L16.33 9.39L4.08 8.98Z M26.12 0.0L26.12 19.59L30.61 19.59L30.2 13.88L31.02 13.06L37.55 13.47L42.45 19.59L47.35 19.59L44.08 15.51L43.27 13.06L45.71 12.24L47.35 9.39L47.35 4.08L45.71 0.82L44.08 0.0ZM30.2 4.49L31.02 3.67L42.04 3.67L42.86 4.49L42.45 9.39L31.02 9.39L30.2 8.57Z M53.06 0.0L53.06 19.59L57.14 19.59L57.14 0.0Z M62.45 0.0L62.45 19.59L66.53 19.59L67.35 6.94L73.47 13.88L80.0 7.35L81.22 7.35L81.22 19.59L85.31 19.59L85.31 0.0L81.22 0.0L73.88 8.16L66.94 0.0Z M90.61 0.0L90.61 19.59L108.57 19.59L108.57 15.92L94.69 15.51L94.69 12.24L95.92 11.43L106.94 11.43L106.94 7.76L94.69 7.35L95.1 3.67L108.57 3.67L108.57 0.0Z";

export type PrimeWordmarkVariant =
  "brand" | "light" | "white" | "black" | "red" | "current";
export type PrimeWordmarkSize = "sm" | "md" | "lg" | "xl" | number;

export interface PrimeWordmarkProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: PrimeWordmarkSize;
  variant?: PrimeWordmarkVariant;
  withExpansion?: boolean;
  withTagline?: boolean;
  className?: string;
}

const HEIGHT_MAP: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

const FILL_MAP: Record<PrimeWordmarkVariant, string> = {
  brand: "#FFFFFF",
  light: "#000000",
  white: "#FFFFFF",
  black: "#000000",
  red: "#FF0000",
  current: "currentColor",
};

export function PrimeWordmark({
  size = "md",
  variant = "brand",
  withExpansion = false,
  withTagline = false,
  className,
  ...props
}: PrimeWordmarkProps) {
  const heightPx = typeof size === "number" ? size : HEIGHT_MAP[size] || 18;
  const widthPx = Math.round((heightPx * 109) / 20);
  const fillColor = FILL_MAP[variant] || FILL_MAP.brand;

  const isLight = variant === "light" || variant === "black";
  const textColor = isLight ? "text-black" : "text-white";
  const mutedTextColor = isLight ? "text-black/60" : "text-white/60";

  return (
    <div className={cn("inline-flex flex-col select-none", className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 109 20"
        width={widthPx}
        height={heightPx}
        fill="none"
        aria-label="PRIME"
        role="img"
        className="shrink-0"
      >
        <path d={PRIME_WORDMARK_PATH} fill={fillColor} fillRule="evenodd" />
      </svg>

      {withExpansion && (
        <div
          className={cn(
            "mt-1 font-mono text-[9px] uppercase tracking-[0.2em] font-medium leading-tight",
            mutedTextColor
          )}
        >
          Preparation Roadmap for Interviews, Mastery & Excellence
        </div>
      )}

      {withTagline && (
        <div
          className={cn(
            "mt-2.5 flex items-center gap-3 text-xs tracking-wider font-semibold border-t pt-2",
            textColor,
            isLight ? "border-black/10" : "border-white/10"
          )}
        >
          <span>
            Plan<span className="text-prime-red">.</span>
          </span>
          <span>
            Practice<span className="text-prime-red">.</span>
          </span>
          <span>
            Revise<span className="text-prime-red">.</span>
          </span>
          <span>
            Master<span className="text-prime-red">.</span>
          </span>
        </div>
      )}
    </div>
  );
}
