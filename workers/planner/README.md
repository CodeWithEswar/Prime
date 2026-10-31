# PRIME Planner Worker

Background execution worker responsible for evaluating and generating daily preparation plans.

## Architecture

- **Runtime**: Cloudflare Workers
- **Authoritative Database**: Connects directly to Supabase PostgreSQL using service-role credentials.
- **Triggers**: Cloudflare Cron triggers (daily schedule) and manual admin dispatch.

## Development

Run local worker simulation:

```bash
pnpm worker:planner:dev
```

Health check:

```bash
curl http://localhost:8787/health
```

## Secrets Management

Never commit service-role keys or secrets to wrangler configuration. Secrets are stored via:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
