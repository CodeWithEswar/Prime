# PRIME — Design System & Visual Foundation

> Visual Direction: **Dark editorial productivity × developer tooling × solid neumorphic physical controls × pure black & pure red performance accent.**

PRIME is an engineered interview-preparation operating system. It must not look or feel like a generic stock shadcn dashboard, nor should it drift into Zinc or blue-gray palettes.

---

## 1. Pure Black-First Surface Philosophy

Black comes first — **not Zinc first**. Visual hierarchy is established via subtle surface elevation and thin borders, not large glowing gradients or floating glass containers.

### Surface Hierarchy

```text
--prime-canvas:       #000000   (Pure True Black Void)
--prime-surface-1:    #070708   (Level 1: Base Grouping Surface)
--prime-surface-2:    #0c0c0d   (Level 2: Raised Cards & Panels)
--prime-surface-3:    #111113   (Level 3: Elevated Popovers & Menus)
--prime-surface-4:    #161619   (Level 4: Modal & Sheet Overlays)
--prime-surface-hover: #1a1a1e  (Interactive Hover Feedback)
--prime-surface-active: #202024 (Interactive Pressed State)
```

### Borders

```text
--prime-border-subtle:   #141416
--prime-border-default:  #222225
--prime-border-strong:   #333337
```

---

## 2. Pure Performance Red Accent

Pure Red (`#FF0000`) in PRIME denotes precision, focus, and urgent preparation action:

- `--prime-red`: `#ff0000` (Core performance accent)
- `--prime-red-hover`: `#ff2626`
- `--prime-red-active`: `#d60000`
- `--prime-red-soft`: `rgba(255, 0, 0, 0.12)`
- `--prime-red-subtle`: `rgba(255, 0, 0, 0.06)`
- `--prime-red-border`: `rgba(255, 0, 0, 0.32)`

Pure Red is used with discipline (5–10% visual surface) for:

- Primary CTA buttons
- Active tab indicators and nav bars
- Due Today / Needs Revision urgency badges
- Keyboard focus rings (`ring-2 ring-[var(--accent)]/50`)

Muted semantic feedback colors (success green `#30a46c`, warning amber `#f5a524`, info blue `#3b82f6`) are strictly secondary and never compete with Pure Red.

---

## 3. Solid Neumorphic Hardware Controls

PRIME primary buttons feel like solid, tactile physical hardware controls sitting slightly above the black interface:

### Primary Neumorphic Control Structure

- Gradient-backed Pure Red body (`linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), #ff0000`)
- Upper inner highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.28)`)
- Dark lower edge bevel (`inset 0 -1px 0 rgba(0, 0, 0, 0.45)`)
- External layered drop shadow (`0 1px 2px rgba(0, 0, 0, 0.7), 0 4px 14px rgba(255, 0, 0, 0.25)`)
- Tactile press compression: `transform: translateY(1px)` with internal shadow depression.

---

## 4. Typography Rules

- **Geist Sans**: Primary interface font for display titles, headings, navigation, and descriptions.
- **Geist Mono**: Strictly reserved for technical metadata, timers, problem numbers (`#001`), durations, and numeric metrics with tabular figure support (`font-feature-settings: "tnum" on, "lnum" on`).
- Avoid turning the entire interface into monospace text.

---

## 5. Radius System

Compact, restrained, and developer-oriented (4px–12px):

- `--radius-xs`: `4px` — Badges, keycaps, small checkboxes
- `--radius-sm`: `6px` — Buttons, inputs, chips, task rows
- `--radius-md`: `8px` — Cards, panels, calendars
- `--radius-lg`: `10px` — Dialogs, modal sheets
- `--radius-xl`: `12px` — Standalone containers

Avoid oversized bubbly radii (`rounded-2xl`, `rounded-3xl`, `rounded-full` on cards).

---

## 6. Icons — Hugeicons Exclusively

PRIME exclusively utilizes `@hugeicons/react` and `@hugeicons/core-free-icons` via `components/ui/icon.tsx`.

- **NEVER** import from Lucide, Heroicons, FontAwesome, Tabler, or Phosphor.
- If any component introduces another icon package, swap the icon for its Hugeicons equivalent.

---

## 7. Motion & Physics

