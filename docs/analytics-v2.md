# PRIME Analytics V2

## Repository audit

The former Progress route was a placeholder. Analytics uses the authenticated dashboard shell, PRIME controls, the shared chart frame, and Recharts. The canonical attempt log and problem catalog provide DSA evidence. Today records focus sessions, while Calendar and Planner supply the local-date convention, committed daily plans and tasks, and capacity snapshots. Revision records recall outcomes and the live queue. The Mastery service owns all mastery scores, stages, and evidence coverage.

The current schema stores mutable task placement rather than an immutable history of daily commitments. Historical adherence and missed commitments cannot be reconstructed reliably. A carried task can appear in several daily plans. The execution view reports current committed rows and excludes superseded placements via the Planner policy. Planned rest uses a stored plan snapshot. Missing capacity stays unknown rather than applying today's availability to the past.

The weakness domain has a pure classifier but no published diagnostics projection, confidence model, or historical signal to consume. Analytics does not derive a parallel weakness score. The session timer records task-linked sessions without a cross-domain subject taxonomy. Preparation Mix groups time by known work type and preserves unclassified sessions.

## Metric contract v1

Periods cover 7, 30, or 90 user-local days. Without comparison, the range includes today so new activity is visible immediately. Comparison uses complete days and the immediately preceding equal-length window. Timestamp-based records are assigned to local days. Mastery, the revision queue, and the target plan are current snapshots.

| Metric                   | Definition and source                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Distinct problems solved | Unique canonical problem IDs with an independent or hint-assisted success in `problem_attempts`. Successful attempts count every such event.                                                       |
| Independent solve rate   | Independent outcomes divided by attempts with a recognized outcome. Solution viewed and unsolved remain eligible but are separate from assisted successes. Missing denominator yields unavailable. |
| Hint-assisted rate       | Hint-assisted successes divided by recognized attempts. The log does not track hints used on unsuccessful attempts.                                                                                |
| Median solve duration    | Median positive duration from successful attempts. No arbitrary performance benchmark.                                                                                                             |
| Reattempt improvement    | Within the window, a canonical problem has an earlier recorded non-independent outcome followed by an independent solve. Simultaneous records do not establish order.                              |
| Recorded study time      | Positive stored duration of closed `study_sessions`, attributed to local start date. Attempt duration and task estimates are excluded.                                                             |
| Committed work           | `daily_tasks` on committed `daily_plans`, filtered through the Planner's active-status policy and excluding rows created after the assigned day. Completed rows are reported separately.           |
| Active preparation days  | At least one attempt, closed measured session, completed task on its actual completion date, or recorded review. Planned work alone is not activity.                                               |
| Recorded reviews         | Rows in `revision_attempts`, grouped by the recorded rating. Completion rate requires historical due obligations and is unavailable.                                                               |
| Mastery and coverage     | Current authoritative PRIME Core projection. Period DSA coverage counts distinct attempted problems and is shown separately from lifetime mastery coverage.                                        |

## Query and security model

The server derives the owner from the authenticated session. Personal queries use the signed-in client, explicit owner filters, and existing RLS. Timestamp reads use a padded UTC bound followed by exact local-day projection, including DST. Inputs are allowlisted and paginated with stable ordering. A capped or failed source becomes unavailable in its own section. The browser receives summarized results rather than raw logs. No migration or rollup is required for this implementation. [Supabase pagination](https://supabase.com/docs/reference/javascript/range) and [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security) informed the query design.

Existing indexes cover daily plan dates, review timestamps, and session start timestamps. The attempt index has problem ID between the owner and timestamp, so a production plan for the 180-day comparison query should be measured before deciding whether a dedicated owner and attempt timestamp index is warranted. The current server limit is 20 pages of 500 rows per high-volume source. Hitting it makes that source unavailable to avoid reporting partial totals as complete.

## Workspace and verification scope

- Overview has the period metric rail, three-mode Preparation Pulse, Preparation Mix, current mastery, and deterministic insights.
- DSA has a daily or seven-day trajectory, canonical topic and difficulty filters, the sortable Topic Performance Matrix, topic detail, difficulty summaries, and qualifying reattempt sequences.
- Time separates recorded study minutes, planned minutes, saved capacity, and completed task counts.
- Consistency shows the selectable Preparation Rhythm, saved rest dates, current carried placements, and a weekly execution table.
- Skills shows the Mastery Landscape and observed revision outcomes alongside the live revision queue.
- PRIME AI receives a bounded read-only summary from the same metrics service. Analytics links into Planner without creating or confirming commitments.

The rhythm uses native HTML buttons so the same calendar cells support touch and keyboard selection. A graphical prerequisite explorer, historical weakness diagnostics and mastery changes, historical commitment adherence, a subject taxonomy for custom sessions, and live database and device profiling are outside this implementation.

## Validation

- The unit suite passed all 476 tests. Analytics tests cover outcome classification, duplicate solves, equal periods, daylight saving time, invalid session measurements, task replacement, and missing sources.
- The Playwright workspace test used isolated authenticated fixtures. It checked the legacy redirect, chart inspection, date and comparison changes, topic drill-down, separate planned and recorded time, rest-day behavior, and navigation through all six views. It checked Overview for page overflow at 360, 390, 430, 768, and 1440 pixels.
- Lint, type checking, and the Webpack production build passed. The default Turbopack build stopped when its CSS worker exited while processing the Mastery stylesheet.
