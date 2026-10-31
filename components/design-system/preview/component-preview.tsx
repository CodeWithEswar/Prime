"use client";

import * as React from "react";
import {
  EyeIcon,
  CodeIcon,
  LaptopMinimalIcon,
  Tablet01Icon,
  SmartPhone01Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion";
import { CodeHighlight } from "@/components/design-system/shared/code-highlight";

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
  const [replayKey, setReplayKey] = React.useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  const viewportWidthClasses = {
    desktop: "w-full",
    tablet:
      "w-full max-w-[768px] border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-md)] p-6 shadow-elevation-3 bg-[#010101]",
    mobile:
      "w-full max-w-[375px] border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-md)] p-4 shadow-elevation-3 bg-[#010101]",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[#030303]">
        {/* Left: Mode Switcher (Preview vs Code) & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {code && (
            <div className="h-8 inline-flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.10)] bg-[#000000] p-0.5 text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "relative h-full inline-flex items-center justify-center gap-1.5 px-2.5 rounded-[2px] transition-colors cursor-pointer select-none",
                  activeTab === "preview"
                    ? "text-white font-semibold"
                    : "text-white/45 hover:text-white"
                )}
                aria-label="Preview component"
              >
                {activeTab === "preview" && (
                  <motion.span
                    layoutId="preview-tab-pill"
                    className="absolute inset-0 bg-[#0a0a0a] border border-[rgba(255,255,255,0.14)] rounded-[2px]"
                    transition={motionSpring.control}
                  />
                )}
                <Icon icon={EyeIcon} size={13} className="relative z-10 shrink-0" />
                <span className="relative z-10 font-medium">Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={cn(
                  "relative h-full inline-flex items-center justify-center gap-1.5 px-2.5 rounded-[2px] transition-colors cursor-pointer select-none",
                  activeTab === "code"
                    ? "text-white font-semibold"
                    : "text-white/45 hover:text-white"
                )}
                aria-label="View component code"
              >
                {activeTab === "code" && (
                  <motion.span
                    layoutId="preview-tab-pill"
                    className="absolute inset-0 bg-[#0a0a0a] border border-[rgba(255,255,255,0.14)] rounded-[2px]"
                    transition={motionSpring.control}
                  />
                )}
                <Icon icon={CodeIcon} size={13} className="relative z-10 shrink-0" />
                <span className="relative z-10 font-medium">Code</span>
              </button>
            </div>
          )}

          {title && (
            <div className="flex items-center gap-2 min-w-0 pl-1">
              <span className="text-xs font-semibold text-white tracking-wide truncate">
                {title}
              </span>
              {description && (
                <span className="text-xs text-[var(--text-tertiary)] hidden xl:inline truncate">
                  — {description}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Viewport Controls, Background Swatch & Replay Button */}
        {activeTab === "preview" ? (
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 border-t border-[rgba(255,255,255,0.06)] sm:border-t-0 sm:pt-0 shrink-0">
            <div className="flex items-center gap-2">
              {/* Viewport Width Switcher with Device Icons */}
              <div className="h-8 inline-flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.10)] bg-[#000000] p-0.5 shrink-0">
                {[
                  {
                    key: "desktop",
                    icon: LaptopMinimalIcon,
                    label: "Desktop",
                    width: "100%",
                  },
                  { key: "tablet", icon: Tablet01Icon, label: "Tablet", width: "768px" },
                  {
                    key: "mobile",
                    icon: SmartPhone01Icon,
                    label: "Mobile",
                    width: "375px",
                  },
                ].map((vp) => (
                  <button
                    key={vp.key}
                    type="button"
                    onClick={() => setViewport(vp.key as "desktop" | "tablet" | "mobile")}
                    title={`${vp.label} (${vp.width})`}
                    className={cn(
                      "relative h-full inline-flex items-center justify-center px-2 sm:px-2.5 rounded-[2px] text-[11px] font-mono transition-colors cursor-pointer select-none",
                      viewport === vp.key
                        ? "text-white font-semibold"
                        : "text-white/40 hover:text-white"
                    )}
                    aria-label={`${vp.label} viewport`}
                  >
                    {viewport === vp.key && (
                      <motion.span
                        layoutId="preview-vp-pill"
                        className="absolute inset-0 bg-[#0a0a0a] border border-[rgba(255,255,255,0.14)] rounded-[2px]"
                        transition={motionSpring.control}
                      />
                    )}
                    <Icon icon={vp.icon} size={13} className="relative z-10 shrink-0" />
                    <span className="relative z-10 hidden xl:inline font-mono text-[10px] ml-1.5">
                      {vp.width}
                    </span>
                  </button>
                ))}
              </div>

              {/* Background Surface Swatch Switcher */}
              <div className="h-8 inline-flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.10)] bg-[#000000] p-0.5 shrink-0">
                {[
                  {
                    key: "canvas",
                    label: "Canvas",
                    color: "#000000",
                    border: "rgba(255,255,255,0.25)",
                  },
                  {
                    key: "surface",
                    label: "Surface",
                    color: "#030303",
                    border: "rgba(255,255,255,0.18)",
                  },
                  {
                    key: "raised",
                    label: "Raised",
                    color: "#060606",
                    border: "rgba(255,255,255,0.18)",
                  },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setBgMode(mode.key as "canvas" | "surface" | "raised")}
                    title={`Background: ${mode.label}`}
                    className={cn(
                      "relative h-full inline-flex items-center justify-center px-2 sm:px-2.5 rounded-[2px] text-[11px] font-mono transition-colors cursor-pointer select-none",
                      bgMode === mode.key
                        ? "text-white font-semibold"
                        : "text-white/40 hover:text-white"
                    )}
                    aria-label={`${mode.label} background surface`}
                  >
                    {bgMode === mode.key && (
                      <motion.span
                        layoutId="preview-bg-pill"
                        className="absolute inset-0 bg-[#0a0a0a] border border-[rgba(255,255,255,0.14)] rounded-[2px]"
                        transition={motionSpring.control}
                      />
                    )}
                    <span
                      className="relative z-10 h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: mode.color,
                        border: `1px solid ${mode.border}`,
                      }}
                    />
                    <span className="relative z-10 font-mono text-[10px] hidden xl:inline ml-1.5">
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Replay Animation Action Button */}
            <button
              type="button"
              onClick={handleReplay}
              title="Reset & Replay animations"
              className="h-8 w-8 inline-flex items-center justify-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.10)] bg-[#000000] text-white/50 hover:text-white hover:border-white/25 hover:bg-[#090909] transition-all cursor-pointer active:scale-95 shrink-0"
              aria-label="Replay animations"
            >
              <Icon icon={Refresh01Icon} size={13} className="shrink-0" />
            </button>
          </div>
        ) : (
          /* Code View Header info */
          <div className="h-8 flex items-center gap-2 ml-auto">
            <span className="font-mono text-[10px] text-white/40 tracking-wider hidden sm:inline">
              INTERACTIVE CODE INSPECTOR
            </span>
          </div>
        )}
      </div>

      {/* Main Preview / Code Stage with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === "preview" ? (
          <motion.div
            key={`stage-preview-${replayKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration.fast, ease: motionEase.enter }}
            className={cn(
              "p-4 sm:p-8 md:p-12 min-h-[220px] sm:min-h-[280px] flex items-center justify-center transition-colors relative overflow-x-auto",
              bgClasses
            )}
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Viewport Resizing container with layout animation (240–320ms) */}
            <motion.div
              layout
              transition={{ duration: motionDuration.slow, ease: motionEase.standard }}
              className={cn("mx-auto transition-all duration-300", viewportWidthClasses)}
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
            className="p-3 bg-[#000000]"
          >
            <CodeHighlight code={code || ""} language="TSX" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
