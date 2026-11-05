"use client";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
export function LabControl({
  icon,
  label,
  iconOnly = false,
  children,
  className = "",
  ...props
}: ComponentProps<typeof Button> & {
  icon?: IconSvgElement;
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size={iconOnly ? "icon-sm" : "sm"}
      aria-label={label}
      title={label}
      data-icon-only={iconOnly}
      className={`lab-control ${className}`}
      {...props}
    >
      {icon && <Icon icon={icon} size={16} />} {!iconOnly && children}
    </Button>
  );
}
