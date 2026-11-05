"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  RotateRight01Icon,
  Calendar03Icon,
  AlertCircleIcon,
  BookOpen01Icon,
  Notification01Icon,
  Analytics01Icon,
  Brain02Icon,
  Tick02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getNotificationCategoryMeta } from "@/domain/notifications/eligibility";
import type {
  InAppNotification,
  NotificationCategory,
} from "@/domain/notifications/types";
import { cn } from "@/lib/utils";
import { notificationHref } from "../inbox";

function categoryIcon(category: NotificationCategory) {
  if (category.startsWith("revision")) return RotateRight01Icon;
  if (category.includes("aptitude")) return Brain02Icon;
  if (
    category.includes("assessment") ||
    category.includes("session") ||
    category.includes("plan")
  )
    return Calendar03Icon;
  if (category.includes("digest")) return BookOpen01Icon;
  if (category.includes("report")) return Analytics01Icon;
  if (
    category.includes("missed") ||
    category.includes("risk") ||
    category.includes("deadline")
  )
    return AlertCircleIcon;
  return Notification01Icon;
}

interface NotificationItemProps {
  notification: InAppNotification;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpen?: (notification: InAppNotification) => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  selectionDisabled?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onOpen,
  selected,
  onSelect,
  selectionDisabled,
  disabled,
  compact,
}: NotificationItemProps) {
  const unread = !n.readAt;
  const href = notificationHref(n.actionUrl);
  const date = new Date(n.createdAt);
  const validDate = !Number.isNaN(date.getTime());
  const titleClass = cn(
    "block w-full min-w-0 text-left text-[13px] leading-5 break-words [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:underline hover:underline underline-offset-4",
    unread ? "font-semibold text-white" : "font-medium text-[var(--text-secondary)]"
  );
  return (
    <div
      data-testid="notification-row"
      data-unread={unread}
      className={cn(
        "relative flex min-w-0 items-start gap-3 border-b border-[var(--border-subtle)] px-3 py-4 last:border-b-0 sm:px-4 transition-colors hover:bg-[var(--surface-hover)]",
        unread && "bg-white/[0.025]",
        selected && "bg-[var(--accent)]/[0.045]"
      )}
    >
      {onSelect && (
        <Checkbox
          aria-label={`Select ${n.title}`}
          checked={selected}
          disabled={selectionDisabled || disabled}
          onCheckedChange={onSelect}
          containerClassName="min-h-7 w-5"
        />
      )}
      <div
        className={cn(
          "relative mt-1 shrink-0",
          unread ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
        )}
      >
        <Icon icon={categoryIcon(n.category)} size={18} />
        {unread && (
          <span className="absolute -left-1 -top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--background)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-tertiary)]">
          <span>{getNotificationCategoryMeta(n.category).label}</span>
          <span aria-hidden="true">·</span>
          <time
            dateTime={validDate ? n.createdAt : undefined}
            title={validDate ? date.toLocaleString() : undefined}
          >
            {validDate
              ? formatDistanceToNowStrict(date, { addSuffix: true })
              : "Date unavailable"}
          </time>
          {unread && <span className="sr-only">Unread</span>}
        </div>
        {onOpen ? (
          <button type="button" className={titleClass} onClick={() => onOpen(n)}>
            {n.title}
          </button>
        ) : href ? (
          <Link
            href={href}
            onClick={() => {
              if (unread) onMarkRead?.(n.id);
            }}
            className={titleClass}
          >
            {n.title}
          </Link>
        ) : (
          <p className={titleClass}>{n.title}</p>
        )}
        <p
          className={cn(
            "mt-1 text-xs leading-5 text-[var(--text-secondary)] break-words [overflow-wrap:anywhere]",
            compact ? "line-clamp-2" : "line-clamp-1"
          )}
        >
          {n.body}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            disabled={disabled}
            aria-label={`Actions for ${n.title}`}
            title="Notification actions"
          >
            <Icon icon={MoreHorizontalIcon} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {unread && onMarkRead && (
            <DropdownMenuItem onSelect={() => onMarkRead(n.id)}>
              <Icon icon={Tick02Icon} size={15} className="mr-2" />
              Mark as read
            </DropdownMenuItem>
          )}
          {!unread && onMarkUnread && (
            <DropdownMenuItem onSelect={() => onMarkUnread(n.id)}>
              <Icon icon={Mail01Icon} size={15} className="mr-2" />
              Mark as unread
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onDelete(n.id)}>
                <Icon icon={Delete02Icon} size={15} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
