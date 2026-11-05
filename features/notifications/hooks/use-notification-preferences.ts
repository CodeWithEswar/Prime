"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { NotificationPreferences } from "@/domain/notifications/types";
import type { NotificationPreferencesInput } from "@/domain/notifications/schemas";

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery<{ preferences: NotificationPreferences | null }>({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const res = await fetch("/api/notifications/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return res.json();
    },
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (updated: Partial<NotificationPreferencesInput>) => {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update preferences");
      }
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() }),
  });

  return {
    preferences: query.data?.preferences ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: query.refetch,
    updatePreferences: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
