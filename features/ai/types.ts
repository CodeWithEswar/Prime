import type { ContextRef, AIIntent } from "./schema";
import type { TechnicalBlock } from "./markdown/structured";
export type AIState =
  | "idle"
  | "connecting"
  | "streaming"
  | "tool_requested"
  | "tool_running"
  | "confirmation_required"
  | "resuming"
  | "completed"
  | "cancelled"
  | "failed";
export type AIEvent =
  | { type: "hint_level"; level: number }
  | { type: "technical_block"; block: TechnicalBlock }
  | { type: "start"; conversationId: string; messageId: string; hintDepth: number }
  | { type: "text_delta"; text: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_result"; name: string; ok: boolean; summary: string }
  | { type: "confirmation_required"; action: AIAction }
  | { type: "entity_reference"; title: string; href: string }
  | { type: "error"; code: string; message: string; retryAfter?: number }
  | {
      type: "done";
      status: "completed" | "interrupted";
      inputTokens?: number;
      outputTokens?: number;
    };
export interface AIAction {
  id: string;
  tool_name: string;
  status: string;
  input: { title: string; body: string; problemId?: string; problemTitle?: string };
  expires_at: string;
  result: { noteId?: string } | null;
}
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: string;
  intent: AIIntent;
  ordinal: number;
  created_at: string;
  parts: AIEvent[];
}
export interface AIConversation {
  id: string;
  title: string;
  context: ContextRef;
  hint_depth: number;
  mode: AIIntent;
  updated_at: string;
  archived: boolean;
}
export interface AIContext {
  reference: ContextRef;
  label: string;
  subtitle: string;
  facts: Record<string, unknown>;
  references: { title: string; href: string }[];
  unavailable: string[];
}
