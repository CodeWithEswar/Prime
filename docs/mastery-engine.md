# PRIME — Mastery Intelligence Engine

Evidence-based skill mastery, attempt quality, retention depth, independence, confidence calibration, timing, topic intelligence, and diagnostic explainability.

---

## 1. Executive Summary & Purpose

Mastery evaluates whether a learner can reproduce a skill independently and recall it after a spaced interval. The audit found canonical attempt and revision logs, a separate completion status, a draft score and snapshot migration, and an illustrative landing-page diagnostic. The workspace now derives its evidence directly from the canonical logs.

### What Mastery Answers

| Question | Owning Subsystem | Core Meaning |
|---|---|---|
| *Did I do the scheduled work?* | **Planner & Today** | Completion of assigned tasks |
| *What happened when I tried?* | **Attempt Engine** | Execution outcome, duration, confidence |
| *Did I retain it later?* | **Revision Engine** | Spaced recall at 1d, 3d, 7d, 14d, 30d |
| *Can I actually do this again without help?* | **Mastery Engine** | Accumulated evidence across independence & retention |
| *What should I improve next?* | **Weakness Engine** (Future) | Priority triage combining mastery, failures, and gaps |
| *Am I ready to clear target interviews?* | **Readiness Engine** (Future) | Comprehensive readiness projection |

---

## 2. Invariants & Non-Negotiable Architectural Rules

1. **Deterministic Domain Functions**: Mastery is calculated by pure TypeScript functions with zero side-effects and zero React/Next.js/Supabase/Groq/Mistral/Gemini dependencies.
   ```ts
   calculateProblemMastery(input, config, clock)
   ```
   *Same input + same config + same clock = identical result.*

2. **One Solve ≠ Mastered**: A single solve—even with confidence = 5 and lightning-fast execution—can **never** grant `mastered` status. Mastery requires repeated independent demonstration and verified spaced retention.

3. **AI explanation**. PRIME AI can explain deterministic results. The engine derives scores only from recorded attempts and reviews.

4. **Authoritative Evidence Tables**: Raw learning attempts (`problem_attempts`) and spaced revisions (`revision_items`, `revision_attempts`) remain authoritative. Mastery computes a derived result on demand from those records.

5. **Pure Black & Pure Red Design System**:
   - Palette strictly confined to `#000000`, `#FFFFFF`, `#FF0000`.
   - Zero traffic-light colors (no green, yellow, blue).
   - 5–8% red budget reserved strictly for active selections, blockers, and retention regressions (`Forgot`).

---

## 3. Evidence Signals & Policy V1

Centralized in `domain/mastery/policy.ts` with policy version `1`.

| Signal | Role | Canonical Source | Weight | Description |
|---|---|---|---|---|
| **Independence** | Primary | `problem_attempts.outcome` | 30% | Independent (1.0), Hint (0.65), Solution Viewed (0.25), Unsolved (0.0). |
| **Retention** | Primary | `revision_attempts.rating` | 25% | Easy (1.0), Okay (0.75), Hard (0.40), Forgot (0.0). Scaled by interval depth multiplier. |
| **Repeated Evidence** | Primary | Count of independent solves & passed reviews | 15% | Proves reproducibility. Requires >= 2 proof events for high levels. |
| **Time Efficiency** | Supporting | `problem_attempts.time_taken_seconds` vs target | 10% | Pacing efficiency clamped: `<= 1.0x` (100), `<= 1.25x` (85), `<= 1.5x` (70), `<= 2.0x` (50), `> 2.0x` (25). Null if target missing. |
| **Hint Independence** | Primary/Supporting | `problem_attempts.outcome` distribution | 10% | Penalizes systematic reliance on hints across attempts. |
| **Confidence Calibration** | Supporting | `problem_attempts.confidence` vs outcome | 5% | Rewards alignment between self-reported confidence and demonstrated execution. |
| **Recency** | Context | Evidence timestamps | 5% | Half-life decay (45 days) with bounded floor (0.25). |

### Normalized Weight Redistribution

If an optional dimension (such as `timing` or `confidenceCalibration`) is unavailable for a problem, its weight is redistributed proportionally across the remaining active dimensions rather than artificially penalizing the score.

---

## 4. Semantic Mastery Levels & Mandatory Requirements

