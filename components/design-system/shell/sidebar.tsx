"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { getGroupedNavigation } from "@/lib/design-system/registry";
import { motion, AnimatePresence } from "motion/react";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion";

export interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export function DesignSystemSidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const groups = React.useMemo(() => getGroupedNavigation(), []);

  // Track expanded subcategories (default all expanded)
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggleSubcategory = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <nav
      className={cn(
        "flex flex-col h-full w-full py-4 pr-3 overflow-y-auto prime-scrollbar-thin text-xs select-none",
        className
      )}
      aria-label="Design System Navigation"
    >
      {/* Overview root link */}
      <div className="mb-4 pb-2 border-b border-[var(--border-subtle)] px-2">
        <Link
          href="/design-system"
          onClick={onItemClick}
          className={cn(
            "group relative flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-xs)] font-medium transition-colors",
            pathname === "/design-system"
              ? "bg-[rgba(255,255,255,0.04)] text-white font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white"
          )}
        >
          {pathname === "/design-system" && (
            <motion.span
              layoutId="prime-ds-nav-indicator"
              className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#ff0000]"
              transition={motionSpring.control}
            />
          )}
          <span>System Overview</span>
          <span className="font-mono text-[10px] text-[var(--text-disabled)]">
            46 Items
          </span>
        </Link>
      </div>

      {/* Main Groups: Foundations, Components, Patterns */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.category} className="space-y-2">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              {group.title}
            </div>

            <div className="space-y-3">
              {group.subcategories.map((sub) => {
                const groupKey = `${group.category}-${sub.title}`;
                const isCollapsed = collapsed[groupKey] ?? false;

                return (
                  <div key={sub.title} className="space-y-1">
                    {/* Subcategory Header (collapsible) */}
                    <button
                      type="button"
                      onClick={() => toggleSubcategory(groupKey)}
                      className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold text-[rgba(255,255,255,0.60)] hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{sub.title}</span>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-disabled)]">
                        <span>{sub.items.length}</span>
                        <motion.span
                          animate={{ rotate: isCollapsed ? -90 : 0 }}
                          transition={{
                            duration: motionDuration.fast,
                            ease: motionEase.standard,
                          }}
                          className="inline-flex items-center"
                        >
                          <Icon icon={ArrowDown01Icon} size={12} className="opacity-50" />
                        </motion.span>
                      </div>
                    </button>

                    {/* Subcategory Items with AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          key={`sub-${groupKey}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: motionDuration.fast,
                            ease: motionEase.enter,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pl-1 border-l border-[rgba(255,255,255,0.06)] ml-2 py-0.5">
                            {sub.items.map((item) => {
                              const href = `/design-system/${item.category}/${item.slug}`;
                              const isActive = pathname === href;

                              return (
                                <Link
                                  key={item.slug}
                                  href={href}
                                  onClick={onItemClick}
                                  className={cn(
                                    "group relative flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-xs)] transition-colors",
                                    isActive
                                      ? "bg-[rgba(255,255,255,0.04)] text-white font-semibold"
                                      : "text-[rgba(255,255,255,0.60)] hover:bg-[var(--surface-hover)] hover:text-white"
                                  )}
                                >
                                  {isActive && (
                                    <motion.span
                                      layoutId="prime-ds-nav-indicator"
                                      className="absolute -left-[5px] top-1 bottom-1 w-0.5 rounded-full bg-[#ff0000]"
                                      transition={motionSpring.control}
                                    />
                                  )}
                                  <span className="truncate">{item.name}</span>
                                  {item.primitive && (
                                    <span className="text-[9px] font-mono text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 transition-opacity">
                                      {item.status === "stable" ? "" : item.status}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
