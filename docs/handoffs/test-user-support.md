# Handoff: Test User Support for QA

## Context

During Sprint 1 QA testing, the QA agent was unable to test authenticated pages because Firebase Auth requires real credentials. Currently, all pages behind `AuthGuard` redirect to `/sign-in` when no Firebase user is present. This blocks:
- E2E testing of authenticated flows
- Accessibility auditing of protected pages (Playwright, Lighthouse, axe-core)
- Automated regression testing in CI/CD

The project needs a **test user system** that allows QA to authenticate with a real user (with proper roles and permissions) without requiring manual Google login each time.

## Target Agents

- **Backend Developer** — API-side test user seeding + test auth bypass
- **Frontend Developer** — Frontend test auth provider
- **Project Manager** — Track as a ticket, coordinate priority

## What is Needed

### Backend (API)

1. **Test auth guard bypass** (dev/test environment only):
   - When `NODE_ENV=test` or `NODE_ENV=development` and a special header (e.g., `x-test-user: <firebaseUid>`) is present, skip Firebase token verification and load the user directly from the database by `firebaseUid`.
   - This should be implemented inside `FirebaseAuthGuard.canActivate()` with a clear guard: only active when `NODE_ENV !== 'production'`.

2. **Seed script for test users**:
   - Extend `prisma/seed.ts` to create test users with known `firebaseUid` values:
     - `test-admin` — User with ADMIN role, belongs to a seeded household
     - `test-member` — User with MEMBER role, belongs to the same household
     - `test-no-household` — User with no household (for onboarding flow testing)
   - Seed a test household with sample lists, items, and invites so QA can test all flows immediately.

3. **E2E test utility**:
   - A helper that creates a Supertest agent with the test user header pre-configured.
   - Example: `const agent = createTestAgent(app, 'test-admin');`

### Frontend (Web)

1. **Test auth provider** (dev/test environment only):
   - When `NEXT_PUBLIC_TEST_USER=true` is set, the `AuthProvider` should skip Firebase `onAuthStateChanged` and instead provide a mock user object.
   - The mock user should have the same shape as a Firebase `User` (uid, email, displayName, getIdToken).
   - `getIdToken()` should return the `firebaseUid` string (which the backend test guard will use to look up the user).

2. **Environment variable**:
   - `NEXT_PUBLIC_TEST_USER=true` — enables test auth mode
   - `NEXT_PUBLIC_TEST_USER_UID=test-admin` — which seeded user to impersonate

### Security Requirements

- Test auth MUST be gated behind `NODE_ENV !== 'production'` on both frontend and backend.
- No test code should be included in production builds.
- The seed script should not run in production environments.

## Why This Matters

Without this, QA cannot:
- Run automated E2E tests in CI
- Audit accessibility of 5 out of 7 pages (all authenticated)
- Perform regression testing after changes
- Validate role-based access control (ADMIN vs MEMBER behaviors)

## Acceptance Criteria

- [ ] Backend: `FirebaseAuthGuard` supports `x-test-user` header in dev/test
- [ ] Backend: `prisma/seed.ts` creates 3 test users + household with sample data
- [ ] Backend: E2E test helper `createTestAgent()` utility available
- [ ] Frontend: `AuthProvider` supports test user mode via env var
- [ ] Frontend: Authenticated pages render without Firebase when test mode is active
- [ ] All test auth code is gated behind `NODE_ENV !== 'production'`
- [ ] QA can run full accessibility audit without manual login

## Priority

**High** — This blocks comprehensive QA testing for all current and future sprints.
