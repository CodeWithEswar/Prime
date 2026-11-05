# PRIME — DSA Practice & Problem Tracking Vertical Slice

## Production Overview

The DSA Practice vertical slice establishes the core problem tracking and retention workflow in PRIME. PRIME is an interview-preparation planning and mastery system; it does not host an in-browser code editor or mock compiler. Instead, it guides the developer on **what to solve**, provides **editorial context**, deep-links directly to external platforms (**LeetCode** with `target="_blank" rel="noopener noreferrer"`), and tracks personal performance and spaced revision schedules upon return.

---

## 1. User Journey & Core Flow

```text
Discover Problem (/practice/dsa)
       ↓
Understand Context (Roadmaps, Collections, Company Frequencies)
       ↓
Open External Practice Platform (target="_blank" rel="noopener noreferrer")
       ↓
Return to PRIME
       ↓
Record Attempt (Outcome, Duration, Confidence 1-5, Edge Case Notes)
       ↓
Atomic PostgreSQL Transaction (record_problem_attempt RPC)
       ↓
Update Personal Progress & Schedule Next Revision
       ↓
Reflect Progress Immediately Everywhere (Badges, Counters, Context Rail)
```

---

## 2. Architecture & Routes

| Route | Description |
| :--- | :--- |
| `/practice` | Instant redirect boundary to `/practice/dsa`. |
| `/practice/dsa` | Canonical DSA catalog with server-side pagination, search debouncing, topic/collection/company filters, and slide-over workspace drawer (`ProblemWorkspaceSheet`). |
| `/practice/dsa/[problemSlug]` | Direct deep-linkable workspace view displaying comprehensive problem context, company statistics, personal progress, attempt history, and attempt recording modal. |

---

## 3. Database & Spaced Repetition Design

### Atomic Transaction RPC (`record_problem_attempt`)
Attempts are recorded atomically in PostgreSQL via `public.record_problem_attempt`:
1. **Inserts** row into `public.problem_attempts`.
2. **Upserts** row into `public.user_problem_progress` (`status`, `mastery_score`, `last_attempt_at`, `next_revision_at`).
3. **Upserts** row into `public.revision_items` (`next_review_at`, `interval_days`, `status = 'active'`).

### Retention Intervals Sequence
Spaced repetition intervals advance along:
```text
1 day  →  3 days  →  7 days  →  14 days  →  30 days
```
- **Independent solve with high confidence (4-5)**: Advances to the next interval step in the sequence.
- **Independent solve with low confidence (1-2)**: Scheduled for a 3-day review.
- **Hint used**: Scheduled for a 3-day review.
- **Solution viewed or unsolved**: Status set to `needs_revision`, interval reset to 1 day.

---

## 4. Design System Compliance

- **Pure Black (`#000000`) & Canvas (`#030303`)**: High-contrast, focused coding aesthetic.
- **Pure Red (`#FF0000` / `var(--accent)`)**: Strictly reserved for urgent attention states (`Needs Revision`, `Due today`, `Overdue`).
- **Monochromatic Typography**: Difficulties use white-alpha hierarchy (`easy`: 60% opacity, `medium`: 85% opacity, `hard`: 100% bold white).
- **Icons**: Exclusively `@hugeicons/core-free-icons` via `<Icon icon={...} />`.

---

## 5. Verification Matrix

| Test Suite | Commands | Status |
| :--- | :--- | :--- |
| **TypeScript** | `npm run typecheck` | Passed (0 errors) |
| **ESLint** | `npm run lint` | Passed (0 errors, 0 warnings) |
| **Unit & Integration** | `npm test` | Passed (17 test files, 167 tests) |
| **E2E Integration** | `npx playwright test tests/e2e/practice.spec.ts` | Passed (5/5 tests in Chromium) |

