# PRIME — Phase 1 Design System (Pure Black × Pure Red)

> Visual Signature: **PURE BLACK × PURE RED × WHITE**  
> Direction: **Dark editorial productivity × developer tooling × solid neumorphic physical controls × pure red performance accent.**

PRIME is an engineered personal interview-preparation operating system. It does not use Zinc, Slate, neutral-gray, charcoal, washed black, burgundy, muted red, coral red, pink-red, or blue-black as its primary visual identity.

The core rule of PRIME:

- **Black creates space.**
- **White carries information.**
- **Red directs attention.**

---

## 1. Core Brand Colors

Canonical brand primitives defined in `:root`:

```css
:root {
  /* Brand */
  --prime-black: #000000;
  --prime-red: #ff0000;
  --prime-white: #ffffff;

  /* Canvas */
  --prime-canvas: #000000;

  /* Black surfaces (narrow black range: #000000 - #0D0D0D) */
  --prime-surface: #000000;
  --prime-surface-raised: #030303;
  --prime-surface-elevated: #060606;
  --prime-surface-interactive: #090909;
  --prime-surface-hover: #0d0d0d;

  /* Borders (white-alpha edges) */
  --prime-border-subtle: rgba(255, 255, 255, 0.07);
  --prime-border-default: rgba(255, 255, 255, 0.12);
  --prime-border-strong: rgba(255, 255, 255, 0.2);

  /* Text (white and white-alpha) */
  --prime-text-primary: #ffffff;
  --prime-text-secondary: rgba(255, 255, 255, 0.68);
  --prime-text-tertiary: rgba(255, 255, 255, 0.46);
  --prime-text-disabled: rgba(255, 255, 255, 0.28);

  /* Pure red accent */
  --prime-accent: #ff0000;
  --prime-accent-hover: #ff1a1a;
  --prime-accent-active: #e60000;

  /* Red transparency */
  --prime-accent-soft: rgba(255, 0, 0, 0.12);
  --prime-accent-muted: rgba(255, 0, 0, 0.07);
  --prime-accent-border: rgba(255, 0, 0, 0.35);

  /* Focus */
  --prime-focus: #ff0000;
}
```

---

## 2. Critical Black Rule & Surface Depth

Do **NOT** solve hierarchy by progressively turning everything gray (`#09090B`, `#18181B`, `#27272A`, `#3F3F46`). This produces a stock Zinc/shadcn appearance.

Instead, PRIME begins at `#000000` and remains extremely close to black:

```text
Canvas:        #000000
Base surface:  #000000
Raised:        #030303
Elevated:      #060606
Interactive:   #090909
Hover:         #0D0D0D
```

Depth is created primarily through:

- **Borders:** Thin white-alpha edges (`rgba(255, 255, 255, 0.07)`, `0.12`, `0.20`)
- **Inner highlights:** `inset 0 1px 0 rgba(255, 255, 255, 0.025)`
- **Shadows:** Deep dark drop shadows (`0 1px 2px rgba(0, 0, 0, 0.8)`)
- **Spacing, typography, and overlays**

Do NOT brighten the entire card simply to make it visible.

---

## 3. Pure Red Philosophy & Usage

The canonical PRIME accent is **`#FF0000`** exclusively (not `#E5484D`, `#DC2626`, or `#EF4444`).

Target visual distribution:

- **90%** black / white / neutral transparency
- **5–8%** PRIME red
- **2–5%** semantic exceptions

### Where Red Appears:

- Primary CTA action buttons
- Active navigation indicator (`▌ Today`)
- Current preparation focus
- Selected calendar cell fill
- Revision due / overdue state
- Focus rings
- Progress highlight bar
- PRIME brand mark

### Red Glow Restriction:

**DO NOT use red glow as the normal design language.** Avoid `box-shadow: 0 0 40px red`. If an accent halo is needed, keep it restrained (`0 0 12px rgba(255, 0, 0, 0.08)`) and only for highly specific active states.

---

## 4. Solid Neumorphic Controls

### Primary Solid Neumorphic Control

Machined and tactile pure red button:

```css
background:
  linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.03) 18%,
    rgba(0, 0, 0, 0.05) 100%
  ),
  #ff0000;
border: 1px solid rgba(255, 255, 255, 0.16);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.2),
  inset 0 -2px 0 rgba(0, 0, 0, 0.25),
  0 1px 1px rgba(0, 0, 0, 0.9),
  0 5px 12px rgba(0, 0, 0, 0.45);
```

- **Hover:** Slight brightness increase to `#FF1A1A` without shifting to pink.
- **Active / Pressed:** Physical compression via `transform: translateY(1px)`, darker red `#E60000`, depressed inner shadow.

### Black Neumorphic Secondary Control

Tactile black-on-black physical depth:

```css
background: #050505;
border: 1px solid rgba(255, 255, 255, 0.11);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.045),
  inset 0 -1px 0 rgba(0, 0, 0, 0.85),
  0 2px 5px rgba(0, 0, 0, 0.65);
```

- **Hover:** `#090909`
- **Pressed:** `#020202`

---

## 5. Status & Difficulty Language

### Status Language (Monochrome with Red Signal)

```text
○ Not Started:     rgba(255, 255, 255, 0.40)
◐ Learning:        rgba(255, 255, 255, 0.80)
✓ Solved:          #ffffff
↻ Needs Revision:  #ff0000 (Pure Red pulsing dot)
◆ Mastered:        #ffffff
```

This ensures **Needs Revision** immediately commands attention across any view.

### Difficulty Hierarchy (Strictly Monochromatic)

Do **NOT** automatically color code Easy (green), Medium (yellow), Hard (red). PRIME remains monochromatic:

- **Easy:** Regular text weight, subtle border (`rgba(255, 255, 255, 0.07)`)
- **Medium:** Medium text weight, default border (`rgba(255, 255, 255, 0.12)`)
- **Hard:** Semi-bold text weight, strong border (`rgba(255, 255, 255, 0.20)`)

Pure red is not used for "Hard" because red already carries PRIME's active/revision language.

---

## 6. Focus Ring Specification

Keyboard focus rings use Pure Red without blooming glow:

```css
outline: none;
box-shadow:
  0 0 0 1px #000000,
  0 0 0 3px rgba(255, 0, 0, 0.72);
```

---

## 7. Interactive Workbench Route

The complete design language is live and verifiable at:

```text
/design-system
```

With 8 section anchors:

1. **Foundations**: Pure Black `#000000`, narrow surface hierarchy (`#000000` to `#0D0D0D`), white-alpha borders, typography scale, layered elevation shadows.
2. **Controls & Forms**: Pure red solid neumorphic primary, black secondary (`#050505`), inputs, search input with ⌘K, switch, radio, select.
3. **Navigation & Structure**: Line tabs with glowing red underline, segmented tabs, sidebar nav items with `▌` left red indicator.
4. **Status, Badges & Metrics**: Monochromatic status lifecycle, monochromatic difficulty badges, metric cards, metric strip, keycaps.
5. **Data Display Patterns**: Task rows, problem rows (with LeetCode/TUF/GFG links), revision review queue, activity feed, tables, progress bars.
6. **Calendar Primitive**: Month calendar with Today (red outline), Selected (pure red solid fill), completed days (white dot), revision due (red dot).
7. **Overlays & Feedback**: Dialog modal (`#030303`), Alert Dialog, Sheet drawer, Popover, Dropdown Menu, Command Palette (`⌘K`), Empty states, Error states, Skeletons, Toasts.
8. **Responsive & Accessibility**: Focus ring guidelines, reduced-motion compliance, mobile responsive layout.
