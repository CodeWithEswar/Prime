# Study Session Feature Architecture

Intended responsibility:

- Focused practice timer and session state
- Problem notes capture during active solving
- Transient session persistence without premature database thrashing

Planned internal structure (Phase 1+):

- `components/` - Hardware-style session timer, note scratchpad
- `queries/` - Active session state
- `types/` - Session state model
