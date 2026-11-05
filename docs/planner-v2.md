# PRIME — Planner V2: Adaptive Preparation Planning Architecture

## Executive Summary

PRIME Planner V2 elevates the platform from an automatic schedule generator into a **Hybrid Preparation Planning System**. Under this paradigm:
- The **Learner** decides what matters: their commitments, target milestones, priority intents, backlog items, and personal availability exceptions.
- **PRIME** decides how to distribute preparation intelligently: honoring prerequisites, spaced repetition intervals, cognitive capacity limits, and daily buffer thresholds.

Planner V2 adheres strictly to deterministic domain modeling. Canonical scheduling calculations, capacity budgets, plan health evaluations, and rebalancing policies are executed by pure TypeScript functions and atomic PostgreSQL transactions. PRIME AI serves exclusively as a read-only explainer and conversational planning assistant—never as the authority calculating or directly writing canonical schedules.

---

## 1. System Responsibility Boundaries

To maintain long-term architectural integrity, PRIME establishes rigorous boundaries between preparation subsystems:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                               CURRICULUM                               │
│                   Authoritative syllabus & DAG dependencies            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                ROADMAP                                 │
│                WHAT should eventually be learned & mastered            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              PLANNER V2                                │
│                   WHEN preparation should happen across time           │
│           (Balances User Intent + Curriculum + Capacity + Buffer)      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│                TODAY                 │  │           CALENDAR           │
│       WHAT should be executed now    │  │ HOW preparation is projected │
│   (Daily operational execution unit) │  │  (Multi-scale temporal view) │
└───────────────────┬──────────────────┘  └──────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            REVISION ENGINE                             │
│                  WHEN learned material must be revisited               │
│                (FSRS / Spaced Repetition Memory Scheduling)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            MASTERY ENGINE                              │
│              WHAT evidence demonstrates the user can reproduce         │
│          (Multi-factor deterministic skill evaluation & calibration)   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Roadmap**: Defines the directed acyclic graph (DAG) of modules, concepts, and problem sets. It knows sequence and prerequisites, not time or dates.
- **Planner V2**: Allocates work into concrete calendar days based on capacity, priority, and intent. It produces the committed `daily_plans` and `daily_tasks`.
- **Today**: The execution focal point for the current local day. It reads the confirmed daily tasks from Planner, executes attempts, and allows carry-over of unfinished tasks.
- **Calendar**: Temporal visualization projecting committed tasks across Month, Week, and Agenda horizons with interactive date selection.
- **Revision Engine**: Generates spaced repetition review tasks when memory retention decays. Revisions enter Planner as top-priority constraints (`P0`).
- **Mastery Engine**: Evaluates authentic capability from attempt evidence, independent solves, and retention history.

---

## 2. The Three Planning Horizons

Preparation planning operates simultaneously across three cognitive horizons:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. STRATEGIC HORIZON (90-Day Timeline & Target Role Trajectory)                  │
│    - Milestone progression towards target interview date                         │
│    - Cumulative study minutes, feasibility forecast, and completion velocity     │
│    - Workload distribution and long-range burnout prevention                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. TACTICAL COMMITMENT HORIZON (Weekly Commitment Board)                         │
│    - 7-day tactical window balancing core curriculum, revisions, and DSA         │
│    - Capacity mini-rails visualizing allocated minutes vs. planning budget       │
│    - Daily focus switcher and contextual commitment cards                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. OPERATIONAL EXECUTION HORIZON (Today Execution & Daily Plan)                  │
│    - Concrete checklist of prioritized tasks for the active local day            │
│    - Locked commitments protected against accidental reshuffling                 │
│    - "Optional Next" expansion after core commitments are satisfied              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Planner V2 Workflows

### 3.1 "Plan Work" Progressive Disclosure Sheet
Accessed via the primary `+ Plan work` action across the Planner workspace, this slide-over sheet provides contextual task configuration:
1. **Work Source Selector**:
   - `Custom Task`: Freeform title, target duration (15m to 180m), priority (`P0`, `P1`, `P2`, `OPTIONAL`).
   - `Prime Core Curriculum`: Selects next-eligible modules and concept milestones.
   - `DSA Practice`: Integrates problems from the DSA catalog, applying difficulty-based duration estimates.
   - `Spaced Revision`: Surfaces due and pending revision items.
   - `Algorithm Lab`: Schedules interactive algorithm implementation labs.
2. **Scheduling Options**:
   - Immediate allocation to next available slot.
   - Explicit target date placement with optional overload permission.
   - Direct placement into the unscheduled **Backlog**.
   - Lock commitment toggle (`is_locked = true`).

