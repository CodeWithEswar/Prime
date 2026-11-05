# PRIME AI

PRIME AI provides a shared contextual panel and `/ai` preparation workspace. It uses Groq for explanations and coaching; PRIME's deterministic curriculum, attempt and revision services remain authoritative. The feature is optional and does not replace those services.

## Repository audit

The repository uses Next.js 16.4.3, React 19.3, Supabase, TanStack Query, Zod, Radix primitives, Hugeicons and the PRIME Command Frame. There was no Mistral integration to replace. Roadmap, DSA Practice, Problem Intelligence, attempts and Revision had usable services. Planner/Today and Notes had placeholder screens backed by tables; no planner mutation service existed. The implementation reuses the existing authentication, server/admin clients, query provider, curriculum selectors, problem-detail queries, UI primitives and branding. Notes now displays the twenty most recently updated owned notes and can attach a selected note to AI context.

## Groq setup and model policy

The official `groq-sdk` 1.6.0 is isolated in `lib/ai/groq.ts`. The configured model is **`openai/gpt-oss-120b`**, verified against both the official catalog and the supplied account's live model list. One primary model is configured; no fast/fallback routing was introduced.

At verification, the catalog listed a 131,072-token context window and 65,536 maximum completion tokens for this model. PRIME caps its own completion at 1,800 tokens. The published free-plan limits included 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day; actual organization limits remain authoritative. Developer-plan figures and account-specific quotas can differ. See [models](https://console.groq.com/docs/models) and [rate limits](https://console.groq.com/docs/rate-limits).

Streaming uses Chat Completions, low reasoning effort, hidden reasoning, temperature 0.3, a 75-second abort budget and no automatic SDK retries. Registered function tools use JSON Schema and server-side Zod validation. Ordinary responses remain Markdown. Groq documents that structured-output mode currently cannot be combined with streaming/tool use, so the application does not combine those incompatible modes. [Official SDK](https://github.com/groq/groq-typescript), [tool calling](https://console.groq.com/docs/tool-use/local-tool-calling), [structured outputs](https://console.groq.com/docs/structured-outputs).

Server-only configuration:

```text
PRIME_AI_ENABLED=true
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b
SUPABASE_SERVICE_ROLE_KEY=...
```

No `NEXT_PUBLIC_` secret is created. Keys are stored locally only in ignored `.env.local`. Runtime configuration errors produce a controlled AI error; builds make no provider calls. When disabled, AI actions and navigation disappear and `/ai` shows an unavailable state. Core PRIME continues operating.

## Provider and streaming architecture

`lib/ai/` owns configuration, model policy, errors, prompts, provider contracts, streaming transport, redaction and the tool registry. `features/ai/server/` owns authenticated application context and persistence. Routes under `/api/ai/` expose chat, context, paginated conversations/messages, proposals/confirmations and feedback.

The streaming gateway sends newline-delimited JSON events: start, text delta, hint metadata, tool activity/result, entity reference, confirmation, controlled error and done. It supports partial UTF-8/network chunks. Provider cancellation follows browser abort and timeout signals. Partial assistant text is retained as interrupted/failed when possible. Database writes occur at lifecycle boundaries, not per token.

The client has explicit connecting/streaming/tool/confirmation/completed/cancelled/failed states. Stop cancels generation; a rejected request restores the prompt. Retry replaces the latest assistant response without adding another user message. Editing the latest user prompt replaces its downstream response. Request UUIDs, a conversation lease and database uniqueness prevent duplicate turns. Closing the panel preserves the active conversation within the dashboard session; persisted history remains available after reload.

## Persistence and RLS

Migration `20261102183803_prime_ai.sql` was applied to the linked Supabase project after the user explicitly requested the push. CLI-generated database types were regenerated. Only that pending migration was pushed; seeds and vault updates were excluded.

Tables:

- `ai_conversations`: title, original context reference, mode, hint depth and current-turn lease.
- `ai_messages`: bounded content, role/status, ordinal, intent, typed parts, request identity and provider metrics.
- `ai_tool_calls`: immutable note proposal, expiry, decision/status and result; one proposal per assistant message.
- `ai_feedback`: one helpful/not-helpful rating per owned response.
- `ai_usage_buckets`: current minute/day request counts, accessible only to the trusted server.

All five tables enable RLS. Authenticated clients can read their own conversations, messages, proposals and feedback; they cannot forge assistant content or action state. The server derives the user through `auth.getUser()` and scopes privileged operations to that owner. Service-only invoker RPCs implement atomic turn creation/quotas and note confirmation; neither RPC is executable by anonymous/authenticated clients. No new security-definer function was added. `lib/ai/database.ts` narrowly corrects the generated RPC type for its intentionally nullable new-conversation argument; table types come from the generated schema.

## Context and coaching

The browser supplies only a typed page/entity reference. The server reloads canonical data rather than scraping the DOM or trusting browser progress values.

| Context | Actual information supplied |
| --- | --- |
| Problem | Metadata, topic, difficulty, target time, status, latest ten attempts, revision state and Core-stage metadata |
| Roadmap | Existing deterministic selector output, current stage/progress and next recommendation with its reason code |
| Revision | Up to twenty due active problem revisions, excluding future snoozes |
| Today/Plan | Existing plan and up to thirty ordered tasks for the requested date; no invented plan when absent |
| Notes | The explicitly attached owned note, or a requested bounded notes read |
| Progress | Bounded recorded status counts, with sample/total counts distinguished |
| Practice | Catalog context plus bounded search through a registered tool |
| Algorithm Lab | Server-regenerated algorithm/input/step snapshot, variables, active Java line, invariant and complexity; execution remains deterministic |

AI Roadmap reads request strict error handling so unavailable personal data is not silently interpreted as zero progress. Dates use the user's stored timezone where applicable. Context traces disclose the conversation's attached origin. General chat does not automatically attach every note, attempt or plan.

Intents are Ask, Explain, Hint, Summarize, Correct, Improve, Quiz, Interview and Revision Notes. Hint depth is persisted and capped at five. Quiz/interview mode persists between turns and asks one question at a time. Prompts teach invariants, recognition signals and trade-offs without inventing progress or revision dates. The current version is `prime-ai-v3-algorithm-lab`.

Context budgets are explicit: latest fourteen messages, 9,000 history characters, 9,000 current-context characters, 5,000 characters per tool result, at most six calls and three model rounds per turn. Older semantic conversation summaries are not generated in V1; old details may need restating. Mode/hint depth remain persisted and domain facts are refreshed.

## Panel, workspace and rendering

The desktop panel uses 440px and reserves main-content space at wide widths. Narrower screens use the existing modal Sheet. The dedicated page uses history, conversation and optional context columns; mobile uses history/context drawers. PRIME AI is available in the sidebar, mobile More navigation and command search while enabled.

Buttons use PRIME's compact bordered surfaces and Hugeicons. Code/response/composer actions and Continue to latest are icon-only with accessible labels and hover titles. Select controls use the existing Radix-based component, stay on one line and adapt to their available width. Mobile layout follows the visual viewport and safe areas; short viewports compact the context/composer. Automatic following stops when the reader scrolls up and resumes through Continue to latest.

The shared renderer uses safe GFM Markdown, a lazy Code Frame and responsive Data Strip tables. Code has source-only copy, wrap, line numbers, bounded automatic language detection for code-like TEXT, manual language choice and readable syntax colors. Incomplete fences stay lightweight until closed. Typed hints/tools/confirmations/references are rendered separately. See [renderer architecture](ai-markdown.md).

## Queries, permissions and limits

TanStack keys include the account identity. Conversation lists use stable timestamp/ID cursor pagination, messages use ordinal pagination, and current context is cached briefly. Header/panel/workspace share one controller and query client. Streams use fetch/AbortController rather than a query as a token transport. Feedback and confirmation use mutations. Note saves invalidate only notes-related data.

The database enforces eight accepted turns/minute and eighty/day per account across server instances. The minute/day buckets are bounded to the current two entries per account. Provider organization-wide token quotas may still be reached; 429/Retry-After and provider failures have controlled UX. No automatic write retry occurs.

## Verification and remaining limits

Verification includes the actual SQL migration in isolated PostgreSQL, server orchestration/HTTP/Markdown tests, browser fixtures in Chromium/Firefox/WebKit, live provider smoke checks and a rolled-back service-role lifecycle test against the linked database. The deployed API credential was verified without printing records. Test requests do not spend provider quota; the small manual provider checks used synthetic examples.

Final command counts/results are recorded in [the renderer report](ai-markdown.md). Logs and traces live in ignored `.generated/ai/`.

Planner mutations are intentionally unavailable until a real planner service can validate them. No autonomous jobs, AI scheduling/mastery/readiness engine, code execution, web search, voice, connectors, vector database, background summarization or unrelated modules were added. Notes are the initial confirmed write tool. A hard process termination can leave a streaming row until a later turn expires its lease; ordinary Stop/network failures are finalized when the process remains alive.

Supabase advisors reported existing warnings on legacy trigger/revision functions and Auth password settings, with no finding on the newly added AI functions/tables. Those unrelated settings were not changed. See [security details](ai-security.md) and [the actual tool matrix](ai-tools.md).
