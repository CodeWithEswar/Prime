# Revision Feature Architecture

Intended responsibility:

- Spaced repetition queue management (due items for the day)
- Problem recall rating and next interval calculation
- Backlog health indicators

Planned internal structure (Phase 1+):

- `components/` - Revision queue list, grade rating buttons (0-5)
- `queries/` - TanStack Query hooks for `queryKeys.revision`
- `mutations/` - Review submission mutations calling `domain/revision` algorithms
- `schemas/` - Review submission payload schemas
- `server/` - Daily due revision queries
- `types/` - Revision queue view models
