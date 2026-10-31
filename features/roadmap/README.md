# Roadmap Feature Architecture

Intended responsibility:

- Structured interview preparation roadmap visualization
- Hierarchical topic navigation (Data Structures, Algorithms, System Design)
- Topic mastery status indicators

Planned internal structure (Phase 1+):

- `components/` - Roadmap tree, topic node cards, mastery badges
- `queries/` - TanStack Query hooks for `queryKeys.roadmap`
- `schemas/` - Topic and item schemas
- `server/` - Cached roadmap queries (`CACHE_POLICY.roadmap`)
- `types/` - Roadmap data contracts
