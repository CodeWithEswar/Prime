"use client";

import * as React from "react";
import { Tick02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

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
                  "px-2 py-0.5 rounded-[2px] capitalize transition-colors",
                  bgMode === mode
                    ? "bg-[#090909] text-white font-semibold shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                {mode}
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
                  "px-2 py-0.5 rounded-[2px] capitalize transition-colors",
                  viewport === vp
                    ? "bg-[#090909] text-white font-semibold shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                {vp}
              </button>
            ))}
          </div>

          {/* Preview vs Code Tab Switcher */}
          {code && (
            <div className="flex items-center rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#000000] p-0.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-2 py-0.5 rounded-[2px] transition-colors",
                  activeTab === "preview"
                    ? "bg-[#090909] text-white font-semibold"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={cn(
                  "px-2 py-0.5 rounded-[2px] transition-colors",
                  activeTab === "code"
                    ? "bg-[#090909] text-white font-semibold"
                    : "text-[var(--text-tertiary)] hover:text-white"
                )}
              >
                Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Preview / Code Stage */}
      {activeTab === "preview" ? (
        <div
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
          <div
            className={cn("mx-auto transition-all duration-200", viewportWidthClasses)}
          >
            <div className="flex items-center justify-center w-full">{children}</div>
          </div>
        </div>
      ) : (
        <div className="relative p-4 bg-[#020202] text-xs font-mono overflow-x-auto prime-scrollbar text-white/90">
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-4 top-4 flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.12)] bg-[#060606] text-[11px] text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <Icon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={13}
              className={copied ? "text-[#ff0000]" : ""}
            />
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
          <pre className="pr-20 leading-relaxed">{code}</pre>
        </div>
      )}
    </div>
  );
}
