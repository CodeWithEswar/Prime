# PRIME landing implementation

## Landing structure

Public home page: sticky header, centered hero with the shorter “Prepare with purpose.” headline, preparation journey, why PRIME, structured roadmap, daily planning, practice, revision, weakness and mastery, progress and readiness, four-step method, sample workspace, final CTA, and minimal footer.

## Brand geometry

Native SVG uses a filled red ascending terminal with angular terraces and repeated nested outlines based on the supplied reference. It is cropped at hero scale, repeated faintly behind revision, and resolves at the final CTA. Section paths connect journey and method steps. No raster background, canvas, video, or additional animation dependency.

## Motion

Fast staggered hero typography, initial outline reveal, section reveals, scroll-driven path drawing, subtle geometry translation, black-to-red-black background interpolation, and existing tactile button states. The header gains a black background and border with scrolling. Feature sections remain in normal document flow; no pinned feature sequence. All continuous effects use MotionValues without per-frame React state updates. SVG filters remain static and limited to the primary shape.

## Product story and scope

Roadmap explains deliberate sequencing; daily planning translates goals into manageable sessions; practice distinguishes independent solutions from hints and reviewed solutions; revision supports retention; mastery identifies areas needing attention; readiness is explicitly a preparation indicator, never a hiring prediction. Product visuals reuse PRIME Button, Card, Checkbox, and branding primitives. Fixtures are labeled previews. No invented testimonials, success rates, pricing, infrastructure copy, or AI claims.

CTAs lead to the sample workspace because authentication routes do not exist. The sample workspace supports local view switching and sample task completion only. No authentication, onboarding, dashboard application logic, scheduling algorithms, persistence, or backend changes were implemented. Text-style arrow symbols were removed from the landing page and existing matching visible metric/design-system examples.

## Responsive and accessibility

The hero is centered and fits its heading, description, and CTAs within the viewport; verified at 1920×900, 1440×800, 1366×650, 390×844, and 320×640. Desktop feature sections use spacious split compositions. Tablet reduces outline detail. Mobile uses stacked sections, a compact navigation menu, a horizontal preview navigation, and subdued cropped geometry. Verified widths: 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1536, and 1920.

Decorative SVG is hidden from assistive technology. Semantic sections, visible focus, skip navigation, labeled checkboxes, and descriptive navigation labels are present. Reduced motion removes spatial effects and smooth scrolling. Removing the obsolete root loading skeleton allows the full landing page to remain visible without JavaScript. Hero content is rendered on the server and remains visible before animation code loads. Existing social image metadata is retained; landing title, description, and canonical metadata are set.

The shared Button needed a Slottable wrapper for link composition under the installed Radix version; a regression test covers it.

## Verification

- Typecheck: passed.
- Lint: passed.
- Unit tests: 64 passed.
- Browser tests: 24 passed across Chromium, Firefox, and WebKit. Coverage: navigation, preview interactions, twelve responsive widths, and no-JavaScript checks passed. Keyboard/reduced-motion checks additionally cover focus and sample-task behavior.
- Visual review: desktop hero, mobile hero, and workspace composition inspected.
- Production build: blocked by Turbopack's CSS worker exiting before its connection handshake, reproduced outside the sandbox on existing globals.css. A webpack fallback did not finish and was stopped. A successful production build and Core Web Vitals measurements are not claimed.

Browser checks against an existing preview: `node node_modules/@playwright/test/cli.js test --config scripts/landing-qa.config.ts`. Set `PRIME_PREVIEW_URL` if its URL differs from http://localhost:3001. The normal Playwright configuration also includes Chromium, Firefox, and WebKit.

## Weakness & mastery redesign

The static mastery list has been replaced with an open six-topic diagnostic. SVG paths show relationships; solid white nodes indicate mastered/strong topics, white outlines indicate practicing/learning, and Binary Search is the sole red revision focus. Visible labels and a semantic topic list keep state understandable without hover or color alone.

Hover, keyboard focus, and touch selection update the contextual evidence panel. Selecting a topic persists that focus after the pointer leaves the map. “Review next” opens an explicitly labeled sample review plan with no account or product logic. Data remains deterministic presentation fixtures; the existing right-side narrative is preserved.

Connection drawing, a short node reveal, and the insight entrance play once. A faint geometric background moves toward the map using a scroll MotionValue; no per-frame React updates or new dependencies. Reduced motion shows complete paths and static nodes. Mobile replaces the network with a vertical mastery path. Desktop, tablet, and mobile compositions were visually inspected.

The focused mastery browser checks pass in Chromium, Firefox, and WebKit, covering hover, click, keyboard selection, review-plan toggling, mobile ordering, viewport bounds, and reduced motion. The production build was retried and reproduced the existing Turbopack CSS-worker startup failure on globals.css.

## Preparation journey and mastery layout update

The journey is now a focused client component within the server-rendered landing page. Five open stages sit directly on an angular SVG path, each with a number, icon, title, description, and a textual current/earlier/ahead state. Desktop uses a short sticky sequence; shorter desktop windows, tablet, mobile, and reduced-motion mode use normal document flow. Tablet and mobile have a separately drawn vertical SVG path. The Master terminal reuses PRIME's actual mark paths.

Verified installed Hugeicons exports, all rendered through the existing Icon primitive at size 21 and stroke width 1.5:

| Stage    | Export         |
| -------- | -------------- |
| Plan     | Route02Icon    |
| Practice | SourceCodeIcon |
| Review   | FileSearchIcon |
| Revise   | RepeatIcon     |
| Master   | Diamond01Icon  |

MotionValues draw each SVG segment, tint the black background subtly, and move a faint ambient layer. React state changes only when the active stage crosses a threshold; a small dead band avoids threshold flicker. Completed stages become white, the current node becomes red, and future nodes stay quiet. Hover/focus previews remain separate from scroll progress. Revise has a short settling rotation; Master resolves into the PRIME terminal. There is no moving progress head, looping animation, new dependency, or backend logic.

Node links lead to existing roadmap, practice, mastery, revision, and readiness sections. Icons are decorative alongside visible text; links retain red focus outlines and the current step has aria-current="step". Reduced motion removes drawing, translation, and sticky pinning while keeping the full structural path and all stage text visible. The section remains complete without JavaScript.

Mastery topic details now update in the right column underneath the existing narrative. The graph and legend remain on the left. Mobile keeps narrative, map, and evidence in a readable vertical order. Hover, keyboard focus, and selection retain their existing behavior. No insight panel remains beneath the desktop graph.

Latest verification: npm run lint and npm run typecheck passed; all 64 unit tests passed. The 24 landing browser checks passed across Chromium, Firefox, and WebKit after correcting the responsive test to use the effective media-query viewport (WebKit excludes its scrollbar). npm run build still fails at the existing Turbopack CSS-worker startup error on globals.css.
