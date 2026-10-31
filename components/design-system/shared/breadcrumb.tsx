import * as React from "react";
import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export interface BreadcrumbProps {
  category?: string;
  subcategory?: string;
  name?: string;
}

export function DesignSystemBreadcrumb({ category, subcategory, name }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-tertiary)]"
    >
      <Link
        href="/design-system"
        className="text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        Design System
      </Link>

      {category && (
        <>
          <Icon icon={ArrowRight01Icon} size={11} className="opacity-40" />
          <span className="capitalize text-[var(--text-secondary)]">{category}</span>
        </>
      )}

      {subcategory && (
        <>
          <Icon icon={ArrowRight01Icon} size={11} className="opacity-40" />
          <span className="text-[var(--text-secondary)]">{subcategory}</span>
        </>
      )}

      {name && (
        <>
          <Icon icon={ArrowRight01Icon} size={11} className="opacity-40" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
            {name}
          </span>
        </>
      )}
    </nav>
  );
}
