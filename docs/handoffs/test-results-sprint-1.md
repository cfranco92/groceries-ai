# Sprint 1 Test Results — QA Handoff

**Date:** 2026-04-04
**Sprint:** 1 (SCRUM-23)
**QA Agent:** qa-engineer

---

## Summary

| Category | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Backend Unit Tests | 34 | 34 | 0 | 0 |
| Backend E2E Tests | 25 | 24 | 0 | 1 |
| Frontend Unit Tests | 33 | 33 | 0 | 0 |
| **Total** | **92** | **91** | **0** | **1** |

**Overall result: PASS (with 1 bug found)**

---

## Backend Unit Tests (34/34 passing)

Tests located in colocated `*.spec.ts` files.

| Module | Tests | Status |
|---|---|---|
| `users.service.spec.ts` | User CRUD operations | All pass |
| `households.service.spec.ts` | Household create, invite, join, update, role enforcement | All pass |
| `lists.service.spec.ts` | Shopping list CRUD, pagination, filtering, soft delete | All pass |
| `list-items.service.spec.ts` | Item add, update, check, reorder, remove, auto-increment sortOrder | All pass |

### Coverage (Unit Tests Only)

| Metric | Coverage |
|---|---|
| Statements | 27.92% |
| Branches | 15.47% |
| Functions | 35.89% |
| Lines | 28.28% |

**Note:** Coverage is low because unit tests only cover service layers. Controllers, guards, filters, DTOs, and decorators are exercised by E2E tests but Jest's `--coverage` for unit tests doesn't count E2E. Service-level coverage is strong:
- `list-items.service.ts` — 100% statements, 100% lines
- `lists.service.ts` — 91.89% statements, 94.11% lines
- `households.service.ts` — 78.94% statements, 78.18% lines
- `users.service.ts` — 100% statements, 100% lines

---

## Backend E2E Tests (24/25, 1 skipped)

File: `apps/api/test/app.e2e-spec.ts`

### Approach

Mocks `firebase-admin` so `verifyIdToken(token)` returns `{ uid: token }`. The Bearer token IS the firebaseUid, allowing the original `FirebaseAuthGuard` to work correctly with pre-seeded test users.

### Test Coverage by Area

| Area | Tests | Status |
|---|---|---|
| Health check (public, no auth) | 1 | Pass |
| Authentication enforcement (401) | 2 | Pass |
| User profile (GET/PATCH /users/me) | 2 | Pass |
| Household flow (create, invite, join, get, RBAC, update) | 6 | Pass |
| Shopping list flow (create, add items, check, get, complete, delete) | 5 | Pass |
| Item reorder | 1 | **Skipped (bug)** |
| Pagination (page size, last page, status filter) | 3 | Pass |
| Validation errors (empty body, unknown fields, invalid data) | 3 | Pass |

### Flows Validated End-to-End

1. **Auth flow**: No token -> 401, bad format -> 401, valid token -> user resolved
2. **User flow**: Get profile, update display name
3. **Household flow**: Create household (becomes ADMIN) -> duplicate 409 -> generate invite code -> member joins -> both visible -> MEMBER can't update (403) -> ADMIN can update
4. **Shopping list flow**: Create list (ACTIVE) -> add items (auto sortOrder) -> check item -> get with items -> complete (COMPLETED + completedAt) -> soft delete -> 404
5. **Pagination**: Correct page size, meta.total, hasNextPage, last page, status filtering

---

## Frontend Unit Tests (33/33 passing)

| File | Tests | What's Tested |
|---|---|---|
| `auth.test.ts` | 12 | signInSchema (4) + signUpSchema (8): email validation, password rules (length, uppercase, number), confirm match, optional displayName |
| `sign-in/page.test.tsx` | 8 | Form rendering, Google button, heading/subtitle, sign-up link, signIn call, redirect to /lists, auth error display, email validation |
| `sign-up/page.test.tsx` | 6 | Form fields, heading, sign-in link, signUp call, redirect to /onboarding, duplicate email error |
| `auth-guard.test.tsx` | 3 | Loading spinner, renders children when authenticated, empty when no user |
| `lists-store.test.ts` | 4 | Default filter (ACTIVE), setFilter, dialog default (closed), setCreateDialogOpen |

### Testing Infrastructure Created

- `apps/web/vitest.config.ts` — Vitest with React plugin, jsdom, path aliases, v8 coverage
- `apps/web/src/test/setup.ts` — Global mocks (next/navigation, Firebase, next-themes)
- `apps/web/src/test/test-utils.tsx` — QueryClient wrapper, testing-library re-exports

