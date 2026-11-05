"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Copy01Icon,
  Tick02Icon,
  NoteAddIcon,
  MoreHorizontalIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { AIControl } from "./ai-control";
import { useAI } from "../ai-provider";
import { aiRequest } from "../queries";
import type { AIMessage } from "../types";
import "./response-actions.css";
export function ResponseActions({ message }: { message: AIMessage }) {
  const ai = useAI()!,
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const feedback = useMutation({
    mutationFn: (rating: "helpful" | "not_helpful") =>
      aiRequest("/api/ai/feedback", {
        method: "POST",
        body: JSON.stringify({ messageId: message.id, rating }),
      }),
  });
  const save = useMutation({ mutationFn: () => ai.saveNote(message.id) });
  const canRetry =
    ai.messages.at(-1)?.id === message.id &&
    !["connecting", "streaming", "tool_running"].includes(ai.state);
  return (
    <>
      <div className="ai-message-actions prime-response-actions">
        <AIControl
          iconOnly
          icon={copied ? Tick02Icon : Copy01Icon}
          aria-label="Copy response"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message.content);
              setCopied(true);
              setCopyError(false);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopyError(true);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </AIControl>
        {message.status === "completed" && (
          <AIControl
            iconOnly
            icon={NoteAddIcon}
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            Save as Note
          </AIControl>
        )}
        <div className="prime-response-secondary">
          {canRetry && (
            <AIControl
              iconOnly
              icon={RotateRight01Icon}
              onClick={() => void ai.send("", message.intent, "retry")}
            >
              Retry
            </AIControl>
          )}
          <AIControl
            iconOnly
            icon={ThumbsUpIcon}
            disabled={feedback.isPending}
            aria-pressed={feedback.variables === "helpful" && feedback.isSuccess}
            onClick={() => feedback.mutate("helpful")}
          >
            Helpful
          </AIControl>
          <AIControl
            iconOnly
            icon={ThumbsDownIcon}
            disabled={feedback.isPending}
            aria-pressed={feedback.variables === "not_helpful" && feedback.isSuccess}
            onClick={() => feedback.mutate("not_helpful")}
          >
            Not helpful
          </AIControl>
        </div>
        <div className="prime-response-more">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AIControl
                iconOnly
                icon={MoreHorizontalIcon}
                size="icon-sm"
                aria-label="More response actions"
                title="More response actions"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={6}
              collisionPadding={12}
              className="w-44 bg-[#0A0A0A] border border-[#262626] shadow-2xl p-1.5 rounded-lg z-50 select-none animate-in fade-in-0 zoom-in-95"
            >
              {canRetry && (
                <DropdownMenuItem
                  onSelect={() => void ai.send("", message.intent, "retry")}
                  className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-mono text-[#D4D4D4] hover:text-white focus:bg-[#1A1A1A] focus:text-white rounded-md transition-colors"
                >
                  <Icon icon={RotateRight01Icon} size={15} className="text-[#AAAAAA] shrink-0" />
                  <span>Retry response</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={() => feedback.mutate("helpful")}
                className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-mono text-[#D4D4D4] hover:text-white focus:bg-[#1A1A1A] focus:text-white rounded-md transition-colors"
              >
                <Icon icon={ThumbsUpIcon} size={15} className="text-[#AAAAAA] shrink-0" />
                <span>Helpful</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => feedback.mutate("not_helpful")}
                className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-mono text-[#D4D4D4] hover:text-white focus:bg-[#1A1A1A] focus:text-white rounded-md transition-colors"
              >
                <Icon icon={ThumbsDownIcon} size={15} className="text-[#AAAAAA] shrink-0" />
                <span>Not helpful</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <span className="sr-only" role="status">
        {copied ? "Response copied." : ""}
      </span>
      {(feedback.error || copyError) && (
        <p className="ai-muted" role="status">
          {copyError
            ? "Copy failed. You can select the response to copy it."
            : "Could not save feedback."}
        </p>
      )}
    </>
  );
}
