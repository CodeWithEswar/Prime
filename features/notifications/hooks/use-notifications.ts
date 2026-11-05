"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  updateInboxNotificationsAction,
  markAllNotificationsReadAction,
} from "../server/actions";
import type { NotificationCategory } from "@/domain/notifications/types";
import type { NotificationsListResponse, NotificationTab } from "../types";
import type { InboxOperation } from "../inbox";

export interface UseNotificationsOptions {
  tab?: NotificationTab;
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const client = useQueryClient();
  const {
    tab = "all",
    category,
    unreadOnly = false,
    limit = 20,
    search = "",
    enabled = true,
  } = options;
  const query = useInfiniteQuery({
    queryKey: [
      ...queryKeys.notifications.list({ category, unreadOnly }),
      tab,
      limit,
      search,
    ],
    initialPageParam: null as string | null,
    enabled,
    queryFn: async ({ pageParam, signal }): Promise<NotificationsListResponse> => {
      const params = new URLSearchParams({ tab, limit: String(limit), search });
      if (category) params.set("category", category);
      if (unreadOnly) params.set("unreadOnly", "true");
      if (pageParam) params.set("cursor", pageParam);
      const res = await fetch("/api/notifications?" + params, { signal });
      if (!res.ok)
        throw new Error("Notifications could not be loaded. Please try again.");
      return res.json();
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
  const unreadCount = query.data?.pages[0]?.unreadCount;
  useEffect(() => {
    if (unreadCount !== undefined)
      client.setQueryData(queryKeys.notifications.unreadCount(), { unreadCount });
  }, [client, unreadCount]);
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["notifications", "list"] }),
      client.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() }),
    ]);
  };
  // Keep saved rows unchanged until the server confirms a mutation.
  const update = useMutation({
    mutationFn: async ({
      ids,
      operation,
    }: {
      ids: string[];
      operation: InboxOperation;
    }) => {
      const result = await updateInboxNotificationsAction(ids, operation);
      if (!result.ok) throw new Error(result.error);
      return result.data.ids;
    },
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });
  const rows = query.data?.pages.flatMap((page) => page.notifications) ?? [];
  const notifications = rows.filter(
    (row, index) => rows.findIndex((n) => n.id === row.id) === index
  );
  return {
    notifications,
    unreadCount: unreadCount ?? 0,
    countAvailable: unreadCount !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    markAsRead: (id: string) => update.mutate({ ids: [id], operation: "read" }),
    markAsUnread: (id: string) => update.mutate({ ids: [id], operation: "unread" }),
    deleteNotification: (id: string) => update.mutate({ ids: [id], operation: "delete" }),
    updateSelected: (ids: string[], operation: InboxOperation) =>
      update.mutateAsync({ ids, operation }),
    markAllAsRead: () => markAll.mutate(),
    isMarkingAllRead: markAll.isPending,
    isUpdating: update.isPending || markAll.isPending,
    mutationError: update.error?.message ?? markAll.error?.message,
  };
}
