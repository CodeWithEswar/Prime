"use client";

import * as React from "react";
import { useId, createElement, type ReactNode } from "react";
import { extractText, headingSlug } from "@/features/ai/markdown/utils";
import { useRichContent } from "../rich-content-provider";
import { cn } from "@/lib/utils";

export interface RichHeadingProps {
  level: number;
  children: ReactNode;
}

export function RichHeading({ level, children }: RichHeadingProps) {
  const { isNarrow } = useRichContent();
  const idPrefix = useId().replace(/:/g, "");
  const text = extractText(children);
  const slug = headingSlug(text);
  const anchorId = `${idPrefix}-${slug}`;

  // Heading sizes tuned for readability, adapted when in narrow side panel
  const sizeClasses = {
    1: isNarrow ? "text-lg font-bold mt-4 mb-2" : "text-xl sm:text-2xl font-bold mt-6 mb-2.5",
    2: isNarrow ? "text-base font-bold mt-3.5 mb-2" : "text-lg sm:text-xl font-bold mt-5 mb-2",
    3: isNarrow ? "text-sm font-bold mt-3 mb-1.5" : "text-base sm:text-lg font-bold mt-4 mb-1.5",
    4: "text-sm font-semibold mt-3 mb-1 text-neutral-200",
    5: "text-xs font-semibold mt-2.5 mb-1 text-neutral-300",
    6: "text-xs font-medium mt-2 mb-1 text-neutral-400",
  }[level] || "text-base font-bold";

  return createElement(
    `h${level}`,
    {
      className: cn(
        "prime-md-heading font-mono text-white tracking-tight leading-snug scroll-mt-6 break-words",
        `prime-md-h${level}`,
        sizeClasses
      ),
      id: anchorId,
    },
    children
  );
}