| Level | Evidence Threshold | Mandatory Requirements |
|---|---|---|
| `UNSEEN` | 0 | No valid attempts or revisions recorded. |
| `EXPOSED` | Attempted | Attempted at least once, but zero successful independent or hint solves. |
| `LEARNING` | Score >= 30 | Active practice underway, but assistance reliance or early retention gaps remain. |
| `PRACTICED` | Score >= 50 | At least 1 successful attempt (independent or hint). |
| `PROFICIENT` | Score >= 70 | At least 1 verified independent solve **AND** at least 1 successful revision milestone (>= 3 days). |
| `MASTERED` | Score >= 85 | At least 2 verified independent solves **AND** verified retention milestone >= 7 days **AND** no recent `Forgot` regression. |

---

## 5. Retention Ladder & Interval Depth

Passing a 1-day revision does not prove long-term memory. PRIME applies an **Interval Depth Multiplier**:

```text
1-Day Review    0.25 multiplier (initial reinforcement)
3-Day Review    0.45 multiplier (early consolidation)
7-Day Review    0.70 multiplier (minimum for Mastered)
14-Day Review   0.90 multiplier (strong long-term retention)
30-Day Review   1.00 multiplier (permanent pattern memory)
```

### Regressions (`Forgot`)

If a user marks a spaced repetition review as `Forgot`:
- The retention dimension receives an immediate penalty (capped at 35).
- `requirements.hasRecentForgot` is set to `true`.
- The problem is immediately blocked from `mastered` status, falling back to `proficient` or `practiced`.
- A deterministic blocker `RECENT_FORGOT` is attached.
- An `Okay` or `Easy` review clears the regression blocker. The remaining mastery requirements still apply.

---

## 6. Freshness vs Anxiety-Inducing Daily Score Decay

PRIME distinguishes between **accumulated evidence** and **evidence freshness**:

- **Fresh (<= 30 days)**: Evidence is active within the current review cycle.
- **Aging (31–90 days)**. A maintenance review can refresh the evidence.
- **Stale (> 90 days)**: Last evidence is over 90 days old. Status badge notes `Refresh Recommended` without arbitrarily destroying the accumulated historical score.

---

## 7. Curriculum Aggregation & Core Scope

### Prime Core vs Catalog Separation

```text
PRIME Core Curriculum (189 Curated Problems)
       ↓
Canonical Stages (16 Sequential Stages)
       ↓
Curriculum Topics (e.g. Binary Search, Dynamic Programming)
```

- **Untouched Optional Problems**: Optional catalog questions never penalize Core topic mastery or coverage.
- **Core Coverage**: Communicates how much of the canonical curriculum has been demonstrated (e.g. `8 / 10 Core problems practiced`).
- **Bonus Optional Evidence**: Proficient or mastered optional Core entries can contribute up to five evidence points to their topic.

---

## 8. Database Architecture & RLS

The service reads at most 40 attempts and 40 reviews per problem, in owner-scoped batches of 50. Postgres policies on the original tables enforce ownership. The established attempt and revision transactions remain the write path. Their next read recalculates Mastery, and the UI reports unavailable evidence when the source query fails.

The existing draft snapshot migration is unused. V1 requires no database migration or backfill and shows no mastery history chart. The Revision page retains its existing review history.
---

## 9. Explainability & Diagnostics

Every calculated result deterministically produces:
- `strengths`: Concrete evidence points (e.g., `2 verified independent solves demonstrate reproducibility`).
- `blockers`: Explicit missing requirements (e.g., `7+ day retention required for Mastered`).
- `nextEvidence`: The single deterministic next action the user should take (e.g., `Advance retention by passing the scheduled 7-day review`).

---

## 10. AI Boundary & Integration

PRIME AI has read-only access to deterministic mastery:
- Tools: `get_mastery_evidence`
- Context loader: `loadAIContext(client, userId, { type: "mastery", ref: topicSlug })`
- Rule: AI must say *"PRIME currently marks Binary Search as Proficient because..."* and never *"I think you are Proficient"*.
- AI quizzes do not directly change mastery state.

---

## 11. Verification & Test Suite

The engine is verified across four test tiers:
1. **Domain Unit Tests** (`tests/unit/mastery-domain.test.ts`): Tests for boundary values, invariants, decays, regressions, and determinism.
2. **Component Tests** (`tests/unit/mastery-components.test.tsx`): Header, strip, filters, evidence rail, lens, and problem row interactions.
3. **Database and RLS tests** (`tests/integration/mastery-evidence.test.ts`): Saved attempts and reviews, regression, and account isolation through real database policies.
4. **E2E Playwright Suite** (`tests/e2e/mastery-workspace.spec.ts` & `tests/e2e/mastery.spec.ts`): Desktop workspace, keyboard navigation, and 360px/390px mobile drawer responsiveness without horizontal overflow.

