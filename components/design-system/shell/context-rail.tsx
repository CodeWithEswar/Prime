"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RegistryItem } from "@/lib/design-system/types";
import { motion } from "motion/react";
import { motionSpring } from "@/lib/motion";

export interface ContextRailProps {
  item?: RegistryItem;
  sections?: readonly string[];
  className?: string;
}

export function DesignSystemContextRail({ item, sections, className }: ContextRailProps) {
  const itemSections = item?.sections;

  // Raw candidate section IDs from prop or registry
  const candidateSections = React.useMemo(() => {
    if (sections && sections.length > 0) return Array.from(sections);
    if (itemSections && itemSections.length > 0) return Array.from(itemSections);
    return [
      "preview",
      "description",
      "anatomy",
      "attributes",
      "accessibility",
      "usage",
      "prompt",
    ];
  }, [sections, itemSections]);

  // Only track and render sections that actually exist in the DOM
  const [validSections, setValidSections] = React.useState<string[]>(candidateSections);
  const [activeId, setActiveId] = React.useState<string>(
    candidateSections[0] || "preview"
  );
  const isClickingRef = React.useRef(false);
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validate DOM elements on client mount and sort in DOM order
  React.useEffect(() => {
    const checkElements = () => {
      const elements = candidateSections
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length > 0) {
        elements.sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
        const orderedIds = elements.map((el) => el.id);
        setValidSections(orderedIds);
        setActiveId((prev) => (orderedIds.includes(prev) ? prev : orderedIds[0]));
      } else {
        // Fallback: discover any main section / preview element with an ID
        const found = Array.from(
          document.querySelectorAll<HTMLElement>(
            "main section[id], main [id='preview'], main [id='prompt']"
          )
        )
          .map((el) => el.id)
          .filter(Boolean);

        if (found.length > 0) {
          setValidSections(found);
          setActiveId((prev) => (found.includes(prev) ? prev : found[0]));
        }
      }
    };

    checkElements();
    const rafId = requestAnimationFrame(checkElements);
    return () => cancelAnimationFrame(rafId);
  }, [candidateSections]);

  // High-precision scroll spy with active section calculation
  React.useEffect(() => {
    if (validSections.length === 0) return;

    const handleScroll = () => {
      // Don't fight smooth scroll animation when user explicitly clicked a link
      if (isClickingRef.current) return;

      const headerOffset = 120;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. Bottom of page special case: Activate the last section
      if (scrollY + windowHeight >= documentHeight - 60) {
        setActiveId(validSections[validSections.length - 1]);
        return;
      }

      // 2. Top of page special case: Activate the first section
      if (scrollY < 60) {
        setActiveId(validSections[0]);
        return;
      }

      // 3. Find the section currently in reading focus (closest to top below header)
      let current = validSections[0];

      for (let i = 0; i < validSections.length; i++) {
        const secId = validSections[i];
        const el = document.getElementById(secId);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        // If the section top has scrolled past or is near the header offset
        if (rect.top <= headerOffset) {
          current = secId;
        } else {
          break; // Sections are sequential in the DOM
        }
      }

      setActiveId(current);
    };

    // Initial check
    handleScroll();

    const onUserScrollInterrupt = () => {
      if (isClickingRef.current) {
        isClickingRef.current = false;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("wheel", onUserScrollInterrupt, { passive: true });
    window.addEventListener("touchmove", onUserScrollInterrupt, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("wheel", onUserScrollInterrupt);
      window.removeEventListener("touchmove", onUserScrollInterrupt);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [validSections]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, secId: string) => {
    e.preventDefault();
    setActiveId(secId);
    isClickingRef.current = true;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, 800);

    const el = document.getElementById(secId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
      window.history.replaceState(null, "", `#${secId}`);
    }
  };

  const formatSectionLabel = (id: string) => {
    const labels: Record<string, string> = {
      preview: "Interactive Preview",
      description: "Overview",
      anatomy: "Anatomy",
      scale: "Token Scale",
      tokens: "Tokens",
      variants: "Variants",
      states: "States",
      attributes: "Component API",
      accessibility: "Accessibility",
      keyboard: "Keyboard",
      usage: "Usage Guidelines",
      dodont: "Do & Don't",
      prompt: "AI Prompt",
    };

    return (
      labels[id] ||
      id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  };

  return (
    <aside
      className={cn(
        "hidden xl:block w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto prime-scrollbar-thin space-y-6 text-xs select-none pr-2",
        className
      )}
    >
      {/* Table of Contents */}
      {validSections.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-bold px-1">
            On this page
          </div>
          <div className="space-y-0.5 border-l border-[rgba(255,255,255,0.07)] pl-2">
            {validSections.map((secId) => {
              const isActive = activeId === secId;

              return (
                <a
                  key={secId}
                  href={`#${secId}`}
                  onClick={(e) => handleLinkClick(e, secId)}
                  className={cn(
                    "relative block py-1 px-1.5 rounded-[var(--radius-xs)] font-medium transition-colors cursor-pointer",
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
              <span className="text-white">Verified</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
