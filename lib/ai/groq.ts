import "server-only";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { aiConfig } from "./config";
import { AI_LIMITS, resolveModel } from "./model-policy";
import type { AIProvider } from "./provider";
let groq: Groq | undefined;
function getGroq() {
  return (groq ??= new Groq({
    apiKey: aiConfig().key,
    maxRetries: 0,
    timeout: AI_LIMITS.timeoutMs,
  }));
}
export const groqProvider: AIProvider = {
  async *stream(messages, tools, signal) {
    const client = getGroq();
    const stream = await client.chat.completions.create(
      {
        model: resolveModel(),
        messages: messages as ChatCompletionMessageParam[],
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? "auto" : undefined,
        stream: true,
        temperature: 0.3,
        max_completion_tokens: AI_LIMITS.outputTokens,
        reasoning_effort: "low",
        include_reasoning: false,
      },
      { signal }
    );
    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (choice?.delta.content) yield { type: "text", text: choice.delta.content };
      for (const call of choice?.delta.tool_calls ?? [])
        yield {
          type: "tool",
          index: call.index,
          id: call.id,
          name: call.function?.name,
          arguments: call.function?.arguments,
        };
      if (choice?.finish_reason) yield { type: "finish", reason: choice.finish_reason };
      if (chunk.x_groq?.usage)
        yield {
          type: "usage",
          input: chunk.x_groq.usage.prompt_tokens,
          output: chunk.x_groq.usage.completion_tokens,
        };
    }
  },
};
