"use client";

import * as React from "react";
import { Copy01Icon, Tick02Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface PromptSectionProps {
  prompt: string;
  componentName: string;
  className?: string;
}

export function PromptSection({ prompt, componentName, className }: PromptSectionProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="prompt"
      className={cn(
        "p-5 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.12)] bg-[#030303] space-y-4 shadow-elevation-1 scroll-mt-20",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--prime-accent-soft)] text-[#ff0000]">
            <Icon icon={SparklesIcon} size={14} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">AI Implementation Prompt</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Paste directly into AI coding agent instructions to produce exact{" "}
              {componentName} implementations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-xs)] border border-[var(--prime-accent-border)] bg-[var(--prime-accent-soft)] text-xs text-white hover:bg-[var(--prime-accent-border)] font-medium transition-colors"
        >
          <Icon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={14}
            className={copied ? "text-[#ff0000]" : ""}
          />
          <span>{copied ? "Prompt Copied!" : "Copy Prompt"}</span>
        </button>
      </div>

      <div className="p-4 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#000000] font-mono text-xs text-[rgba(255,255,255,0.85)] leading-relaxed whitespace-pre-wrap overflow-x-auto prime-scrollbar max-h-72">
        {prompt}
      </div>
    </div>
  );
}
