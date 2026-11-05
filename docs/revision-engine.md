# PRIME Revision Engine & Revision Command Center

## Architectural Overview & Domain Spaced Repetition Specification

The **PRIME Revision Engine** transforms problem solving practice into permanent conceptual retention. It operates as a deterministic spaced repetition state machine tightly integrated with the DSA problem catalog, attempt tracking, app shell attention indicators, and scheduled email notifications.

---

## 1. Core Spaced Repetition Progression

Instead of heuristic or black-box ML models, PRIME uses a **deterministic milestone ladder**:

```text
Solve Problem
      ↓
Record Attempt (Outcome: Independent, Hint, Solution, Unsolved)
      ↓
Initial Revision Scheduled (1, 3, or 7 days)
      ↓
Problem Becomes Due (Appears in /revision Command & Shell Attention)
      ↓
Review Problem
      ↓
Record Revision Feedback:
      ├─ Forgot  ──> Reset interval to 1 day (urgent reconsolidation)
      ├─ Hard    ──> Retain current interval (conservative consolidation)
      ├─ Okay    ──> Advance +1 milestone: 1d → 3d → 7d → 14d → 30d
      └─ Easy    ──> Advance +2 milestones: 1d → 7d, 3d → 14d, 7d+ → 30d
```

### Stage Labels & Retention Horizons

| Milestone Stage | Interval | Retention Horizon | Purpose |
| :--- | :--- | :--- | :--- |
| **Stage 1-day** | 1 day | Immediate recall | Catch memory decay within 24 hours |
| **Stage 3-day** | 3 days | Short-term consolidation | Solidify working patterns |
| **Stage 7-day** | 7 days | Medium-term recall | Validate retention after weekend gap |
| **Stage 14-day** | 14 days | Long-term reinforcement | Verify multi-week conceptual recall |
| **Stage 30-day** | 30 days | Permanent mastery | Confirms instinctual interview readiness |

---

## 2. Database Schema & RPC Functions

### Schema Extensions (`supabase/migrations/20261102120000_revision_engine.sql`)

- **`revision_items`**:
  - `bookmarked BOOLEAN NOT NULL DEFAULT false`: User-flagged priority items.
  - `snooze_count INTEGER NOT NULL DEFAULT 0`: Number of times review has been deferred.
  - `snoozed_until TIMESTAMPTZ`: Postponed review cutoff.
- **`revision_attempts`**:
  - `time_spent_minutes INTEGER NOT NULL DEFAULT 0`: Active review duration.
  - `confidence INTEGER CHECK (confidence BETWEEN 1 AND 5)`: Self-assessed certainty.
  - `notes TEXT`: Key takeaways or edge cases recalled.

### Atomic Stored Procedures

1. **`complete_problem_revision(p_problem_id, p_rating, p_time_spent_minutes, p_confidence, p_notes)`**:
   - Evaluates rating against deterministic ladder.
   - Updates `revision_items.interval_days`, `next_review_at`, `last_reviewed_at`, and clears `snoozed_until`.
   - Inserts append-only log in `revision_attempts`.
   - Synchronizes `user_problem_progress.next_revision_at`.
2. **`snooze_problem_revision(p_problem_id, p_snooze_until)`**:
   - Defers `next_review_at` to the selected timestamp.
   - Increments `snooze_count` without altering earned interval stage.
3. **`toggle_revision_bookmark(p_problem_id)`**:
   - Toggles priority bookmark status atomically.

---

## 3. Revision Command Center UI (`/revision`)

The user interface matches the signature black/red/white PRIME design system:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ● REVISION                                                                       │
│ Review what matters before it fades.                     [ ⓘ How it works? ]    │
│ Spaced repetition for long-term mastery.                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ↻ Overdue (2) ]  [ 📅 Due Today (10) ]  [ ▤ Upcoming (24) ]  [ 📊 This Week (36) ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ Due Queue   Upcoming   Completed   All                          [ All Topics ⌵ ] │
├───────────────────────────────────────────────────────┬──────────────────────────┤
│ ⏱ Overdue · 2                                         │ Revision Load (Next 7 D) │
│ [★] Two Sum             EASY   Due Yesterday  [Review] │ [█] [█] [█] [█] [█] [█] [█]│
│ [★] Longest Substring   MED    1 day ago      [Review] ├──────────────────────────┤
│                                                       │ Retention Trend ⓘ        │
│ 📅 Due Today · 10                                     │ Easy  ───●────●          │
│ [★] 0/1 Knapsack        MED    Stage 3-day    [Review] │ Okay ─●                  │
│ [★] Kth Largest Element MED    Stage 3-day    [Review] │ Hard ●                   │
│                                                       │ R1   R2   R3   R4        │
│ ▤ Upcoming                                            ├──────────────────────────┤
│ > Tomorrow · 4                                        │ How Revision Works ⓘ     │
│ > Nov 04 · 7                                          │ 1. Practice a problem    │
│ > Nov 05 · 3                                          │ 2. Review at right time  │
│                                                       │ 3. Build long-term recall│
└───────────────────────────────────────────────────────┴──────────────────────────┘
```

---

## 4. Email Notifications & Cloudflare Reminders Integration

- **SMTP Mailer (`lib/email/revision-mailer.ts`)**:
  - Transport configured with `GMAIL_USER` and `GMAIL_PASS` credentials.
  - Sends high-contrast, executive HTML emails listing overdue and due-today problems with direct review links.
- **API Dispatcher (`app/api/reminders/dispatch/route.ts`)**:
  - Handles automated triggers (cron jobs or Cloudflare worker webhook).
  - Queries Supabase for users with due reviews, groups items, and dispatches personal digests.
- **Cloudflare Worker (`workers/reminders/src/index.ts`)**:
  - Runs morning (`0 6 * * *`) and evening (`0 20 * * *`) cron triggers.
  - Exposes `/dispatch-reminders` endpoint to trigger digests securely.

