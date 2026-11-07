"use client";

import * as React from "react";
import { useRichContent } from "../rich-content-provider";
import { safeAILink } from "@/features/ai/markdown/utils";
import { cn } from "@/lib/utils";

export interface RichLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children?: React.ReactNode;
}

export function RichLink({ href, children, className, ...props }: RichLinkProps) {
  const { references } = useRichContent();

  if (!href) return <span>{children}</span>;

  const sanitized = safeAILink(href);
  if (!sanitized) return <span>{children}</span>;

  // Internal link security: must be explicitly supplied in references
  const isInternal = sanitized.startsWith("/");
  if (isInternal && !references.has(sanitized)) {
    return <span>{children}</span>;
  }

  const isExternal = sanitized.startsWith("https://") || sanitized.startsWith("http://");

  return (
    <a
      href={sanitized}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "font-medium transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#FF0000] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF0000]",
        isInternal ? "prime-entity-link text-[#FF4D4D] hover:text-[#FF6666]" : "prime-external-link text-[#60A5FA] hover:text-[#93C5FD]",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