Motion communicates mechanical state, not decorative flourish.

- **Instant**: `80ms` (toggles, micro-ticks)
- **Fast**: `120ms` (button presses, small state changes)
- **Normal**: `180ms` (menus, popovers, badges)
- **Deliberate**: `240ms` (dialogs, sheets, page transitions)
- **Springs**: Tight (`stiffness: 450, damping: 32`), balanced (`stiffness: 350, damping: 28`)
- **Accessibility**: Full compliance with `prefers-reduced-motion: reduce`.

---

## 8. Component Inventory

### UI Primitives (`components/ui/`)

- `Button`: Primary neumorphic, secondary, outline, ghost, destructive, link; loading state; `asChild` support.
- `Input`: Pure black canvas background, sharp border, pure red focus ring.
- `SearchInput`: Integrated search icon, clear button, and `⌘K` keyboard shortcut badge.
- `Textarea`: Matching black canvas styling with multiline support.
- `Checkbox`: Pure red active checked state with crisp SVG checkmark.
- `RadioGroup`: Pure red center dot indicator.
- `Switch`: Precision hardware switch with pure red active fill.
- `Select`: Radix Select on elevated `#111113` surface with tick indicators.
- `Tabs`: Line tabs with pure red active glow bar + Segmented tabs.
- `Progress`: Linear progress, segmented progress, and labeled progress bars.
- `Tooltip`: Elevated surface tooltips with fast duration.
- `DropdownMenu`: Elevated surface with separators, shortcuts, and destructive styling.
- `Popover`: Contextual card popover.
- `Dialog`: Modal dialog with `#161619` overlay surface and tactile close.
- `AlertDialog`: Destructive confirm vs cancel dialog.
- `Sheet`: Responsive right-docked drawer with slide-in animation.
- `Command`: `cmdk` command palette with search and keyboard navigation.
- `Calendar`: Monthly interactive calendar with Today (pure red ring), Selected (pure red solid), and streak dots.
- `Avatar`: User avatar with fallback initials.
- `Sonner`: Toaster notification system styled for pure black surface.

### Shared Domain Primitives (`components/shared/`)

- `PageHeader`: High-clarity editorial header with title, description, badge, actions.
- `SectionHeader`: Section heading separating visual modules.
- `StatusBadge`: Preparation status lifecycle (`not_started`, `learning`, `solved`, `needs_revision` in pure red, `mastered`).
- `Metric`: Tabular mono value with label, units, and trend indicators.
- `MetricStrip`: Single-line minimal-chrome KPI strip.
- `TaskRow`: Actionable task item (default, active, completed, disabled).
- `ProblemRow`: DSA problem row with difficulty badge, topic, external platform link.
- `RevisionRow`: Spaced repetition item with interval badge and Due Today pure red urgency.
- `ActivityRow`: Chronological activity feed row with mono timestamp and icons.
- `KeyboardKey`: Tactile physical keycap badge (`⌘`, `K`, `Esc`, `Enter`).
- `EmptyState`: Zero-data placeholder with Hugeicons icon and CTA.
- `ErrorState`: Inline or card error notification with retry button.
- `NavItem`: Navigation item with thin pure red active indicator bar.

---

## 9. Interactive Workbench Route

The complete design system can be inspected and verified live at:

```text
/design-system
```

With 8 comprehensive sections:

1. Foundations (Colors, Surfaces nested demo against pure black, Typography scale, Spacing & Radius, Elevation & Shadows, Motion)
2. Controls & Forms (Buttons, Inputs, Search with `⌘K`, Textarea, Checkbox, Radio, Switch, Select)
3. Navigation & Structure (Line Tabs, Segmented Tabs, Nav Items)
4. Status, Badges & Metrics (Status Lifecycle, Difficulty Badges, Metric Cards, Metric Strip, Keycaps)
5. Data Display Patterns (Tasks, Problems, Revision rows, Activity feed, Tables, Progress bars)
6. Calendar Primitive (Interactive monthly calendar)
7. Overlays & Feedback (Dialog, Alert Dialog, Sheet, Popover, Dropdown, Command, Empty State, Error State, Skeletons, Toasts)
8. Responsive & Accessibility (Breakpoints, Pure red focus rings, Reduced-motion)
