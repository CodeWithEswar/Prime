# PRIME — remaining landing-page redesign

## Sections updated

- **Clarity at every step:** a shorter, contained headline and three open iconographic principles, each paired with a meaningful product fragment and a real section link.
- **Roadmap:** an angular topic path with completed/current/upcoming states. Selecting a topic reveals its place in the sequence and the next useful action.
- **Daily planning:** illustrative 30/60/90-minute plans, a study rhythm, and keyboard-accessible task completion. Fixtures change locally; no planning engine or stored user progress.
- **Practice:** sample problems and a separate reflection area for independent solutions, hints, reviewed approaches, or continued difficulty.
- **Revision:** an open three-point timeline; selecting a return date changes the topic and recall focus. Background geometry is quieter for readability.
- **Progress:** distributed preparation signals, predominantly white with a red revision focus. All lengths are explicitly illustrative, with qualitative labels rather than claimed scores.
- **Readiness:** six preparation dimensions arranged around the real PRIME mark. Selection reveals contextual guidance; the hiring-outcome disclaimer remains visible.
- **Method:** an open two-by-two editorial sequence with semantic icons and a faint angular connector.
- **Product experience:** the duplicate workspace section was removed by a concurrent edit and that removal is preserved. Focused roadmap, daily-plan, practice, and revision fragments remain beside the relevant product explanations. CTAs lead to the roadmap preview.
- **Quiet transition:** a typography-led pause before the final CTA.
- **Final CTA:** “Make your preparation deliberate.” with the existing PRIME button and terminal geometry.
- **Footer:** actual PRIME wordmark at architectural scale, restrained geometry, concise navigation, and a minimal metadata line.

## Sections preserved

The established hero, navigation, five-stage PRIME Journey, and Mastery Diagnostic retain their composition and behavior. Mastery continues to show its topic details in the right column. Global fonts, selection, scrollbars, controls, and motion tokens remain in place.

## Removed UI patterns

Removed the generic bordered ProductPanel previews, static demo rows, dashboard browser/sidebar shell, conventional readiness panel, repeated method-label strip, and small-logo footer. The main page remains a Server Component; interactive examples have focused client boundaries.

## Iconography

Actual installed Hugeicons exports, rendered through PRIME’s Icon primitive with a consistent stroke treatment:

| Export         | Use                                       |
| -------------- | ----------------------------------------- |
| Route02Icon    | Roadmap, direction, and method            |
| FileSearchIcon | Reflecting on the attempt                 |
| RepeatIcon     | Revision, retention, and return reminders |
| Clock01Icon    | Available daily preparation time          |
| SourceCodeIcon | Practice reflection                       |
| Calendar03Icon | The sample day                            |
| Target01Icon   | Setting a preparation target              |
| Diamond01Icon  | Measuring mastery                         |

The footer and readiness center use the approved PRIME brand SVGs rather than miscellaneous icons.

## Motion

Grouped section reveals reuse PRIME’s Reveal utility. Roadmap and revision paths draw once. Progress signals resolve once with static illustrative lengths. Readiness connectors resolve toward the central mark and selection highlights only the relevant dimension. Existing final-CTA geometry completes its path. Footer geometry has a short path reveal and a very small scroll translation; the wordmark remains immediately available in server-rendered markup. No perpetual loops, new animation dependency, canvas, or video.

## Cinematic footer

The base is pure black. The original PRIME wordmark fills the content width in white; faint architectural paths and one restrained red terminal sit behind it. Navigation links only to existing roadmap, practice, revision, progress, method, and top anchors. No invented legal routes, social accounts, company identity, or location. Mobile uses stacked content, a two-column link group, and simplified background emphasis. Reduced motion shows the complete geometry without parallax or drawing.

## Responsive and accessibility

Desktop uses open split compositions and distributed progress signals. Tablet compacts spacing and labels. Mobile presents narrative before visuals, stacks reflection and method content, and keeps controls touch-friendly. Checked widths: 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1536, and 1920.

Native buttons, links, and the existing checkbox support keyboard activation. Selected controls expose aria-pressed; preview regions have descriptive labels and locally unique aria-controls targets. Visible focus is retained. Decorative icons and SVGs are hidden from assistive technology. Core content is available without JavaScript, and reduced-motion preferences disable spatial/drawing effects. No measured Core Web Vitals or frame-rate result is claimed.

## Scope

All data is deterministic illustrative content. No authentication, onboarding, dashboard logic, persistence, planning algorithms, revision engine, backend, or infrastructure changes.

## Verification

- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed.
- `npm test`: 64 unit tests passed.
- Browser checks: all 33 passed across Chromium, Firefox, and WebKit. Includes preview interactions, preserved journey/mastery behavior, keyboard operation, reduced motion, no-JavaScript content, real anchor destinations, and the twelve requested viewport widths.
- `npm run build`: still fails at the previously reproduced Turbopack CSS-worker startup error on existing globals.css. A successful production build is not claimed.
