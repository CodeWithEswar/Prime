"use client";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function SidebarCollapse({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean;
  onToggle: (trigger: HTMLButtonElement) => void;
  className?: string;
}) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(event) => onToggle(event.currentTarget)}
          aria-label={label}
          aria-expanded={!collapsed}
          aria-controls="prime-sidebar-navigation"
          className={cn("shell-collapse", className)}
        >
          <Icon
            icon={collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon}
            size={19}
            aria-hidden="true"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side={collapsed ? "right" : "bottom"} className="shell-tooltip">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
