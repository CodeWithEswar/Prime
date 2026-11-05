# DSA problem intelligence page

## Architecture and navigation

The catalog opens the canonical `/practice/dsa/[problemSlug]` route. The old problem workspace Sheet has been removed. Titles are normal internal links; the external practice action remains separate and uses the stored provider URL. Missing or unverified URLs show a pending message instead of a generated LeetCode destination.

The `from` parameter preserves the catalog's search, topic, difficulty, company, collection, status, source window, revision filter, sort, page, and page size. Only the internal DSA catalog path and recognized query keys are accepted. Session storage preserves scroll, the selected visible link's focus, and up to 100 results from the current catalog page for previous/next navigation. This context expires after 30 minutes. Direct visits do not invent neighboring results.

Server metadata and rendering share a request-cached lookup. Loading, missing-problem, and recoverable-error states are separate. A database failure does not become a false 404.

## Personal intelligence and revisions

The workspace uses dedicated cards for the problem header, preparation snapshot, performance, attempt history, revision, source collections, and company context. Snapshot metrics, attempt entries, collections, and companies have compact individual tiles. The desktop rail has separate personal-state and problem-context cards. Missing acceptance rates and target times are omitted. Targets use the stored scalar `estimated_minutes`, without inventing a range or About text.

The existing attempt dialog and server mutation remain authoritative. Failed saves retain form input. Successful saves refresh this problem, its attempts, catalog lists and summary, revision data, and progress summary. Server paths are revalidated for the catalog, detail page, and revision page. The entire application cache is not cleared.

Revision intervals come from the existing 1/3/7/14/30-day domain sequence. Current and paused schedules use stored values. An earlier interval is marked reviewed only when actual review records support it. The page reads existing review ratings; it does not add a new review-completion or scheduling engine.

## Recharts

Charts are dynamically loaded only when useful data exists:

- No attempts: useful source context and a clear starting state, without charts.
- One attempt: actual outcome, time, confidence, and history; no trend line.
- At least two usable time or confidence records: that metric's trend appears independently.
- At least three actual review ratings: an ordinal Forgot / Hard / Okay / Easy progression appears. This is a review-outcome chart, not a calculated memory-retention percentage.

Recharts renders rounded duration bars with the latest attempt in red, a confidence area chart with a subtle red fill, and a step chart for actual review outcomes. Each chart has a current-value heading, summary, subtle grid, black tooltip, and keyboard-accessible layer. Selecting a point opens details on touch or pointer devices. Invalid dates, zero durations, and missing confidence values do not become fabricated points. Personal best requires an independent solve. Analytics disclose when they summarize only the latest 40 attempts.

## Company logos and source context

The controlled registry covers 174 company names/aliases, including all six companies in the user's screenshot. There are 172 local entries and two fixed official company-image URLs for Wissen Technology and Works Applications. The registry does not claim complete coverage of the 420-company catalog. Google and Microsoft retain their multicolor marks; other logos retain their brand colors without grayscale filters. Dark marks receive a light tile for contrast. Unknown or failed images use a neutral company symbol instead of initials. The company name remains visible and the decorative image avoids duplicate screen-reader names. No user-supplied remote URL is rendered. Asset sources are recorded in `public/brand/companies/sources.json`.

Only actual company associations for this problem are loaded. The initial list shows six companies, with an explicit view-all control. Available source windows come from those records. A single numeric value is labeled Source frequency; missing or multiple source values show Associated. Overlapping windows are never added, and frequency is not presented as an interview probability. A matching entry company is prioritized without inventing an association.

Collections use actual names, sections, and positions where stored. Missing positions are omitted. The local normalized catalog identifies `01-knapsack-problem` (`70bb14c7-540d-519a-b82f-46621f6590e9`) in AlgoPrep 151, Love Babbar 450, and Shradha, with no stored positions. No similarly named Knapsack variants were merged.

## Queries and performance

One canonical problem lookup is followed by parallel reads for this problem's topics, collections, active company associations, personal progress, attempts, and revision with review history. Personal reads explicitly filter the authenticated user and problem, in addition to existing RLS. No schema or RLS changes are required.

Initial attempt history is capped at 40 entries with an exact total; older entries load on demand, 40 at a time. Review history is capped at 40. Company associations are bounded at 1,000 records and filtered to this problem, without fetching the global company catalog or all 4,411 questions. Partial context failures remain visible and do not erase saved history.

## Responsive behavior and accessibility

The workspace has a maximum width of 1,440 pixels constrained to the shell's available width. At narrower desktop and tablet widths the context rail moves below the main sections. Mobile uses one column and stacked full-width actions. Buttons and section tabs are 32 px on mobile as on desktop; small controls are 28 px, prominent actions 36 px, and authentication controls 40 px. The section navigation remains compact and scrollable. Charts have explicit heights, and text wraps without horizontal page overflow.

Anchor navigation supports keyboard activation and moves focus to the corresponding heading. Dialog close restores focus to the triggering action. Form controls expose selected state and confidence labels. Reduced-motion preferences disable transitions and chart animations. Loading and failure messages use status or alert semantics.

## Validation

As of November 2, 2026:

- All 203 unit and integration tests passed, including navigation validation, chart activation thresholds, provider labels, company-window semantics, bounded history, explicit user scoping, and partial query failures.
- Project lint and type checking passed. The files added or directly changed for the page also pass a separate targeted lint check; the broader pre-existing catalog feature still has lint debt outside the project's lint script.
- Six flows in the earlier Chromium run were confirmed passing: new problem, progressive analytics after saving, save-failure retry, due-review/company context, responsive sizes, and keyboard/dialog behavior. The catalog-return fixture was corrected afterward to support a second page.
- The dedicated browser suite covers Chromium, Firefox, and WebKit, viewport widths 320–1,920, a 1,366×650 window, a 200% zoom equivalent, reduced motion, failed-logo fallback, partial errors, and older history. Run with `pnpm test:e2e:problem`. It uses an isolated local Supabase HTTP fixture and never writes live user data or opens external practice providers.
- The full localhost integration rerun was deferred at the user's request after automatic permission review timed out twice. A later offline Chromium render of the actual page and chart components verified all 13 listed viewport widths, no horizontal overflow or sidebar overlap, 32 px action/tab heights on a coarse-pointer device, all three Recharts chart types, point tooltips, eight loaded local company logos, the company expansion control, and zero/one-attempt states without fabricated charts. It reported no page errors. This uses fixture data, navigation/mutation shims, and inline local assets; it does not validate live authentication, database mutations, external logo availability, or the real shell's JavaScript behavior.
- The production build stalled in the restricted runner and was stopped. An unrestricted rerun was deferred at the user's request; no successful final build is claimed.

## Deferred

No advanced mastery calculation, weakness scoring, readiness score, new review workflow, new problem statements, speculative company associations, fabricated target-time ranges, or planner/roadmap/Today expansion is included. External-link repair and the remaining pending source URLs are documented separately in `docs/dsa-link-audit.md`.
