# GroceriesAI - Project Context for Claude Code

## Project Overview

GroceriesAI is a household grocery management application that allows families to create shopping lists, upload purchase receipts, track spending history, and receive smart restocking recommendations. Built as a web-first application with a planned mobile expansion.

## Tech Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Frontend (web)  | Next.js 14+ (App Router) + TypeScript |
| Backend (API)   | NestJS + TypeScript                   |
| Database        | PostgreSQL + Prisma ORM               |
| Authentication  | Firebase Auth                         |
| File Storage    | Google Cloud Storage                  |
| OCR / Receipts  | Google Document AI                    |
| Monorepo        | Turborepo                             |
| Package Manager | pnpm                                  |
| Styling         | Tailwind CSS + shadcn/ui              |
| Future Mobile   | React Native / Expo                   |

## Monorepo Structure

```
groceries-ai/
├── CLAUDE.md                  # This file - project context
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json (pnpm workspaces)
├── pnpm-workspace.yaml
├── docs/                      # Project documentation
│   ├── ARCHITECTURE.md        # Technical architecture details
│   ├── DATA_MODEL.md          # Database schema and relationships
│   ├── API_DESIGN.md          # REST API endpoint specifications
│   └── FEATURES.md            # Feature roadmap by phases
├── apps/
│   ├── web/                   # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/           # App Router pages and layouts
│   │   │   ├── components/    # React components
│   │   │   │   ├── ui/        # Base UI components (shadcn/ui)
│   │   │   │   └── features/  # Feature-specific components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utilities, API client, Firebase config
│   │   │   ├── stores/        # State management (Zustand)
│   │   │   └── styles/        # Global styles and Tailwind config
│   │   └── public/            # Static assets
│   └── api/                   # NestJS backend application
│       ├── src/
│       │   ├── modules/       # Feature modules (NestJS convention)
│       │   │   ├── auth/      # Authentication & authorization
│       │   │   ├── users/     # User management
│       │   │   ├── households/# Household management
│       │   │   ├── lists/     # Shopping lists CRUD
│       │   │   ├── products/  # Product catalog
│       │   │   ├── receipts/  # Receipt upload & OCR processing
│       │   │   └── insights/  # Analytics & recommendations
│       │   ├── common/        # Shared guards, pipes, interceptors
│       │   ├── config/        # App configuration (env vars)
│       │   └── prisma/        # Prisma schema and migrations
│       └── test/              # E2E tests
└── packages/
    ├── shared-types/          # Shared TypeScript types/interfaces
    ├── utils/                 # Shared utility functions
    └── eslint-config/         # Shared ESLint configuration
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm dev --filter=web
pnpm dev --filter=api

# Build all apps
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Database commands (from apps/api)
pnpm --filter=api prisma:migrate    # Run migrations
pnpm --filter=api prisma:generate   # Generate Prisma client
pnpm --filter=api prisma:studio     # Open Prisma Studio
pnpm --filter=api prisma:seed       # Seed database
```

## Coding Conventions

### General

- Language: TypeScript (strict mode) across all packages
- All code, comments, variable names, documentation, and commit messages in **English**
- User-facing text supports **Spanish** via i18n (app will be i18n-ready from the start)
- Use `pnpm` exclusively (not npm or yarn)
- Prefer named exports over default exports (except Next.js pages)
- Use absolute imports with path aliases (`@/components/...`, `@/lib/...`)

### Frontend (Next.js)

- Use App Router (not Pages Router)
- Server Components by default; add `'use client'` only when needed
- State management with Zustand for client-side state
- Use React Query (TanStack Query) for server state and API calls
- Form handling with React Hook Form + Zod validation
- Components follow the pattern: `ComponentName/index.tsx` + `ComponentName.types.ts`

### Backend (NestJS)

- Follow NestJS module structure strictly
- Each module contains: controller, service, module, DTOs, and entities
- Use class-validator for DTO validation
- Use Prisma for all database operations (no raw queries unless justified)
- All endpoints must be documented with Swagger decorators
- Use Guards for authentication, Interceptors for response transformation
- Error handling through NestJS exception filters

### Database (Prisma)

- Schema file: `apps/api/src/prisma/schema.prisma`
- Use snake_case for table and column names in PostgreSQL
- Use camelCase in Prisma model fields (Prisma handles the mapping)
- Always add `createdAt` and `updatedAt` to every model
- Use soft deletes (`deletedAt` nullable timestamp) for important entities
- Write meaningful migration names: `pnpm --filter=api prisma migrate dev --name add_receipts_table`

### Testing

- Unit tests: Jest (colocated with source files as `*.spec.ts`)
- E2E tests: Jest + Supertest (in `apps/api/test/`)
- Frontend tests: Vitest + React Testing Library
- Minimum test coverage target: 80%

### Git Conventions

- Branch naming: `feature/short-description`, `fix/short-description`, `chore/short-description`
- Commit messages: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- PR descriptions must include: summary of changes, testing done, and screenshots (if UI)

## Environment Variables

### API (`apps/api/.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/groceries_ai
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
GCP_PROJECT_ID=
GCS_BUCKET_NAME=groceries-ai-receipts
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=
PORT=3001
NODE_ENV=development
```

### Web (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Key Architectural Decisions

1. **PostgreSQL over Firestore**: The data model is highly relational (users → households → lists → items → products → receipts). SQL handles these relationships more naturally.
2. **Firebase Auth only (not full Firebase)**: We use Firebase exclusively for authentication. All business data lives in PostgreSQL.
3. **Turborepo monorepo**: Shared types between frontend and backend reduce bugs and improve DX.
4. **Prisma ORM**: Type-safe database access that generates TypeScript types from the schema, integrating naturally with the rest of the stack.
5. **Document AI over Vision API**: Document AI has specialized receipt processors that extract structured data (line items, prices, totals) rather than raw text.

## Important Notes for AI Agents

- Always check `docs/` folder for detailed specifications before implementing features
- The `packages/shared-types` package is the source of truth for data interfaces
- Never hardcode Firebase credentials or GCP keys - always use environment variables
- When adding a new feature module in NestJS, follow the existing module pattern
- Run `pnpm lint` and `pnpm test` before considering any task complete
- Database changes require a Prisma migration - never modify the database directly
- The final review and testing pass will be done by Codex
