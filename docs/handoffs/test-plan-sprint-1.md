# Handoff: QA Test Plan — Sprint 1

## Context

Sprint 1 delivers all of Phase 1: authentication, household management, shopping lists CRUD, and the base UI. This test plan covers SCRUM-23 (Phase 1 E2E tests and test coverage). You should start testing **after** the backend and frontend developers complete their work.

## Target Agent

**QA Engineer** (`.claude/agents/qa-engineer.md`)

## Context Files to Read First

1. `CLAUDE.md` — Test commands, coverage targets (80%)
2. `docs/API_DESIGN.md` — API contracts to test against
3. `docs/handoffs/test-ready-sprint-1-api.md` — Backend dev's notes on what was built (read when available)
4. `docs/handoffs/test-ready-sprint-1-web.md` — Frontend dev's notes on what was built (read when available)

## Ticket Covered

| Ticket | Summary |
|--------|---------|
| SCRUM-23 | Phase 1 E2E tests and test coverage |

## Dependencies

- **Backend Developer** must complete all API endpoints and create `docs/handoffs/test-ready-sprint-1-api.md`
- **Frontend Developer** must complete all UI and create `docs/handoffs/test-ready-sprint-1-web.md`
- Both apps must be runnable locally: `pnpm dev`

## Test Scope

### 1. Backend Unit Tests

Verify that backend services have unit tests with mocked Prisma. Focus on:

**Auth Module:**
- Token verification succeeds with valid token
- Token verification fails with invalid/expired token
- Auto-provisioning creates new user on first request
- CurrentUser decorator extracts user correctly

**Users Module:**
- GET /users/me returns user with household
- PATCH /users/me updates only provided fields
- Validation rejects invalid input

**Households Module:**
- Create household sets user as ADMIN
- Cannot create household if user already has one (409)
- Generate invite code produces valid 8-char code
- Join with valid invite code assigns user to household
- Join with expired invite code fails
- ADMIN-only endpoints reject MEMBER role (403)
- Cannot remove self from household

**Lists Module:**
- CRUD operations scoped to household
- Cannot access another household's lists (403)
- Status filter works
- Soft delete sets deletedAt
- Pagination returns correct meta

**List Items Module:**
- Add item with auto-increment sortOrder
- Check/uncheck item
- Reorder is transactional
- Cannot add item to another household's list (403)

### 2. Backend E2E Tests

Create E2E tests in `apps/api/test/` using Supertest. These test the full request/response cycle.

**Critical flows to test E2E:**
1. Health check returns 200
2. Unauthenticated request returns 401
3. Create household -> invite member -> join household (full flow)
4. Create list -> add items -> check items -> complete list (full flow)
5. Pagination works on lists endpoint
6. Validation errors return proper format

**Note:** E2E tests need to mock Firebase token verification (create a test utility that generates mock tokens and stubs the Firebase Admin SDK).

### 3. Frontend Unit Tests

Verify that frontend components have unit tests with React Testing Library.

**Auth Components:**
- Sign-in form renders and validates input
- Sign-up form validates matching passwords
- Protected route redirects unauthenticated users

**List Components:**
- Lists overview renders list cards
- Empty state shown when no lists
- Create list dialog opens and submits
- List detail renders items with checkboxes
- Check/uncheck toggles item state
- Add item form validates input

**Household Components:**
- Onboarding shows create and join options
- Members list renders with roles
- ADMIN-only actions hidden for MEMBER role

### 4. Accessibility Testing

Use the MCP tools (Playwright, Lighthouse, a11y/axe-core):

**For each page, verify:**
- Lighthouse accessibility score >= 95
- No WCAG violations from axe-core scan
- All interactive elements have accessible names
- Keyboard navigation works (Tab, Enter, Escape)
- Color contrast meets 4.5:1 minimum
- Focus styles visible on all interactive elements

**Pages to audit:**
- `/auth/sign-in`
- `/auth/sign-up`
- `/onboarding`
- `/lists` (overview)
- `/lists/[id]` (detail)
- `/household` (settings)
- `/profile`

### 5. Coverage Targets

- **Backend**: 80% minimum on all new code in `apps/api/src/modules/`
- **Frontend**: 80% minimum on all new code in `apps/web/src/`
- Run `pnpm --filter=api test --coverage` and `pnpm --filter=web test:coverage`

## Test Commands

```bash
# Run all tests
pnpm test

# Backend tests with coverage
pnpm --filter=api test -- --coverage

# Frontend tests with coverage
pnpm --filter=web test:coverage

# Backend E2E tests
pnpm --filter=api test:e2e

# Start dev server for Playwright/Lighthouse testing
pnpm dev
```

## Acceptance Criteria

- [ ] All backend unit tests pass
- [ ] All backend E2E tests pass
- [ ] All frontend unit tests pass
- [ ] Backend coverage >= 80% on `src/modules/`
- [ ] Frontend coverage >= 80% on `src/`
- [ ] No `.skip` or `.only` left in test files
- [ ] Lighthouse accessibility >= 95 on all pages
- [ ] No critical/serious WCAG violations from axe-core
- [ ] Test results documented

## After Completion

Create `docs/handoffs/test-results-sprint-1.md` with:
- Pass/fail summary per module
- Coverage numbers (screenshot or table)
- Accessibility audit results per page
- Issues found (with severity: critical, major, minor)
- Recommendations for improvement
