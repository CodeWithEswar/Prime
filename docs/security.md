# PRIME — Security Architecture & Guidelines

Security in PRIME follows defense-in-depth across the client, API, server boundary, and database.

---

## 1. Database & Row Level Security (RLS)

- **RLS as Final Boundary**: Never rely purely on application-level checks. All tables storing user-specific state enforce PostgreSQL Row Level Security.
- **Identity Trust**: The authenticated identity is always resolved through `auth.uid()`. Client-supplied user IDs in request bodies or query parameters are never trusted.

---

## 2. Service-Role Isolation (`server-only`)

- The Supabase service-role client (`lib/supabase/admin.ts`) bypasses RLS and holds superuser permissions.
- It is strictly locked behind `import "server-only"`. Any attempt to import it into a client component results in a compilation failure during the Next.js build.
- Service-role credentials are used only for:
  1. Internal background Worker executions
  2. Administrative maintenance
  3. Controlled system migrations

---

## 3. Environment & Secret Management

- Secrets are never prefixed with `NEXT_PUBLIC_`.
- Worker secrets are managed via Cloudflare Wrangler secrets (`wrangler secret put <KEY>`) and never committed to `wrangler.jsonc`.
- The repository only commits `.env.example` with sanitized placeholders.

---

## 4. Input Security & Trust Boundaries

- All external inputs (URL parameters, search filters, form bodies, Server Action arguments) are validated at the entrypoint using **Zod**.
- SQL injection is prevented by Supabase parameterized query bindings.

---

## 5. Security Headers

Configured in `next.config.ts`:

- **Content-Security-Policy (CSP)**: Constrains scripts, frames, styles, and data connections.
- **X-Frame-Options**: `DENY` prevents clickjacking.
- **X-Content-Type-Options**: `nosniff` prevents MIME-sniffing exploits.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Permissions-Policy**: Disables camera, microphone, and geolocation APIs.
- **Strict-Transport-Security (HSTS)**: Enforces TLS connections.

---

## 6. Logging Hygiene & Redaction

The structured logger (`lib/logging/index.ts`) automatically scrubs sensitive credentials including passwords, authorization tokens, cookies, and API keys before writing to standard streams.
