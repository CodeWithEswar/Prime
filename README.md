# PRIME

> **Preparation Roadmap for Interviews, Mastery & Excellence**

PRIME is an engineered, personal interview-preparation operating system designed for software engineers targeting top-tier product companies and technical assessments. Built on a distraction-free command runway, PRIME unifies daily scheduling, algorithmic practice tracking, spaced repetition recall, CS fundamentals mastery, and interview readiness diagnostics.

PRIME is **not** a generic coding sandbox — it is an execution engine. It guides your study trajectory, balances workload across available bandwidth, and links directly to trusted external platforms (LeetCode, TakeUForward, GeeksforGeeks) while ensuring concepts permanently transfer into long-term recall.

---

## ⚡ Core Pillars & Capabilities

### 1. 90-Day Adaptive Study Runway (`/today` & `/plan`)
- Converts distant interview dates into 3–4 deliberate daily tasks.
- **Dynamic Capacity Balancing**: Missed a day? The planner automatically redistributes study load across future days without cognitive debt or burnout.
- Distraction-free execution strip with real-time progress tracking.

### 2. Spaced Repetition Revision Engine (`/revision`)
- Calibrated using adapted **SuperMemo SM-2** and **Ebbinghaus Forgetting Curves**.
- Surfaces solved problems and fundamental concepts at exact intervals (1, 3, 7, 14, 28 days) before memory decay occurs.
- Active recall verification ensuring concepts can be reproduced under pressure.

### 3. DSA Pattern Mastery Studio (`/practice/dsa` & `/roadmap/dsa`)
- Structured curriculum spanning **75+ core algorithmic patterns** (Arrays, Two Pointers, Monotonic Stacks, Dynamic Programming, Graphs, and Trees).
- Detailed problem intelligence, attempt logging, and pattern-frequency weighting.
- Interactive Algorithm Lab with search and window visualizers (`/lab`).

### 4. Computer Science Fundamentals (`/fundamentals` & `/roadmap`)
- Four comprehensive interactive university-grade courses:
  - **Database Management Systems (DBMS)**: Relational schemas, normalization (3NF/BCNF), indexing, ACID transactions.
  - **Operating Systems (OS)**: Process scheduling, memory virtualization, concurrency, deadlocks.
  - **Computer Networks (CN)**: OSI/TCP-IP stacks, routing protocols, flow control, socket programming.
  - **Object-Oriented Programming (OOP)**: SOLID principles, design patterns, polymorphic architectures.
- Includes embedded visual simulators and curated video curriculum.

### 5. Aptitude & Logical Reasoning (`/practice/aptitude` & `/roadmap/aptitude`)
- Over **130+ categorized topics** covering quantitative aptitude, logical reasoning, and data interpretation.
- Curated video explanations, timed daily drill sessions, and mastery tracking.

### 6. Interview Readiness & Observability (`/readiness` & `/mastery`)
- Multidimensional readiness score calculated across pattern breadth, recall consistency, and fundamental depth.
- Topic-level competency radar and historical study velocity metrics.

### 7. Unified Notifications & Reminders Engine (`/notifications`)
- Auto-reconciled candidate inbox tracking due revisions, upcoming course milestones, and daily study digests.
- Timezone-aware quiet hours, user preference controls, and background Cloudflare cron dispatchers.

### 8. Cinematic Editorial Landing Experience (`/`)
- Pure black (`#000000`) with signature pure red (`#FF0000`) editorial visual identity.
- Kinetic typography, interactive dot grids with cursor proximity illumination, tactile spotlight cards, and an Embla product carousel.
- **Cinematic Bridge Finale**: Custom SVG perspective scene capturing the candidate's journey toward the illuminated PRIME monument.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, React 19, TypeScript strict mode) |
| **Styling & UI** | Tailwind CSS v4, customized shadcn primitives, CSS semantic tokens |
| **Icons & Brand** | Hugeicons exclusively (`@hugeicons/react`), SVG vectors |
| **Typography** | Geist Sans & Geist Mono (`next/font`) |
| **Motion** | Framer Motion & Motion v12, accessible `usePrimeReducedMotion()` |
| **Server State** | TanStack Query v5 with centralized type-safe query keys |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS) policies, `@supabase/ssr` |
| **Background Cron** | Cloudflare Workers & Wrangler (`workers/planner`, `workers/reminders`) |
| **Email Delivery** | Nodemailer with Resend & SMTP fallback adapters |
| **Validation** | Zod v3 schema validation across all API and database boundaries |
| **Testing** | Vitest, React Testing Library, Playwright E2E |

---

## 📁 Repository Structure

```text
prime/
├── app/                  # Next.js App Router (marketing, dashboard, auth, APIs)
│   ├── (auth)/           # Authentication flows (OAuth callback, email confirm)
│   ├── (dashboard)/      # Protected workspaces (today, plan, practice, roadmap, etc.)
│   └── api/              # Secure endpoints (notifications, weather, AI, crons)
├── components/           # UI primitives & design system components
│   ├── landing/          # Cinematic landing page sections, carousels & finale
│   ├── shell/            # Command frame, sidebar navigation, top bar
│   └── ui/               # Accessible neumorphic controls (Button, Input, Sheet, etc.)
├── domain/               # Pure algorithmic domain logic (planning, revision, mastery)
├── features/             # Vertical slice feature modules
│   ├── today/            # Daily runway snapshot and task reconcilers
│   ├── practice/         # DSA catalog, filters, attempt tracking
│   ├── revision/         # Spaced repetition scheduling & recall queues
│   ├── notifications/    # In-app inbox & automated sync engine
│   └── settings/         # Profile, appearance, target dates, notifications
├── lib/                  # Shared infrastructure (Supabase clients, Query, utils)
├── supabase/             # PostgreSQL migrations, seed data, RLS security policies
├── workers/              # Cloudflare Workers for scheduled background execution
├── tests/                # 68 test files (unit, integration, and E2E)
└── docs/                 # Architectural specifications and engineering reports
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- pnpm `v10+` or `v12+`

### 2. Installation
```bash
git clone https://github.com/CodeWithEswar/Prime.git
cd Prime
pnpm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```
Configure your `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Verification & Quality Standards

PRIME enforces strict quality gates on every commit:

```bash
# TypeScript strict typecheck
pnpm typecheck

# ESLint inspection
pnpm lint

# Full test suite (670+ tests)
pnpm test

# Production build
pnpm build
```

---

## 🔒 Security Architecture

- **Zero-Secret Client Exposure**: Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`) are guarded by `server-only` and never prefixed with `NEXT_PUBLIC_`.
- **Row Level Security (RLS)**: Every user table enforces strict tenant isolation (`auth.uid() = user_id`).
- **Internal Cron Authorization**: Background dispatch endpoints require cryptographic Bearer tokens.

---

## 📄 License

Private repository. All rights reserved © 2026 PRIME.
