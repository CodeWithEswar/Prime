# PRIME — Weakness Intelligence Engine

## Executive Summary

The **Weakness Intelligence Engine** is PRIME's diagnostic and improvement system. While the **Mastery Engine** answers *"What can I demonstrate?"*, the Weakness Engine answers:
1. **Where am I struggling?** (Identifies specific topics and problems with diagnostic signals)
2. **Why am I struggling?** (Root cause analysis across failures, hint dependency, timing inefficiency, and retention regression)
3. **How reliable is that conclusion?** (Evidence confidence based on problem diversity, attempt depth, and temporal spread)
4. **What should I practice next?** (Deterministic, prioritized improvement recommendations)
5. **How can PRIME help me improve?** (Seamless routing into Algorithm Lab, conceptual review, and Planner V2)

---

## 1. System Responsibility Boundaries

To protect architectural boundaries, PRIME maintains clear separation of concerns:

| System | Responsibility | Canonical Output |
| :--- | :--- | :--- |
| **Prime Core Curriculum** | Authoritative syllabus & prerequisite DAG | Stages, topics, checkpoint problems |
| **Roadmap** | Learning progression & milestone tracking | Unlocked stages, eligible topics |
| **DSA Practice** | Captures authentic problem-solving attempts | `problem_attempts`, `user_problem_progress` |
| **Revision Engine** | Measures and schedules memory retention | `revision_items`, `revision_attempts` (FSRS) |
| **Mastery Engine** | Interprets demonstrated competence | Semantic mastery levels (`unseen` to `mastered`), evidence scores |
| **Weakness Intelligence** | Diagnoses improvement needs & root causes | Diagnostic status, evidence confidence, actionable recommendations |
| **Planner V2** | Balances capacity and schedules preparation | `daily_plans`, `daily_tasks`, `planning_intents` |
| **Today** | Daily operational execution runway | Executed checklist, "Optional Next" practice |
| **Algorithm Lab** | Visual algorithm learning & step debugging | Interactive simulation algorithms |
| **PRIME AI** | Conversational explainability & assistance | Read-only explanations of deterministic diagnostics |

> [!IMPORTANT]
> The Weakness Engine **never** acts as a secondary scheduling engine or recalculates canonical mastery. It consumes raw attempt telemetry, revision ratings, and mastery outputs, and emits structured recommendations that flow into Planner V2 via user-confirmed `planning_intents`.

---

## 2. Weakness vs. Insufficient Evidence

A fundamental principle of the Weakness Engine:
> **Untouched topics are NOT weaknesses. They are NOT ASSESSED.**

Diagnostic states are distinct from mastery levels:
- `not_assessed`: Zero attempts and zero revisions recorded.
- `emerging`: Initial practice (1 attempt or preliminary exposure), insufficient data for confident diagnosis.
- `needs_attention`: Statistically significant signal of struggle (high hint rate, repeated failures, or retention regression).
- `persistent`: Chronic weakness across multiple attempts/sessions (>= 3 failures or chronic hint dependency).
- `improving`: Learner previously struggled but recent attempts demonstrate independent solves and successful revisions.
- `stable`: Solid performance, low hint dependency, and consistent retention.

---

## 3. Four-Dimensional Evidence Model

The Weakness Engine assesses four orthogonal dimensions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. FAILURE SIGNAL (Weight: 0.35)                                       │
│    - Ratio of failed attempts to total attempts                        │
│    - Frequency of repeated recent failures                            │
│    - Chronic unsolved status                                           │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HINT & SOLUTION DEPENDENCY (Weight: 0.25)                           │
│    - Percentage of successful solves requiring hints (outcome = 'hint')│
│    - Solution-viewed attempts (outcome = 'solution_viewed')           │
│    - Inability to complete problems independently                      │
├────────────────────────────────────────────────────────────────────────┤
│ 3. TIME INEFFICIENCY (Weight: 0.20)                                    │
│    - Actual duration vs. configured target duration (targetTimeMinutes)│
│    - Significant speed deficit (> 1.3x target duration)                │
│    - Handled as UNKNOWN if duration or target time is unavailable      │
├────────────────────────────────────────────────────────────────────────┤
│ 4. RETENTION REGRESSION (Weight: 0.20)                                 │
│    - Revision reviews marked 'forgot' or 'hard'                        │
│    - Decay after earlier successful solves                             │
│    - Handled as UNKNOWN if no revision reviews exist                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Missing-Evidence Normalization
When a dimension is unavailable (e.g., no timing recorded or no revision reviews completed yet):
- That dimension is explicitly flagged as `UNKNOWN` / `null`.
- The remaining known dimension weights are **renormalized** so their sum equals 1.0.
- Diagnostic confidence is appropriately degraded (e.g., cannot achieve `high` confidence without revision and timing evidence).
- The engine never assumes failure for missing data.

