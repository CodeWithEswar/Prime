"use client";
import { Compass01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ShellPreparationContext } from "./types";
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? null
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
}
export function SidebarPreparationContext({
  context,
  collapsed,
  className,
}: {
  context: ShellPreparationContext | null;
  collapsed: boolean;
  className?: string;
}) {
  if (!context?.targetRole) return null;
  const date = context.targetDate ? formatDate(context.targetDate) : null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("shell-preparation", className)}
          tabIndex={collapsed ? 0 : undefined}
          aria-label={
            collapsed
              ? `Preparation target: ${context.targetRole}${date ? `, ${date}` : ""}`
              : undefined
          }
        >
          <span className="shell-preparation-symbol">
            <Icon icon={Compass01Icon} size={18} aria-hidden="true" />
          </span>
          <div className="shell-label">
            <div className="shell-target-label">
              <span>Target Goal</span>
              {date && <time dateTime={context.targetDate!}>{date}</time>}
            </div>
            <p>{context.targetRole}</p>
          </div>
        </div>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="shell-tooltip">
          {context.targetRole}
          {date ? ` · ${date}` : ""}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
