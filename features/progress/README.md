# Progress Feature Architecture

Intended responsibility:

- Interview readiness score presentation
- Weakness detection alerts and recommendations
- Spaced activity metrics, velocity, and streak statistics

Planned internal structure (Phase 1+):

- `components/` - Readiness gauges, weakness callouts, activity summaries
- `queries/` - TanStack Query hooks for `queryKeys.progress`
- `server/` - Aggregated progress snapshots and domain scoring calls
- `types/` - Progress summary contracts
