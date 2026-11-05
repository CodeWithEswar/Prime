# PRIME — Preparation Calendar

## Temporal Planning Canvas · Month / Week / Agenda · Workload Intelligence · Capacity Mapping · Revision Signals · Mobile-First Execution

---

## 1. Executive Purpose & Product Philosophy

A generic calendar answers:
> *"What date is it?"*

A productivity calendar answers:
> *"What meetings or events do I have?"*

PRIME Calendar answers:
> **"How is my preparation distributed across time?"**

The Preparation Calendar is PRIME's **Temporal Planning Canvas**. It provides an instant, explainable projection of the user's 90-day adaptive preparation plan, showing where workload is concentrated, where revision pressure exists, where scheduled recovery occurs, and how capacity is utilized across time.

```text
CATALOG          (What can be practiced)
   ↓
PRIME CORE       (What should be learned — curated ~189 canonical problems)
   ↓
ROADMAP          (Conceptual dependency order)
   ↓
REVISION ENGINE  (What must be revisited & intervals)
   ↓
ADAPTIVE PLANNER (Authoritative: daily generation, capacity, carry-forward, rebalancing)
   ↓
TODAY            (Execution runway: "What should I do right now?")
   ↓
CALENDAR         (Temporal projection: "How is my preparation distributed across time?")
```

---

## 2. Architectural Invariants & Authority Boundaries

1. **Projection, Not a Second Scheduler**:
   - The Calendar **never** generates tasks, modifies capacity rules, recalculates spaced repetition intervals, or invents plan trajectories.
   - The Planner remains authoritative for: generated daily tasks, daily capacity, availability exceptions, rest days, carry-forward, and rebalancing.
   - The Revision Engine remains authoritative for: due dates, recall intervals, and stage progression.
   - Today remains authoritative for: the real-time execution experience.

2. **Absolute Data Integrity**:
   - Zero redundant database tables (`calendar_events`, `calendar_tasks`, etc. are strictly prohibited).
   - Calendar consumes existing `daily_plans`, `daily_tasks`, `availability_rules`, `availability_exceptions`, `revision_items`, `problems`, and `preparation_plans`.

3. **Task Completion $\neq$ Problem Mastery**:
   - Scheduled preparation effort (even with hints or partial solutions) satisfies daily task completion.
   - Problem mastery is evaluated independently by the Mastery Engine.

4. **No HTML `<canvas>` Element**:
   - Built exclusively with semantic HTML, CSS Grid, React, and lightweight SVG/CSS visualization rails to ensure 100% accessibility (WCAG 2.2 AA), screen-reader readability, responsive adaptation, and testability.

---

## 3. Data Flow Architecture

```text
                   PRIME CORE
                       │
                       ▼
                    ROADMAP
                       │
                       ▼
                    PLANNER
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   DAILY PLANS     AVAILABILITY    REVISION
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              CALENDAR PROJECTION
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
          MONTH       WEEK      AGENDA
            │          │          │
            └──────────┼──────────┘
                       ▼
                    DAY LENS
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
         TODAY                    PLAN
```

---

## 4. Signature UI Components

### 4.1 Preparation Pulse Grid (Month View)
- 7-column layout starting on **Monday** and ending on **Sunday**.
- Week index labels (`W01`, `W02`, ...) along the left.
- **Day Cell Anatomy**:
  - Date Number in Geist Mono.
  - **Today Terminal**: Pure Red beacon dot (`#FF0000`).
  - **Selected Date**: Crisp white outline `#FFFFFF` with subtle elevation.
  - **Day Load Rail**: Visual ratio of planned minutes vs available capacity.
  - **Duration Text**: Compact readable duration (`3h`, `2h30`, `45m`, or `REST`).
  - **Revision Signal**: Semantic Hugeicon (`↻ 2`), highlighted in Pure Red when overdue.
  - **Carry Signal**: Arrow indicator (`↳ 1`) for carried-forward work.
  - **Over-capacity Warning**: Pure Red indicator (`! 35m`) when `planned > capacity`.
  - **Target Marker**: Clean `TARGET` badge for the user's interview deadline.

### 4.2 Preparation Load Rail
- **Normal Planned**: Muted white (`rgba(255,255,255,0.4)`).
- **Completed Portion**: Pure white fill (`#FFFFFF`).
- **Remaining Capacity**: Faint background rail (`rgba(255,255,255,0.08)`).
- **Over-Capacity**: Red overflow terminal segment with accessible title.
- **Rest Day**: Subtle recovery dots (`· REST`).

### 4.3 Capacity Lanes (Week View)
- A vertical timeline of 7 horizontal lanes avoiding cramped 7-column kanban layouts.
- **Top Summary Strip**: `THIS WEEK: 21h planned · 24h capacity · 4 revisions · 12 Core problems · 1 rest day`.
- Each day lane shows: Day title, capacity metrics, load rail, task allocation pills (`Revision 20m`, `Core 90m`, `Custom 30m`), and trajectory status.

### 4.4 Day Lens (Contextual Inspector)
- Right-side inspection panel on desktop (380–420px) or bottom drawer on constrained viewports.
- Displays selected date header, exact planned/capacity metrics, load rail, and segmented task groups:
  - `01 / REVISION`: Spaced repetition items with interval and duration.
  - `02 / PRIME CORE`: Curated canonical problems with difficulty, topic, and practice link.
  - `03 / CUSTOM`: User-defined milestones.
- Direct execution CTA: `[ Open Today ]` (if date is Today) or `[ Open Day in Plan ]` (if future date).

### 4.5 Mobile Experience (360px / 390px / 430px)
- **Top**: Compact month map with weekday initials (`M`, `T`, `W`, `T`, `F`, `S`, `S`) and micro load rails.
- **Bottom**: Immediate inline agenda for the selected date. Tapping any date instantly updates the agenda without full page reloads or jarring shifts.
- **Zero Horizontal Overflow**: Guaranteed at narrow widths down to 360px.

---

## 5. PRIME Design System Alignment

- **Palette**: Strictly Pure Black (`#000000`), Pure Red (`#FF0000`), and White (`#FFFFFF`).
- **Red Budget**: 5–8% visible UI (Today beacon, overdue revision signal, over-capacity warning, primary CTA).
- **Typography**: Geist Sans for primary headings and task labels; Geist Mono for dates, week numbers, durations, and capacity metrics.
- **Icons**: Exclusively Hugeicons (`Calendar02Icon`, `RotateRight01Icon`, `SourceCodeIcon`, `Task01Icon`, `Alert02Icon`, `ArrowRight01Icon`).

---

## 6. Timezone & Temporal Reliability

- Date calculations use canonical `YYYY-MM-DD` strings derived via `Intl.DateTimeFormat` with the user's configured IANA timezone (e.g. `Asia/Kolkata`, `America/New_York`, `UTC`).
- Fully resistant to client/server daylight saving time (DST) shifts and leap year edge cases (verified for Feb 29 leap years).

---

## 7. Verification Suite

- **Unit Tests (`tests/unit/calendar-domain.test.ts`)**: 13 tests verifying duration formatting, load rail metric calculations, attention precedence, month summary calculation, week grouping, and leap year matrix generation.
- **Shell Navigation Tests (`tests/unit/shell.test.tsx`)**: 16 tests verifying `/calendar` presence in `AVAILABLE_NAVIGATION_ITEMS` and route context resolution.
- **Playwright E2E Tests (`tests/e2e/calendar.spec.ts`)**: Tests month pulse grid rendering, Day Lens inspection, view switching (Month, Week, Agenda), and mobile 360px/390px zero-overflow compliance.

