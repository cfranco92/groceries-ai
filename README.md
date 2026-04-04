# GroceriesAI

Smart grocery management for households. Create shopping lists, upload receipts with OCR, track spending, and get restocking recommendations powered by AI.

Built by Cristian Franco and Alejandro Franco.

## What It Does

- **Shopping Lists** — Create, share, and manage grocery lists with your household
- **Receipt Scanning** — Upload receipts and automatically extract items, prices, and totals via OCR
- **Spending History** — Track purchases over time with spending analytics by category
- **Smart Restocking** — Get recommendations for items you're likely running low on, based on your purchase patterns
- **Household Management** — Invite family members, assign admin/member roles

## Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | NestJS, TypeScript, Prisma ORM                                |
| Database | PostgreSQL                                                    |
| Auth     | Firebase Authentication                                       |
| Storage  | Google Cloud Storage                                          |
| OCR      | Google Document AI                                            |
| Monorepo | Turborepo + pnpm                                              |

## Project Structure

```
groceries-ai/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   └── api/                 # NestJS backend (port 3001)
├── packages/
│   ├── shared-types/        # TypeScript interfaces
│   ├── utils/               # Shared utilities
│   └── eslint-config/       # Shared linting rules
├── docs/                    # Architecture, API design, data model, features
├── .claude/
│   ├── agents/              # 6 specialized AI agents
│   ├── rules/               # Context-scoped coding rules
│   └── settings.json        # Claude Code hooks
├── .github/workflows/       # CI, PR review, deploy
└── docker-compose.yml       # Local PostgreSQL + Redis
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop
- Google Cloud CLI (`gcloud`)
- Firebase CLI (`firebase`)
- Claude Code CLI (`claude`)
- GitHub CLI (`gh`)

### Setup

```bash
# Clone the repo
git clone git@github.com:YOUR_USERNAME/groceries-ai.git
cd groceries-ai

# Install dependencies
pnpm install

# Start local services (PostgreSQL + Redis)
docker compose up -d

# Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit both files with your Firebase and GCP credentials

# Run database migrations
pnpm --filter=api prisma migrate dev

# Seed initial data
pnpm --filter=api prisma:seed

# Start development
pnpm dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:3001`.

## Development with AI Agents

This project uses Claude Code with 6 specialized agents for development. Each agent has isolated context and specific expertise.

### Available Agents

| Agent           | Command                                               | Role                         |
| --------------- | ----------------------------------------------------- | ---------------------------- |
| Project Manager | `claude --agent .claude/agents/project-manager.md`    | Task breakdown, coordination |
| Frontend Dev    | `claude --agent .claude/agents/frontend-developer.md` | Next.js, React, UI           |
| Backend Dev     | `claude --agent .claude/agents/backend-developer.md`  | NestJS, Prisma, API          |
| UX Designer     | `claude --agent .claude/agents/ux-designer.md`        | Design specs, accessibility  |
| DevOps          | `claude --agent .claude/agents/devops-engineer.md`    | Docker, GCP, CI/CD           |
| QA Engineer     | `claude --agent .claude/agents/qa-engineer.md`        | Testing, coverage, E2E       |

### MCP Tools

Agents have access to these tools via `.mcp.json`:

- **Playwright** — Browser automation and visual testing
- **Lighthouse** — Performance and accessibility auditing
- **a11y (axe-core)** — WCAG compliance scanning
- **Prisma** — Database migration management
- **Docker** — Container inspection and logs
- **Context7** — Up-to-date framework documentation

### Workflow

1. Pick a Jira ticket (SCRUM-XX)
2. Create a branch: `git checkout -b feature/SCRUM-XX-description`
3. Launch the appropriate agent
4. Agent implements, hooks auto-format and lint
5. Create a PR — Claude reviews it automatically via GitHub Actions
6. Review, merge, auto-deploy

## Common Commands

```bash
pnpm dev                      # Start all apps
pnpm dev --filter=web         # Frontend only
pnpm dev --filter=api         # Backend only
pnpm build                    # Build all
pnpm test                     # Run all tests
pnpm lint                     # Lint everything

# Database
pnpm --filter=api prisma migrate dev    # Run migrations
pnpm --filter=api prisma studio         # Visual DB browser
pnpm --filter=api prisma:seed           # Seed data

# Docker
docker compose up -d           # Start services
docker compose down            # Stop services
docker compose ps              # Check status
```

## Documentation

Detailed specs are in the `docs/` folder:

- [Architecture](docs/ARCHITECTURE.md) — System design, auth flow, deployment
- [API Design](docs/API_DESIGN.md) — REST endpoints and contracts
- [Data Model](docs/DATA_MODEL.md) — Prisma schema and relationships
- [Features](docs/FEATURES.md) — Phase roadmap
- [Research](docs/RESEARCH_AND_RECOMMENDATIONS.md) — Tooling and best practices

## License

Private project. All rights reserved.
