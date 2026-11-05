export interface ProviderMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
}
export interface ProviderTool {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}
export type ProviderDelta =
  | { type: "text"; text: string }
  | { type: "tool"; index: number; id?: string; name?: string; arguments?: string }
  | { type: "usage"; input: number; output: number }
  | { type: "finish"; reason: string };
export interface AIProvider {
  stream(
    messages: ProviderMessage[],
    tools: ProviderTool[],
    signal: AbortSignal
  ): AsyncIterable<ProviderDelta>;
}
