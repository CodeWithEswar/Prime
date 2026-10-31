# Auth Feature Architecture

Intended responsibility:

- User session authentication integration via Supabase SSR Auth
- Passwordless / magic link & OAuth login boundaries
- User settings and preparation profile preferences

Planned internal structure (Phase 1+):

- `components/` - Authentication UI (sign-in card, callback handler)
- `server/` - Supabase server actions (login, logout, session verification)
- `schemas/` - Zod schemas for auth credentials
- `types/` - Auth session types
