# PRIME authentication implementation

## Surface and window fit

`/login` uses the existing PRIME mark, white typography, red accent, and an isolated black background. The centered surface shares existing input, button, Hugeicons, Motion, RHF, and Zod primitives. The top utility row keeps Back at the left and PRIME at the right.

The layout follows the dynamic viewport height. Height breakpoints at 800 and 680 px reduce card padding and gaps while preserving 46 px form controls. Ordinary laptop windows fit the complete form; very short or zoomed windows retain normal vertical scrolling. Mobile uses a simpler open surface. The background cannot introduce horizontal overflow.

## Navigation and spatial interaction

Back uses the installed `ArrowLeft02Icon`. An ordinary activation uses history only when the document referrer is a safe internal application destination; otherwise its real home link provides the fallback. Modified clicks retain native link behavior. Keyboard focus remains visible.

The spatial layer uses native SVG paths and the actual PRIME brand paths. MotionValues and springs update geometry independently of React rendering. The form never follows the pointer.

A CSS dot pattern with 28 px spacing is revealed through a smooth 180 px radial mask, with standard and WebKit properties. Six tiny red points coincide with selected PRIME path vertices. There are no per-dot components, custom cursor, particles, or pointer state updates per frame. The field weakens over controls, fades after 2.2 seconds idle, and settles on exit, blur, loading, and verified success. Touch/coarse pointers, reduced motion, and browsers without masking receive the static background instead.

The Google control has a transparent background, thin white border, and a centered icon-and-label group. The official Google mark sits 10 px beside the text with no white badge or background. A small local horizontal highlight follows the pointer. The card occludes the decorative field. Errors remain local to the form.

## Authentication behavior

The repository's documented methods are passwordless email and OAuth. Email POSTs request a PKCE sign-in link for an existing account; they do not create accounts. Confirmation masks the email and does not claim authentication succeeded. Resending has a cooldown. Pending, validation, offline, timeout, provider failure, retry, email sent, and verified completion states are implemented.

Server handlers validate origin, email, safe return paths, and provider URLs. Callback exchange requires a returned user and session. Middleware checks the authenticated user before serving completion, carries refreshed cookies across redirects, and prevents authentication responses from being cached. No raw provider errors or secrets appear in the interface.

The runtime provider endpoint exposes only capability booleans. A read-only check of the configured Supabase project returned email enabled and Google disabled. The Google control therefore remains disabled with a clear explanation. Google OAuth wiring is ready for a provider configuration supplied by the project owner. No external provider settings were changed.

There is no implemented private workspace or policy route in this repository. A successful login returns to a sanitized internal destination, defaulting to the landing page. No dashboard, password flow, fake legal links, or onboarding was added.

## Accessibility and verification

The form is server-rendered, labeled, keyboard accessible, and visible without JavaScript. Native POST actions provide the email fallback. Error descriptions are associated with the field; confirmation receives focus. Loading prevents duplicate submissions. Reduced motion removes parallax, dot animation, and delayed completion navigation.

Unit tests cover validation, redirect boundaries, origin checks, email and OAuth handlers, callback verification, cookie-preserving session redirects, and completion timing. Browser checks cover responsive bounds, desktop window heights, short-screen scrolling, static rendering, Back history/fallback, keyboard operation, loading stability, provider availability, errors, offline behavior, dot reveal/idle/exit, and reduced/touch behavior. See `tests/e2e/auth.spec.ts` and the auth unit suites.

Real email delivery and a real Google account sign-in were not exercised. Provider and success responses are mocked in automated state tests; the live project was queried only for provider availability. Edge and physical Safari were not separately tested; Chromium and Playwright WebKit provide engine coverage.

The production build currently encounters the existing Turbopack CSS worker startup failure: the child Node process exits before the build can connect. Lint, type checking, unit tests, and the local development preview are verified separately. This is not a successful production-build claim.

## Primary references

Final checks: lint and type checking passed, along with 94 unit tests. All 30 authentication/footer browser scenarios passed across Chromium, Firefox, and WebKit over the main run and focused reruns. The development browser tests explicitly activate the form before checking hydrated pointer/provider behavior. The form-fit checks include 1366 px windows at 600, 640, 720, and 768 px heights.

- [Supabase server clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase Google authentication](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Google sign-in branding](https://developers.google.com/identity/branding-guidelines)
