import * as React from "react";
import Link from "next/link";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export interface PrevNextProps {
  prev?: { name: string; href: string };
  next?: { name: string; href: string };
}

export function DesignSystemPrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Previous and Next components"
      className="pt-10 mt-12 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1.5 p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#070707] transition-all"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-[#ff0000] transition-colors">
            <Icon icon={ArrowLeft01Icon} size={13} />
            <span>PREVIOUS</span>
          </div>
          <span className="text-sm font-semibold text-white group-hover:translate-x-0.5 transition-transform">
            {prev.name}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1.5 p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#070707] transition-all text-left sm:text-right"
        >
          <div className="flex items-center justify-start sm:justify-end gap-1.5 text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-[#ff0000] transition-colors">
            <span>NEXT</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </div>
          <span className="text-sm font-semibold text-white group-hover:-translate-x-0.5 transition-transform">
            {next.name}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
