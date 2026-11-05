"use client";
import { queryKeys } from "@/lib/query/keys";
import { queryOptions } from "@tanstack/react-query";
import type { AIAction, AIConversation, AIMessage, AIContext } from "./types";
import type { ContextRef } from "./schema";
export async function aiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "PRIME AI is temporarily unavailable.");
  return data;
}
export interface HistoryResult {
  messages: AIMessage[];
  actions: AIAction[];
  nextCursor: number | null;
}
export interface ConversationResult {
  conversations: AIConversation[];
  nextCursor: string | null;
}
export const historyOptions = (userId: string, id: string) =>
  queryOptions({
    queryKey: queryKeys.ai.messages(userId, id),
    queryFn: ({ signal }) =>
      aiRequest<HistoryResult>(`/api/ai/messages?conversationId=${id}`, { signal }),
    staleTime: 0,
    retry: false,
  });
export const contextOptions = (userId: string, ref: ContextRef) =>
  queryOptions({
    queryKey: queryKeys.ai.context(userId, ref),
    queryFn: ({ signal }) =>
      aiRequest<AIContext>(
        `/api/ai/context?${new URLSearchParams(
          Object.entries(ref)
            .filter(([, v]) => v !== undefined)
            .map(([key, value]) => [
              key,
              typeof value === "string" ? value : JSON.stringify(value),
            ])
        )}`,
        { signal }
      ),
    staleTime: 30000,
    retry: false,
  });
