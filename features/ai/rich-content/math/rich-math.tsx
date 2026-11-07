"use client";

import * as React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

export interface RichMathProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function RichMath({ math, block = false, className }: RichMathProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(math, containerRef.current, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = math;
      }
    }
  }, [math, block]);

  if (block) {
    return (
      <div className={cn("overflow-x-auto scrollbar-thin py-2 my-2 text-center", className)}>
        <span ref={containerRef} className="inline-block" />
      </div>
    );
  }

  return <span ref={containerRef} className={cn("inline-block px-1", className)} />;
}

