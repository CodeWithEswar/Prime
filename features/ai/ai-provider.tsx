"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { consumeAIStream } from "@/lib/ai/streaming";
import { queryKeys } from "@/lib/query/keys";
import { pageContext } from "./page-context";
import { aiRequest, historyOptions } from "./queries";
import type { AIState, AIMessage, AIAction, AIConversation, AIEvent } from "./types";
import type { AIIntent, ContextRef } from "./schema";
import "./components/ai-shell.css";
const AIPanel = dynamic(() => import("./components/ai-panel"), { ssr: false });
interface AIController {
  enabled: boolean;
  userId: string;
  open: boolean;
  setOpen: (open: boolean, trigger?: HTMLElement, context?: ContextRef) => void;
  restoreFocus: () => void;
  conversationId: string | null;
  reference: ContextRef;
  messages: AIMessage[];
  actions: AIAction[];
  state: AIState;
  error: string;
  hintDepth: number;
  send: (
    text: string,
    intent?: AIIntent,
    mode?: "send" | "retry" | "edit"
  ) => Promise<boolean>;
  stop: () => void;
  newConversation: (ref?: ContextRef) => void;
  select: (conversation: AIConversation) => Promise<void>;
  loadOlder: () => Promise<void>;
  hasOlder: boolean;
  decide: (id: string, decision: "confirm" | "cancel") => Promise<void>;
  saveNote: (messageId: string) => Promise<void>;
}
const AIContext = createContext<AIController | null>(null);
export function useAI() {
  return useContext(AIContext);
}
export function AIProvider({
  enabled,
  userId,
  children,
}: {
  enabled: boolean;
  userId: string;
  children: ReactNode;
}) {
  const pathname = usePathname(),
    queryClient = useQueryClient();
  const [open, setPanel] = useState(false),
    [id, setId] = useState<string | null>(null),
    [reference, setRef] = useState<ContextRef>({ type: "general" }),
    [messages, setMessages] = useState<AIMessage[]>([]),
    [actions, setActions] = useState<AIAction[]>([]),
    [state, setState] = useState<AIState>("idle"),
    [error, setError] = useState(""),
    [hintDepth, setDepth] = useState(0),
    [older, setOlder] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null),
    busy = useRef(false),
    origin = useRef<HTMLElement | null>(null),
    generation = useRef(0);
  useEffect(
    () => () => {
      abort.current?.abort();
    },
    []
  );
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversations(userId) });
  function reset(ref: ContextRef = pageContext(pathname)) {
    if (busy.current) return;
    generation.current++;
    setId(null);
    setRef(ref);
    setMessages([]);
    setActions([]);
    setState("idle");
    setError("");
    setDepth(0);
    setOlder(null);
  }
  function changeOpen(value: boolean, trigger?: HTMLElement, context?: ContextRef) {
    if (value) {
      origin.current = trigger ?? (document.activeElement as HTMLElement);
      if (context) setRef(context);
      else if (!id && !messages.length) setRef(pageContext(pathname));
    }
    setPanel(value);
  }
  function restoreFocus() {
    const target = origin.current?.isConnected
      ? origin.current
      : document.getElementById("workspace-main");
    target?.focus();
  }
  async function send(
    text: string,
    intent: AIIntent = "ask",
    mode: "send" | "retry" | "edit" = "send"
  ) {
    if (!enabled || busy.current || (!text.trim() && mode !== "retry")) return false;
    busy.current = true;
    const version = ++generation.current,
      controller = new AbortController();
    abort.current = controller;
    setState("connecting");
    setError("");
    setActions((a) =>
      a.map((x) => (x.status === "pending" ? { ...x, status: "cancelled" } : x))
    );
    const previous = messages,
      previousActions = actions,
      requestId = crypto.randomUUID(),
      draftId = `draft-${requestId}`;
    let activeId = draftId,
      serverId = id;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const base =
      mode === "send"
        ? messages
        : lastUser
          ? messages.slice(0, messages.findIndex((m) => m.id === lastUser.id) + 1)
          : messages;
    const userMessage: AIMessage = {
      id: `user-${requestId}`,
      role: "user",
      content: text,
      status: "completed",
      intent,
      ordinal: 0,
      created_at: new Date().toISOString(),
      parts: [],
    };
    const optimistic =
      mode === "send"
        ? [...base, userMessage]
        : mode === "edit"
          ? base.map((m) => (m.id === lastUser?.id ? { ...m, content: text } : m))
          : base;
    setMessages([
      ...optimistic,
      {
        ...userMessage,
        id: draftId,
        role: "assistant",
        content: "",
        status: "streaming",
      },
    ]);
    let sawStart = false,
      sawError = false;
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id ?? undefined,
          requestId,
          message: text,
          intent,
          context: reference,
          mode,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        setMessages(previous);
        setActions(previousActions);
        throw new Error(data.error ?? "PRIME AI is temporarily unavailable.");
      }
      if (!response.body) throw new Error("No response stream.");
      await consumeAIStream(response.body, (event: AIEvent) => {
        if (version !== generation.current) return;
        if (event.type === "start") {
          sawStart = true;
          activeId = event.messageId;
          serverId = event.conversationId;
          setId(serverId);
          setDepth(event.hintDepth);
          setState("streaming");
          setMessages((list) =>
            list.map((m) => (m.id === draftId ? { ...m, id: activeId } : m))
          );
        } else if (event.type === "text_delta") {
          setState("streaming");
          setMessages((list) =>
            list.map((m) =>
              m.id === activeId ? { ...m, content: m.content + event.text } : m
            )
          );
        } else if (event.type === "confirmation_required") {
          setState("confirmation_required");
          setActions((list) => [
            ...list.filter((a) => a.id !== event.action.id),
            event.action,
          ]);
        } else if (event.type === "tool_start") setState("tool_running");
        else if (event.type === "error") {
          sawError = true;
          setError(event.message);
          setState("failed");
        } else if (event.type === "done") {
          setState(
            sawError ? "failed" : event.status === "completed" ? "completed" : "cancelled"
          );
          setMessages((list) =>
            list.map((m) => (m.id === activeId ? { ...m, status: event.status } : m))
          );
        }
        if (!["start", "text_delta"].includes(event.type))
          setMessages((list) =>
            list.map((m) =>
              m.id === activeId ? { ...m, parts: [...m.parts, event] } : m
            )
          );
      });
    } catch (e) {
      if (controller.signal.aborted) {
        setState("cancelled");
        setMessages((list) =>
          list.map((m) => (m.id === activeId ? { ...m, status: "interrupted" } : m))
        );
      } else {
        setError(e instanceof Error ? e.message : "The response was interrupted.");
        setState("failed");
      }
    } finally {
      busy.current = false;
      abort.current = null;
      void invalidate();
      if (sawStart && serverId && !controller.signal.aborted) {
        try {
          const history = await queryClient.fetchQuery(historyOptions(userId, serverId));
          if (version === generation.current) {
            setMessages(history.messages);
            setActions(history.actions);
            setOlder(history.nextCursor);
          }
        } catch {
          /* Keep streamed text if history refresh fails. */
        }
      }
    }
    return sawStart;
  }
  async function select(conversation: AIConversation) {
    if (busy.current) return;
    const version = ++generation.current;
    setState("connecting");
    setError("");
    try {
      const history = await queryClient.fetchQuery(
        historyOptions(userId, conversation.id)
      );
      if (version !== generation.current) return;
      setId(conversation.id);
      setRef(conversation.context);
      setDepth(conversation.hint_depth);
      setMessages(history.messages);
      setActions(history.actions);
      setOlder(history.nextCursor);
      setState("idle");
    } catch (e) {
      setState("failed");
      setError((e as Error).message);
    }
  }
  async function loadOlder() {
    if (!older || !id) return;
    try {
      const result = await aiRequest<import("./queries").HistoryResult>(
        `/api/ai/messages?conversationId=${id}&before=${older}`
      );
      setMessages((m) => [...result.messages, ...m]);
      setOlder(result.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function decide(actionId: string, decision: "confirm" | "cancel") {
    try {
      setError("");
      const result = await aiRequest<{ status: string; noteId?: string }>(
        "/api/ai/tools",
        { method: "PATCH", body: JSON.stringify({ id: actionId, decision }) }
      );
      setActions((list) =>
        list.map((a) =>
          a.id === actionId ? { ...a, status: result.status, result: result } : a
        )
      );
      if (result.status === "completed") {
        void queryClient.invalidateQueries({ queryKey: ["notes"] });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.ai.context(userId, { type: "notes" }),
        });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function saveNote(messageId: string) {
    try {
      const { action } = await aiRequest<{ action: AIAction }>("/api/ai/tools", {
        method: "POST",
        body: JSON.stringify({ messageId }),
      });
      setActions((a) => [...a.filter((x) => x.id !== action.id), action]);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const value: AIController = {
    enabled,
    userId,
    open,
    setOpen: changeOpen,
    restoreFocus,
    conversationId: id,
    reference,
    messages,
    actions,
    state,
    error,
    hintDepth,
    send,
    stop: () => abort.current?.abort(),
    newConversation: reset,
    select,
    loadOlder,
    hasOlder: !!older,
    decide,
    saveNote,
  };
  return (
    <AIContext.Provider value={value}>
      <div
        className="ai-shell-boundary"
        data-ai-open={enabled && open && !pathname.startsWith("/ai")}
      >
        {children}
      </div>
      {enabled && open && !pathname.startsWith("/ai") && <AIPanel />}
    </AIContext.Provider>
  );
}