### 3.2 Plan Preview & Plan Health Diagnostic
Before any change is committed to the database, Planner V2 builds an atomic `planner_proposal` and calculates real-time **Plan Health**:
- **Operational Status**:
  - `HEALTHY`: Workload fits within the planning budget (available minutes minus reserved buffer).
  - `TIGHT`: Workload uses reserved buffer minutes but stays within absolute available capacity.
  - `OVERLOADED`: Workload exceeds absolute available capacity on one or more dates.
  - `INFEASIBLE`: Target date or prerequisite requirements cannot be satisfied.
- **Buffer & Capacity Visualization**:
  - Displays reserved buffer percentage (5%–40%, default 15%).
  - Highlights over-capacity and buffer-breach days.
- **Deterministic Explainability ("Why This Plan?")**:
  - Automatically translates domain scheduling reasons into plain-English justifications (e.g., "Locked commitment preserved", "High-priority user intent scheduled first", "Spaced revision scheduled on due date", "DSA problem volume capped at 3/day to prevent fatigue").

### 3.3 Confirmation & Two-Phase Commit
1. The client requests a proposal via `buildProposal(command)`.
2. The server acquires an advisory transaction lock (`lock_planner_owner`), computes candidate placements using `planControl()`, generates a SHA-256 snapshot hash, and stores the proposal in `planner_proposals`.
3. The user inspects the preview diff: additions, date shifts, unplaced items, and health warnings.
4. On `confirmProposal(id)`, the server verifies user ownership, checks that the proposal has not expired (10-minute TTL), verifies that the snapshot hash has not changed (detecting concurrent modifications), and updates `daily_plans` and `daily_tasks` in a single ACID transaction.

### 3.4 Backlog Management
The Backlog holds unscheduled items that the user intends to prepare but has not yet assigned to specific dates:
- Users can add items directly to the backlog from the catalog, Roadmap, or Plan Work modal.
- Each item tracks title, estimated minutes, domain category badge, priority, and source provenance.
- The `Schedule` action opens the Plan Work flow prefilled with the backlog item, while automatic planning seamlessly draws eligible work from the backlog.

### 3.5 Weekly Commitment Board
The `Week` tab visualizes the 7-day tactical window:
- Aggregates planned minutes vs. total capacity across the week.
- Displays each day of the week as an interactive card showing day name, date, load bar, and item count.
- The active selected day is rendered with a prominent Pure Red border (`#FF0000`), a live `TODAY` indicator, and a complete itemized task checklist.
- Tasks display duration in monospace font (`~30m`), priority badges, lock status indicators, and context actions.

### 3.6 Availability & Exception Management
Located in the `Availability` tab:
- **Weekday Defaults**: Set available minutes for each day of the week (Monday through Sunday) or designate specific days as rest days (0 minutes).
- **Reserved Buffer**: Configurable slider from 5% to 40% (default 15%) to absorb unexpected disruptions and prevent plan fragility.
- **Date Exceptions**: Override standard weekday rules for specific calendar dates (e.g., exams, travel, sick days, or preparation sprints).

### 3.7 Carry-Forward & Rebalancing (Stability Principle)
Unfinished tasks from past days (`date < today`) are never silently dropped:
- They are flagged as missed and queued for rebalancing.
- **The Stability Principle**: Rebalancing prioritizes minimal future churn. It never moves completed tasks or locked commitments (`is_locked = true`). Future tasks on days within capacity remain on their assigned dates. Only missed tasks or tasks on overloaded days are systematically migrated to the next available capacity slots.

---

## 4. Design System Compliance

Planner V2 adheres strictly to the PRIME brand identity and design system:
- **Color Palette**: Pure Black (`#000000`), Pure White (`#FFFFFF`), and Pure Red (`#FF0000`) with neutral zinc accents (`#18181b`, `#27272a`, `#52525b`, `#a1a1aa`).
- **Active State Highlights**: Selected date pills and cards utilize `border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_8px_rgba(255,0,0,0.3)]` for razor-sharp visual feedback.
- **Typography & Metrics**: All numerical statistics, durations, dates, and badges render in clean monospace (`font-mono tracking-tight`).
- **Responsive Layouts**: Designed mobile-first, ensuring zero horizontal overflow on mobile viewports (360px, 390px, 430px) through tablet (768px) and desktop (1440px+).

---

## 5. Verification & Testing

Planner V2 is verified through a multi-tier test harness:
1. **Domain Unit Tests** (`tests/unit/planner-control.test.ts`):
   - Verifies pure allocation algorithms, buffer reservations, DSA per-day limits, priority sorting, and deterministic placement outputs.
2. **Database Integration Tests** (`tests/integration/planner-control.test.ts`):
   - Executes real PostgreSQL migrations against in-memory PGlite.
   - Validates owner isolation, proposal expiration, snapshot hash concurrency checks, and atomic rollback on constraint violations.
3. **End-to-End Browser Tests** (`tests/e2e/planner.spec.ts`):
   - Automated with Playwright across narrow (360px–430px) and wide (1440px) viewports.
   - Tests the complete Plan Work progressive disclosure modal, target date picker, plan health preview, proposal confirmation, and weekly board updates.
