# PRIME — Interview Readiness Engine Architecture & Specification

## 1. Mission & Core Philosophy

The **Interview Readiness Engine** is PRIME's premium preparation assessment instrument. It evaluates how a learner's demonstrated, verified learning evidence compares against the competency requirements of their target interview profile.

### Fundamental Principle
> **Readiness is NOT the probability of getting hired.**
> PRIME does NOT compute or display fabricated percentage chances (e.g. "87% chance of getting into Google").
> PRIME provides a deterministic, transparent, and explainable assessment of **preparation evidence alignment**, not a speculative hiring prediction.

---

## 2. Design System Audit & Component Reuse Matrix

In strict accordance with PRIME's design standards, the Interview Readiness Engine creates zero new global design libraries or visual primitives. It exclusively composes the existing, battle-tested PRIME design system.

### Component Reuse Matrix

| UI Requirement | Existing Component | Source File | Action |
| :--- | :--- | :--- | :--- |
| **Page Layout & Header** | `PageFrame` | `components/shell/page-frame.tsx` | Reused (`variant="workspace"`) |
| **Container & Surfaces** | `Card`, `CardHeader`, `CardTitle`, `CardContent` | `components/ui/card.tsx` | Reused (`elevation="base"`, pure black borders) |
| **View Navigation** | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `components/ui/tabs.tsx` | Reused (Landscape, Coverage Matrix, Gaps) |
| **Profile Selector** | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `components/ui/select.tsx` | Reused |
| **Primary & Context Actions** | `Button` | `components/ui/button.tsx` | Reused (`variant="primary"`, `"secondary"`, `"ghost"`) |
| **Icons** | `Icon` with `@hugeicons/core-free-icons` | `components/ui/icon.tsx` | Reused (`Award01Icon`, `Target02Icon`, etc.) |
| **Status & Indicators** | `Badge`, `StatusBadge` | `components/ui/badge.tsx`, `components/shared/status.tsx` | Reused |
| **Competency Inspector** | `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` | `components/ui/sheet.tsx` | Reused (Accessible slide-over drawer) |
| **Evidence Matrix Table** | `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | `components/ui/table.tsx` | Reused (Responsive table layout) |
| **Search Filter** | `SearchInput` | `components/ui/search-input.tsx` | Reused |
| **Progress Rails** | `Progress` | `components/ui/progress.tsx` | Reused |
| **Metrics & Stats** | `Metric`, `MetricStrip` | `components/shared/metric.tsx`, `metric-strip.tsx` | Reused |
| **Loading Skeleton** | `Skeleton` | `components/ui/skeleton.tsx` | Reused |
| **Empty / Error States** | `EmptyState`, `ErrorState` | `components/shared/empty-state.tsx` | Reused |
| **Fluid Transitions** | Motion (`motion`, `motionSpring`, `motionEase`) | `lib/motion/index.ts` | Reused |

### Visual Identity
- **Color Palette**: Pure Black (`#000000`), Pure White (`#FFFFFF`), and Pure Red (`#FF0000`) with neutral zinc accents (`#18181b`, `#27272a`, `#52525b`).
- **Typography**: Geist Sans for interface prose; Geist Mono for measurements, ratios, durations, and competency codes.
- **Elevation**: Flat, quiet, border-defined surfaces with no glowing rainbow gradients.

---

## 3. Product Architecture & System Boundaries

```text
       TARGET ROLE / INTERVIEW PROFILE
                      │
                      ▼
               REQUIREMENT MODEL
                      │
                      ▼
              COMPETENCY FRAMEWORK
                      │
     ┌────────────────┼────────────────┐
     │                │                │
     ▼                ▼                ▼
    DSA          FUNDAMENTALS       APTITUDE
     │                │                │
     ▼                ▼                ▼
  ATTEMPTS       ASSESSMENTS        RESULTS
     │                │                │
     └────────────────┼────────────────┘
                      ▼
              EVIDENCE NORMALIZER
                      │
                      ▼
               READINESS ENGINE
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    COVERAGE       QUALITY       CONFIDENCE
       │              │              │
       └──────────────┼──────────────┘
                      ▼
              READINESS ASSESSMENT
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   OBSERVATORY       GAPS      RECOMMENDATIONS
                      │
                      ▼
                  PLANNER V2
                      │
                      ▼
                    TODAY
                      │
                      ▼
               NEW PRACTICE EVIDENCE
```

### Separation of Responsibilities
- **Roadmap**: Sequences *what* should be learned along the curriculum DAG.
- **DSA Practice / Attempts**: Captures problem attempts and timing telemetry.
- **Revision Engine**: Schedules and tests spaced memory retention (FSRS).
- **Mastery Engine**: Evaluates demonstrated competence and reproducibility.
- **Weakness Intelligence**: Diagnoses specific struggling patterns and root causes.
- **Readiness Engine**: Evaluates overall preparation alignment against a target interview profile.
- **Planner V2**: Schedules recommended preparation work into daily budgets.
- **Today**: Executes active daily preparation commitments.

---

## 4. The Three Evidence Pillars

