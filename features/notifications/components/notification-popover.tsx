"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Tick02Icon, Settings02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import { NotificationEmptyState } from "./notification-empty-state";
import type { NotificationTab } from "../types";

function subscribe(listener: () => void) {
  const media = window.matchMedia("(max-width: 639px)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const mobileSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
const serverSnapshot = () => false;

export function NotificationPopover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>("all");
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const inbox = useNotifications({ tab, limit: 8, enabled: open });
  const panel = (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            {inbox.countAvailable ? (
              <span>{`${inbox.unreadCount} unread`}</span>
            ) : inbox.isError ? (
              <span>Inbox unavailable</span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Icon
                  icon={Loading03Icon}
                  size={12}
                  className="animate-spin text-[var(--text-secondary)] shrink-0"
                />
                <span>Loading…</span>
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Mark all notifications as read"
          title="Mark all as read"
          disabled={!inbox.unreadCount || inbox.isUpdating}
          loading={inbox.isMarkingAllRead}
          onClick={inbox.markAllAsRead}
        >
          <Icon icon={Tick02Icon} size={16} />
        </Button>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as NotificationTab)}
        className="border-b border-[var(--border-subtle)] p-3"
      >
        <TabsList
          variant="segmented"
          layoutId="notification-preview-tabs"
          className="grid w-full grid-cols-3"
          aria-label="Notification views"
        >
          <TabsTrigger value="all">Inbox</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
      </Tabs>
      {inbox.mutationError && (
        <p role="alert" className="px-4 py-2 text-xs text-red-300">
          {inbox.mutationError}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {inbox.isLoading ? (
          <div role="status" aria-label="Loading notifications" className="space-y-4 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : inbox.isError ? (
          <div role="alert" className="space-y-3 p-8 text-center">
            <p className="text-xs">Couldn&apos;t load notifications.</p>
            <Button variant="outline" size="sm" onClick={() => void inbox.refetch()}>
              Try again
            </Button>
          </div>
        ) : !inbox.notifications.length ? (
          <NotificationEmptyState tab={tab} />
        ) : (
          inbox.notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              compact
              disabled={inbox.isUpdating}
              onMarkRead={inbox.markAsRead}
              onMarkUnread={inbox.markAsUnread}
            />
          ))
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border-subtle)] p-3">
        <Button asChild variant="secondary" size="sm">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            Open inbox
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon-sm"
          aria-label="Notification preferences"
          title="Notification preferences"
        >
          <Link href="/settings/notifications" onClick={() => setOpen(false)}>
            <Icon icon={Settings02Icon} size={16} />
          </Link>
        </Button>
      </div>
    </>
  );

  if (mobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          className="flex h-dvh w-full flex-col gap-0 p-0 pt-10 sm:max-w-none"
          aria-describedby="notification-sheet-description"
        >
          <SheetTitle className="sr-only">Notification inbox</SheetTitle>
          <SheetDescription id="notification-sheet-description" className="sr-only">
            Your latest preparation updates and reminders.
          </SheetDescription>
          {panel}
        </SheetContent>
      </Sheet>
    );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="flex max-h-[min(620px,calc(100dvh-100px))] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border-[var(--border-default)] bg-[var(--background)] p-0 shadow-elevation-4"
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}
