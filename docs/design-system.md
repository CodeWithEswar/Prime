# PRIME — Design System & Visual Foundation

> Visual Direction: **Dark editorial productivity × developer tooling × restrained red performance accent.**

PRIME is an engineered interview-preparation operating system. It must not look or feel like a generic stock shadcn dashboard, nor should it drift into Zinc or blue-gray palettes.

---

## 1. Black-First Surface Philosophy

Black comes first. Visual hierarchy is established via subtle surface elevation and thin borders, not large glowing gradients or floating glass containers.

### Surface Hierarchy

```text
Page Background               #070707
Primary Surface               #0B0B0C   (Grouping zones & sections)
Raised Surface                #101011   (Cards, dialogs, drawers)
Interactive / Elevated        #141415   (Inputs, active controls)
Hover State                   #181819   (Interactive hover feedback)
```

### Borders

```text
Subtle Border                 #19191B
Default Border                #242426
Strong Border                 #303033
```

---

## 2. Restrained Performance Red Accent

Red in PRIME denotes precision, focus, and deliberate action. It is used sparingly to prevent visual fatigue:

- `--accent`: `#e5484d`
- `--accent-hover`: `#f05257`
- `--accent-active`: `#d93d42`
- `--accent-muted`: `rgba(229, 72, 77, 0.12)`
- `--accent-subtle`: `rgba(229, 72, 77, 0.07)`
- `--accent-border`: `rgba(229, 72, 77, 0.28)`

Never communicate error or status using red alone; always pair with an icon and clear typography.

---

## 3. Solid Neumorphic Hardware Controls

PRIME primary buttons feel like solid, tactile physical hardware controls sitting slightly above the black interface:

### Primary Hardware Button Structure

- Solid red accent body (`#e5484d`)
- Subtle upper inner highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.22)`)
- Dark lower edge bevel (`inset 0 -1px 0 rgba(0, 0, 0, 0.45)`)
- Controlled external shadow (`0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(229, 72, 77, 0.15)`)
- Tactile press compression: `transform: translateY(0.5px)` with internal shadow depression.

---

## 4. Typography Rules

- **Geist Sans**: Primary editorial interface font for headings, navigation, descriptions, and labels.
- **Geist Mono**: Strictly reserved for technical metadata, timers, problem IDs, durations, and numeric statistics.
- Avoid turning the entire interface into monospace text.

---

## 5. Radius System

Compact and developer-oriented (approx 4–10px):

- `--radius-xs`: `0.25rem` (4px) — Badges, small checkboxes
- `--radius-sm`: `0.375rem` (6px) — Buttons, inputs, chips
- `--radius-md`: `0.5rem` (8px) — Cards, panels
- `--radius-lg`: `0.625rem` (10px) — Modals, sheets

Avoid oversized radii (`rounded-2xl`, `rounded-3xl`).

---

## 6. Icons — Hugeicons Exclusively

PRIME exclusively utilizes `@hugeicons/react`.

- Do NOT mix Lucide, Heroicons, FontAwesome, Tabler, or Phosphor icons.
- If a future shadcn primitive imports another icon library, swap the icon for its Hugeicons equivalent.

---

## 7. Motion Guidelines

Motion must communicate state, not decoration.

- Fast: `120ms` (micro-interactions, button presses)
- Normal: `180ms` (menus, badges, hover disclosures)
- Slow: `240ms` (modals, sheets, page transitions)
- Springs: snappy, damped physics without bouncing oscillations.
- Full compliance with `prefers-reduced-motion`.

---

## Strict Rule

> **PRIME must not gradually drift back into stock Zinc/shadcn styling.** All components must consume semantic CSS tokens and adhere to the black-first palette.
