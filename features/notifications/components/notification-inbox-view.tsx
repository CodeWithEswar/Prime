"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Tick02Icon,
  Settings02Icon,
  Notification01Icon,
  Mail01Icon,
  Calendar03Icon,
  Delete02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getNotificationCategoryMeta } from "@/domain/notifications/eligibility";
import type {
  InAppNotification,
  NotificationCategory,
} from "@/domain/notifications/types";
import { useNotifications } from "../hooks/use-notifications";
import { useNotificationPreferences } from "../hooks/use-notification-preferences";
import { NotificationItem } from "./notification-item";
import { NotificationEmptyState } from "./notification-empty-state";
import {
  notificationCategories,
  notificationDayGroup,
  notificationHref,
  type InboxOperation,
} from "../inbox";
import type { NotificationTab } from "../types";
import { cn } from "@/lib/utils";

export const inboxTabs = [
  { id: "all", label: "Inbox", icon: Notification01Icon },
  { id: "unread", label: "Unread", icon: Mail01Icon },
  { id: "reminders", label: "Reminders", icon: Calendar03Icon },
] as const;

export function NotificationInboxView() {
  const [tab, setTab] = useState<NotificationTab>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [detail, setDetail] = useState<InAppNotification | null>(null);
  const [message, setMessage] = useState("");
  const { preferences } = useNotificationPreferences();
  const timeZone =
    preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const inbox = useNotifications({
    tab,
    category: category === "all" ? undefined : (category as NotificationCategory),
    search: query,
    limit: 20,
  });
  const allRef = useRef<HTMLInputElement>(null);
  const visibleSelected = selected.filter((id) =>
    inbox.notifications.some((n) => n.id === id)
  );
  const selectable = inbox.notifications.slice(0, 50);
  const allSelected =
    selectable.length > 0 && selectable.every((n) => visibleSelected.includes(n.id));
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (allRef.current)
      allRef.current.indeterminate = visibleSelected.length > 0 && !allSelected;
  }, [allSelected, visibleSelected.length]);

  function filter(nextTab: NotificationTab, nextCategory = category) {
    setTab(nextTab);
    setCategory(nextCategory);
    setSelected([]);
    setMessage("");
  }
  async function update(ids: string[], operation: InboxOperation) {
    try {
      const updated = await inbox.updateSelected(ids, operation);
      setSelected((current) => current.filter((id) => !updated.includes(id)));
      setDeleting([]);
      setMessage(
        operation === "delete"
          ? `${updated.length} notification${updated.length === 1 ? "" : "s"} deleted.`
          : `${updated.length} notification${updated.length === 1 ? "" : "s"} marked as ${operation}.`
      );
    } catch {
      /* The hook keeps the rows and exposes the action error. */
    }
  }
  const grouped = new Map<string, InAppNotification[]>();
  for (const row of inbox.notifications) {
    const key = notificationDayGroup(row.createdAt, timeZone);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }
  const actionHref = notificationHref(detail?.actionUrl);

  return (
    <div className="@container min-w-0" data-testid="notification-inbox">
      <div className="grid min-w-0 gap-5 @min-[54rem]:grid-cols-[180px_minmax(0,1fr)] @min-[54rem]:gap-8">
        <aside className="hidden @min-[54rem]:block">
          <p className="mb-3 px-3 text-xs font-medium text-[var(--text-tertiary)]">
            Your notifications
          </p>
          <nav aria-label="Inbox views" className="space-y-1">
            {inboxTabs.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                onClick={() => filter(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={cn(
                  "relative w-full justify-start border-transparent text-[var(--text-secondary)]",
                  tab === item.id &&
                    "border-[var(--border-default)] bg-[var(--surface-raised)] text-white before:absolute before:-left-px before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--accent)]"
                )}
              >
                <Icon icon={item.icon} size={16} />
                {item.label}
                {item.id === "unread" && (
                  <span className="ml-auto text-xs tabular-nums text-[var(--text-secondary)]">
                    {inbox.countAvailable ? inbox.unreadCount : "—"}
                  </span>
                )}
              </Button>
            ))}
          </nav>
          <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/settings/notifications">
                <Icon icon={Settings02Icon} size={15} />
                Preferences
              </Link>
            </Button>
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                {inboxTabs.find((t) => t.id === tab)?.label}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {inbox.countAvailable
                  ? `${inbox.unreadCount} unread notification${inbox.unreadCount === 1 ? "" : "s"}`
                  : inbox.isError
                    ? "Inbox unavailable"
                    : "Loading your inbox…"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!inbox.unreadCount || inbox.isUpdating}
                loading={inbox.isMarkingAllRead}
                onClick={inbox.markAllAsRead}
              >
                <Icon icon={Tick02Icon} size={15} />
                Mark all read
              </Button>
              <Button
                asChild
                variant="outline"
                size="icon-sm"
                className="@min-[54rem]:hidden"
                title="Notification preferences"
                aria-label="Notification preferences"
              >
                <Link href="/settings/notifications">
                  <Icon icon={Settings02Icon} size={15} />
                </Link>
              </Button>
            </div>
          </div>
          <Tabs
            value={tab}
            onValueChange={(value) => filter(value as NotificationTab)}
            className="@min-[54rem]:hidden"
          >
            <TabsList
              variant="segmented"
              layoutId="notification-inbox-views"
              className="grid w-full grid-cols-3"
              aria-label="Inbox views"
            >
              {inboxTabs.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid min-w-0 gap-2 @min-[32rem]:grid-cols-[minmax(0,1fr)_200px]">
            <SearchInput
              aria-label="Search notifications"
              placeholder="Search your inbox…"
              maxLength={100}
              shortcut=""
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelected([]);
              }}
              onClear={() => {
                setSearch("");
                setSelected([]);
              }}
            />
            <Select value={category} onValueChange={(value) => filter(tab, value)}>
              <SelectTrigger aria-label="Notification category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {notificationCategories.map((key) => (
                  <SelectItem value={key} key={key}>
                    {getNotificationCategoryMeta(key).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {inbox.mutationError && (
            <p
              role="alert"
              className="rounded-md border border-red-500/25 bg-red-500/5 p-3 text-xs text-red-300"
            >
              {inbox.mutationError}
            </p>
          )}
          <span className="sr-only" role="status">
            {message}
          </span>
          <Card elevation="base" className="min-w-0 overflow-hidden">
            <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Checkbox
                  ref={allRef}
                  aria-label="Select visible notifications"
                  checked={allSelected}
                  disabled={!selectable.length || inbox.isUpdating}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? selectable.map((n) => n.id) : [])
                  }
                  containerClassName="min-h-7 w-5"
                />
                <span className="text-xs text-[var(--text-secondary)]">
                  {visibleSelected.length
                    ? `${visibleSelected.length} selected`
                    : "Select notifications"}
                </span>
              </div>
              {visibleSelected.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={inbox.isUpdating}>
                      <Icon icon={MoreHorizontalIcon} size={16} />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => void update(visibleSelected, "read")}
                    >
                      <Icon icon={Tick02Icon} size={15} className="mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => void update(visibleSelected, "unread")}
                    >
                      <Icon icon={Mail01Icon} size={15} className="mr-2" />
                      Mark as unread
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onSelect={() => setDeleting(visibleSelected)}
                    >
                      <Icon icon={Delete02Icon} size={15} className="mr-2" />
                      Delete selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Newest first
                </span>
              )}
            </div>
            {inbox.isLoading ? (
              <div
                role="status"
                aria-label="Loading notifications"
                className="divide-y divide-[var(--border-subtle)]"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div className="space-y-3 p-5" key={i}>
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : inbox.isError && !inbox.notifications.length ? (
              <div role="alert" className="space-y-3 px-5 py-12 text-center">
                <p className="text-sm">Couldn&apos;t load your inbox</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your notifications haven&apos;t been changed.
                </p>
                <Button variant="outline" size="sm" onClick={() => void inbox.refetch()}>
                  Try again
                </Button>
              </div>
            ) : !inbox.notifications.length ? (
              <NotificationEmptyState
                tab={tab}
                message={
                  query || category !== "all"
                    ? "Try another search or category."
                    : undefined
                }
              />
            ) : (
              [...grouped].map(([label, rows]) => (
                <section key={label} aria-label={label}>
                  <h3 className="border-y border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2 text-[11px] font-medium text-[var(--text-secondary)]">
                    {label}
                  </h3>
                  {rows.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      selected={visibleSelected.includes(n.id)}
                      disabled={inbox.isUpdating}
                      selectionDisabled={
                        visibleSelected.length >= 50 && !visibleSelected.includes(n.id)
                      }
                      onSelect={(checked) =>
                        setSelected(
                          checked
                            ? [...visibleSelected, n.id]
                            : visibleSelected.filter((id) => id !== n.id)
                        )
                      }
                      onMarkRead={inbox.markAsRead}
                      onMarkUnread={inbox.markAsUnread}
                      onDelete={(id) => setDeleting([id])}
                      onOpen={(item) => {
                        setDetail(item);
                        if (!item.readAt) inbox.markAsRead(item.id);
                      }}
                    />
                  ))}
                </section>
              ))
            )}
            {inbox.isError && inbox.notifications.length > 0 && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] p-4 text-xs"
              >
                <span>Couldn&apos;t load more notifications.</span>
                <Button variant="outline" size="sm" onClick={() => void inbox.refetch()}>
                  Try again
                </Button>
              </div>
            )}
            {inbox.hasNextPage && (
              <div className="border-t border-[var(--border-subtle)] p-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  loading={inbox.isFetchingNextPage}
                  onClick={() => void inbox.fetchNextPage()}
                >
                  Load more notifications
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      <AlertDialog
        open={deleting.length > 0}
        onOpenChange={(open) => {
          if (!open && !inbox.isUpdating) setDeleting([]);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)]">
          <AlertDialogTitle>
            Delete{" "}
            {deleting.length === 1 ? "notification" : `${deleting.length} notifications`}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This removes{" "}
            {deleting.length === 1 ? "this notification" : "these notifications"} from
            your inbox. Your preparation records are kept.
          </AlertDialogDescription>
          {inbox.mutationError && (
            <p role="alert" className="text-xs text-red-300">
              {inbox.mutationError}
            </p>
          )}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={inbox.isUpdating}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              loading={inbox.isUpdating}
              onClick={() => void update(deleting, "delete")}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto px-5 py-6 sm:max-w-lg">
          <SheetHeader className="pr-7">
            <span className="text-xs text-[var(--text-tertiary)]">
              {detail && getNotificationCategoryMeta(detail.category).label}
            </span>
            <SheetTitle className="break-words [overflow-wrap:anywhere]">
              {detail?.title}
            </SheetTitle>
            <SheetDescription>
              {detail &&
                new Date(detail.createdAt).toLocaleString(undefined, { timeZone })}
            </SheetDescription>
          </SheetHeader>
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-secondary)] [overflow-wrap:anywhere]">
            {detail?.body}
          </p>
          {inbox.mutationError && (
            <p role="alert" className="text-xs text-red-300">
              {inbox.mutationError}
            </p>
          )}
          {actionHref && (
            <Button asChild variant="secondary" className="mt-auto w-full">
              <Link href={actionHref}>Open in PRIME</Link>
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
