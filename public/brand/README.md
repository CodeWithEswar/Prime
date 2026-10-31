# PRIME — Brand Identity & Asset System

> **Preparation Roadmap for Interviews, Mastery & Excellence**  
> Visual Signature: **Pure Black × Pure Red × White** (`#000000` × `#FF0000` × `#FFFFFF`)

---

## 1. Brand Concept & Philosophy

PRIME is an interview-preparation operating system engineered for disciplined execution, structured roadmaps, spaced repetition, and technical mastery.

The visual identity is anchored around the **PRIME Mark**, a custom geometric symbol engineered on an interlocking grid:

```text
PREPARATION  ───►  ROADMAP  ───►  MASTERY  ───►  EXCELLENCE (THE PRIME STATE)
```

### Visual Anatomy & Symbolism

1. **Upward Path (Progression)**: The ascending lower ribbon represents daily forward momentum, discipline, and incremental mastery.
2. **Structured Steps (Roadmap)**: The interlocking stepped contour between the two ribbons symbolizes the structured preparation roadmap and milestone progression.
3. **Hidden 'P' (Product Identity)**: The negative space counter between the two interlocking ribbons subtends the clean silhouette of the letter **P** for PRIME.
4. **Sharp Upward Arrow (Excellence / Peak)**: The upper ribbon terminates in a dynamic upward-right arrow symbolizing summit attainment, interview readiness, and achieving the **PRIME state**.

---

## 2. Core Palette Specifications

| Token          | Hex       | RGB                  | Role                                                   |
| :------------- | :-------- | :------------------- | :----------------------------------------------------- |
| **Pure Black** | `#000000` | `rgb(0, 0, 0)`       | Primary Canvas, Dark Surfaces, Deepest Contrast        |
| **Pure Red**   | `#FF0000` | `rgb(255, 0, 0)`     | Canonical Brand Accent, Active Indicators, Punctuation |
| **Pure White** | `#FFFFFF` | `rgb(255, 255, 255)` | Primary High-Contrast Typography & Monochrome Variants |

> **Strict Rule**: Never substitute `#FF0000` with muted crimson, burgundy, coral, or zinc-washed tones. Never substitute `#000000` with neutral dark gray or navy-tinted slate.

---

## 3. Typography & Messaging

- **Primary Wordmark**: `PRIME` — Geometric, heavy uppercase tracked sans-serif letterforms.
- **Acronym Expansion**: `Preparation Roadmap for Interviews, Mastery & Excellence`
- **Core Tagline**: `Plan. Practice. Revise. Master.` (where periods `.` are styled in **Pure Red** `#FF0000`).

---

## 4. Asset Inventory

### A. Vector Assets (SVG)

```text
public/brand/
├── mark/
│   ├── prime-mark-red.svg       # Canonical Pure Red mark on transparent (24×24)
│   ├── prime-mark-white.svg     # Pure White mark for dark monochrome usage
│   ├── prime-mark-black.svg     # Pure Black mark for light surface usage
│   └── prime-mark-current.svg   # currentColor mark for dynamic theming
├── logo/
│   ├── prime-logo-dark.svg      # Primary lockup: Red mark + White wordmark (143×24)
│   ├── prime-logo-light.svg     # Light lockup: Red mark + Black wordmark (143×24)
│   ├── prime-logo-white.svg     # Monochrome white lockup (143×24)
│   ├── prime-logo-black.svg     # Monochrome black lockup (143×24)
│   ├── prime-logo-red.svg       # Full red lockup (143×24)
│   ├── prime-logo-dark.png      # Transparent 572×96 high-DPI raster fallback
│   └── prime-logo-light.png     # Transparent 572×96 high-DPI raster fallback
└── icons/
    └── favicon.svg              # Scalable SVG favicon (32×32 with pure black base)
```

### B. Favicons & Application Icons

```text
public/
├── favicon.ico                  # 32×32 binary multi-resolution favicon
├── favicon-16.png               # 16×16 browser tab favicon
├── favicon-32.png               # 32×32 high-DPI browser tab favicon
├── favicon-48.png               # 48×48 desktop shortcut icon
├── apple-touch-icon.png         # 180×180 iOS home screen icon
├── icon-192.png                 # 192×192 standard PWA app icon
├── icon-512.png                 # 512×512 high-res PWA app icon
├── icon-maskable-512.png        # 512×512 Android adaptive maskable icon (safe area)
└── app-icon-1024.png            # 1024×1024 master app store icon
```

### C. Social & Open Graph Assets

```text
public/
├── og-default.png               # 1200×630 Open Graph card with glowing summit ascent
├── twitter-card.png             # 1200×630 Twitter/X summary large image card
├── github-social-preview.png    # 1600×900 16:9 GitHub repository social preview
├── social-square.png            # 1080×1080 1:1 avatar for GitHub, Twitter, Discord
└── manifest.json                # Web App Manifest linking all icons
```

---

## 5. React Components

Import directly from `@/components/branding`:

```tsx
import { PrimeLogo, PrimeMark, PrimeWordmark } from '@/components/branding';

// Header / Navigation Lockup
<PrimeLogo size="sm" href="/" />

// Standard Product Lockup
<PrimeLogo size="md" variant="brand" />

// Hero Display with Full Expansion & Tagline
<PrimeLogo size="lg" withExpansion withTagline />

// Symbol Only (Dynamic Theming)
<PrimeMark size={24} variant="brand" />

// Standalone Wordmark
<PrimeWordmark size="md" withTagline />
```

---

## 6. Brand Usage Guidelines

### Do's:

- Maintain the precise mathematical ratio of the interlocking ribbon paths.
- Ensure minimum contrast ratio (\ge 4.5:1) against background surfaces.
- Use the official vector assets generated from the master geometry.
- Preserve the Pure Red `#FF0000` punctuation in the tagline.

### Don'ts:

- Do NOT distort, rotate, stretch, or alter the ribbon coordinates.
- Do NOT add drop shadow halos or bevel gradients directly to the mark vectors.
- Do NOT substitute Pure Black (`#000000`) with charcoal or blue-gray.
- Do NOT substitute Pure Red (`#FF0000`) with salmon or burgundy.
