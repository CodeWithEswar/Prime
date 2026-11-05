"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAI } from "../ai-provider";
import { aiRequest, contextOptions, type ConversationResult } from "../queries";
import { queryKeys } from "@/lib/query/keys";
import type { AIAction, AIMessage } from "../types";
import { intentSchema, type AIIntent } from "../schema";
import "./ai-refinements.css";
import "./ai-responsive.css";
import "./ai-select.css";
import { HintTrace, TechnicalContent } from "../markdown/structured";
import { ResponseActions } from "./response-actions";
import { AIControl } from "./ai-control";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Add01Icon,
  Clock01Icon,
  InformationCircleIcon,
  NoteAddIcon,
  Cancel01Icon,
  StopIcon,
  SentIcon,
  Layout01Icon,
  Archive01Icon,
  Edit01Icon,
  BookOpen01Icon,
  HelpCircleIcon,
  Brain01Icon,
  File01Icon,
  AiChat01Icon,
  RotateRight01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
const intentIcons: Record<AIIntent, IconSvgElement> = {
  ask: AiChat01Icon,
  explain: BookOpen01Icon,
  hint: HelpCircleIcon,
  summarize: File01Icon,
  correct: Tick02Icon,
  improve: Edit01Icon,
  quiz: Brain01Icon,
  interview: AiChat01Icon,
  revision_notes: NoteAddIcon,
};
const Markdown = dynamic(() => import("./markdown-renderer"), {
  loading: () => <p className="ai-muted">Preparing response…</p>,
});
const subscribeHydration = () => () => {};
const intentLabels: Record<AIIntent, string> = {
  ask: "Ask",
  explain: "Explain",
  hint: "Hint",
  summarize: "Summarize",
  correct: "Correct",
  improve: "Improve",
  quiz: "Quiz me",
  interview: "Interview me",
  revision_notes: "Revision notes",
};
const prompts: Partial<Record<AIIntent, string>> = {
  explain: "Explain the pattern and the invariant I should remember.",
  hint: "Give me the next progressive hint.",
  quiz: "Quiz me on the current context, one question at a time.",
  interview: "Start a technical interview on this topic, one question at a time.",
  revision_notes: "Create concise revision notes for this context.",
  summarize: "Summarize this context using only my actual PRIME data.",
};
const labQuestions = [
  {
    label: "Explain this step",
    prompt: "Explain this exact attached algorithm step and what state changed.",
    intent: "explain",
  },
  {
    label: "Why did this move?",
    prompt:
      "Why did the pointer or node move in this attached trace? Use the deterministic snapshot.",
    intent: "explain",
  },
  {
    label: "Explain the invariant",
    prompt: "Explain the algorithm invariant and why this step preserves it.",
    intent: "explain",
  },
  {
    label: "Beginner explanation",
    prompt: "Explain this attached step to a beginner using its actual input values.",
    intent: "explain",
  },
  {
    label: "Java logic",
    prompt: "Explain the active Java line and how it corresponds to this trace state.",
    intent: "explain",
  },
  {
    label: "Complexity",
    prompt:
      "Explain time and space complexity, distinguishing it from observed operation counts.",
    intent: "explain",
  },
  {
    label: "Quiz me",
    prompt:
      "Quiz me on this algorithm snapshot, one question at a time. Do not reveal the answer first.",
    intent: "quiz",
  },
  {
    label: "What happens next?",
    prompt:
      "Help me reason about the next transition from this snapshot. The trace engine, not AI, determines execution. Ask me to predict before explaining.",
    intent: "hint",
  },
] as const;
const masteryQuestions = [
  { label: "Explain my mastery", intent: "explain", prompt: "Explain my current mastery using my recorded evidence. Distinguish independent solving, spaced recall, and freshness." },
  { label: "What evidence am I missing?", intent: "ask", prompt: "Identify the evidence I am missing and suggest one practice or revision step. Use only my recorded PRIME data." },
  { label: "Quiz this skill", intent: "quiz", prompt: "Quiz me on the selected skill, one question at a time. The quiz is practice and must not change my mastery level." },
] as const;
const plannerQuestions = [
  {
    label: "Draft my week",
    intent: "ask",
    prompt:
      "Draft a study plan for the seven days starting on my selected Planner date. Use my actual daily study budgets, existing commitments, and rest days. Protect locked tasks, prioritize due reviews and Core work, and show suggested additions with estimated minutes for each day. Keep the plan advisory.",
  },
  {
    label: "Find time for revision",
    intent: "ask",
    prompt:
      "Suggest where to fit my due revisions into the week starting on my selected Planner date. Use my remaining daily budget and keep locked commitments and rest days intact. Flag any reviews that do not fit.",
  },
  {
    label: "Review my target",
    intent: "explain",
    prompt:
      "Review whether my current preparation target is realistic given my Planner capacity and remaining work. Explain the biggest trade-off and suggest practical adjustments. Flag any data you are missing.",
  },
] as const;
export function ContextTrace() {
  const ai = useAI()!;
  const context = useQuery({
    ...contextOptions(ai.userId, ai.reference),
    enabled: ai.enabled,
  });
  const status = context.data?.facts.status;
  const count = context.data?.facts.attemptCount;
  return (
    <section className="ai-context-trace" aria-label="Current AI context">
      <span className="ai-eyebrow">Context · {ai.reference.type}</span>
      <h2>
        {context.data?.label ??
          (context.isLoading ? "Loading context…" : "Preparation workspace")}
      </h2>
      <p>{context.data?.subtitle ?? "Ask about a concept or attach a PRIME page."}</p>
      {typeof status === "string" && (
        <span className="ai-fact">
          Status <b>{status.replaceAll("_", " ")}</b>
        </span>
      )}
      {typeof count === "number" && (
        <span className="ai-fact">
          Attempts <b>{count}</b>
        </span>
      )}
      {context.error && (
        <p className="ai-muted">
          Context is unavailable. PRIME AI will not assume your progress.
        </p>
      )}
      {context.data?.references.map((r) => (
        <Link key={r.href} href={r.href}>
          {r.title}
        </Link>
      ))}
      {ai.reference.type !== "general" && (
        <AIControl
          className="ai-text-button"
          icon={Cancel01Icon}
          onClick={() => ai.newConversation({ type: "general" })}
        >
          Clear context
        </AIControl>
      )}
    </section>
  );
}
function useSafeBack() {
  const router = useRouter();
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    try {
      if (typeof window !== "undefined" && window.history.length > 1 && document.referrer) {
        const prev = new URL(document.referrer);
        if (prev.origin === window.location.origin && prev.pathname !== "/ai") {
          event.preventDefault();
          router.back();
          return;
        }
      }
    } catch {
      /* Fallback to normal Link href navigation */
    }
  };
}

