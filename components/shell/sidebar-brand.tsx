"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { PrimeMark, PrimeWordmark } from "@/components/branding";
import { cn } from "@/lib/utils";
export function SidebarBrand({
  collapsed,
  className,
  action,
}: {
  collapsed: boolean;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("shell-brand", className)} data-compact={collapsed}>
      <Link href="/practice/dsa" aria-label="PRIME Home" className="shell-brand-link">
        <PrimeMark size={24} />
        <span className="shell-brand-wordmark" aria-hidden={collapsed}>
          {!collapsed && <PrimeWordmark size={17} />}
        </span>
      </Link>
      <span className="shell-brand-caption">PREPARATION WORKSPACE</span>
      {action}
    </div>
  );
}
