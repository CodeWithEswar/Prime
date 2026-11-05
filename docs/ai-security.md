# PRIME AI security and privacy

## Trust boundaries

The browser sends a conversation UUID, request UUID, bounded user text, typed intent and a page/entity reference. It cannot supply system prompts, arbitrary tools, owner IDs or credentials. The server verifies the current Supabase user and reloads relevant domain data. Unrelated personal content is not automatically bundled with every prompt.

POST/PATCH endpoints require the configured same origin and reject cross-site mutation requests. JSON is capped by actual streamed byte count (32KB), with a 6,000-character message limit. Zod rejects unknown fields. Authentication/configuration/input/provider/storage failures are normalized without raw request bodies or provider stack traces.

## Trusted persistence

The five AI tables all enable RLS. Authenticated clients receive owner-filtered reads, with no direct insert/update privilege on trusted AI lifecycle/action records. Quota rows have no client access. Composite foreign keys bind conversation/message ownership. Service-only RPCs use security invoker and an empty search path; EXECUTE is revoked from PUBLIC, anon and authenticated.

The existing server admin helper is used only after application authentication for AI persistence and confirmation. Every privileged query includes the verified owner or passes it into the narrowly defined service-only RPC. The model never selects an owner. This service credential is necessary to prevent a browser client from forging assistant roles or confirming a write by updating a table directly.

Request UUID uniqueness, an atomic conversation lease and transactional quotas protect against duplicate/concurrent turns. A note confirmation locks its action row, checks owner, status and expiry, and atomically writes one note. Model text saying “confirmed” is not authorization.

## Prompt injection and tools

User text, notes, external metadata and text returned by tools remain untrusted data. Prompts explicitly reject instructions inside such content to override rules or mutate state. Defense does not depend only on the prompt: the registry has no arbitrary SQL/browser/code tool, tool arguments are validated, read operations remain owner scoped, and the only V1 write requires trusted UI confirmation.

The model cannot calculate canonical schedules, revision transitions, prerequisites, outcomes, mastery or readiness. It can explain actual deterministic output/reason codes. Missing data is reported as unavailable rather than invented.

## Credentials and logs

`GROQ_API_KEY` and the Supabase server credential are kept only in server configuration and ignored `.env.local`. Neither is public-prefixed. No key is embedded in source, prompts, browser requests or client bundles. Server provider transport is fixed to the official Groq SDK boundary; no browser connection to Groq is needed.

Known API-key/token and database-connection-string patterns are redacted from user text and domain text before provider context and persistence. Pattern redaction is defense in depth, not a guarantee that arbitrary pasted secrets can be identified; users should not use AI chat as a secret store. Application logs record request IDs, status, model, timing and available usage counts rather than conversation bodies, tool payloads, cookies or keys.

## Rendering

The Markdown pipeline never enables raw HTML. Scripts, SVG/iframe/object/embed content, event handlers and model styles cannot execute. Remote model images are suppressed. Links are protocol checked; internal Markdown links require an application-supplied reference. External links use safe attributes. Code is rendered as escaped React text/tokens, including HTML examples; Highlight.js AST output does not enter `dangerouslySetInnerHTML`.

Structured technical blocks use a bounded Zod union. Model prose is not interpreted as a tool confirmation, algorithm metadata or executable diagram. Formatting failure preserves the original escaped response. No Mermaid, KaTeX, execution sandbox or remote image loader was added.

## Verification and deployment

The migration was first exercised in local PostgreSQL tests, then applied after the user's explicit push instruction. Owner isolation, forged-write rejection, restricted RPC execution, retry/edit lifecycle, quota enforcement, cancellation/expiry and replayed confirmation were tested. Linked-table privileges and invoker/EXECUTE settings were queried after deployment. A live service-role lifecycle check was rolled back without retaining test messages or quota changes.

Supabase advisors returned pre-existing warnings for legacy trigger/revision functions and disabled Auth leaked-password protection; no new AI-table/function finding was reported. These warnings remain outside this feature's scope. Browser tests use isolated authentication/forecast/AI fixtures and do not create real account records or spend Groq quota. Bounded manual Groq checks use synthetic examples.
