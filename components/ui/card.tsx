import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "base" | "surface" | "raised" | "elevated";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = "raised", interactive = false, ...props }, ref) => {
    const elevationClasses = {
      base: "bg-[var(--surface-base)] border-[var(--border-subtle)] shadow-elevation-1",
      surface:
        "bg-[var(--surface-base)] border-[var(--border-subtle)] shadow-elevation-1",
      raised:
        "bg-[var(--surface-raised)] border-[var(--border-default)] shadow-elevation-2",
      elevated:
        "bg-[var(--surface-elevated)] border-[var(--border-strong)] shadow-elevation-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-md)] border text-[var(--foreground)] transition-all duration-150",
          elevationClasses[elevation],
          interactive &&
            "hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] cursor-pointer active:translate-y-[0.5px]",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-[var(--text-secondary)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 pt-0 border-t border-[var(--border-subtle)] mt-4",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
