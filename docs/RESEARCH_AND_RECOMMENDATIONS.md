# GroceriesAI - Research & Recommendations

Deep research on tooling, multi-agent architecture, CI/CD automation, and best practices for the project. Compiled April 2026.

---

## 1. Multi-Agent Architecture with Claude Code

### The Problem

Using Claude for everything in a single conversation degrades context over time. The solution is to create **specialized agents** that each focus on one domain, with isolated context windows.

### Recommended Agent Structure

Create agents in `.claude/agents/` — each agent gets its own system prompt, tool access, and model configuration:

```
.claude/
├── agents/
│   ├── project-manager.md      # Orchestrates, breaks tasks, tracks deps
│   ├── frontend-developer.md   # React, Next.js, UI components
│   ├── backend-developer.md    # NestJS, Prisma, API design
│   ├── ux-designer.md          # Design system, accessibility, UX
│   ├── devops-engineer.md      # CI/CD, Docker, GCP, deployments
│   └── qa-engineer.md          # Testing, coverage, E2E
├── skills/
│   ├── api-reviewer/SKILL.md   # /review-api command
│   ├── component-builder/SKILL.md
│   └── test-generator/SKILL.md
├── rules/
│   ├── backend-database.md     # Scoped to apps/api/prisma/**
│   ├── frontend-accessibility.md
│   └── devops-deployment.md
├── hooks/
│   ├── pre-commit.sh
│   └── post-commit.sh
└── settings.json
```

### Agent Definitions

Each `.md` file in `.claude/agents/` defines a specialized agent:

**Project Manager** (`project-manager.md`):
```markdown
---
name: project-manager
description: Orchestrates team coordination, breaks work into tasks
model: claude-opus-4-6
tools: [Read, Glob, Grep]
---

You are the Project Manager for GroceriesAI. Your role is to:
- Break Jira tickets into implementable subtasks
- Identify dependencies between tasks
- Coordinate work across frontend, backend, and DevOps
- Review PR descriptions for completeness
- Track progress against FEATURES.md phases

Always reference docs/FEATURES.md for the roadmap and CLAUDE.md for conventions.
```

**Frontend Developer** (`frontend-developer.md`):
```markdown
---
name: frontend-developer
description: React, Next.js, TypeScript UI development
model: claude-opus-4-6
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

You are an expert React/Next.js developer for GroceriesAI. Your specializations:
- Next.js 14+ App Router with Server Components
- TypeScript strict mode
- Tailwind CSS + shadcn/ui component patterns
- Zustand for client state, TanStack Query for server state
- React Hook Form + Zod for forms
- Vitest + React Testing Library

Rules:
- Server Components by default, 'use client' only when needed
- Named exports (except page.tsx)
- Path aliases: @/components, @/lib, @/hooks
- 80%+ test coverage on new code
- Run pnpm lint before completing any task
```

**Backend Developer** (`backend-developer.md`):
```markdown
---
name: backend-developer
description: NestJS, Prisma, PostgreSQL API development
model: claude-opus-4-6
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

You are an expert NestJS backend developer for GroceriesAI. Your specializations:
- NestJS modular architecture with DI
- Prisma ORM with PostgreSQL
- REST API design with Swagger/OpenAPI
- Firebase Auth verification (AuthGuard)
- class-validator for DTO validation
- Jest + Supertest for testing

Rules:
- Follow existing module pattern: controller, service, module, DTOs
- All endpoints documented with Swagger decorators
- Use Prisma select/include to avoid over-fetching
- Consistent error format per API_DESIGN.md
- Run pnpm --filter=api test before completing any task
```

**DevOps Engineer** (`devops-engineer.md`):
```markdown
---
name: devops-engineer
description: CI/CD, Docker, GCP deployment, infrastructure
model: claude-opus-4-6
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

You are the DevOps engineer for GroceriesAI. Your specializations:
- GitHub Actions CI/CD pipelines
- Docker and Docker Compose
- GCP: Cloud Run, Cloud SQL, Cloud Storage, Document AI
- Turborepo monorepo optimization
- Security: secrets management, CORS, rate limiting

Rules:
- Never commit secrets to git
- Use specific versions for all Docker images (not :latest)
- GitHub Actions for all CI/CD (not Cloud Build)
- Vercel for frontend deployment
- Cloud Run for backend deployment
```

**QA Engineer** (`qa-engineer.md`):
```markdown
---
name: qa-engineer
description: Testing strategy, coverage, E2E tests
model: claude-haiku-4-5
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

You are the QA engineer for GroceriesAI. Your specializations:
- Jest unit tests for NestJS services
- Vitest + React Testing Library for frontend
- E2E tests with Jest + Supertest
- Test coverage analysis and improvement
- Edge case identification

Rules:
- Test user behavior, not implementation details
- Use role-based queries (getByRole) over test IDs
- 80%+ coverage target for all new code
- Each test verifies one aspect (single assertion focus)
- Mock only what's necessary
```