The Readiness Engine strictly isolates three orthogonal dimensions for every competency:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. COVERAGE (Has the learner meaningfully practiced the competency?)   │
│    - none: Zero attempts or reviews.                                   │
│    - limited: 1 problem attempted, or < 30% of target problem set.    │
│    - sufficient: Multiple distinct problems covering core patterns.    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PERFORMANCE (What does the available evidence demonstrate?)        │
│    - Evidence from independent solves vs. hint dependency              │
│    - Memory retention outcomes from revision reviews (okay/easy/forgot)│
│    - Mastery Engine semantic levels (practiced, proficient, mastered)  │
│    - Weakness Intelligence signals (needs_attention, persistent)       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. EVIDENCE CONFIDENCE (Is there enough data to justify a conclusion?) │
│    - insufficient: 0-1 attempts.                                       │
│    - low: 2 attempts on 1 problem.                                     │
│    - moderate: >= 3 attempts across >= 2 distinct problems.           │
│    - high: >= 5 attempts across >= 3 distinct problems + revisions.   │
└────────────────────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **What Readiness is NOT:**
> - `Task completed` $\neq$ `Competency assessed` (clicking complete does not prove skill).
> - `Algorithm Lab watched` $\neq$ `DSA readiness` (visual tracing is an aid, not evidence of problem-solving).
> - `Missing evidence` $\neq$ `Failed assessment` (untouched topics are `not_assessed`, never failed).

---

## 5. Readiness Status Model

Each competency is assigned an evidence-based categorical status:

| Status | Meaning |
| :--- | :--- |
| `not_assessed` | No valid practice attempts or assessment evaluations recorded. |
| `insufficient_evidence` | Initial attempts exist, but data is too sparse for reliable evaluation. |
| `developing` | Demonstrated practice with emerging independence, but core requirements remain incomplete. |
| `needs_attention` | Evidence shows active struggle, high hint dependency, repeated failures, or retention decay. |
| `evidence_aligned` | Sufficient coverage, consistent independent solves, and demonstrated retention. |

---

## 6. Target Profiles & Competency Framework

Readiness is evaluated against explicit, versioned preparation targets:

### Canonical Target Profiles
1. **General Software Development Engineer (`general-sde`)**:
   - Focus: Broad algorithmic foundation, core systems fundamentals, basic aptitude, and coding mock.
   - 18 Total Competencies (10 DSA, 4 Fundamentals, 2 Aptitude, 2 Mock).
2. **Backend Developer (`backend-dev`)**:
   - Focus: High emphasis on Algorithms, DBMS, SQL, Operating Systems, Networking, and Technical Mock.
   - 16 Total Competencies.
3. **Full-Stack Developer (`fullstack-dev`)**:
   - Focus: Balanced DSA, Database Modeling, OOP, Web Architecture, and Coding Mock.
   - 16 Total Competencies.
4. **Frontend Developer (`frontend-dev`)**:
   - Focus: Core DSA (Arrays, Strings, Trees), Web Fundamentals, Performance, and Coding Mock.
   - 14 Total Competencies.

---

## 7. Signature Visualizations & Workflows

### 7.1 Readiness Landscape
The signature visual component displays all target competencies grouped by preparation domain:
- **DSA** (Arrays, Two Pointers, Sliding Window, Binary Search, Trees, Graphs, DP, etc.)
- **Fundamentals** (DBMS, Operating Systems, Computer Networks, OOP, SQL)
- **Aptitude** (Quantitative, Logical Reasoning, Verbal)
- **Interview Practice** (Coding Mock, Technical Mock, Behavioral Mock)
Each competency card shows importance (`Core` / `Supporting`), status pill, and confidence indicator.

### 7.2 Competency Evidence Inspector (Sheet / Drawer)
Selecting any competency opens a detailed slide-over inspector:
- **Requirement Target**: Core vs. Supporting requirement for the active profile.
- **What Supports This?**: Quantified evidence points (distinct problems solved, independent rate, successful revisions).
- **What Needs Attention?**: Specific blockers (e.g., hint dependency, retention decay, limited problem variety).
- **Next Best Action**: Actionable preparation task with duration and rationalization.
- **Action**: `[ Plan Improvement ]` button routing directly into Planner V2!

### 7.3 Evidence Coverage Matrix
A high-density table allowing sorting, search, and domain filtering across all competencies. Columns detail Coverage, Performance, Retention, Confidence, and Requirement Importance.

### 7.4 Readiness Gaps & Priority Attention
Categorizes and prioritizes gaps:
- `Unassessed`: Important competency has zero evidence.
- `Limited Evidence`: Preliminary attempts exist but require reinforcement.
- `Performance Gap`: High hint dependency or repeated failures.
- `Retention Gap`: Forgotten during spaced repetition review.
- `Coverage Gap`: Insufficient problem breadth.

---

## 8. Planner V2 & Today Integration

```text
[ READINESS GAP ]
        │
        ▼
[ ACTIONABLE RECOMMENDATION ]
        │
        ▼ (User clicks "Plan Improvement")
[ PREFILLED PLANNING INTENT ] (/plan?work=new&source=...)
        │
        ▼
[ PLANNER PROPOSAL & PREVIEW ] (Honors capacity, buffer, rest days, locked tasks)
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

## 9. Verification & Quality Gates

The engine is verified through:
1. **Domain Unit Tests** (`tests/unit/readiness-domain.test.ts`): Profile switching, evidence normalization, missing data handling, gap identification, and recommendation ranking.
2. **Component Tests** (`tests/unit/readiness-components.test.tsx`): Header, landscape, inspector, matrix, accessibility.
3. **Integration Tests** (`tests/integration/readiness.test.ts`): Full data service query aggregation and RLS isolation.
4. **End-to-End Tests** (`tests/e2e/readiness.spec.ts`): Full browser walkthrough across desktop (1440px), tablet (768px), and mobile (360px–430px).

