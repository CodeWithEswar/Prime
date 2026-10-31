# PRIME Reminders Worker

Background execution worker responsible for dispatching email preparation reminders and weekly digest reports.

## Architecture

- **Runtime**: Cloudflare Workers
- **Authoritative Database**: Supabase PostgreSQL (reads user notifications and email preferences).
- **Email Delivery Boundary**: Dispatches via Resend API.
- **Triggers**: Cloudflare Cron triggers (morning daily brief, evening task check).

## Development

Run local worker simulation:

```bash
pnpm worker:reminders:dev
```

Health check:

```bash
curl http://localhost:8788/health
```

## Secrets Management

Secrets are managed via Wrangler CLI:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put RESEND_API_KEY
```
