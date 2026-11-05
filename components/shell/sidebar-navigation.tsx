"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RouteTerminal } from "./sidebar-route-rail";
import { AVAILABLE_NAVIGATION_GROUPS, isRouteActive } from "./navigation-config";
import { cn } from "@/lib/utils";
import { useAI } from "@/features/ai/ai-provider";
export function SidebarNavigation({
  collapsed,
  revisionDueCount = 0,
  onNavigate,
  onOpenSearch,
  className,
  id = "prime-sidebar-navigation",
}: {
  collapsed: boolean;
  revisionDueCount?: number;
  onNavigate?: () => void;
  onOpenSearch?: (trigger?: HTMLElement) => void;
  className?: string;
  id?: string;
}) {
  const pathname = usePathname(),
    query = useSearchParams();
  const ai = useAI();
  return (
    <nav
      id={id}
      aria-label="Primary Navigation"
      className={cn("shell-nav prime-scrollbar-thin", className)}
    >
      {AVAILABLE_NAVIGATION_GROUPS.map((group) => (
        <div
          className="shell-nav-group"
          key={group.id}
          role="group"
          aria-label={group.label}
        >
          <span className="shell-group-label shell-label">{group.label}</span>
          <div className="shell-route-list">
            {group.items
              .filter((item) => !item.aiOnly || ai?.enabled)
              .map((item) => {
                const active = isRouteActive(pathname, item, query),
                  due = item.attention === "revision" && revisionDueCount > 0;
                const link = (
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-label={`${item.label}${due ? `, ${revisionDueCount} revisions due` : ""}`}
                    className={cn("shell-nav-link", active && "is-active")}
                  >
                    {active && <RouteTerminal />}
                    <span className="shell-nav-icon">
                      <Icon icon={item.icon} size={19} aria-hidden="true" />
                    </span>
                    <span className="shell-nav-text shell-label">{item.label}</span>
                    {due && (
                      <span
                        className={cn("shell-attention", collapsed && "is-compact")}
                        aria-hidden="true"
                      >
                        {revisionDueCount}
                      </span>
                    )}
                  </Link>
                );
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="shell-tooltip">
                        {item.label}
                        {due ? ` · ${revisionDueCount} due` : ""}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
          </div>
        </div>
      ))}
      {onOpenSearch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="shell-nav-link shell-nav-search"
              onClick={(event) => onOpenSearch(event.currentTarget)}
              aria-label="Search PRIME"
              aria-haspopup="dialog"
            >
              <span className="shell-nav-icon">
                <Icon icon={Search01Icon} size={19} aria-hidden="true" />
              </span>
              <span className="shell-nav-text shell-label">Search</span>
              <kbd className="shell-label">/</kbd>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="shell-tooltip">
              Search PRIME
            </TooltipContent>
          )}
        </Tooltip>
      )}
    </nav>
  );
}
