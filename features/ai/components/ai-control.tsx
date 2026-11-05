"use client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import "./ai-icon-actions.css";
export function AIControl({
  icon,
  children,
  className,
  variant = "secondary",
  size = "sm",
  type = "button",
  asChild,
  iconOnly = false,
  ...props
}: ButtonProps & { icon?: IconSvgElement; iconOnly?: boolean }) {
  const label =
    props["aria-label"] ?? (typeof children === "string" ? children : props.title);
  return (
    <Button
      {...props}
      aria-label={iconOnly ? label : props["aria-label"]}
      title={props.title ?? (iconOnly ? label : undefined)}
      asChild={asChild}
      type={type}
      variant={variant}
      size={iconOnly ? "icon-sm" : size}
      data-variant={variant}
      data-icon-only={iconOnly || undefined}
      className={cn("ai-control", iconOnly && "ai-icon-only", className)}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon && <Icon icon={icon} size={15} aria-hidden="true" />}
          {!iconOnly && children}
        </>
      )}
    </Button>
  );
}
