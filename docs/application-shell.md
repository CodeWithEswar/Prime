# PRIME application shell

The authenticated workspace uses the PRIME Command Frame: a pure black shell, precise route rail and red terminal, restrained borders, and shared typography. The open/close control lives inside the sidebar in both states. The visible control is compact; its clickable area remains 44 px.

## Sidebar and navigation

- Desktop: 240 px expanded and 64 px collapsed. Collapsed destinations use centered 36 px square buttons. The route marker stays vertically centered in the active button, including after Motion layout transitions.
- The brand and account remain pinned. Only navigation scrolls. The selected state combines text/icon contrast, a hairline and terminal, and `aria-current`.
- A first-party preference cookie supplies the initial server render. Local storage is also written for compatibility; it does not decide hydration state. Refreshing with JavaScript disabled still renders the selected width.
- Central navigation metadata advertises DSA Practice, Revision, and Settings. Today, Roadmap, Plan, Progress, and Notes remain hidden while their screens are placeholders.
- Revision's catalog filter retains its own active state. Deep problem routes retain Practice selection and expose contextual back navigation.

## Topbar, command, and mobile

The sticky topbar supplies context, a command trigger, actual revision attention, and an optional page-action slot. A single command dialog handles page navigation and forwards question searches to the existing catalog filter. `/` and Ctrl/Cmd+K ignore editable controls and other open dialogs. No unimplemented keyboard sequences or notification controls are advertised.

At 768–1099 px, a 64 px rail opens a left drawer from its internal control. Below 768 px, bottom navigation provides Practice, Revision, Search, and More, with safe-area padding. More provides available destinations and the real account action. Dialogs trap focus, close with Escape, and restore focus to their explicit opener, including Safari where clicking a button does not automatically focus it.

## Data and performance

The server layout verifies the Supabase user. Middleware preserves safe deep-link return destinations for anonymous visitors. Private responses are not cached. Supabase initialization waits outside the static prerender before its time-sensitive session state is created.

Profile, target settings, and the revision count load concurrently on the server. A default role alone does not create a target card: a configured date is also required. Missing context is omitted. Calendar elapsed time is not presented as completed planner progress. No shell-specific database table, polling loop, or new dependency was introduced. Navigation and content retain their shared layout on transitions.

PageFrame supports wide-table, workspace, reading, focus, and full-width content. A lightweight loading boundary supports workspace navigation. Inner feature content was not redesigned; subsequent requested changes only adjusted shared control density and unsafe practice-link actions.

## Control density

Shared CSS tokens govern Button, Input, SearchInput, Select, command rows, dropdown items, and tabs. Defaults are 32 px, small buttons 28 px, prominent actions 36 px, and login fields/actions 40 px. The shell command has 32 px rows and close button with a 40 px input. Mobile and coarse-pointer devices use the same compact values as desktop, following the user's density preference. Mobile topbar actions use 36 px controls, and the bottom navigation is 56 px plus the device safe area. Landing and login overrides use the same tokens instead of retaining oversized local heights.

## Motion and accessibility

The active route terminal and sidebar width use existing Motion tokens. There is no continuous animation, glow, or particle layer. Reduced motion removes transitions and layout animation. Navigation has accessible names, current-state semantics, tooltips in compact mode, visible keyboard focus, and a skip link.

## Validation

The dedicated Playwright configuration uses an isolated local backend and a separate Next build directory; it never forwards test requests to the live database. The real middleware, server layout, cookie adapter, and client components are exercised. It does not verify Google OAuth or production Supabase availability.

- 27 browser checks passed across Chromium, Firefox, and WebKit, covering inside controls, SSR preference persistence, command behavior, editor shortcuts, deep links, anonymous redirects, account sign-out, missing context, focus trapping/restoration, and control density.
- Desktop widths: 1280, 1366, 1440, 1600, 1920; short desktop: 1366×650. Tablet: 768, 820, 1024. Mobile: 320, 360, 375, 390, 430. A 683×384 viewport checks the space available at approximately 200% desktop scaling; physical browser zoom was not automated.
- A later focused check passed after the final compact-button and active-marker alignment refinements.
- Lint, type checking, 185 tests, and production build passed before the subsequent catalog-link repair. See the link audit document for its additional tests and final verification.

Final verification after the catalog-link repair: project lint, DSA lint, type checking, formatting, production build, and all **192 tests across 19 files** passed. Browser coverage remains the 27 passing cross-browser checks above plus the focused active-marker alignment check.

Major implementation files are `components/shell/*`, `app/(dashboard)/layout.tsx`, the dashboard loading boundary, `lib/supabase/middleware.ts`, `lib/supabase/server.ts`, shared UI controls, and `tests/e2e/shell.spec.ts`. Run `npm run test:e2e:shell` for the isolated browser suite.
