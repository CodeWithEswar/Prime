"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion";

export const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva("inline-flex items-center justify-center relative", {
  variants: {
    variant: {
      line: "border-b border-[var(--border-subtle)] w-full justify-start gap-4 sm:gap-6 bg-transparent p-0 rounded-none overflow-x-auto scrollbar-none flex-nowrap",
      segmented:
        "bg-[var(--surface-raised)] p-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] gap-1 overflow-x-auto scrollbar-none flex-nowrap",
    },
  },
  defaultVariants: {
    variant: "line",
  },
});

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  layoutId?: string;
}

interface TabsContextValue {
  variant: "line" | "segmented";
  layoutId: string;
}

const TabsVariantContext = React.createContext<TabsContextValue>({
  variant: "line",
  layoutId: "prime-ds-active-tab",
});

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  (
    { className, variant = "line", layoutId = "prime-ds-active-tab", children, ...props },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({
        variant: variant || "line",
        layoutId,
      }),
      [variant, layoutId]
    );

    return (
      <TabsVariantContext.Provider value={contextValue}>
        <TabsPrimitive.List
          ref={ref}
          className={cn(tabsListVariants({ variant, className }))}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </TabsVariantContext.Provider>
    );
  }
);
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { variant, layoutId } = React.useContext(TabsVariantContext);
  const [isActive, setIsActive] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Monitor Radix data-state attribute
  React.useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      setIsActive(el.getAttribute("data-state") === "active");
    });

    setIsActive(el.getAttribute("data-state") === "active");
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });

    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
        variant === "line" &&
          "min-h-[var(--control-height)] pb-2 pt-1 text-[var(--text-secondary)] hover:text-white data-[state=active]:text-white",
        variant === "segmented" &&
          "min-h-[var(--control-height-sm)] px-2.5 py-1 rounded-[var(--radius-xs)] text-xs text-[var(--text-secondary)] hover:text-white data-[state=active]:text-white z-10",
        className
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2 shrink-0">{children}</span>

      {/* Shared Gliding Active Indicator */}
      {isActive && variant === "line" && (
        <motion.span
          layoutId={`${layoutId}-line`}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff0000] shadow-[0_0_8px_rgba(255,0,0,0.6)]"
          transition={motionSpring.control}
        />
      )}

      {isActive && variant === "segmented" && (
        <motion.span
          layoutId={`${layoutId}-segmented`}
          className="absolute inset-0 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--border-default)] shadow-elevation-1"
          transition={motionSpring.control}
        />
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: motionDuration.fast, ease: motionEase.enter }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