### Context Management Best Practices

**Strategy 1: Git Worktree Isolation** — Each agent runs in its own worktree (branch). This prevents file conflicts when multiple agents work in parallel. Claude Code handles this automatically with the `isolation: "worktree"` flag.

**Strategy 2: Scoped Rules** — Create `.claude/rules/` files with YAML frontmatter that specify `scope:` paths. Rules only load when the agent touches those files.

**Strategy 3: One Task Per Session** — Don't mix frontend and backend work in one conversation. Start a new session for each domain-specific task. This keeps context sharp.

**Strategy 4: CLAUDE.md as Single Source of Truth** — All agents read the same CLAUDE.md. Keep it concise (~3KB). Detailed specs go in docs/*.md files that agents read on-demand.

---

## 2. Claude Code Hooks

Hooks automate quality checks at key points in the development workflow.

### Configuration (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostEdit": [
      {
        "matcher": "\\.(ts|tsx)$",
        "command": "npx prettier --write $FILE"
      }
    ],
    "PreCommit": [
      {
        "command": "pnpm lint --max-warnings 0"
      },
      {
        "command": "pnpm tsc --noEmit"
      }
    ],
    "PostCommit": [
      {
        "command": "git push origin $(git rev-parse --abbrev-ref HEAD)"
      }
    ]
  }
}
```

### Hook Lifecycle

```
Session Start → [PostSessionStart]
File Edit     → [PostEdit] → auto-format with Prettier
Before Commit → [PreCommit] → lint, type-check, tests
Git Commit    → [PostCommit] → push, notify
Session End   → [PreSessionEnd] → cleanup
```

### Recommended Hooks for GroceriesAI

**PostEdit**: Auto-format with Prettier on every file save.

**PreCommit**: Run linting, TypeScript type checking, and tests on changed files. If any check fails, the commit is blocked.

**PostCommit**: Auto-push to remote branch.

---

## 3. GitHub Actions + Claude PR Review

### Install the GitHub App

```bash
claude /install-github-app
```

This configures the `anthropics/claude-code-action` GitHub Action for your repository.

### PR Review Workflow

```yaml
# .github/workflows/claude-pr-review.yml
name: Claude PR Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            Review this PR for GroceriesAI focusing on:
            1. TypeScript strict mode compliance (no 'any' types)
            2. NestJS module structure and DI patterns
            3. React/Next.js component patterns (Server Components default)
            4. Prisma query optimization (avoid N+1)
            5. Security: SQL injection, XSS, auth issues
            6. Test coverage for changed files
            7. Consistency with CLAUDE.md conventions

            Provide specific line numbers and actionable feedback.
```

### Path-Specific Security Review

```yaml
# .github/workflows/claude-security-review.yml
name: Claude Security Review

on:
  pull_request:
    paths:
      - 'apps/api/src/modules/auth/**'
      - 'apps/api/src/prisma/**'
      - 'apps/web/src/lib/**'

jobs:
  security-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            SECURITY REVIEW - Critical files changed.
            Check: password hashing, JWT handling, input sanitization,
            SQL injection vectors, permission checks, secrets exposure.
```

### Main CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - uses: pnpm/action-setup@v3
        with: { version: '9' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint --max-warnings 0
      - run: pnpm tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: validate
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - uses: pnpm/action-setup@v3
        with: { version: '9' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - uses: pnpm/action-setup@v3
        with: { version: '9' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### Conventional Commits Enforcement

```yaml
# .github/workflows/commitlint.yml
name: Conventional Commits

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: wagoid/commitlint-github-action@v6
```

### Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - uses: pnpm/action-setup@v3
        with: { version: '9' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter=web build
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: apps/web

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/api:${{ github.sha }} apps/api
          gcloud run deploy groceries-ai-api \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/api:${{ github.sha }} \
            --region us-central1
```

### Required GitHub Secrets

```
ANTHROPIC_API_KEY          # Claude API (for PR reviews)
VERCEL_TOKEN               # Frontend deployment
GCP_SA_KEY                 # GCP Service Account JSON
GCP_PROJECT_ID             # GCP project
DATABASE_URL               # Production DB (environments)
CODECOV_TOKEN              # Code coverage (optional)
```

---

## 4. Frontend Best Practices (2026)

### Zustand State Management

Separate stores by domain. Use Zustand only for client-side UI state — server state goes through TanStack Query.

```typescript
// stores/useListStore.ts
import { create } from 'zustand';

interface ListStore {
  selectedListId: string | null;
  setSelectedList: (id: string | null) => void;
}

export const useListStore = create<ListStore>((set) => ({
  selectedListId: null,
  setSelectedList: (id) => set({ selectedListId: id }),
}));
```

### TanStack Query Patterns

Use query key factories for consistency:

```typescript
// lib/query-keys.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
```

Configure defaults in a central QueryClient:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### React Hook Form + Zod

Keep schemas in separate files. Full TypeScript inference from Zod:

```typescript
// schemas/list.ts
import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export type CreateListInput = z.infer<typeof createListSchema>;
```

### Server Components Performance

React Server Components reduce JavaScript bundle by ~62%. Strategy:
- Server Components by default
- `'use client'` only for interactivity (forms, state, event handlers)
- Wrap async data in `<Suspense>` boundaries with skeleton fallbacks
- Use `loading.tsx` for route-level loading states

### Testing: Vitest + React Testing Library

```typescript
// Test user behavior, not implementation
test('adds item to list', async () => {
  render(<AddItemForm listId="123" />);

  await userEvent.type(getByRole('textbox', { name: /item/i }), 'Milk');
  await userEvent.click(getByRole('button', { name: /add/i }));

  expect(await findByText('Milk')).toBeInTheDocument();
});
```

---

## 5. Backend Best Practices (2026)

### Prisma Optimization

Use singleton pattern. Select only needed fields. Avoid N+1 queries:

```typescript
// GOOD: Single query with select
const lists = await prisma.shoppingList.findMany({
  select: {
    id: true,
    name: true,
    items: { select: { id: true, name: true, isChecked: true } },
  },
  where: { householdId },
});
```

Bulk operations for batch inserts/updates. Index all foreign keys and frequently queried columns.

### BullMQ for Background Jobs

Use for receipt OCR processing instead of blocking the API request:

```typescript
@Processor('receipts')
export class ReceiptsProcessor {
  @Process('process-ocr')
  async handleOCR(job: Job<{ receiptId: string }>) {
    // 1. Update status to PROCESSING
    // 2. Call Document AI
    // 3. Parse results, match products
    // 4. Update status to COMPLETED or FAILED
  }
}
```

Configure with retry and exponential backoff:

```typescript
BullModule.registerQueue({
  name: 'receipts',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})
```

### Rate Limiting

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 60,   // 60 requests per minute (general)
    }]),
  ],
})

// Per-endpoint override for sensitive routes
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('upload')
async uploadReceipt() { }
```

---

## 6. GCP Cost Optimization

### Estimated Monthly Costs

| Service | Free Tier | Typical Cost |
|---------|-----------|-------------|
| Cloud Run | 180k vCPU-sec | $0-10 |
| Cloud SQL (dev) | — | $10 (db-f1-micro) |
| Cloud SQL (prod) | — | $50-80 |
| Cloud Storage | 5 GB free | $0.20/GB |
| Document AI | — | $0.10/receipt |
| **Total (dev)** | | **$10-20** |
| **Total (prod)** | | **$50-100** |

### Key Optimizations

- **Cloud Run**: Start with 256MB RAM, 0.25 vCPU. Scale to zero when idle.
- **Cloud SQL**: Use db-f1-micro for dev. Schedule stops during off-hours (75% savings).
- **Document AI**: Process receipts async via BullMQ. Batch when possible.
- **Cloud Storage**: Use signed URLs (not public). Set lifecycle policies to archive old receipts.
- **GitHub Actions over Cloud Build**: Free with GitHub, simpler setup.

### Cloud Storage Signed URLs

```typescript
const [url] = await storage
  .bucket(process.env.GCS_BUCKET_NAME)
  .file(`receipts/${receiptId}`)
  .getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
```

---

## 7. Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: groceries_ai
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  postgres_data:
```

Run `docker compose up -d` then `pnpm dev` for the full stack.

---

## 8. Recommended VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| Prettier | Code formatting |
| ESLint | Linting |
| Prisma | Schema syntax highlighting |
| Tailwind CSS IntelliSense | Class autocomplete |
| Path Intellisense | Auto-complete imports |
| Thunder Client | API testing |
| SQLTools | PostgreSQL queries |

### Workspace Settings (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "search.exclude": { "**/node_modules": true, "**/.turbo": true }
}
```

---

## 9. Development Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT FLOW                       │
│                                                          │
│  1. Pick Jira ticket (SCRUM-XX)                         │
│  2. Create branch: feature/SCRUM-XX-description         │
│  3. Open Claude Code with specialized agent             │
│  4. Implement (agent reads CLAUDE.md + docs/)           │
│  5. Hooks auto-run: lint, type-check, tests             │
│  6. Create PR with SCRUM-XX in title                    │
│  7. Claude GitHub Action auto-reviews PR                │
│  8. You/Alejandro review → EN REVISIÓN                  │
│  9. Codex runs final test pass → EN PRUEBAS             │
│ 10. Merge to main → auto-deploy → FINALIZADO           │
│                                                          │
│  Jira auto-links commits and PRs via SCRUM-XX keys     │
└─────────────────────────────────────────────────────────┘
```
