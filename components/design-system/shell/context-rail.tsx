"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RegistryItem } from "@/lib/design-system/types";
import { motion } from "motion/react";
import { motionSpring } from "@/lib/motion";

export interface ContextRailProps {
  item?: RegistryItem;
  sections?: readonly string[];
}

export function DesignSystemContextRail({ item, sections }: ContextRailProps) {
  const activeSections = React.useMemo(
    () => sections || item?.sections || [],
    [sections, item?.sections]
  );
  const [activeId, setActiveId] = React.useState<string>(activeSections[0] || "preview");

  // IntersectionObserver for active section tracking
  React.useEffect(() => {
    if (activeSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0% -65% 0%",
        threshold: 0.1,
      }
    );

    activeSections.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSections]);

  const formatSectionLabel = (id: string) => {
    return id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <aside className="space-y-6 text-xs select-none sticky top-20">
      {/* Table of Contents */}
      {activeSections.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-bold px-1">
            On this page
          </div>
          <div className="space-y-0.5 border-l border-[rgba(255,255,255,0.07)] pl-2">
            {activeSections.map((secId) => {
              const isActive = activeId === secId;

              return (
                <a
                  key={secId}
                  href={`#${secId}`}
                  className={cn(
                    "relative block py-1 px-1.5 rounded-[var(--radius-xs)] font-medium transition-colors",
                    isActive
                      ? "text-white font-semibold"
                      : "text-[var(--text-secondary)] hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="prime-ds-toc-indicator"
                      className="absolute -left-[9px] top-1.5 bottom-1.5 w-0.5 bg-[#ff0000] rounded-full"
                      transition={motionSpring.control}
                    />
                  )}
                  {formatSectionLabel(secId)}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Component Metadata Card */}
      {item && (
        <div className="p-3.5 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2.5 shadow-elevation-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
            Component Info
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Status:</span>
              <span className="text-[#ff0000] font-bold uppercase">{item.status}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Category:</span>
              <span className="text-white capitalize">{item.category}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Subcategory:</span>
              <span className="text-white">{item.subcategory}</span>
            </div>

            {item.primitive && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Primitive:</span>
                <span className="text-white truncate max-w-[120px] text-right">
                  {item.primitive}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Client Component:</span>
              <span className="text-white">{item.clientComponent ? "Yes" : "No"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Accessibility:</span>
              <span className="text-emerald-400">Verified</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