---

## 4. Diagnostic Confidence

Every diagnosis reports an evidence confidence rating:
- `insufficient`: 0–1 attempts, or isolated single failure.
- `low`: 2 attempts on 1 problem, or narrow single-problem exposure.
- `moderate`: >= 3 attempts across >= 2 distinct problems, or consistent multi-session evidence.
- `high`: >= 5 attempts across >= 3 distinct problems, including revision reviews.

Repeatedly failing the same problem 10 times increases problem-level severity, but **does not** imply high topic-level coverage.

---

## 5. Root Cause Analysis & Stable Reason Codes

Explanations are derived deterministically and mapped to stable reason codes:
- `REPEATED_FAILURE`: Multiple unsuccessful attempts on the same or related problems.
- `HIGH_HINT_DEPENDENCY`: Majority of successful solves required hints or assistance.
- `SOLUTION_DEPENDENCY`: Solution was revealed before solving independently.
- `TIME_INEFFICIENCY`: Solutions are consistently slower than the target problem duration.
- `REVISION_FAILURE`: Scheduled spaced review was marked 'forgot'.
- `RETENTION_REGRESSION`: Previously mastered or solved problem failed during later retention review.
- `INSUFFICIENT_EVIDENCE`: Attempt count is too low for a conclusive diagnosis.
- `LIMITED_PROBLEM_COVERAGE`: Only 1 problem attempted in a multi-problem topic.
- `RECENT_IMPROVEMENT`: Recent independent solves indicate recovery from prior struggle.
- `INDEPENDENCE_IMPROVING`: Hint dependency has trended downwards in recent sessions.
- `STALE_EVIDENCE`: Last practice was over 60 days ago; evidence may not reflect current skill.

---

## 6. Deterministic Improvement Recommendations

Recommendations provide concrete, actionable guidance:
- `RETRY_PROBLEM`: Retry an assisted problem independently after an incubation interval.
- `PRACTICE_SIMILAR`: Practice an adjacent problem of similar pattern and difficulty.
- `REVIEW_PREREQUISITE`: Review a foundational prerequisite when struggling with a downstream topic.
- `COMPLETE_REVISION`: Perform an overdue or upcoming spaced retention review.
- `PRACTICE_INDEPENDENTLY`: Attempt new problems with a deliberate no-hints commitment.
- `REVIEW_ALGORITHM`: Open Algorithm Lab for interactive visual debugging of the underlying algorithm.
- `STUDY_CONCEPT`: Read conceptual notes and review boundary condition patterns.
- `ASSESS_TOPIC`: Complete an initial benchmark problem in an unassessed topic.

### 6.1 Planner V2 Integration Workflow
```text
[ WEAKNESS DIAGNOSTIC ]
         │
         ▼
[ IMPROVEMENT RECOMMENDATION ]
         │
         ▼ (User clicks "Plan Improvement")
[ PREFILLED PLANNING INTENT ] (/plan?work=new&source=...)
         │
         ▼
[ PLANNER PROPOSAL & PREVIEW ] (Calculates capacity, buffer, and dates)
         │
         ▼
[ USER CONFIRMATION ]
         │
         ▼
[ COMMITTED DAILY TASKS ]
         │
         ▼
[ TODAY SURFACE EXECUTION ]
```

---

## 7. Responsive UI & Visual Language

- **Workspace Route**: `/weakness`
- **Palette**: Pure Black (`#000000`), Pure Red (`#FF0000`), Pure White (`#FFFFFF`).
- **Skill Diagnostic Map**: Topic order matches PRIME Core curriculum sequence. Selected topic highlights with Pure Red border.
- **Evidence Lens**: Details selected topic, root causes, evidence dimension rails, and actionable recommendation cards.
- **Mobile Support**: Fully responsive across 360px, 390px, 430px, 768px, and 1440px+, using an accessible slide-over Drawer on mobile.

