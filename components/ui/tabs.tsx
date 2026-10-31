"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      line: "border-b border-[var(--border-subtle)] w-full justify-start gap-6 bg-transparent p-0 rounded-none",
      segmented:
        "bg-[var(--surface-raised)] p-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] gap-1",
    },
  },
  defaultVariants: {
    variant: "line",
  },
});

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsVariantContext = React.createContext<"line" | "segmented">("line");

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "line", children, ...props }, ref) => (
  <TabsVariantContext.Provider value={variant || "line"}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
        variant === "line" &&
          "relative pb-3 pt-2 text-[var(--text-secondary)] hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[var(--accent)] data-[state=active]:after:shadow-[0_0_8px_rgba(255,0,0,0.6)]",
        variant === "segmented" &&
          "px-3 py-1.5 rounded-[var(--radius-xs)] text-xs text-[var(--text-secondary)] hover:text-white data-[state=active]:bg-[var(--surface-elevated)] data-[state=active]:text-white data-[state=active]:shadow-elevation-1 data-[state=active]:border data-[state=active]:border-[var(--border-default)]",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
