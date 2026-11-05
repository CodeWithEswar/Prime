"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

export function useUnreadNotificationsCount() {
  const query = useQuery<{ unreadCount: number }>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=1");
      if (!res.ok) throw new Error("Unread count is unavailable");
      const data = await res.json();
      return { unreadCount: data.unreadCount ?? 0 };
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });

  return query.data?.unreadCount ?? 0;
}
