"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function RichListUl({ children, className }: React.HTMLAttributes<HTMLUListElement>) {
  const isTaskList = className?.includes("contains-task-list");
  return (
    <ul
      className={cn(
        "prime-md-list my-3 pl-6 space-y-1.5 text-[14px] sm:text-[15px] leading-relaxed text-[#dedede]",
        isTaskList ? "prime-md-task-list list-none pl-0 space-y-2" : "list-disc",
        className
      )}
    >
      {children}
    </ul>
  );
}

export function RichListOl({ children, start, className }: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      start={start}
      className={cn(
        "prime-md-list my-3 pl-6 space-y-1.5 list-decimal text-[14px] sm:text-[15px] leading-relaxed text-[#dedede]",
        className
      )}
    >
      {children}
    </ol>
  );
}

export function RichListLi({ children, className }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("leading-relaxed", className)}>
      {children}
    </li>
  );
}

export function RichTaskCheckbox({ checked }: { checked?: boolean }) {
  return (
    <input
      type="checkbox"
      checked={!!checked}
      disabled
      className="mr-2 h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-[#FF0000] align-middle cursor-default"
      aria-label={checked ? "Completed checklist item" : "Incomplete checklist item"}
    />
  );
}

