"use client";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarCollapse } from "./sidebar-collapse";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarPreparationContext } from "./sidebar-preparation-context";
import { SidebarUser } from "./sidebar-user";
import { cn } from "@/lib/utils";
import type { ShellUserData, ShellPreparationContext } from "./types";
export function AppSidebar({
  user,
  preparationContext,
  revisionDueCount = 0,
  collapsed,
  onToggleCollapse,
  onOpenShortcuts,
  className,
}: {
  user: ShellUserData | null;
  preparationContext: ShellPreparationContext | null;
  revisionDueCount?: number;
  collapsed: boolean;
  onToggleCollapse: (trigger?: HTMLElement) => void;
  onOpenShortcuts?: (trigger?: HTMLElement) => void;
  className?: string;
}) {
  return (
    <aside
      aria-label="Application Sidebar"
      className={cn("shell-sidebar", className)}
      data-compact={collapsed}
    >
      <SidebarBrand
        collapsed={collapsed}
        action={<SidebarCollapse collapsed={collapsed} onToggle={onToggleCollapse} />}
      />
      <SidebarNavigation
        collapsed={collapsed}
        revisionDueCount={revisionDueCount}
        onOpenSearch={onOpenShortcuts}
      />
      <div className="shell-sidebar-bottom">
        <SidebarPreparationContext context={preparationContext} collapsed={collapsed} />
        <SidebarUser
          user={user}
          collapsed={collapsed}
          onOpenShortcuts={onOpenShortcuts}
        />
      </div>
    </aside>
  );
}
