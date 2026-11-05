"use client";

import { Notification02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useUnreadNotificationsCount } from "../hooks/use-unread-count";
import { NotificationPopover } from "./notification-popover";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const unreadCount = useUnreadNotificationsCount();

  return (
    <NotificationPopover>
      <Button
        variant="outline"
        size="icon-sm"
        type="button"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        className={cn(
          "relative text-[var(--text-secondary)]",
          unreadCount > 0 && "text-white",
          className
        )}
      >
        <Icon icon={Notification02Icon} size={16} />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-semibold tabular-nums text-white ring-2 ring-[var(--background)]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </NotificationPopover>
  );
}
