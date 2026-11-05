# PRIME — Planner Scheduling & Allocation Policy

## Overview

The PRIME Planner scheduling policy governs how user preparation goals, curriculum milestones, spaced revision items, and custom tasks are deterministically distributed across time. The engine prioritizes predictability, cognitive sustainability, and minimal schedule churn.

---

## 1. Capacity & Budget Calculations

Preparation capacity is computed on a per-calendar-day basis according to the learner's local timezone.

### 1.1 Precedence Hierarchy
For any given date, available study time is resolved through the following strict hierarchy:
1. **Dated Exception** (`availability_exceptions`): If an exception exists for the exact calendar date (`YYYY-MM-DD`), its `available_minutes` takes absolute precedence. If `is_unavailable = true`, available minutes is forced to `0`.
2. **Recurring Weekday Rule** (`availability_rules`): If no dated exception exists, the rule for that day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) is applied.
3. **User Default Profile** (`user_settings.daily_study_minutes`): If no explicit weekday rule exists, the user's default daily study minutes is used. If the day is marked in `rest_days`, capacity is set to `0`.

### 1.2 The Buffer Principle
To prevent burnout and absorb real-world variance (e.g., tough problems taking longer, unexpected interruptions), PRIME reserves a dedicated **Daily Planning Buffer**:
- **Default Buffer**: 15% of available daily minutes.
- **Configurable Range**: 5% to 40% (adjusted in the Planner Availability settings).
- **Planning Budget Formula**:
  $$\text{Planning Budget} = \lfloor \text{Available Minutes} \times (1 - \text{Buffer Rate}) \rfloor$$

**Example**: For a 120-minute available study day with a 15% buffer:
- Available Minutes: $120\text{ m}$
- Reserved Buffer: $18\text{ m}$
- Planning Budget: $102\text{ m}$

Automatic planning will only schedule up to 102 minutes of work on that day. The remaining 18 minutes serve as an operational safety margin.

---

## 2. Daily Cognitive Guardrails

To ensure deep learning rather than superficial rushing, the engine enforces strict daily guardrails:
1. **New DSA Problem Limit**: Maximum of **3 new DSA problems per day**. Cognitive retention diminishes significantly beyond 3 novel algorithmic challenges in a single session.
2. **Spaced Revision Reservation**: When calculating capacity for upcoming days, known upcoming revision items reserve their required minutes first (`reserves`), preventing new curriculum topics from crowding out memory consolidation.
3. **Rest Day Protection**: Days with `0` available minutes or `isRestDay = true` will not receive automatic task placements.

---

## 3. Priority Hierarchy & Allocation Order

When distributing work, tasks are sequenced and evaluated in descending priority order:

```text
Priority Rank 1: LOCKED COMMITMENTS
Tasks marked with is_locked = true. These are fixed by the user and never moved automatically.

Priority Rank 2: DUE SPACED REVISIONS
Spaced repetition items due today or overdue (P0). Memory decay is non-negotiable.

Priority Rank 3: USER-EXPLICIT COMMITMENTS & HIGH PRIORITY INTENTS
Tasks created directly by the user or assigned P0/P1 priority in the backlog.

Priority Rank 4: CARRY-FORWARD TASKS
Pending tasks from previous dates (date < today) that were not marked completed.

Priority Rank 5: CORE CURRICULUM NEXT-ELIGIBLE MILESTONES
Modules and practice problems from the PRIME Core curriculum whose prerequisites are 100% satisfied.

Priority Rank 6: OPTIONAL BACKLOG & PRACTICE
P2 and OPTIONAL practice items, included when capacity permits and the user enables "Include optional practice".
```

---

## 4. Manual Overrides & Overload Management

Learners maintain sovereignty over their schedule. If a user explicitly assigns a task to a specific date that exceeds the planning budget:
- If `allowOverload = false`: The allocator flags a warning (`This move exceeds the day's planning budget`) and leaves the item in the unplaced list.
- If `allowOverload = true`: The allocator permits the placement and generates an informative status:
  - If `planned > available`: Flags that the day exceeds absolute availability by $X$ minutes.
  - If `planned > budget`: Flags that the day consumes $X$ minutes of its reserved safety buffer.

---

## 5. Rebalancing & The Stability Principle

Life happens: study sessions are missed, exams arise, or availability changes. When rebalancing is triggered:

### 5.1 The Stability Principle
**Automatic rebalancing must never cause catastrophic schedule churn.**
- Completed tasks (`status = 'completed'`) are immutable.
- Locked tasks (`is_locked = true`) are immutable.
- Future tasks on days that remain within capacity are **left completely undisturbed**.
- Only tasks that are explicitly invalid (e.g., missed tasks where `date < today`, or tasks residing on dates that are now over capacity due to an availability reduction) are rescheduled.

### 5.2 Scoped Rebalancing
When an availability rule or exception is updated, the rebalancer accepts a `rebalanceScope(date: string) => boolean` predicate. Only tasks scheduled on the modified dates are considered for displacement, preserving the remainder of the 90-day trajectory.

### 5.3 Task Lineage & Provenance
When a task is moved to a new date:
- Its unique task ID is preserved.
- If carried forward from a past missed date, `carried_from_task_id` records the ancestor task, `carry_count` increments, and `original_date` records the first scheduled date.

---

## 6. Deterministic Explainability Codes

Every placement and move generated by Planner V2 is stamped with a canonical machine-readable reason code, which is translated for the UI and AI contexts:

| Reason Code | Category | User-Facing Explanation |
| :--- | :--- | :--- |
| `LOCKED_COMMITMENT` | Protection | Preserved on selected date as a locked commitment. |
| `USER_SELECTED_DATE` | Manual Intent | Scheduled on the date explicitly chosen by you. |
| `USER_HIGH_PRIORITY` | Intent Priority | Scheduled early based on your high-priority intent. |
| `REVISION_DUE` | Retention | Scheduled to reinforce memory on its spaced retention due date. |
| `CORE_NEXT_ELIGIBLE` | Curriculum | Scheduled as your next prerequisite-cleared curriculum milestone. |
| `AVAILABLE_CAPACITY` | Load Balance | Scheduled on the earliest day with open study capacity. |
| `CARRY_FORWARD` | Recovery | Carried forward from an earlier missed preparation session. |
| `CAPACITY_REBALANCE` | Maintenance | Rescheduled to relieve an overloaded day while protecting your buffer. |
| `TARGET_PRESSURE` | Velocity | Scheduled to keep pace with your active interview target date. |
| `BALANCED_WORKLOAD` | Pacing | Distributed evenly across the week to prevent cognitive burnout. |

---

## 7. Role of PRIME AI

PRIME AI interacts with the Planner strictly under read-only and advisory semantics:
- **No Direct Mutation**: PRIME AI cannot directly alter database rows or bypass validation.
- **Explainability**: PRIME AI reads the output of `planner_snapshot` and explains *why* the planner made specific choices using the deterministic reason codes.
- **Draft Assistance**: When the user requests AI planning (e.g., via the "Plan with AI" button), the AI formulates suggested changes, which are channeled through the standard `buildProposal` and `confirmProposal` preview/confirmation flow.
