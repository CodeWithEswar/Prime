# PRIME

> **Preparation Roadmap for Interviews, Mastery & Excellence**

PRIME is an engineered, personal interview-preparation operating system focused on structured roadmaps, day-wise planning, DSA practice tracking, spaced repetition, mastery tracking, and interview readiness.

PRIME is **not** a coding platform. It does not include a code execution sandbox, online compiler, or AI chatbot; DSA problems link to external platforms (such as LeetCode, TakeUForward, and GeeksforGeeks).

---

## Current Status: Phase 0 — Foundation Only

This repository currently hosts the production-grade engineering foundation established in **Phase 0**. No product modules (Today dashboard, Practice sheet, Roadmap viewer, Revision queue, Progress analytics) are implemented yet.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript strict mode)
- **Styling**: Tailwind CSS v4, customized shadcn primitives, CSS semantic variables
- **Design Language**: Black-first editorial foundation, restrained red accent, solid neumorphic hardware controls
- **Icons**: Hugeicons exclusively (`@hugeicons/react`)
- **Typography**: Geist Sans & Geist Mono (`next/font`)
- **Interactive Server State**: TanStack Query v5 with centralized `queryKeys`
- **Data & Auth Layer**: Supabase PostgreSQL with Row Level Security (RLS) & `@supabase/ssr`
- **Background Execution**: Cloudflare Workers with Wrangler configuration
- **Validation**: Zod (trust boundary validation)
- **Forms**: React Hook Form with `@hookform/resolvers`
- **Testing**: Vitest, React Testing Library, Playwright
- **Tooling**: pnpm, ESLint 9, Prettier

---

## Directory Architecture

```text
prime/
├── app/                  # Next.js App Router (layout, error boundaries, tokens preview)
├── components/           # UI primitives (solid neumorphic Button, Card, Input, etc.)
├── domain/               # Pure algorithmic domain modules (planning, revision, mastery)
├── features/             # Vertical slice feature architecture boundaries
├── lib/                  # Shared infrastructure (supabase, query, cache, validation, logging)
├── public/               # Public branding and static assets
├── supabase/             # Local migrations, seed, tests, config.toml
├── workers/              # Cloudflare Workers (planner, reminders, shared)
├── tests/                # Unit, integration, and E2E test suites
└── docs/                 # In-depth architectural & operational documentation
```

---

## Getting Started

### Prerequisites

- Node.js `v20+` or `v24+`
- pnpm `v12+`
- Docker (for local Supabase)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

### 3. Verify Code Quality & Testing

```bash
# Typecheck TypeScript
pnpm typecheck

# Lint with ESLint
pnpm lint

# Run Unit & Component Tests
pnpm test

# Build Production Application
pnpm build
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Phase 0 Foundation Verification preview surface.

---

## Documentation

Detailed architectural and design specifications:

- [Architecture & Data Flow](docs/architecture.md)
- [Caching & Invalidation Policies](docs/caching.md)
- [Database & RLS Conventions](docs/database.md)
- [Design System & Neumorphic Buttons](docs/design-system.md)
- [Development Workflow](docs/development.md)
- [Security Guidelines](docs/security.md)

---

## Security Notice

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or other server secrets to client components.
- Sensitive server modules are strictly guarded with `server-only`.
- All user-owned database records require PostgreSQL Row Level Security.