export function ConversationRail({ onSelect }: { onSelect?: () => void }) {
  const ai = useAI()!,
    client = useQueryClient();
  const handleBack = useSafeBack();
  const list = useInfiniteQuery({
    queryKey: queryKeys.ai.conversations(ai.userId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      aiRequest<ConversationResult>(
        `/api/ai/conversations${pageParam ? `?before=${encodeURIComponent(pageParam)}` : ""}`,
        { signal }
      ),
    getNextPageParam: (page) => page.nextCursor,
    enabled: ai.enabled,
    staleTime: 15000,
    retry: false,
  });
  const archive = useMutation({
    mutationFn: (id: string) =>
      aiRequest("/api/ai/conversations", {
        method: "PATCH",
        body: JSON.stringify({ id, archived: true }),
      }),
    onSuccess: (_, id) => {
      if (ai.conversationId === id) ai.newConversation();
      return client.invalidateQueries({
        queryKey: queryKeys.ai.conversations(ai.userId),
      });
    },
  });
  return (
    <div className="ai-history">
      <div className="ai-rail-header">
        <Link
          href="/roadmap"
          onClick={handleBack}
          className="ai-rail-back-link"
          title="Return to PRIME Workspace"
        >
          <Icon icon={ArrowLeft01Icon} size={14} />
          <span>Workspace</span>
        </Link>
        <span className="ai-rail-badge">PRIME AI</span>
      </div>
      <AIControl
        className="ai-rail-new-btn"
        icon={Add01Icon}
        onClick={() => {
          ai.newConversation();
          onSelect?.();
        }}
      >
        New conversation
      </AIControl>
      <h2 className="ai-eyebrow">Recent conversations</h2>
      {list.isLoading && <p className="ai-muted">Loading conversations…</p>}
      {list.error && (
        <p className="ai-muted" role="status">
          {list.error.message}
        </p>
      )}
      {list.data?.pages
        .flatMap((p) => p.conversations)
        .map((c) => (
          <div
            className="ai-history-row"
            key={c.id}
            data-active={ai.conversationId === c.id}
          >
            <AIControl
              onClick={() => {
                void ai.select(c);
                onSelect?.();
              }}
            >
              <span>{c.title}</span>
              <small>
                {c.context.type} ·{" "}
                {new Date(c.updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </small>
            </AIControl>
            <AIControl
              aria-label={`Archive ${c.title}`}
              icon={Archive01Icon}
              size="icon-sm"
              title="Archive conversation"
              disabled={archive.isPending}
              onClick={() => archive.mutate(c.id)}
            ></AIControl>
          </div>
        ))}
      {!list.isLoading && !list.error && !list.data?.pages[0]?.conversations.length && (
        <p className="ai-muted">Your preparation conversations will appear here.</p>
      )}
      {list.hasNextPage && (
        <AIControl className="ai-text-button" onClick={() => void list.fetchNextPage()}>
          Load more
        </AIControl>
      )}
      {archive.error && <p role="alert">{archive.error.message}</p>}
    </div>
  );
}
function ActionCard({ action }: { action: AIAction }) {
  const ai = useAI()!;
  const decision = useMutation({
    mutationFn: (value: "confirm" | "cancel") => ai.decide(action.id, value),
  });
  const pending = action.status === "pending" && new Date(action.expires_at) > new Date();
  return (
    <section className="ai-confirmation" aria-label="Note confirmation">
      <span className="ai-eyebrow">
        {pending
          ? "Confirmation required"
          : action.status === "completed"
            ? "Saved to Notes"
            : `Action ${action.status}`}
      </span>
      <h3>{action.input.title}</h3>
      <p>
        Save a Markdown note
        {action.input.problemId
          ? ` attached to ${action.input.problemTitle ?? "the selected problem"}`
          : " in your notebook"}
        .
      </p>
      <details>
        <summary>Review note content</summary>
        <Markdown content={action.input.body} />
      </details>
      {pending && (
        <div className="ai-action-row">
          <AIControl
            className="ai-secondary"
            icon={Cancel01Icon}
            disabled={decision.isPending}
            onClick={() => decision.mutate("cancel")}
          >
            Cancel
          </AIControl>
          <AIControl
            className="ai-primary"
            variant="primary"
            icon={NoteAddIcon}
            disabled={decision.isPending}
            onClick={() => decision.mutate("confirm")}
          >
            {decision.isPending ? "Saving…" : "Confirm save"}
          </AIControl>
        </div>
      )}
      {action.status === "completed" && <Link href="/notes">Open Notes</Link>}
    </section>
  );
}
function Message({ message, lastUser }: { message: AIMessage; lastUser: boolean }) {
  const ai = useAI()!;
  const [edit, setEdit] = useState(false),
    [value, setValue] = useState(message.content);
  const refs = message.parts.filter((p) => p.type === "entity_reference");
  const hint = message.parts.find((p) => p.type === "hint_level");
  const latest = ai.messages.at(-1)?.id === message.id;
  const answer = (
    <Markdown
      content={message.content}
      streaming={message.status === "streaming"}
      references={refs.map((r) => ({ href: r.href, title: r.title }))}
    />
  );
  const toolLabels: Record<string, string> = {
    get_problem_context: "Problem context",
    get_problem_attempt_history: "Attempt history",
    get_current_roadmap_state: "Roadmap",
    get_due_revisions: "Revision queue",
    get_today_plan: "Today's plan",
    get_day_plan: "Day plan",
    search_dsa_catalog: "Problem catalog",
    get_notes: "Notes",
    create_note: "Note draft",
  };
  return (
    <article
      className={`ai-message ai-message-${message.role}`}
      aria-label={message.role === "user" ? "Your message" : "PRIME AI response"}
    >
      <div className="ai-message-label">
        {message.role === "user" ? "You" : "PRIME AI"}
      </div>
      {edit ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setEdit(false);
            void ai.send(value, message.intent, "edit");
          }}
        >
          <label className="sr-only" htmlFor={`edit-${message.id}`}>
            Edit latest prompt
          </label>
          <textarea
            id={`edit-${message.id}`}
            maxLength={6000}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <div className="ai-action-row">
            <AIControl onClick={() => setEdit(false)}>Cancel</AIControl>
            <AIControl type="submit" icon={Edit01Icon}>
              Replace and resend
            </AIControl>
          </div>
          <small>This replaces the last response.</small>
        </form>
      ) : message.role === "assistant" ? (
        message.intent === "hint" ? (
          <HintTrace
            level={hint?.level}
            onNext={
              latest && message.status === "completed"
                ? () => void ai.send("Give me the next progressive hint.", "hint")
                : undefined
            }
          >
            {answer}
          </HintTrace>
        ) : (
          answer
        )
      ) : (
        <p className="ai-user-text">{message.content}</p>
      )}
      {message.role === "assistant" && (
        <>
          {message.parts.map((part, index) =>
            part.type === "technical_block" ? (
              <TechnicalContent key={index} block={part.block} />
            ) : null
          )}
          {message.parts
            .filter((p) => p.type === "tool_result")
            .map((part, index) => (
              <div className="ai-tool-activity" key={index}>
                <Icon icon={part.ok ? Tick02Icon : InformationCircleIcon} size={13} />
                <span>
                  {toolLabels[part.name] ?? "PRIME context"} · {part.summary}
                </span>
              </div>
            ))}
          {!!refs.length && (
            <div className="ai-references">
              {refs.map((ref, index) => (
                <Link className="prime-entity-reference" key={index} href={ref.href}>
                  <Icon icon={BookOpen01Icon} size={12} />
                  {ref.title}
                </Link>
              ))}
            </div>
          )}
          {!!message.content && message.status !== "streaming" && (
            <ResponseActions message={message} />
          )}
        </>
      )}
      {message.role === "user" && lastUser && !edit && (
        <AIControl
          icon={Edit01Icon}
          className="ai-text-button"
          iconOnly
          onClick={() => setEdit(true)}
        >
          Edit latest prompt
        </AIControl>
      )}
    </article>
  );
}
export function AISurface({ panel = false }: { panel?: boolean }) {
  const ai = useAI()!;
  const handleBack = useSafeBack();
  const ready = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
  const [following, setFollowing] = useState(true);
  const [draft, setDraft] = useState(""),
    [intent, setIntent] = useState<AIIntent>("ask"),
    [historyOpen, setHistoryOpen] = useState(false),
    [contextOpen, setContextOpen] = useState(false);
  const bottom = useRef<HTMLDivElement>(null),
    scroller = useRef<HTMLDivElement>(null),
    autoScroll = useRef(true);
  const surface = useRef<HTMLDivElement>(null);
  const promptTextarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!draft && promptTextarea.current) {
      promptTextarea.current.style.height = "24px";
    }
  }, [draft]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const sync = () => {
      const height = viewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--ai-viewport-height", `${height}px`);
      if (surface.current) surface.current.dataset.compactHeight = String(height < 560);
    };
    sync();
    viewport?.addEventListener("resize", sync);
    window.addEventListener("resize", sync);
    return () => {
      viewport?.removeEventListener("resize", sync);
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty("--ai-viewport-height");
    };
  }, []);
  const running = [
    "connecting",
    "streaming",
    "tool_running",
    "tool_requested",
    "resuming",
    "confirmation_required",
  ].includes(ai.state);
  const lastUser = [...ai.messages].reverse().find((m) => m.role === "user");
  useEffect(() => {
    if (autoScroll.current && scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [ai.messages]);
  useEffect(() => {
    const viewport = scroller.current,
      content = viewport?.firstElementChild;
    if (!viewport || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (autoScroll.current) viewport.scrollTop = viewport.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  const quick: AIIntent[] =
    ai.reference.type === "problem"
      ? ["hint", "explain", "quiz", "revision_notes"]
      : ai.reference.type === "revision"
        ? ["quiz", "summarize", "revision_notes"]
        : ["explain", "summarize", "quiz", "interview"];
  const isPlanner = ai.reference.type === "planner";
  const isMastery = ai.reference.type === "mastery";
  const contextQuestions = isMastery ? masteryQuestions : isPlanner
    ? plannerQuestions
    : ai.reference.type === "lab"
      ? labQuestions
      : null;
  return (
    <div ref={surface} className={panel ? "ai-surface ai-surface-panel" : "ai-surface"}>
      <div className="ai-canvas-toolbar">
        <div className="ai-canvas-heading">
          {!panel && (
            <Link
              href="/roadmap"
              onClick={handleBack}
              className="ai-mobile-back-link"
              title="Return to Workspace"
              aria-label="Return to Workspace"
            >
              <Icon icon={ArrowLeft01Icon} size={15} />
              <span className="ai-mobile-back-text">Workspace</span>
            </Link>
          )}
          {!panel && (
            <AIControl
              icon={Menu01Icon}
              size="icon-sm"
              className="ai-mobile-menu-btn"
              title="Conversations"
              aria-label="Conversations"
              onClick={() => setHistoryOpen(true)}
            />
          )}
          <div className="ai-title-block">
            <span className="ai-eyebrow">Preparation intelligence</span>
            <h1>
              <Icon icon={AiChat01Icon} size={16} /> PRIME AI
            </h1>
          </div>
        </div>
        <div className="ai-action-row">
          <AIControl
            icon={Clock01Icon}
            size="icon-sm"
            title="History"
            aria-label="History"
            onClick={() => setHistoryOpen(true)}
            aria-haspopup="dialog"
          ></AIControl>
          <AIControl
            icon={InformationCircleIcon}
            size="icon-sm"
            title="Context"
            aria-label="Context"
            onClick={() => setContextOpen(true)}
            aria-haspopup="dialog"
          ></AIControl>
          <AIControl
            icon={Add01Icon}
            size="icon-sm"
            title="New conversation"
            aria-label="New conversation"
            disabled={running}
            onClick={() => ai.newConversation()}
          ></AIControl>
          {!panel && (
            <AIControl
              asChild
              size="icon-sm"
              title="Return to Workspace"
              aria-label="Return to Workspace"
              className="ai-exit-workspace-btn"
            >
              <Link href="/roadmap" onClick={handleBack}>
                <Icon icon={Layout01Icon} size={14} />
                <span className="sr-only">Return to Workspace</span>
              </Link>
            </AIControl>
          )}
          {panel && (
            <>
              <AIControl
                asChild
                size="icon-sm"
                title="Open workspace"
                aria-label="Open workspace"
              >
                <Link href="/ai" onClick={() => ai.setOpen(false)}>
                  <Icon icon={Layout01Icon} size={15} />
                  <span className="sr-only">Open workspace</span>
                </Link>
              </AIControl>
              <AIControl
                icon={Cancel01Icon}
                size="icon-sm"
                title="Close PRIME AI"
                aria-label="Close PRIME AI"
                onClick={() => {
                  ai.setOpen(false);
                  ai.restoreFocus();
                }}
              />
            </>
          )}
        </div>
      </div>
      {panel && <ContextTrace />}
      <div
        className="ai-messages"
        ref={scroller}
        onScroll={() => {
          const node = scroller.current;
          if (node) {
            const next = node.scrollHeight - node.scrollTop - node.clientHeight < 100;
            autoScroll.current = next;
            setFollowing(next);
          }
        }}
      >
        <div className="ai-message-column">
          {ai.hasOlder && (
            <AIControl className="ai-text-button" onClick={() => void ai.loadOlder()}>
              Load earlier messages
            </AIControl>
          )}
          {!ai.messages.length && (
            <section className="ai-empty">
              <div className="ai-terminal" aria-hidden="true" />
              <span className="ai-eyebrow">Context before conversation</span>
              <h2>
                {isMastery ? "Understand your evidence" : isPlanner
                  ? "Plan your preparation"
                  : panel
                    ? "What will you work on?"
                    : ai.reference.type === "problem"
                      ? "Understand the pattern.\nBuild your reasoning."
                      : "Prepare with\nclearer understanding."}
              </h2>
              <p>
                {isMastery ? "Explore what your practice and reviews demonstrate, and choose what to reinforce next." : isPlanner
                  ? "Get suggestions based on your study budget, commitments, and target date. Review and confirm any schedule changes in Planner."
                  : ai.reference.type === "general"
                    ? "Explore a concept, review your preparation, or practice a technical interview."
                    : "Work with your current PRIME context. Ask for a hint, review your approach, or test your recall."}
              </p>
              <div className="ai-quick-actions">
                {contextQuestions
                  ? contextQuestions.map((question) => (
                      <AIControl
                        key={question.label}
                        icon={intentIcons[question.intent]}
                        disabled={!ready || running}
                        onClick={() => {
                          setIntent(question.intent);
                          void ai.send(question.prompt, question.intent);
                        }}
                      >
                        {question.label}
                      </AIControl>
                    ))
                  : quick.map((key) => (
                      <AIControl
                        key={key}
                        icon={intentIcons[key]}
                        disabled={!ready || running}
                        onClick={() => {
                          setIntent(key);
                          void ai.send(prompts[key] ?? intentLabels[key], key);
                        }}
                      >
                        {intentLabels[key]}
                      </AIControl>
                    ))}
              </div>
              <small>
                PRIME AI uses relevant preparation data. Review generated answers and
                confirm every save.
              </small>
            </section>
          )}
          {ai.messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              lastUser={!running && m.id === lastUser?.id}
            />
          ))}
          {ai.actions.map((a) => (
            <ActionCard key={a.id} action={a} />
          ))}
          {running && (
            <div className="ai-stream-status" role="status">
              {ai.state === "tool_running"
                ? "Reading PRIME context…"
                : ai.state === "connecting"
                  ? "Connecting…"
                  : "Responding…"}
            </div>
          )}
          {ai.error && (
            <div className="ai-error" role="alert">
              <p>{ai.error}</p>
            </div>
          )}
          {!running &&
            ai.conversationId &&
            lastUser &&
            ["failed", "cancelled"].includes(ai.state) && (
              <AIControl
                className="ai-secondary"
                icon={RotateRight01Icon}
                onClick={() => void ai.send("", lastUser.intent, "retry")}
              >
                Retry response
              </AIControl>
            )}
          <div ref={bottom} />
        </div>
      </div>
      {!following && ai.messages.length > 0 && (
        <AIControl
          className="ai-latest-button"
          iconOnly
          icon={AiChat01Icon}
          onClick={() => {
            autoScroll.current = true;
            setFollowing(true);
            if (scroller.current)
              scroller.current.scrollTop = scroller.current.scrollHeight;
          }}
        >
          Continue to latest
        </AIControl>
      )}
      <div className="ai-composer-dock">
        <form
          className="ai-composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim() || running) return;
            const text = draft;
            setDraft("");
            if (promptTextarea.current) {
              promptTextarea.current.style.height = "24px";
            }
            autoScroll.current = true;
            setFollowing(true);
            void ai.send(text, intent).then((accepted) => {
              if (!accepted) setDraft((current) => current || text);
            });
          }}
        >
          <div className="ai-composer-context">
            <span>
              Using:{" "}
              {ai.reference.type === "general" ? "General preparation" : ai.reference.type}
            </span>
            {ai.hintDepth > 0 && <span>Hint {ai.hintDepth}/5</span>}
          </div>
          <label
            className="sr-only"
            htmlFor={panel ? "ai-panel-prompt" : "ai-workspace-prompt"}
          >
            Ask PRIME
          </label>
          <textarea
            ref={promptTextarea}
            disabled={!ready}
            id={panel ? "ai-panel-prompt" : "ai-workspace-prompt"}
            placeholder="Ask PRIME…"
            rows={1}
            maxLength={6000}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 24), 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="ai-composer-footer">
            <Select
              value={intent}
              onValueChange={(value) => setIntent(intentSchema.parse(value))}
            >
              <SelectTrigger aria-label="AI intent" className="ai-intent-select">
                <Icon icon={intentIcons[intent]} size={14} aria-hidden="true" />
                <SelectValue>{intentLabels[intent]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="ai-intent-menu">
                <SelectGroup>
                  <SelectLabel>Working mode</SelectLabel>
                  {intentSchema.options.map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="ai-select-item">
                        <Icon icon={intentIcons[key]} size={14} />
                        {intentLabels[key]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="ai-character-count">{draft.length}/6000</span>
            {running ? (
              <AIControl
                key="stop-generation"
                iconOnly
                icon={StopIcon}
                type="button"
                className="ai-secondary"
                onClick={(event) => {
                  event.preventDefault();
                  ai.stop();
                }}
              >
                Stop generation
              </AIControl>
            ) : (
              <AIControl
                key="send-message"
                iconOnly
                icon={SentIcon}
                variant="primary"
                className="ai-primary"
                type="submit"
                disabled={!ready || !draft.trim()}
              >
                Send
              </AIControl>
            )}
          </div>
        </form>
        <p className="ai-composer-disclaimer">
          PRIME AI can make mistakes. Your recorded progress stays authoritative.
        </p>
      </div>
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="ai-drawer">
          <SheetTitle>Conversations</SheetTitle>
          <SheetDescription>
            Continue an earlier preparation conversation.
          </SheetDescription>
          <ConversationRail onSelect={() => setHistoryOpen(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent className="ai-drawer">
          <SheetTitle>PRIME context</SheetTitle>
          <SheetDescription>Verified data used for this conversation.</SheetDescription>
          <ContextTrace />
        </SheetContent>
      </Sheet>
    </div>
  );
}
