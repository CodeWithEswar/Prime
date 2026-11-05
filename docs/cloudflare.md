# PRIME — Cloudflare Workers Infrastructure Foundation

This document defines the Cloudflare Workers architecture, environment configuration, and verification standards for **PRIME**.

---

## 1. Architecture & Role

Cloudflare Workers operate as stateless scheduled background workers in the PRIME architecture.

```text
Next.js (Vercel)
   │
   ├── Supabase Auth (OAuth / Email)
   │
   └── Supabase PostgreSQL (Authoritative Storage)
            ▲
            │ (Service Role / Direct SQL)
            │
   ┌────────┴────────┐
   │                 │
Worker Planner   Worker Reminders
(Cloudflare)     (Cloudflare)
```

### Guiding Principles

1. **Stateless Compute**: Workers do not maintain independent databases (no Cloudflare D1, KV, or durable storage duplicating user records).
2. **Supabase Single Source of Truth**: All scheduling inputs, user settings, and preparation logs are fetched from and written to Supabase PostgreSQL.
3. **Foundation Phase**: Workers implement the `/health` diagnostic endpoint and the `scheduled` cron skeleton. Business logic (the full planner algorithm and email dispatch) is deferred to feature phases.

---

## 2. Worker Inventory

### 2.1 `prime-worker-planner` (`workers/planner/`)
- **Purpose**: Generates and updates daily preparation plans based on user targets, roadmap DAG dependencies, and mastery ratings.
- **Entrypoint**: `workers/planner/src/index.ts`
- **Config**: `workers/planner/wrangler.jsonc`
- **Cron Schedule (Phase 1+)**: `0 0 * * *` (midnight UTC)
- **Endpoints**:
  - `GET /health`: Returns `{ status: "healthy", worker: "planner", environment: "...", timestamp: "..." }`

### 2.2 `prime-worker-reminders` (`workers/reminders/`)
- **Purpose**: Dispatches morning preparation prompts and evening incomplete task reminders based on user cadence settings.
- **Entrypoint**: `workers/reminders/src/index.ts`
- **Config**: `workers/reminders/wrangler.jsonc`
- **Cron Schedule (Phase 1+)**:
  - Morning prompt: `0 6 * * *` (6:00 AM UTC)
  - Evening check: `0 20 * * *` (8:00 PM UTC)
- **Endpoints**:
  - `GET /health`: Returns `{ status: "healthy", worker: "reminders", environment: "...", timestamp: "..." }`

---

## 3. Environment & Configuration

Cloudflare Account ID: `de6ff29d95bdc8ce81317ce8a72424c0` (`Eswarchinthakayala2004@gmail.com's Account`).

### Bindings

| Variable | Type | Description |
|---|---|---|
| `ENVIRONMENT` | Var | `"development"` \| `"preview"` \| `"production"` |
| `SUPABASE_URL` | Var | URL of the Supabase project (`https://irioygnezxaptppbfpqz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Privileged key for automated background jobs (never exposed in public code) |
| `EMAIL_FROM` | Var | Sender address for reminders (`PRIME <notifications@primeprep.app>`) |
| `RESEND_API_KEY` | Secret | Optional email provider API key for notification dispatch |

---

## 4. Verification & Testing

Unit tests for both workers are maintained in `tests/unit/workers.test.ts`:
- Verifies `GET /health` returns status `200` with the expected JSON payload.
- Verifies the root endpoint returns the foundation greeting.
- Verifies `scheduled` execution completes without error.
- Verifies structured JSON logging via `workerLog`.

To run worker tests:
```bash
npx vitest run tests/unit/workers.test.ts
```

To run dry-run compilation checks:
```bash
npx wrangler deploy --config workers/planner/wrangler.jsonc --dry-run
npx wrangler deploy --config workers/reminders/wrangler.jsonc --dry-run
```

