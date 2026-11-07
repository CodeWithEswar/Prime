"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RichParagraphProps {
  children?: React.ReactNode;
  className?: string;
}

export function RichParagraph({ children, className }: RichParagraphProps) {
  return (
    <p
      className={cn(
        "prime-md-paragraph my-3 text-[14px] sm:text-[15px] leading-[1.72] text-[#dedede] font-sans break-words text-pretty",
        className
      )}
    >
      {children}
    </p>
  );
}

