"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { getShellRoute } from "./navigation-config";
import { cn } from "@/lib/utils";
import { safeCatalogReturn } from "@/features/problems/navigation";
export function ContextBreadcrumb({ className }: { className?: string }) {
  const query = useSearchParams();
  const route = getShellRoute(usePathname(), query);
  return (
    <div className={cn("shell-context", route.parent && "is-deep", className)}>
      {route.parent && (
        <Link
          href={
            route.parent === "/practice/dsa"
              ? safeCatalogReturn(query.get("from"))
              : route.parent
          }
          className="shell-back"
          aria-label="Navigate back"
        >
          <Icon icon={ArrowLeft01Icon} size={18} aria-hidden="true" />
        </Link>
      )}
      <nav aria-label="Breadcrumb">
        <span className="shell-context-parent">{route.section.toUpperCase()}</span>
        <span className="shell-context-separator" aria-hidden="true">
          /
        </span>
        <span aria-current="page" className="shell-context-current">
          {route.label.toUpperCase()}
        </span>
      </nav>
    </div>
  );
}
