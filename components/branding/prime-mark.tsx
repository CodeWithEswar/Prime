import * as React from "react";
import { cn } from "@/lib/utils";

export const PRIME_MARK_PATH_LOWER = "M3 23V14L10.5 9.2H13.5V12.8L7.5 15.2V22L3 23Z";
export const PRIME_MARK_PATH_UPPER =
  "M16.5 1L9 7H16.5V14.2L10.5 16.6V20.4L21 15V4.5L16.5 1Z";

export type PrimeMarkVariant =
  "brand" | "light" | "white" | "black" | "current" | "subtle";

export interface PrimeMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  variant?: PrimeMarkVariant;
  className?: string;
  title?: string;
}

const VARIANT_FILL: Record<PrimeMarkVariant, string> = {
  brand: "#FF0000",
  light: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  current: "currentColor",
  subtle: "rgba(255, 255, 255, 0.4)",
};

export function PrimeMark({
  size = 24,
  variant = "brand",
  className,
  title,
  "aria-label": ariaLabel,
  ...props
}: PrimeMarkProps) {
  const fillColor = VARIANT_FILL[variant] || VARIANT_FILL.brand;
  const isAccessible = Boolean(title || ariaLabel);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn(
        "inline-block shrink-0 select-none transition-colors duration-150",
        className
      )}
      aria-hidden={!isAccessible}
      aria-label={ariaLabel || (title ? undefined : "PRIME Mark")}
      role={isAccessible ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={PRIME_MARK_PATH_LOWER} fill={fillColor} />
      <path d={PRIME_MARK_PATH_UPPER} fill={fillColor} />
    </svg>
  );
}
