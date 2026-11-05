# PRIME AI tool contracts

Only the server registry in `lib/ai/tools/registry.ts` defines tools. Groq cannot supply SQL, table names, arbitrary URLs, a user ID, an API key or new tool definitions. Every input is parsed/validated, the authenticated owner is supplied by PRIME, and output is bounded and validated before it enters the next model round.

| Tool | Access | Scope / limit | Confirmation |
| --- | --- | --- | --- |
| `get_problem_context` | Read | One canonical slug, relevant owned state, latest ten attempts | No |
| `get_problem_attempt_history` | Read | Latest ten attempts for one problem | No |
| `get_current_roadmap_state` | Read | Existing deterministic Core recommendation and progress | No |
| `get_due_revisions` | Read | Up to twenty due active problem revisions | No |
| `get_today_plan` | Read | Existing plan in the stored timezone, up to thirty tasks | No |
| `get_day_plan` | Read | One ISO date, existing plan/tasks only | No |
| `search_dsa_catalog` | Read | Literal title text, optional difficulty, maximum twenty results | No |
| `get_notes` | Read | Up to five owned notes, optionally one owned note UUID | No |
| `create_note` | Proposal | Title ≤100 characters, Markdown ≤12,000, optional validated problem | **Yes** |

Normal read tools use the existing authenticated Supabase client and RLS. A tool error returns a controlled unavailable result; AI may continue with available facts and must not fabricate missing data. Tool activity uses readable product labels. Search/internal references are built from canonical results, never arbitrary model URLs.

## Confirmed note flow

1. The model requests `create_note`, or the user chooses Save as Note on a completed response.
2. PRIME validates the content/attachment and stores one owner-bound proposal for that assistant message. A proposal does not create a note.
3. The UI displays the exact title, content and attachment, with review and confirmation/cancellation controls.
4. The authenticated same-origin confirmation sends only the stored action UUID and decision. Client replacements for the payload are rejected.
5. `decide_ai_note` locks the owned proposal, checks pending status/ten-minute expiry and inserts the existing `notes` record in the same transaction.
6. Replayed confirmation returns the original result. The proposal UUID is also the note UUID, preventing duplicate insertion. Cancellation/expiry performs no note write.

Saved content is Markdown, not HTML. UI status reflects the actual stored outcome. The next AI turn receives stored action outcomes instead of relying on a model claim that something was saved. A cancelled/expired proposal is closed; a fresh assistant draft can produce a new proposal.

## Deliberately unavailable

`create_custom_task` and `reschedule_task` are not registered: Planner/Today have no implemented mutation service yet. No generic database query, progress reset, attempt deletion, curriculum reordering, mastery mutation or revision-date calculation is exposed. This avoids a shadow planner and preserves domain ownership.
