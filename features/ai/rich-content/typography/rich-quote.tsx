"use client";

import * as React from "react";
import { extractText } from "@/features/ai/markdown/utils";
import { RichCallout, type CalloutType } from "../callouts/rich-callout";
import { cn } from "@/lib/utils";

export interface RichQuoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  children?: React.ReactNode;
}

export function RichQuote({ children, className, ...props }: RichQuoteProps) {
  const rawText = extractText(children).trim();

  // Detect GitHub-style alert callout: [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
  const match = rawText.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DEFINITION|EXAMPLE|KEY-TAKEAWAY)\]/i);

  if (match) {
    const alertType = match[1].toLowerCase() as CalloutType;

    // Filter out the alert tag from the children rendering
    const cleanChildren = React.Children.map(children, (child, idx) => {
      if (idx === 0 && React.isValidElement<{ children?: React.ReactNode }>(child)) {
        const text = extractText(child.props.children);
        const replaced = text.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DEFINITION|EXAMPLE|KEY-TAKEAWAY)\]\s*/i, "");
        return replaced ? <p>{replaced}</p> : null;
      }
      return child;
    });

    return <RichCallout type={alertType}>{cleanChildren}</RichCallout>;
  }

  return (
    <blockquote
      className={cn(
        "prime-md-quote my-4 border-l-2 border-[#FF0000]/60 bg-white/[0.02] pl-4 py-2 pr-3 text-neutral-300 italic text-[14px] leading-relaxed rounded-r-md",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

