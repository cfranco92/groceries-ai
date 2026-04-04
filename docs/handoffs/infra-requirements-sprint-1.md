# Handoff: Infrastructure & DevOps Setup — Sprint 1

## Context

Sprint 1 needs the monorepo scaffolding completed and the CI/CD pipeline configured. Some infrastructure is already in place (Turborepo, Docker Compose, Prisma schema, .env), but the apps need full scaffolding and environment management needs to be formalized.

## Target Agent

**DevOps Engineer** (`.claude/agents/devops-engineer.md`)

## Context Files to Read First

1. `CLAUDE.md` — Project conventions, monorepo structure, commands
2. `docs/ARCHITECTURE.md` — Deployment architecture, security requirements
3. `.claude/rules/devops-deployment.md` — CI/CD rules (action versions, pipeline order)
4. `docker-compose.yml` — Current local services
5. `apps/api/package.json` — Current API dependencies
6. `apps/web/package.json` — Current web dependencies

## Tickets Covered

| Ticket | Summary | Priority |
|--------|---------|----------|
| SCRUM-9 | Initialize Turborepo monorepo with pnpm workspaces (partial) | 1 |
| SCRUM-13 | Configure environment variables and .env files | 2 |

## Current State (what already exists)

- Turborepo configured (`turbo.json`)
- pnpm workspaces defined (`pnpm-workspace.yaml`)
- Root `package.json` with scripts (dev, build, lint, test)
- `apps/web/package.json` exists with dependencies but **NO source code** (`apps/web/src/` missing)
- `apps/api/package.json` exists with dependencies, **only** `src/prisma/schema.prisma` exists
- `packages/shared-types/`, `packages/utils/`, `packages/eslint-config/` — check current state
- Docker Compose with PostgreSQL (port 5433) and Redis (port 6379), both running
- `apps/api/.env` exists with real values
- `.gitignore` properly excludes .env and key files

## Implementation Requirements

### Step 1: SCRUM-9 — Complete Monorepo Scaffolding

Verify and complete the monorepo setup. Fill in any gaps:

**packages/shared-types:**
- `package.json` with name `@groceries-ai/shared-types`
- `tsconfig.json` extending base config
- `src/index.ts` with placeholder exports (the backend developer will populate with real types)
- Basic enums that match Prisma: `UserRole`, `ListStatus`, `UnitType`, `ReceiptStatus`, `InviteStatus`

**packages/utils:**
- `package.json` with name `@groceries-ai/utils`
- `tsconfig.json` extending base config
- `src/index.ts` with common utility stubs (e.g., `formatCurrency`, `generateInviteCode`, `slugify`)

**packages/eslint-config:**
- Shared ESLint configuration for the monorepo
- Base config extending recommended + TypeScript rules
- Next.js specific config for the web app
- NestJS specific config for the API

**Turbo pipeline verification:**
- Verify `turbo.json` has proper pipeline definitions for: `dev`, `build`, `lint`, `test`, `tsc`
- Verify workspace dependencies resolve correctly
- `pnpm dev` should attempt to start both apps (web will fail without src, that's ok)
- `pnpm build` should build packages first, then apps
- `pnpm lint` should lint all packages

### Step 2: SCRUM-13 — Environment Variable Management

**Create `.env.example` files:**

`apps/api/.env.example`:
```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/groceries_ai

# Firebase Auth
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# GCP
GCP_PROJECT_ID=
GCS_BUCKET_NAME=groceries-ai-receipts
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=

# Server
PORT=3001
NODE_ENV=development

# Redis (Phase 2+)
REDIS_HOST=localhost
REDIS_PORT=6379
```

`apps/web/.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Verify `.gitignore`** includes all sensitive files and `.env.example` is NOT ignored.

### Step 3: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`:

**Trigger:** Push to `main`, `develop`, or any PR targeting these branches.

**Pipeline order** (per rules): lint -> type-check -> test -> build

**Configuration:**
- Node.js: 20 (LTS)
- pnpm: 9 (via `pnpm/action-setup@v3`)
- `actions/checkout@v4`
- `actions/setup-node@v4` with pnpm store cache
- `pnpm install --frozen-lockfile`
- Use `concurrency` groups to cancel in-progress runs for the same branch

**Jobs:**
```
ci:
  steps:
    - checkout
    - setup pnpm
    - setup node + cache
    - pnpm install --frozen-lockfile
    - pnpm lint
    - pnpm tsc (type check all packages)
    - pnpm test (run all tests)
    - pnpm build (verify build works)
```

**Important:** The pipeline should not require Docker services for now (no DB in CI for unit tests — the backend will mock Prisma in unit tests). E2E tests that need a database will be added later with service containers.

### Step 4: Docker Compose Enhancements

Verify current `docker-compose.yml` is complete:
- PostgreSQL 16 Alpine on port 5433 with health check (already exists)
- Redis 7 Alpine on port 6379 with health check (already exists)
- Named volume for PostgreSQL data persistence (already exists)

No changes needed unless something is broken. Verify by running `docker compose ps`.

## Acceptance Criteria

- [ ] `pnpm install` works from root with no errors
- [ ] `pnpm lint` runs across all packages (may have warnings, no errors)
- [ ] `pnpm tsc` type-checks all packages
- [ ] `packages/shared-types` exports basic enums
- [ ] `packages/utils` has a working build
- [ ] `packages/eslint-config` is consumed by both apps
- [ ] `.env.example` files created for both apps
- [ ] `.gitignore` verified (no secrets committable)
- [ ] CI pipeline runs on push and PR
- [ ] CI pipeline follows order: lint -> type-check -> test -> build
- [ ] Docker services healthy and accessible

## After Completion

Create `docs/handoffs/infra-ready-sprint-1.md` with:
- Summary of what was set up
- Any manual steps needed (env vars, Docker commands)
- CI pipeline URL and status
- Known issues or TODOs
