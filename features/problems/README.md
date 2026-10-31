# Problems Feature Architecture

Intended responsibility:

- Curated DSA problem sheet browsing and filtering
- External problem links (LeetCode, TakeUForward, GeeksforGeeks)
- Problem attempt tracking, difficulty badges, notes, and tags

Planned internal structure (Phase 1+):

- `components/` - Problem sheet table (headless TanStack Table), filters, search bar
- `queries/` - TanStack Query hooks for `queryKeys.problems`
- `mutations/` - Attempt logging and solve status mutations
- `schemas/` - Problem filter query parameter schemas (nuqs integration)
- `server/` - Paginated and cached problem catalog queries
- `types/` - Problem models and attempt records