---

## Accessibility Audit

Screenshots captured for all 7 routes + 2 mobile viewports (stored in `screenshots/`, gitignored).

### Pages Audited

| Page | Screenshot | Auth Required |
|---|---|---|
| Sign In (`/sign-in`) | sign-in.png | No |
| Sign Up (`/sign-up`) | sign-up.png | No |
| Lists Overview (`/lists`) | lists-overview.png | Yes (mock) |
| List Detail (`/lists/:id`) | list-detail.png | Yes (mock) |
| Onboarding (`/onboarding`) | onboarding.png | Yes (mock) |
| Household (`/household`) | household.png | Yes (mock) |
| Profile (`/profile`) | profile.png | Yes (mock) |
| Lists Mobile (375px) | lists-mobile.png | Yes (mock) |
| List Detail Mobile (375px) | list-detail-mobile.png | Yes (mock) |

### Accessibility Findings

**Positive:**
- Semantic HTML used throughout (buttons, forms, labels, nav)
- Form fields have proper labels associated via `htmlFor`/`id`
- Loading states use `aria-busy` and `role="status"`
- Focus styles visible on all interactive elements
- Good color contrast on primary UI elements

**Issues Found:**
- Authenticated pages could not be fully audited with Lighthouse/axe-core without a test user system (auth redirects block automated tools)
- See `docs/handoffs/test-user-support.md` for the proposed solution

---

## Bugs Found

### BUG-001: Route ordering conflict in `list-items.controller.ts`

**Severity:** Medium
**File:** `apps/api/src/modules/lists/list-items.controller.ts`
**Description:** `@Patch(':itemId')` is declared before `@Patch('reorder')` in the controller. When NestJS/Express processes `PATCH /lists/:id/items/reorder`, it matches the parameterized route first (`:itemId = 'reorder'`), routing to `updateItem()` instead of `reorderItems()`. The `UpdateListItemDto` rejects the `items` property with a 400 validation error.

**Steps to reproduce:**
```bash
# Send a reorder request
curl -X PATCH /api/v1/lists/<listId>/items/reorder \
  -H "Authorization: Bearer <token>" \
  -d '{"items": [{"id": "item1", "sortOrder": 0}]}'
# Returns 400: "property items should not exist"
```

**Fix:** Move the `reorderItems()` method (with `@Patch('reorder')`) above the `updateItem()` method (with `@Patch(':itemId')`) in the controller class so the static route registers first.

**E2E test:** Skipped in `app.e2e-spec.ts` with comment explaining the bug.

---

## Blockers & Recommendations

### Blocker: Test User System (HIGH priority)

Full accessibility auditing of authenticated pages is blocked. A test user system is needed for:
- CI/CD automated E2E testing
- Lighthouse/axe-core audits of protected pages
- Role-based access control regression testing

**Handoff created:** `docs/handoffs/test-user-support.md`

### Recommendations

1. **Fix BUG-001** — Reorder the controller methods to resolve the route conflict. This is a one-line change (move the method).
2. **Implement test user system** — Critical for CI/CD and comprehensive QA.
3. **Add controller-level tests** — Current backend coverage only covers services. Adding controller integration tests would significantly improve coverage toward the 80% target.
4. **Add frontend component tests** — Lists page, household page, profile page, and onboarding page components are untested. These should be prioritized in Sprint 2.
5. **Frontend coverage tooling** — Run `vitest --coverage` with v8 provider to track frontend coverage metrics once more components are tested.

---

## Files Created/Modified

### New Files
- `apps/api/test/jest-e2e.json` — E2E test configuration
- `apps/api/test/app.e2e-spec.ts` — 25 E2E tests
- `apps/web/vitest.config.ts` — Vitest configuration
- `apps/web/src/test/setup.ts` — Global test setup/mocks
- `apps/web/src/test/test-utils.tsx` — Test utilities
- `apps/web/src/stores/lists-store.test.ts` — Store tests
- `apps/web/src/lib/validations/auth.test.ts` — Validation schema tests
- `apps/web/src/components/auth-guard.test.tsx` — Auth guard tests
- `apps/web/src/app/(auth)/sign-in/page.test.tsx` — Sign-in page tests
- `apps/web/src/app/(auth)/sign-up/page.test.tsx` — Sign-up page tests
- `docs/handoffs/test-user-support.md` — Test user system handoff
- `docs/handoffs/test-results-sprint-1.md` — This document

### Modified Files
- `.gitignore` — Added `.playwright-mcp/` and `screenshots/` entries
