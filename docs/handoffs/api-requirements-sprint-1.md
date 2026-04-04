# Handoff: Backend API Implementation — Sprint 1

## Context

Sprint 1 covers all of Phase 1: project setup, authentication, household management, shopping lists CRUD, and list items. The Prisma schema is already defined at `apps/api/src/prisma/schema.prisma`. The PostgreSQL database is running locally via Docker on port 5433.

## Target Agent

**Backend Developer** (`.claude/agents/backend-developer.md`)

## Context Files to Read First

1. `CLAUDE.md` — Project conventions, commands, module structure
2. `docs/API_DESIGN.md` — **Primary reference** for all endpoint specs
3. `docs/DATA_MODEL.md` — Prisma schema and relationships
4. `docs/ARCHITECTURE.md` — Auth flow, error handling, security
5. `apps/api/src/prisma/schema.prisma` — Current schema (already defined)
6. `apps/api/package.json` — Current dependencies

## Tickets Covered

| Ticket | Summary | Priority |
|--------|---------|----------|
| SCRUM-11 | Set up NestJS API with base configuration | 1 (do first) |
| SCRUM-12 | Configure PostgreSQL with Prisma schema and seed data | 2 |
| SCRUM-15 | Implement Firebase Auth verification on backend (AuthGuard) | 3 |
| SCRUM-16 | Implement User profile API (GET/PATCH /users/me) | 4 |
| SCRUM-17 | Implement Household CRUD API and invite system | 5 |
| SCRUM-19 | Implement Shopping Lists CRUD API | 6 |
| SCRUM-20 | Implement List Items API | 7 |

## Implementation Order and Requirements

### Step 1: SCRUM-11 — NestJS Base Configuration

Set up the NestJS application in `apps/api/src/` with all base infrastructure.

**Requirements:**
- NestJS app entry point (`main.ts`) with:
  - Global prefix: `/api/v1`
  - Swagger/OpenAPI docs at `/api/docs`
  - Global validation pipe with `class-validator` (whitelist: true, forbidNonWhitelisted: true)
  - Helmet middleware for security headers
  - CORS configured for `http://localhost:3000` (the frontend)
  - Port from env var `PORT` (default 3001)
- `AppModule` with:
  - `ConfigModule.forRoot()` with env validation (validate required vars: DATABASE_URL, FIREBASE_PROJECT_ID, PORT)
  - Health check endpoint: `GET /api/v1/health` returning `{ status: "ok", version, timestamp }`
- Global exception filter with consistent error format (see `docs/API_DESIGN.md` error response format):
  ```json
  {
    "statusCode": 400,
    "message": "...",
    "error": "Bad Request",
    "details": [...],
    "timestamp": "ISO string",
    "path": "/api/v1/..."
  }
  ```
- Scripts in `apps/api/package.json`:
  - `dev`, `build`, `start`, `start:dev`, `start:prod`
  - `lint`, `test`, `test:watch`, `test:e2e`, `tsc`
  - `prisma:migrate`, `prisma:generate`, `prisma:studio`, `prisma:seed`

**Acceptance Criteria:**
- `pnpm --filter=api dev` starts the server on port 3001
- `curl http://localhost:3001/api/v1/health` returns 200 OK
- Swagger UI accessible at `http://localhost:3001/api/docs`
- Invalid requests return consistent error format
- `pnpm --filter=api lint` passes
- `pnpm --filter=api tsc --noEmit` passes

### Step 2: SCRUM-12 — Prisma Setup, Migration, and Seed

The schema is already defined. You need to:

**Requirements:**
- Create `PrismaModule` and `PrismaService` (singleton, shared across all modules)
  - PrismaService extends PrismaClient
  - Implements `OnModuleInit` (connect on init) and `OnModuleDestroy` (disconnect on destroy)
  - Enable shutdown hooks
- Run the initial migration: `pnpm --filter=api prisma migrate dev --name initial_schema`
- Create seed script at `apps/api/src/prisma/seed.ts` with:
  - Default product categories: Dairy, Meat & Fish, Fruits & Vegetables, Bakery, Beverages, Snacks, Cleaning, Personal Care, Frozen, Canned Goods, Condiments, Other
  - Each category with an appropriate icon emoji and sort order
- Configure seed in `package.json`: `"prisma": { "seed": "ts-node src/prisma/seed.ts" }`

**Acceptance Criteria:**
- Migration runs successfully against local PostgreSQL
- `pnpm --filter=api prisma:seed` populates categories
- `pnpm --filter=api prisma studio` shows all tables and seed data
- PrismaService is injectable in any module

### Step 3: SCRUM-15 — Firebase Auth Guard

