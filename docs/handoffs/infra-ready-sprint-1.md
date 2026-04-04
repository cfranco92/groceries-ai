# Infrastructure Ready — Sprint 1

## Summary

Monorepo scaffolding is complete and the CI/CD pipeline is configured. All packages build, lint, type-check, and test successfully.

### What was set up

**SCRUM-9 — Monorepo Scaffolding (completed)**

- `packages/shared-types`: Exports enums (`UserRole`, `ListStatus`, `UnitType`, `ReceiptStatus`, `InviteStatus`) and full TypeScript interfaces matching the Prisma schema.
- `packages/utils`: Utility functions (`formatPrice`, `daysBetween`, `calculateRestockUrgency`, `calculateConfidence`, `truncate`, `slugify`).
- `packages/eslint-config`: Shared ESLint configuration with three presets:
  - `index.js` — base TypeScript config
  - `nestjs.js` — NestJS/Node.js preset (consumed by `apps/api`)
  - `nextjs.js` — Next.js preset (available for `apps/web`)
- ESLint configs added to `packages/shared-types` and `packages/utils` consuming the shared base config.
- `apps/api/.eslintrc.js` updated to consume `@groceries-ai/eslint-config/nestjs`.
- `apps/web`: Minimal Next.js scaffold (`layout.tsx`, `page.tsx`, `next.config.js`, `.eslintrc.js`) so builds pass. Ready for the frontend developer to replace.
- Turbo pipeline verified: `dev`, `build`, `lint`, `test`, `tsc` all defined with correct dependency chains.
- DTO strict-mode fixes: Added definite assignment assertions (`!`) to household DTOs for NestJS class-validator compatibility.
- Test scripts updated with `--passWithNoTests` flag so the pipeline passes before test files are written.

**SCRUM-13 — Environment Variable Management (already complete)**

- `apps/api/.env.example` — includes Database, Firebase Auth, GCP, Server, and Redis variables.
- `apps/web/.env.example` — includes API URL and Firebase client config.
- `.gitignore` verified: excludes `.env`, `.env.local`, `.env.*.local`, `*.pem`, `service-account-key.json`, `firebase-sa-key.json`. Does not exclude `.env.example`.

**CI/CD Pipeline**

- `.github/workflows/ci.yml` — single job, sequential steps: lint → type-check → test → build.
- Triggers on push to `main`/`develop` and PRs targeting those branches.
- Uses pinned actions: `actions/checkout@v4`, `pnpm/action-setup@v3`, `actions/setup-node@v4`.
- Node.js 20, pnpm 9, `pnpm install --frozen-lockfile`.
- Concurrency groups cancel in-progress runs for the same branch.
- No Docker services required (unit tests mock Prisma).

**Docker Compose**

- PostgreSQL 16 Alpine on port 5433 with health check — **healthy**.
- Redis 7 Alpine on port 6379 with health check — **healthy**.
- Named volume `postgres_data` for persistence.
- Removed deprecated `version` field from `docker-compose.yml`.

## Manual Steps Required

1. **Docker services**: Run `docker compose up -d` from the project root to start PostgreSQL and Redis.
2. **Environment variables**: Copy `.env.example` to `.env` in both `apps/api/` and `apps/web/` and fill in Firebase/GCP credentials.
3. **Database setup**: Run `pnpm --filter=api prisma:migrate` then `pnpm --filter=api prisma:seed` after starting PostgreSQL.

## Pipeline Verification

All commands pass from the monorepo root:

| Command | Status |
|---------|--------|
| `pnpm install` | Pass |
| `pnpm lint` | Pass (0 errors, 0 warnings) |
| `pnpm tsc` | Pass |
| `pnpm test` | Pass (17 tests) |
| `pnpm build` | Pass (API + Web) |

## Known Issues / TODOs

- `apps/web` has a minimal scaffold — the frontend developer should replace `src/app/layout.tsx` and `src/app/page.tsx` with the full implementation.
- The `@groceries-ai/eslint-config/nextjs` preset is available but not yet consumed by the web app (waiting for frontend scaffolding with full TypeScript support).
- E2E tests with database service containers will be added to CI later (not in Sprint 1 scope).
