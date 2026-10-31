import * as React from "react";
import {
  HugeiconsIcon,
  type HugeiconsProps,
  type IconSvgElement,
} from "@hugeicons/react";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<HugeiconsProps, "ref" | "icon"> {
  icon: IconSvgElement;
  className?: string;
}

/**
 * PRIME Icon Component
 * Standardizes Hugeicons rendering across the application.
 */
export function Icon({
  icon,
  className,
  size = 18,
  strokeWidth = 1.5,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0 inline-block align-middle", className)}
      {...props}
    />
  );
}

export { HugeiconsIcon };
export type { IconSvgElement };