**Requirements:**
- `AuthModule` with:
  - Firebase Admin SDK initialization using env vars (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
  - `FirebaseAuthGuard` that:
    1. Extracts Bearer token from Authorization header
    2. Verifies token with `firebase-admin.auth().verifyIdToken(token)`
    3. Looks up user in DB by `firebaseUid`
    4. If user doesn't exist, creates one (auto-provisioning) with data from token (email, displayName, avatarUrl from Firebase profile)
    5. Attaches user to request object
    6. Returns 401 for missing/invalid tokens
  - `@CurrentUser()` parameter decorator that extracts the user from the request
  - `AuthUser` type interface for the request user object (id, firebaseUid, email, displayName, role, householdId)
- Set the guard as global default (all routes require auth)
- Exclude health check endpoint from auth

**Acceptance Criteria:**
- Requests without Authorization header get 401
- Requests with invalid token get 401
- Requests with valid Firebase token get through
- First-time users are auto-created in the DB
- `@CurrentUser()` provides user data in controllers
- Health check remains accessible without auth

### Step 4: SCRUM-16 — User Profile API

**Requirements:**
- `UsersModule` with controller and service
- Endpoints (see `docs/API_DESIGN.md` for full specs):
  - `GET /api/v1/users/me` — Return current user profile with household info
  - `PATCH /api/v1/users/me` — Update display name and/or avatar URL
- DTOs:
  - `UpdateUserDto`: displayName (optional string, min 2, max 50), avatarUrl (optional string, isUrl)
- Response format follows the standard `{ data: { ... } }` wrapper

**Acceptance Criteria:**
- GET returns user with household relationship (if exists)
- PATCH validates input and updates only provided fields
- Swagger decorators on all endpoints
- Unit tests for the service

### Step 5: SCRUM-17 — Household CRUD API + Invite System

**Requirements:**
- `HouseholdsModule` with controller and service
- Endpoints (see `docs/API_DESIGN.md`):
  - `POST /api/v1/households` — Create household (user becomes ADMIN, 409 if already has one)
  - `GET /api/v1/households/me` — Get household with members
  - `PATCH /api/v1/households/me` — Update name (ADMIN only)
  - `POST /api/v1/households/me/invite` — Generate invite code (ADMIN only)
  - `POST /api/v1/households/join` — Join household with invite code
  - `GET /api/v1/households/me/invites` — List invites (ADMIN only)
  - `DELETE /api/v1/households/me/invites/:id` — Cancel invite (ADMIN only)
  - `DELETE /api/v1/households/me/members/:userId` — Remove member (ADMIN only)
- Business rules:
  - A user can belong to exactly one household
  - Creating a household sets the user's role to ADMIN and assigns householdId
  - Invite codes are 8-character alphanumeric, unique, expire in 7 days
  - Joining with an invite code assigns the user to the household as MEMBER
  - ADMIN cannot remove themselves
  - Need a `HouseholdMemberGuard` or role check for ADMIN-only operations
- DTOs with class-validator decorators for all inputs

**Acceptance Criteria:**
- Full CRUD working with proper authorization
- Invite flow works end-to-end (generate code -> join with code)
- ADMIN-only endpoints return 403 for MEMBER role
- Cannot create household if user already has one (409)
- Expired invites are rejected
- Unit tests for the service
- Swagger decorators on all endpoints

### Step 6: SCRUM-19 — Shopping Lists CRUD API

**Requirements:**
- `ListsModule` with controller and service
- Endpoints (see `docs/API_DESIGN.md`):
  - `GET /api/v1/lists` — Paginated lists for user's household (filter by status)
  - `POST /api/v1/lists` — Create list (sets createdById from current user)
  - `GET /api/v1/lists/:id` — Get list with items (verify household membership)
  - `PATCH /api/v1/lists/:id` — Update name/status
  - `DELETE /api/v1/lists/:id` — Soft delete (creator or ADMIN only)
- Business rules:
  - All list operations are scoped to the user's household
  - Users can only access lists belonging to their household
  - Setting status to COMPLETED sets the completedAt timestamp
  - Soft delete sets deletedAt, all queries filter `deletedAt: null`
- Pagination: `{ data: [...], meta: { total, page, limit, hasNextPage } }`

**Acceptance Criteria:**
- CRUD operations work with household scoping
- Pagination working correctly
- Status filter works
- Soft delete working
- Cannot access lists from another household (403)
- Unit tests for the service
- Swagger decorators on all endpoints

### Step 7: SCRUM-20 — List Items API

**Requirements:**
- Add items endpoints to `ListsModule` (or separate `ListItemsModule`):
  - `POST /api/v1/lists/:listId/items` — Add item to list
  - `PATCH /api/v1/lists/:listId/items/:itemId` — Update item
  - `PATCH /api/v1/lists/:listId/items/reorder` — Bulk reorder
  - `DELETE /api/v1/lists/:listId/items/:itemId` — Hard delete item
- Business rules:
  - Verify list belongs to user's household before any operation
  - When adding item, set `addedById` from current user
  - sortOrder auto-increments for new items (append to end)
  - Reorder accepts array of `{ id, sortOrder }` and updates in a transaction
- DTOs:
  - `CreateListItemDto`: name (required), quantity (optional, default 1), unit (optional, default UNIT), productId (optional), notes (optional)
  - `UpdateListItemDto`: all fields optional including isChecked
  - `ReorderItemsDto`: items array with id and sortOrder

**Acceptance Criteria:**
- Add, edit, check/uncheck, reorder, delete all work
- Household scoping enforced
- Reorder is transactional
- Unit tests for the service
- Swagger decorators on all endpoints

## Shared Types

After implementing endpoints, export relevant TypeScript interfaces to `packages/shared-types/src/index.ts`:
- User, Household, ShoppingList, ListItem, Category
- API response types (PaginatedResponse, ApiResponse)
- Enums (UserRole, ListStatus, UnitType)
- DTO types for create/update operations

## After Completion

Create `docs/handoffs/test-ready-sprint-1-api.md` describing:
- All endpoints built with their routes
- How to test them (curl examples or Swagger)
- Any deviations from the API_DESIGN.md spec
- Known limitations or TODOs
