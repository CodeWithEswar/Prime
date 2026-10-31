# PRIME — Development Guide

Quick-start guide for setting up and developing **PRIME** locally.

---

## 1. Prerequisites

- **Node.js**: `v20+` or `v24+` (`v24.18.0` tested)
- **pnpm**: `v12+` (`v12.4.1` tested)
- **Docker**: Required for running local Supabase containers

---

## 2. Initial Setup

1. **Clone & Install Dependencies**:

   ```bash
   git clone <repo-url> prime
   cd prime
   pnpm install
   ```

2. **Configure Environment Variables**:

   ```bash
   cp .env.example .env.local
   ```

   Inspect `.env.local` to verify local ports match your local environment.

3. **Start Supabase Local Stack**:
   ```bash
   pnpm supabase:start
   ```
   This spins up local PostgreSQL, Auth, Inbucket (local email viewer), and Studio at `http://localhost:54323`.

---

## 3. Development Commands

### Next.js Application

```bash
# Start Next.js development server with Turbopack
pnpm dev

# Typecheck the codebase
pnpm typecheck

# Run ESLint
pnpm lint

# Format code with Prettier
pnpm format
pnpm format:check

# Run unit and component test suites (Vitest)
pnpm test
pnpm test:watch

# Run Playwright end-to-end tests
pnpm test:e2e

# Run production build
pnpm build
```

### Cloudflare Workers

```bash
# Run local Planner worker
pnpm worker:planner:dev

# Run local Reminders worker
pnpm worker:reminders:dev
```

### Supabase Database

```bash
# Start local containers
pnpm supabase:start

# Stop local containers
pnpm supabase:stop

# Reset local database and re-apply all migrations
pnpm supabase:reset
```
