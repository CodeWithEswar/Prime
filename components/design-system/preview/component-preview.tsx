"use client";

import * as React from "react";
import { Tick02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion";

export interface ComponentPreviewProps {
  children: React.ReactNode;
  code?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ComponentPreview({
  children,
  code,
  title,
  description,
  className,
}: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">("preview");
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [bgMode, setBgMode] = React.useState<"canvas" | "surface" | "raised">("canvas");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewportWidthClasses = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  }[viewport];

  const bgClasses = {
    canvas: "bg-[#000000]",
    surface: "bg-[#030303]",
    raised: "bg-[#060606]",
  }[bgMode];

  return (
    <div
      id="preview"
      className={cn(
        "rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[#000000] overflow-hidden shadow-elevation-2 scroll-mt-20",
        className
      )}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[#030303]">
        <div className="flex items-center gap-2">
          {title && <span className="text-xs font-semibold text-white">{title}</span>}
          {description && (
            <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">
              — {description}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Background Mode Selector */}
          <div className="flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#000000] p-0.5 text-[10px] font-mono">
            {(["canvas", "surface", "raised"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBgMode(mode)}
                className={cn(
                  "relative px-2 py-0.5 rounded-[2px] capitalize transition-colors cursor-pointer",
                  bgMode === mode
                    ? "text-white font-semibold shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                {bgMode === mode && (
                  <motion.span
                    layoutId="preview-bg-indicator"
                    className="absolute inset-0 bg-[#090909] rounded-[2px]"
                    transition={motionSpring.control}
                  />
                )}
                <span className="relative z-10">{mode}</span>
              </button>
            ))}
          </div>

          {/* Viewport Width Selector */}
          <div className="hidden sm:flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#000000] p-0.5 text-[10px] font-mono">
            {(["desktop", "tablet", "mobile"] as const).map((vp) => (
              <button
                key={vp}
                type="button"
                onClick={() => setViewport(vp)}
                className={cn(
                  "relative px-2 py-0.5 rounded-[2px] capitalize transition-colors cursor-pointer",
                  viewport === vp
                    ? "text-white font-semibold shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                {viewport === vp && (
                  <motion.span
                    layoutId="preview-vp-indicator"
                    className="absolute inset-0 bg-[#090909] rounded-[2px]"
                    transition={motionSpring.control}
                  />
                )}
                <span className="relative z-10">{vp}</span>
              </button>
            ))}
          </div>

          {/* Preview vs Code Tab Switcher */}
          {code && (
            <div className="flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#000000] p-0.5 text-[10px] font-mono">
              {(["preview", "code"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-2 py-0.5 rounded-[2px] capitalize transition-colors cursor-pointer",
                    activeTab === tab
                      ? "text-white font-semibold"
                      : "text-[var(--text-tertiary)] hover:text-white"
                  )}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="preview-tab-indicator"
                      className="absolute inset-0 bg-[#090909] rounded-[2px]"
                      transition={motionSpring.control}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview / Code Stage with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === "preview" ? (
          <motion.div
            key="stage-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration.fast, ease: motionEase.enter }}
            className={cn(
              "p-8 sm:p-12 min-h-[260px] flex items-center justify-center transition-colors relative overflow-x-auto",
              bgClasses
            )}
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {/* Viewport Resizing container with layout animation (240–320ms) */}
            <motion.div
              layout
              transition={{ duration: motionDuration.slow, ease: motionEase.standard }}
              className={cn("mx-auto", viewportWidthClasses)}
            >
              <div className="flex items-center justify-center w-full">{children}</div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="stage-code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration.fast, ease: motionEase.enter }}
            className="relative p-4 bg-[#020202] text-xs font-mono overflow-x-auto prime-scrollbar text-white/90"
          >
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-4 top-4 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.12)] bg-[#060606] text-[11px] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              <Icon
                icon={copied ? Tick02Icon : Copy01Icon}
                size={13}
                className={copied ? "text-[#ff0000]" : "text-[var(--text-tertiary)]"}
              />
              <span>{copied ? "Copied" : "Copy TSX"}</span>
            </button>
            <pre className="pr-20">
              <code>{code}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
