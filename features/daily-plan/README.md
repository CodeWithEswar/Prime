# Daily Plan Feature Architecture

Intended responsibility:

- Day-wise preparation task orchestration
- Today's agenda rendering and task completion actions
- Task reordering, skipping, and status transitions

Planned internal structure (Phase 1+):

- `components/` - Today view, daily task items, time estimator
- `queries/` - TanStack Query hooks for `queryKeys.today`
- `mutations/` - Server actions for toggling task state with optimistic reconciliation
- `schemas/` - Zod validation schemas for plan updates
- `server/` - Server data loaders and Supabase data adapters
- `types/` - Daily plan view models
