"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PanelLeftOpenIcon,
  Search01Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { ContextBreadcrumb } from "./context-breadcrumb";
import { getShellRoute } from "./navigation-config";
import type { ShellDayContext } from "./types";
import { cn } from "@/lib/utils";
import { WeatherHeaderIndicator } from "@/features/weather/components/weather-header-indicator";
import { AskPrime } from "@/features/ai/components/ask-prime";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
export function AppTopbar({
  dayContext,
  revisionDueCount = 0,
  onOpenSearch,
  sidebarOpen,
  onOpenSidebar,
  actions,
  className,
}: {
  dayContext: ShellDayContext | null;
  revisionDueCount?: number;
  onOpenSearch: (trigger?: HTMLElement) => void;
  sidebarOpen: boolean;
  onOpenSidebar: (trigger: HTMLButtonElement) => void;
  actions?: ReactNode;
  className?: string;
}) {
  const route = getShellRoute(usePathname(), useSearchParams());
  return (
    <header className={cn("shell-topbar", className)}>
      <div className="shell-topbar-context">
        <button
          type="button"
          className="shell-sidebar-trigger"
          aria-label="Open sidebar"
          aria-haspopup="dialog"
          aria-expanded={sidebarOpen}
          aria-controls={sidebarOpen ? "prime-sidebar-sheet" : undefined}
          onClick={(event) => onOpenSidebar(event.currentTarget)}
        >
          <Icon icon={PanelLeftOpenIcon} size={19} aria-hidden="true" />
        </button>
        <ContextBreadcrumb />
      </div>
      <button
        type="button"
        className="shell-command-trigger"
        onClick={(event) => onOpenSearch(event.currentTarget)}
        aria-label="Search PRIME"
        aria-haspopup="dialog"
      >
        <Icon icon={Search01Icon} size={17} aria-hidden="true" />
        <span>Search or go to…</span>
        <kbd>Ctrl K</kbd>
      </button>
      <div className="shell-topbar-actions">
        <AskPrime />
        <WeatherHeaderIndicator />
        <NotificationBell />
        {actions}
        {dayContext && (
          <span className="shell-day">
            <span>DAY {dayContext.currentDay}</span>
            <i>/</i>
            {dayContext.totalDays}
          </span>
        )}
        {revisionDueCount > 0 && (
          <Link
            href="/revision"
            className="shell-revision"
            aria-label={`${revisionDueCount} revisions due today`}
          >
            <Icon icon={RotateRight01Icon} size={17} aria-hidden="true" />
            <span>
              <b>{revisionDueCount}</b>
              <span className="shell-due-label"> due</span>
            </span>
          </Link>
        )}
      </div>
      <div className="shell-focus-trace" data-section={route.id} aria-hidden="true">
        <i />
      </div>
    </header>
  );
}
