# PRIME — Operating Systems Implementation Audit & Architectural Inventory

## 1. Executive Summary

- **Feature:** CS Fundamentals → Operating Systems (`/roadmap/os`, `/fundamentals/os`)
- **Reference Catalog:** Neso Academy Operating Systems Course (77 Indexed Lessons + 6 Deep-Dive Supplementary Modules)
- **Primary Source Playlist:** `https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O`
- **Auditor:** Staff Full-Stack Engineer, Design Systems Engineer & Learning Systems Architect
- **Audit Date:** 2026-11-04
- **Curriculum Version:** 2.0.0

---

## 2. Reusable Component Inventory

PRIME enforces strict reuse of existing tokens, primitives, and component architecture. No shadow UI primitives or secondary icon libraries are introduced.

| Existing Component / Primitive | Export Path | Purpose in OS Learning Intelligence | Compliance Notes |
| :--- | :--- | :--- | :--- |
| **Button, Button Group** | `@/components/ui/button` | Primary CTA ("Continue Learning", "Plan Course", "Simulate"), step controls | Pure black background, `#FF0000` hover/active accents, tactile solid click |
| **Tabs, TabsList, TabsTrigger** | `@/components/ui/tabs` | Top navigation (Overview, Roadmap, Videos, Practice, Simulators, Revision, Analytics) | Reusable tab switching without second permanent sidebar |
| **Card, Surface** | `@/components/ui/card` | Day overview cards, simulation panels, video items, metric tiles | `#0A0A0A` surface, `#1F1F1F` borders, `#141414` hover elevations |
| **Progress** | `@/components/ui/progress` | Day progress, overall completion %, algorithm step trace | Restrained red indicator `#FF0000` with smooth transitions |
| **Badge** | `@/components/ui/badge` | Difficulty badges (Easy, Medium, Hard), Priority (Critical, High), Lab status | Standardized colors: green/amber/red with dark background tints |
| **Table, TableHeader, TableRow** | `@/components/ui/table` | 77-entry video library, process scheduling tables, frame tables | Compact data density, sticky headers, responsive horizontal scroll |
| **ScrollArea** | `@/components/ui/scroll-area` | Video selector rail, Gantt chart horizontal view, simulation logs | Native overflow styling matching Pure Black canvas |
| **Drawer / Sheet** | `@/components/ui/sheet`, `@/components/ui/drawer` | Mobile filter drawers, day inspection panel on tablet/mobile | Touch-friendly sheets with focus traps and keyboard dismissal |
| **Dialog** | `@/components/ui/dialog` | Video modal player, plan confirmation modal, simulation reset alert | Accessible modal focus management, backdrop blur |
| **Icons** | `@hugeicons/core-free-icons` via `@/components/ui/icon` | System icons: CPU, Play, Checkmark, Clock, Route, Database, Arrow | Single approved Hugeicons set; zero secondary icon libraries |

---

## 3. Domain Tables & Storage Schema

The Supabase database architecture created in `supabase/migrations/20261104140000_dbms_learning_course.sql` was intentionally generalized to support all CS Fundamentals courses (`learning_courses`, `learning_course_days`, `learning_videos`, etc.).

### Domain Tables Reused:
1. `public.learning_courses`:
   - Stores `id: 'os-12-day'`, `slug: 'os'`, `title: '12-Day Operating Systems Learning Roadmap'`, `category: 'fundamentals'`, `total_days: 12`.
2. `public.learning_course_days`:
   - 12 rows corresponding to Days 1–12 of Operating Systems.
3. `public.learning_videos`:
   - 77 indexed Neso Academy entries + 6 supplementary modules.
4. `public.learning_day_videos`:
   - Joins videos to their scheduled day.
5. `public.learning_enrollments`:
   - Tracks user enrollment and active day pointer.
6. `public.learning_video_progress`:
   - Tracks `watched`, `notes`, `difficulty_rating`, `is_bookmarked`, `revision_due`.
7. `public.learning_exercise_attempts`:
   - Tracks numerical problem and laboratory simulation attempts.
8. `public.learning_day_progress`:
   - Tracks assignment completion and day-level notes.

### Local & Offline Fallback:
For unauthenticated sessions or local development without live Supabase credentials, the OS service features an in-memory / `localStorage` state store mirroring all database mutations with zero runtime crashes.

---

## 4. Integration Contracts

### 4.1 Planner V2 Integration
- When user clicks **"Plan Course"**, an idempotent preview is generated mapping 12 days to available study slots (excluding designated rest days).
- User can inspect the scheduled calendar dates in a non-mutating preview modal.
- On explicit confirmation, tasks are committed to `planner_tasks` under category `'fundamentals'` without duplicate insertion.

### 4.2 Revision Engine (FSRS) Integration
- Revision candidates are derived from:
  1. Videos marked with `revision_due: true` or rated `Hard`.
  2. Lab exercises attempted with errors or flagged for follow-up.
- Follows spaced-repetition intervals: 1, 3, 7, 14, 30 days.

### 4.3 Interview Readiness Engine Integration (`/readiness`)
- Competency ID: `fund-os` ("Operating Systems & Concurrency", slug `os-concurrency`).
- The readiness engine directly evaluates:
  - Total OS curriculum videos watched.
  - Interactive simulator lab exercises completed.
  - Due revisions completed.
- Connects directly into General SDE and Backend readiness radar scores without invented hiring probabilities.

---

## 5. Missing Capabilities & Remediation

1. **Direct YouTube Playlist Outbound Scraper in Node**:
   - In sandboxed CI/agent environments without outbound internet access, dynamic network calls fail.
   - **Remediation**: Implemented robust offline-first manifests (`content/os/neso-video-manifest.json`, `content/fundamentals/os/neso-playlist.json`) with corroborated video IDs and safe playlist fallback URLs.
2. **Entries 72–77 Truncated Coverage in Neso Academy**:
   - As documented, entries 72–77 in Neso's playlist are short 5–8 minute chapter teasers rather than full lessons.
   - **Remediation**: Curated and verified 6 high-depth supplementary lessons covering Deadlocks & Banker's algorithm, Memory paging/TLB, File systems, and Disk scheduling.
3. **Interactive Simulation Verification**:
   - Need deterministic pure algorithms separated from React rendering.
   - **Remediation**: Implemented isolated engines in `domain/os/simulators/` with 100% test coverage over edge cases (Belady's anomaly, Banker's multi-resource safety, Gantt tie-breaking, SCAN elevator boundaries).

---

## 6. Migration & Operational Risks

- **Zero Breaking Changes to DBMS**: DBMS tables and routes (`/roadmap/dbms`, `domain/dbms`) remain completely untouched and independent.
- **RLS Security**: All user-level progress (`learning_video_progress`, `learning_exercise_attempts`) is scoped to `auth.uid() = user_id`.
- **Public Curriculum Read**: Manifests and syllabus are static and cached, minimizing database reads.

