# PRIME Command Frame — Application Shell Architecture

## Overview

The **PRIME Command Frame** is the permanent navigation and application shell for authenticated users within PRIME (Preparation Roadmap for Interviews, Mastery & Excellence). Replacing generic dashboard layouts, it embodies three core design disciplines:

1. **Direction**: Primary progression-oriented navigation with a route rail and geometric red terminal (`◆`).
2. **Context**: Topbar contextual breadcrumbs (`PRACTICE / DSA / [PROBLEM]`) and day-count milestones (`DAY X / Y`) derived from real preparation timelines.
3. **Attention**: Subtle real-time signal pills indicating revision debt (`↻ X DUE`) powered by lightweight PostgreSQL queries.

---

## Architectural Components (`components/shell/`)

| Component | Responsibility |
|---|---|
| [`AppShell`](file:///d:/Prime/components/shell/app-shell.tsx) | Client layout coordinator handling desktop collapse persistence, command modal state, and responsive frame boundaries. |
| [`AppSidebar`](file:///d:/Prime/components/shell/app-sidebar.tsx) | Desktop fixed sidebar (`248px` expanded, `64px` collapsed) with brand, navigation, preparation context, and user footer. |
| [`SidebarBrand`](file:///d:/Prime/components/shell/sidebar-brand.tsx) | Brand lockup rendering the full `PrimeLogo` when expanded and geometric `PrimeMark` when collapsed. |
| [`SidebarRouteRail`](file:///d:/Prime/components/shell/sidebar-route-rail.tsx) | Structural vertical guide with dynamic red route terminal node (`◆`) tracked via Framer Motion `layoutId`. |
| [`SidebarNavigation`](file:///d:/Prime/components/shell/sidebar-navigation.tsx) | Grouped navigation items (`PREPARE`, `PRACTICE`, `UNDERSTAND`, `WORKSPACE`) with revision badges. |
| [`SidebarPreparationContext`](file:///d:/Prime/components/shell/sidebar-preparation-context.tsx) | Real target goal (`target_role` & `target_date`) from `user_settings` table without fake progress percentages. |
| [`SidebarUser`](file:///d:/Prime/components/shell/sidebar-user.tsx) | Authenticated avatar, name, email, and Radix dropdown with settings and sign-out server action. |
| [`SidebarCollapse`](file:///d:/Prime/components/shell/sidebar-collapse.tsx) | Edge-mounted collapse toggle with tooltip and keyboard access. |
| [`AppTopbar`](file:///d:/Prime/components/shell/app-topbar.tsx) | 56px sticky topbar with context breadcrumb, command search trigger, day milestone, and revision pill. |
| [`ContextBreadcrumb`](file:///d:/Prime/components/shell/context-breadcrumb.tsx) | Dynamic route hierarchy with back-navigation on detail routes. |
| [`CommandSearch`](file:///d:/Prime/components/shell/command-search.tsx) | Quick action trigger and modal dialog (`cmdk`) activated via global `/` or `⌘K` / `Ctrl+K`. |
| [`MobileNavigation`](file:///d:/Prime/components/shell/mobile-navigation.tsx) | Fixed bottom bar for mobile (`< 768px`) with high-frequency tabs (`Today`, `Roadmap`, `Practice`, `Progress`, `More`). |
| [`MobileMoreSheet`](file:///d:/Prime/components/shell/mobile-more-sheet.tsx) | Bottom drawer for secondary destinations (`Plan`, `Revision`, `Notes`, `Settings`) and sign out. |
| [`PageFrame`](file:///d:/Prime/components/shell/page-frame.tsx) | Layout wrapper providing container widths (`workspace`, `wide-table`, `reading`, `full`) and section headers. |

---

## Server Data Loading (`app/(dashboard)/layout.tsx`)

The shell receives real Supabase data through the root dashboard server component:

```ts
const [profileRes, settingsRes, revisionCountRes] = await Promise.all([
  supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
  supabase.from("user_settings").select("target_role, target_date, start_date, daily_study_minutes").eq("user_id", user.id).maybeSingle(),
  supabase.from("revision_items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active").lte("next_review_at", new Date().toISOString()),
]);
```

- **O(1) Head Count**: Revision due attention uses `{ head: true }` without fetching unnecessary row records.
- **Truthful Milestones**: Days calculation strictly derives from real `start_date` and `target_date`. If unset, it gracefully hides.

---

## Verification & Testing

- **Unit Tests**: [`tests/unit/shell.test.tsx`](file:///d:/Prime/tests/unit/shell.test.tsx) — 14/14 passing (route matching, brand variants, preparation context, navigation groups, badge colors, page frames).
- **All Unit Tests**: 18/18 test suites, 181/181 passing.
- **End-to-End Tests**: [`tests/e2e/shell.spec.ts`](file:///d:/Prime/tests/e2e/shell.spec.ts) — 5/5 passing (sidebar collapse, topbar breadcrumb, command search hotkeys, primary route navigation, mobile bottom navigation & more sheet).
- **TypeScript**: `npm run typecheck` — 0 errors.
- **Linting**: `npm run lint` — 0 errors, 0 warnings.
- **Production Turbopack Build**: `npm run build` — 73/73 routes compiled cleanly.

